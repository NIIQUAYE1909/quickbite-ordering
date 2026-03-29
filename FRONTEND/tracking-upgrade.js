(function () {
  const state = {
    customerShareWatchId: null,
    customerShareInterval: null,
    customerSharingOrderId: null,
    driverTrackingPollInterval: null,
    maps: {}
  };

  const STATUS_COLORS = { Confirmed: 'var(--accent)', Preparing: '#f59e0b', 'On the way': '#3b82f6', Delivered: '#22c55e' };
  const STATUS_ICONS = { Confirmed: '✅', Preparing: '🍳', 'On the way': '🚗', Delivered: '🎉' };
  const STEPS = ['Confirmed', 'Preparing', 'On the way', 'Delivered'];

  function isFiniteNumber(value) {
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  }

  function toLatLngPair(lat, lng) {
    return [Number(lat), Number(lng)];
  }

  function haversineKm(start, end) {
    if (!start || !end) return null;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(end[0] - start[0]);
    const dLng = toRad(end[1] - start[1]);
    const lat1 = toRad(start[0]);
    const lat2 = toRad(end[0]);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(distanceKm) {
    if (!Number.isFinite(distanceKm)) return 'Waiting for both locations';
    if (distanceKm < 1) return `${Math.max(50, Math.round(distanceKm * 1000 / 10) * 10)} m away`;
    return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)} km away`;
  }

  function estimateEtaMinutes(distanceKm, speedKmh, status) {
    if (!Number.isFinite(distanceKm)) return null;
    if (status === 'Delivered') return 0;
    const safeSpeed = Number(speedKmh) > 6 ? Number(speedKmh) : 18;
    const trafficFactor = status === 'Preparing' ? 1.5 : 1.22;
    return Math.max(1, Math.round((distanceKm / safeSpeed) * 60 * trafficFactor));
  }

  function formatEta(minutes, status) {
    if (status === 'Delivered') return 'Delivered';
    if (!Number.isFinite(minutes)) return 'ETA soon';
    if (minutes <= 1) return 'About 1 min';
    if (minutes < 60) return `${minutes} min away`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m away` : `${hours}h away`;
  }

  function getTrackingMetrics(data) {
    const driverCoords = isFiniteNumber(data.latitude) && isFiniteNumber(data.longitude)
      ? toLatLngPair(data.latitude, data.longitude)
      : null;
    const customerCoords = isFiniteNumber(data.customer_latitude) && isFiniteNumber(data.customer_longitude)
      ? toLatLngPair(data.customer_latitude, data.customer_longitude)
      : null;
    const distanceKm = haversineKm(driverCoords, customerCoords);
    const etaMinutes = estimateEtaMinutes(distanceKm, data.speed_kmh, data.status);
    return { driverCoords, customerCoords, distanceKm, etaMinutes };
  }

  function animateMarker(instance, markerKey, targetCoords, type) {
    const currentMarker = instance[markerKey];
    if (!currentMarker) {
      instance[markerKey] = L.marker(targetCoords, { icon: buildMarkerIcon(type) }).addTo(instance.map);
      return;
    }

    const startPoint = currentMarker.getLatLng();
    const start = [startPoint.lat, startPoint.lng];
    const end = targetCoords;
    const distanceKm = haversineKm(start, end);
    if (!distanceKm || distanceKm < 0.005) {
      currentMarker.setLatLng(end);
      return;
    }

    const animationKey = `${markerKey}Anim`;
    if (instance[animationKey]) cancelAnimationFrame(instance[animationKey]);
    const startedAt = performance.now();
    const duration = 1800;

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - ((1 - progress) * (1 - progress));
      const lat = start[0] + ((end[0] - start[0]) * eased);
      const lng = start[1] + ((end[1] - start[1]) * eased);
      currentMarker.setLatLng([lat, lng]);
      if (progress < 1) {
        instance[animationKey] = requestAnimationFrame(tick);
      }
    };

    instance[animationKey] = requestAnimationFrame(tick);
  }

  function getLatestActiveOrder() {
    if (!Array.isArray(window.orders)) return null;
    const activeOrders = window.orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status));
    if (activeOrders.length === 0) return null;
    return activeOrders.slice().sort((a, b) => {
      const aTime = new Date(a.orderedAt || a.time || 0).getTime() || 0;
      const bTime = new Date(b.orderedAt || b.time || 0).getTime() || 0;
      return bTime - aTime;
    })[0];
  }

  function renderActiveTrackingShortcut() {
    const sectionHeader = document.querySelector('#orders .section-header');
    if (!sectionHeader) return;

    let shortcut = document.getElementById('activeTrackingShortcut');
    if (!shortcut) {
      shortcut = document.createElement('div');
      shortcut.id = 'activeTrackingShortcut';
      shortcut.className = 'active-tracking-shortcut';
      sectionHeader.insertAdjacentElement('afterend', shortcut);
    }

    const activeOrder = getLatestActiveOrder();
    if (!activeOrder) {
      shortcut.style.display = 'none';
      shortcut.innerHTML = '';
      return;
    }

    const itemPreview = Array.isArray(activeOrder.items)
      ? activeOrder.items.slice(0, 2).map((item) => item.name || 'Item').join(' • ')
      : 'Ready to track live';

    shortcut.style.display = 'flex';
    shortcut.innerHTML = `
      <div>
        <div class="active-tracking-label">Active delivery</div>
        <div class="active-tracking-title">Order #${activeOrder.id} is ${activeOrder.status}</div>
        <div class="active-tracking-meta">${itemPreview}</div>
      </div>
      <button class="btn-primary active-tracking-btn" type="button" onclick="trackLatestActiveOrder()">Track Latest Order</button>
    `;
  }

  function ensureMap(mapId) {
    if (state.maps[mapId] || typeof L === 'undefined') return state.maps[mapId] || null;
    const el = document.getElementById(mapId);
    if (!el) return null;

    const map = L.map(mapId, { zoomControl: true }).setView([5.6037, -0.1870], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    state.maps[mapId] = { map, driverMarker: null, customerMarker: null, routeLine: null };
    return state.maps[mapId];
  }

  function buildMarkerIcon(type) {
    const color = type === 'customer' ? '#22c55e' : '#3b82f6';
    const emoji = type === 'customer' ? '🏠' : '🚗';
    return L.divIcon({
      className: 'tracking-pin-wrapper',
      html: `<div class="tracking-pin" style="--pin-color:${color};">${emoji}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  }

  function updateMap(mapId, data) {
    const instance = ensureMap(mapId);
    if (!instance) return;

    setTimeout(() => {
      instance.map.invalidateSize();
    }, 0);

    const driverCoords = isFiniteNumber(data.latitude) && isFiniteNumber(data.longitude)
      ? [Number(data.latitude), Number(data.longitude)]
      : null;
    const customerCoords = isFiniteNumber(data.customer_latitude) && isFiniteNumber(data.customer_longitude)
      ? [Number(data.customer_latitude), Number(data.customer_longitude)]
      : null;

    if (driverCoords) {
      if (!instance.driverMarker) {
        instance.driverMarker = L.marker(driverCoords, { icon: buildMarkerIcon('driver') }).addTo(instance.map);
      } else {
        animateMarker(instance, 'driverMarker', driverCoords, 'driver');
      }
    } else if (instance.driverMarker) {
      instance.map.removeLayer(instance.driverMarker);
      instance.driverMarker = null;
    }

    if (customerCoords) {
      if (!instance.customerMarker) {
        instance.customerMarker = L.marker(customerCoords, { icon: buildMarkerIcon('customer') }).addTo(instance.map);
      } else {
        animateMarker(instance, 'customerMarker', customerCoords, 'customer');
      }
    } else if (instance.customerMarker) {
      instance.map.removeLayer(instance.customerMarker);
      instance.customerMarker = null;
    }

    if (instance.routeLine) {
      instance.map.removeLayer(instance.routeLine);
      instance.routeLine = null;
    }
    if (driverCoords && customerCoords) {
      instance.routeLine = L.polyline([driverCoords, customerCoords], {
        color: '#ff5c1a',
        weight: 4,
        opacity: 0.85,
        dashArray: '10 8'
      }).addTo(instance.map);
    }

    const points = [driverCoords, customerCoords].filter(Boolean);
    if (points.length === 1) {
      instance.map.setView(points[0], 15);
    } else if (points.length > 1) {
      instance.map.fitBounds(points, { padding: [40, 40] });
    }
  }

  async function sendLiveLocationUpdate(orderId, actorType, actorName, coords) {
    const res = await fetch(`${API_BASE}/tracking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        actor_type: actorType,
        actor_name: actorName,
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed_kmh: Math.round((coords.speedKmh || 0) * 10) / 10,
        heading: Math.round(coords.heading || 0)
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || 'Unable to send GPS update.');
    return payload;
  }

  function renderAudienceCards(data, mode) {
    const customerNameEl = document.getElementById(mode === 'customer' ? 'customerLiveCardName' : 'driverViewCustomerName');
    const customerMetaEl = document.getElementById(mode === 'customer' ? 'customerLiveCardMeta' : 'driverViewCustomerMeta');
    const driverNameEl = document.getElementById(mode === 'customer' ? 'driverLiveCardName' : 'driverViewDriverName');
    const driverMetaEl = document.getElementById(mode === 'customer' ? 'driverLiveCardMeta' : 'driverViewDriverMeta');
    if (!customerNameEl || !customerMetaEl || !driverNameEl || !driverMetaEl) return;

    const customerShared = isFiniteNumber(data.customer_latitude) && isFiniteNumber(data.customer_longitude);
    const driverShared = isFiniteNumber(data.latitude) && isFiniteNumber(data.longitude);
    customerNameEl.textContent = customerShared ? (data.customer_live_name || data.customer_name || 'Customer') : 'Waiting for customer';
    customerMetaEl.textContent = customerShared
      ? `📍 ${Number(data.customer_latitude).toFixed(5)}, ${Number(data.customer_longitude).toFixed(5)}`
      : 'Customer location not shared yet.';
    driverNameEl.textContent = driverShared ? (data.driver_name || 'Driver') : 'Waiting for driver';
    driverMetaEl.textContent = driverShared
      ? `🚗 ${Number(data.latitude).toFixed(5)}, ${Number(data.longitude).toFixed(5)}`
      : 'Driver GPS not shared yet.';
  }

  function updateTrackingSummaryDom(data, metrics, options = {}) {
    const customerShared = isFiniteNumber(data.customer_latitude) && isFiniteNumber(data.customer_longitude);
    const driverShared = isFiniteNumber(data.latitude) && isFiniteNumber(data.longitude);
    const distanceLabel = formatDistance(metrics.distanceKm);
    const etaLabel = formatEta(metrics.etaMinutes, data.status);
    const routeHint = driverShared && customerShared
      ? `${distanceLabel} • ${etaLabel}`
      : driverShared
        ? 'Driver is live. Waiting for customer location to estimate ETA.'
        : 'Live ETA will appear when the driver starts sharing.';

    const statusBadge = document.getElementById('trackingStatusBadge');
    if (statusBadge) {
      statusBadge.style.background = STATUS_COLORS[data.status] || 'var(--accent)';
      statusBadge.textContent = `${STATUS_ICONS[data.status] || '📦'} ${data.status}`;
    }

    const customerValue = document.getElementById('trackingCustomerValue');
    if (customerValue) customerValue.textContent = data.customer_name || 'N/A';
    const addressValue = document.getElementById('trackingAddressValue');
    if (addressValue) addressValue.textContent = `📍 ${data.address || 'N/A'}`;
    const orderedValue = document.getElementById('trackingOrderedValue');
    if (orderedValue) orderedValue.textContent = formatOrderDate(data.ordered_at);
    const itemsValue = document.getElementById('trackingItemsValue');
    if (itemsValue) itemsValue.textContent = formatOrderItems(data.items);

    const customerPresence = document.getElementById('trackingCustomerPresence');
    if (customerPresence) {
      customerPresence.className = `presence-pill ${customerShared ? 'active' : ''}`;
      customerPresence.textContent = customerShared ? '📍 Customer live' : '📍 Customer not sharing yet';
    }
    const driverPresence = document.getElementById('trackingDriverPresence');
    if (driverPresence) {
      driverPresence.className = `presence-pill ${driverShared ? 'active driver' : ''}`;
      driverPresence.textContent = driverShared ? '🚗 Driver live' : '🚗 Driver GPS not live yet';
    }

    const distanceValue = document.getElementById('trackingDistanceValue');
    if (distanceValue) distanceValue.textContent = distanceLabel;
    const etaValue = document.getElementById('trackingEtaValue');
    if (etaValue) etaValue.textContent = etaLabel;
    const routeValue = document.getElementById('trackingRouteValue');
    if (routeValue) routeValue.textContent = routeHint;

    document.querySelectorAll('#trackingProgress .track-step').forEach((stepEl, index) => {
      const stepIdx = STEPS.indexOf(data.status);
      stepEl.classList.toggle('done', index <= stepIdx);
      stepEl.classList.toggle('active', index === stepIdx);
      const dot = stepEl.querySelector('.track-step-dot');
      if (dot) dot.textContent = index < stepIdx ? '✓' : (STATUS_ICONS[STEPS[index]] || '●');
    });
    document.querySelectorAll('#trackingProgress .track-step-line').forEach((lineEl, index) => {
      lineEl.classList.toggle('done', index < STEPS.indexOf(data.status));
    });

    const driverWrap = document.getElementById('trackingDriverWrap');
    const driverEmpty = document.getElementById('trackingDriverEmpty');
    if (driverWrap && driverEmpty) {
      driverWrap.style.display = data.driver_name ? '' : 'none';
      driverEmpty.style.display = data.driver_name ? 'none' : '';
    }
    const driverName = document.getElementById('trackingDriverName');
    if (driverName) driverName.textContent = data.driver_name || 'Driver';
    const driverPhone = document.getElementById('trackingDriverPhone');
    if (driverPhone) {
      const phone = data.driver_phone || 'N/A';
      driverPhone.innerHTML = `📱 <a href="tel:${phone}" style="color:inherit;">${phone}</a>`;
    }
    const driverSpeed = document.getElementById('trackingDriverSpeed');
    if (driverSpeed) {
      driverSpeed.style.display = driverShared ? '' : 'none';
      driverSpeed.textContent = driverShared ? (data.speed_kmh > 0 ? `${Math.round(data.speed_kmh)} km/h` : 'Stopped') : '';
    }

    const driverHint = document.getElementById('trackingDriverHint');
    if (driverHint) driverHint.style.display = (!driverShared && data.driver_name) ? '' : 'none';
    const customerHint = document.getElementById('trackingCustomerHint');
    if (customerHint) customerHint.style.display = !customerShared ? '' : 'none';
    const updated = document.getElementById('trackingUpdated');
    if (updated) {
      updated.style.display = data.updated_at ? '' : 'none';
      updated.textContent = data.updated_at ? `Last driver update: ${new Date(data.updated_at).toLocaleTimeString()}` : '';
    }

    const historyWrap = document.getElementById('trackingHistoryWrap');
    if (historyWrap) historyWrap.innerHTML = window.renderTrackingHistoryPoints(data.tracking_points || []);

    return { customerShared, driverShared, etaLabel };
  }

  const originalRenderOrders = typeof window.renderOrders === 'function' ? window.renderOrders : null;
  if (originalRenderOrders) {
    window.renderOrders = function renderOrdersWithTrackingShortcut() {
      originalRenderOrders();
      renderActiveTrackingShortcut();
    };
  }

  window.recordTrackedOrder = function recordTrackedOrder(trackData) {
    if (!trackData || !trackData.order_id) return;
    const normalizedId = normalizeOrderId(trackData.order_id);
    if (!normalizedId) return;

    const historyEntry = {
      order_id: normalizedId,
      ordered_at: trackData.ordered_at || trackData.created_at || null,
      tracked_at: new Date().toISOString(),
      status: trackData.status || 'Confirmed',
      items: Array.isArray(trackData.items) ? trackData.items : [],
      driver_name: trackData.driver_name || '',
      driver_phone: trackData.driver_phone || '',
      customer_name: trackData.customer_name || '',
      address: trackData.address || '',
      latitude: trackData.latitude ?? null,
      longitude: trackData.longitude ?? null,
      customer_latitude: trackData.customer_latitude ?? null,
      customer_longitude: trackData.customer_longitude ?? null,
      speed_kmh: trackData.speed_kmh ?? 0,
      heading: trackData.heading ?? 0,
      updated_at: trackData.updated_at || null
    };

    const existingIdx = trackedOrdersHistory.findIndex((h) => normalizeOrderId(h.order_id) === normalizedId);
    if (existingIdx >= 0) trackedOrdersHistory.splice(existingIdx, 1);
    trackedOrdersHistory.unshift(historyEntry);
    trackedOrdersHistory = trackedOrdersHistory.slice(0, 12);
    saveState();
  };

  window.renderTrackingHistoryPoints = function renderTrackingHistoryPoints(points) {
    if (!Array.isArray(points) || points.length === 0) {
      return `
        <div class="track-card" style="margin-top:0.9rem;">
          <div class="track-card-header">
            <strong>Tracking Activity</strong>
          </div>
          <div class="track-no-driver">No live route updates have been recorded for this order yet.</div>
        </div>
      `;
    }

    const recentPoints = points.slice(-6).reverse();
    return `
      <div class="track-card" style="margin-top:0.9rem;">
        <div class="track-card-header">
          <strong>Recent Live Updates</strong>
        </div>
        ${recentPoints.map((point) => `
          <div class="tracking-history-row">
            <div>
              <div class="tracking-history-time">${formatOrderDate(point.recorded_at)}</div>
              <div class="tracking-history-meta">${point.actor_type === 'customer' ? 'Customer' : 'Driver'} · ${point.actor_name || 'Unknown'} · ${Number(point.latitude).toFixed(5)}, ${Number(point.longitude).toFixed(5)}</div>
            </div>
            <div class="tracking-history-speed">${point.speed_kmh > 0 ? Math.round(point.speed_kmh) + ' km/h' : 'Stopped'}</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  window.stopTrackingPoll = function stopTrackingPoll() {
    if (trackingPollInterval) {
      clearInterval(trackingPollInterval);
      trackingPollInterval = null;
    }
    currentTrackedOrderId = null;
    const mapContainer = document.getElementById('liveMapContainer');
    if (mapContainer) mapContainer.style.display = 'none';
    window.stopCustomerLocationSharing(false);
  };

  window.fetchAndRenderTracking = async function fetchAndRenderTracking(orderId) {
    const result = document.getElementById('trackResult');
    if (!result) return;

    try {
      const trackRes = await fetch(`${API_BASE}/tracking?order_id=${orderId}`);
      if (trackRes.status === 404) {
        result.innerHTML = `<div class="track-error">❌ Order #${orderId} was not found. Check the ID and try again.</div>`;
        window.stopTrackingPoll();
        return;
      }
      if (!trackRes.ok) {
        const errorPayload = await trackRes.json().catch(() => ({}));
        throw new Error(errorPayload.error || `Tracking request failed with ${trackRes.status}`);
      }

      const trackData = await trackRes.json();
      const historyRes = await fetch(`${API_BASE}/tracking/history?order_id=${orderId}`);
      const historyPayload = historyRes.ok
        ? await historyRes.json().catch(() => ({ tracking_points: [] }))
        : { tracking_points: [] };

      trackData.tracking_points = Array.isArray(historyPayload.tracking_points)
        ? historyPayload.tracking_points
        : [];

      window.recordTrackedOrder(trackData);
      window.renderTrackingResult(trackData);
    } catch (error) {
      console.error('Error tracking order:', error);
      const snapshot = getTrackedOrderSnapshot(orderId);
      if (snapshot) {
        window.renderTrackingResult({
          ...snapshot,
          order_id: snapshot.order_id,
          tracking_points: [],
          fallback_notice: true
        });
        result.innerHTML += `<div class="track-no-driver" style="margin-top:0.8rem;">Showing the last saved tracking snapshot from this device while live tracking is unavailable.</div>`;
        return;
      }
      result.innerHTML = `<div class="track-error">❌ Unable to load live tracking right now. Please try again shortly.</div>`;
    }
  };

  window.trackOrder = async function trackOrder() {
    const input = document.getElementById('trackInput').value.trim();
    if (!input) { showToast('⚠️ Enter an order ID'); return; }

    const orderId = normalizeOrderId(input);
    if (!orderId) { showToast('⚠️ Enter a valid numeric order ID'); return; }

    const result = document.getElementById('trackResult');
    if (!result) return;
    result.innerHTML = '<p style="color:var(--muted); text-align:center; padding:1rem;">⏳ Loading order details...</p>';

    window.stopTrackingPoll();
    currentTrackedOrderId = orderId;
    await window.fetchAndRenderTracking(orderId);
    trackingPollInterval = setInterval(async () => {
      if (currentTrackedOrderId !== orderId) {
        clearInterval(trackingPollInterval);
        return;
      }
      await window.fetchAndRenderTracking(orderId);
    }, 5000);
  };

  window.renderTrackingResult = function renderTrackingResult(data) {
    const result = document.getElementById('trackResult');
    if (!result) return;

    const statusColor = STATUS_COLORS[data.status] || 'var(--accent)';
    const statusIcon = STATUS_ICONS[data.status] || '📦';
    const stepIdx = STEPS.indexOf(data.status);
    const customerShared = isFiniteNumber(data.customer_latitude) && isFiniteNumber(data.customer_longitude);
    const driverShared = isFiniteNumber(data.latitude) && isFiniteNumber(data.longitude);
    const metrics = getTrackingMetrics(data);
    const distanceLabel = formatDistance(metrics.distanceKm);
    const etaLabel = formatEta(metrics.etaMinutes, data.status);
    const routeHint = driverShared && customerShared
      ? `${distanceLabel} • ${etaLabel}`
      : driverShared
        ? 'Driver is live. Waiting for customer location to estimate ETA.'
        : 'Live ETA will appear when the driver starts sharing.';

    result.innerHTML = `
      <div class="track-card">
        <div class="track-card-header">
          <strong>📦 Order #${data.order_id}</strong>
          <span class="track-status-badge" style="background:${statusColor};">${statusIcon} ${data.status}</span>
        </div>
        <div class="track-info-grid">
          <div><span class="track-label">Customer</span><span class="track-value">${data.customer_name || 'N/A'}</span></div>
          <div><span class="track-label">Address</span><span class="track-value">📍 ${data.address || 'N/A'}</span></div>
          <div><span class="track-label">Ordered</span><span class="track-value">${formatOrderDate(data.ordered_at)}</span></div>
          <div><span class="track-label">Items</span><span class="track-value">${formatOrderItems(data.items)}</span></div>
        </div>
        <div class="tracking-presence-row">
          <div class="presence-pill ${customerShared ? 'active' : ''}">${customerShared ? '📍 Customer live' : '📍 Customer not sharing yet'}</div>
          <div class="presence-pill ${driverShared ? 'active driver' : ''}">${driverShared ? '🚗 Driver live' : '🚗 Driver GPS not live yet'}</div>
        </div>
        <div class="tracking-metric-grid">
          <div class="tracking-metric-card">
            <span class="tracking-metric-label">Distance</span>
            <strong class="tracking-metric-value">${distanceLabel}</strong>
          </div>
          <div class="tracking-metric-card">
            <span class="tracking-metric-label">Estimated arrival</span>
            <strong class="tracking-metric-value">${etaLabel}</strong>
          </div>
          <div class="tracking-metric-card">
            <span class="tracking-metric-label">Live route</span>
            <strong class="tracking-metric-value">${routeHint}</strong>
          </div>
        </div>
        <div class="track-progress">
          ${STEPS.map((step, i) => `
            <div class="track-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}">
              <div class="track-step-dot">${i < stepIdx ? '✓' : STATUS_ICONS[step] || '●'}</div>
              <div class="track-step-label">${step}</div>
            </div>
            ${i < STEPS.length - 1 ? `<div class="track-step-line ${i < stepIdx ? 'done' : ''}"></div>` : ''}
          `).join('')}
        </div>
        ${data.driver_name ? `
          <div class="track-driver-info">
            <div class="track-driver-icon">🚗</div>
            <div>
              <div class="track-driver-name">${data.driver_name}</div>
              <div class="track-driver-phone">📱 <a href="tel:${data.driver_phone}" style="color:inherit;">${data.driver_phone || 'N/A'}</a></div>
            </div>
            ${driverShared ? `<div class="track-driver-speed">${data.speed_kmh > 0 ? Math.round(data.speed_kmh) + ' km/h' : 'Stopped'}</div>` : ''}
          </div>
        ` : '<div class="track-no-driver">Driver not yet assigned.</div>'}
        ${!driverShared && data.driver_name ? '<div class="track-no-driver">Driver assigned. Live GPS will appear once the rider starts sharing location.</div>' : ''}
        ${!customerShared ? '<div class="track-no-driver">Share your location in this screen so the rider can navigate to you faster.</div>' : ''}
        ${data.updated_at ? `<div class="track-updated">Last driver update: ${new Date(data.updated_at).toLocaleTimeString()}</div>` : ''}
      </div>
    `;
    result.innerHTML += window.renderTrackingHistoryPoints(data.tracking_points || []);

    const mapContainer = document.getElementById('liveMapContainer');
    if ((driverShared || customerShared) && mapContainer) {
      mapContainer.style.display = 'block';
      updateMap('trackLiveMap', data);
      document.getElementById('driverCardName').textContent = '🚗 ' + (data.driver_name || 'Driver');
      document.getElementById('driverCardPhone').textContent = '📱 ' + (data.driver_phone || 'N/A');
      document.getElementById('driverCardSpeed').textContent = driverShared
        ? (data.speed_kmh > 0 ? `🏎️ ${Math.round(data.speed_kmh)} km/h` : '🅿️ Stopped')
        : 'GPS offline';
      document.getElementById('driverCardEta').textContent = data.status === 'Delivered' ? 'Delivered' : etaLabel;
      document.getElementById('liveMapTitle').textContent = driverShared && customerShared ? 'Live customer & driver map' : 'Live delivery map';
      document.getElementById('liveMapUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString();
      renderAudienceCards(data, 'customer');
    } else if (mapContainer) {
      mapContainer.style.display = 'none';
    }

    if (data.status === 'Delivered') {
      window.stopTrackingPoll();
    }
  };

  window.trackOrderById = function trackOrderById(orderId) {
    showModal('trackModal');
    const input = document.getElementById('trackInput');
    if (input) {
      const numId = String(normalizeOrderId(orderId) || '').replace(/[^0-9]/g, '');
      input.value = numId || orderId;
    }
    window.trackOrder();
  };

  window.trackLatestActiveOrder = function trackLatestActiveOrder() {
    const activeOrder = getLatestActiveOrder();
    if (!activeOrder) {
      showToast('No active order is available to track right now.');
      return;
    }
    window.trackOrderById(activeOrder.id);
  };

  window.toggleCustomerLocationSharing = function toggleCustomerLocationSharing() {
    if (state.customerShareWatchId !== null || state.customerShareInterval) {
      window.stopCustomerLocationSharing();
      return;
    }

    const orderId = currentTrackedOrderId || normalizeOrderId(document.getElementById('trackInput')?.value || '');
    const statusEl = document.getElementById('customerShareStatus');
    const btn = document.getElementById('customerShareBtn');

    if (!orderId) {
      showToast('Track your order first, then share your location.');
      return;
    }
    if (!navigator.geolocation) {
      if (statusEl) statusEl.textContent = 'GPS unavailable';
      showToast('Your device does not support live location sharing.');
      return;
    }
    if (!window.isSecureContext) {
      if (statusEl) statusEl.textContent = 'HTTPS required';
      showToast('Customer live location requires the secure deployed site.');
      return;
    }

    state.customerSharingOrderId = orderId;
    if (btn) btn.textContent = '📴 Stop Sharing My Location';
    if (statusEl) statusEl.textContent = 'Starting...';

    const actorName = currentUser?.name || 'Customer';
    const sendCustomerLocation = async (position) => {
      try {
        await sendLiveLocationUpdate(orderId, 'customer', actorName, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speedKmh: position.coords.speed ? position.coords.speed * 3.6 : 0,
          heading: position.coords.heading || 0
        });
        if (statusEl) statusEl.textContent = 'Live now';
        if (currentTrackedOrderId === orderId) await window.fetchAndRenderTracking(orderId);
      } catch (error) {
        if (statusEl) statusEl.textContent = 'Error';
        showToast(error.message || 'Unable to share your location right now.');
      }
    };

    const onGpsError = (err) => {
      if (statusEl) statusEl.textContent = 'Permission needed';
      showToast(err.code === 1 ? 'Allow location permission to share your live position.' : 'Unable to read your current location.');
      window.stopCustomerLocationSharing(false);
    };

    navigator.geolocation.getCurrentPosition(sendCustomerLocation, onGpsError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 12000
    });
    state.customerShareWatchId = navigator.geolocation.watchPosition(sendCustomerLocation, onGpsError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000
    });
    state.customerShareInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendCustomerLocation, onGpsError, {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 8000
      });
    }, 6000);
  };

  window.stopCustomerLocationSharing = function stopCustomerLocationSharing(showMessage = true) {
    if (state.customerShareInterval) { clearInterval(state.customerShareInterval); state.customerShareInterval = null; }
    if (state.customerShareWatchId !== null) { navigator.geolocation.clearWatch(state.customerShareWatchId); state.customerShareWatchId = null; }
    state.customerSharingOrderId = null;
    const btn = document.getElementById('customerShareBtn');
    const statusEl = document.getElementById('customerShareStatus');
    if (btn) btn.textContent = '📍 Share My Live Location';
    if (statusEl) statusEl.textContent = 'Off';
    if (showMessage) showToast('Customer location sharing stopped');
  };

  window.startDriverSharing = function startDriverSharing() {
    const driverName = document.getElementById('driverShareName').value.trim();
    const orderId = parseInt(document.getElementById('driverShareOrderId').value.trim(), 10);
    const statusEl = document.getElementById('driverShareStatus');
    const btn = document.getElementById('driverShareBtn');

    if (!driverName) { showToast('⚠️ Enter your name'); return; }
    if (!orderId) { showToast('⚠️ Enter the order ID'); return; }
    if (!navigator.geolocation) {
      statusEl.innerHTML = `<div class="driver-share-error">❌ Your browser/device does not support GPS. Use a phone browser.</div>`;
      return;
    }
    if (!window.isSecureContext) {
      statusEl.innerHTML = `<div class="driver-share-error">❌ Live GPS only works on a secure HTTPS site. Open the deployed site instead of an insecure page.</div>`;
      return;
    }

    statusEl.innerHTML = `<div class="driver-share-loading">📡 Getting your GPS location...</div>`;
    btn.disabled = true;
    btn.textContent = '⏳ Sharing...';

    const refreshLiveView = async () => {
      const liveView = document.getElementById('driverLiveView');
      if (!liveView) return;
      try {
        const res = await fetch(`${API_BASE}/tracking?order_id=${orderId}`);
        if (!res.ok) return;
        const data = await res.json();
        const metrics = getTrackingMetrics(data);
        liveView.style.display = 'block';
        updateMap('driverLiveMap', data);
        renderAudienceCards(data, 'driver');
        const updatedEl = document.getElementById('driverLiveUpdated');
        if (updatedEl) {
          const summary = Number.isFinite(metrics.distanceKm)
            ? `${formatDistance(metrics.distanceKm)} • ${formatEta(metrics.etaMinutes, data.status)}`
            : 'Waiting for both live locations';
          updatedEl.textContent = `${summary} • Updated ${new Date().toLocaleTimeString()}`;
        }
      } catch (_) {}
    };

    if (state.driverTrackingPollInterval) clearInterval(state.driverTrackingPollInterval);
    state.driverTrackingPollInterval = setInterval(refreshLiveView, 5000);
    refreshLiveView();

    const sendLocation = async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const speed = position.coords.speed ? (position.coords.speed * 3.6) : 0;
      const heading = position.coords.heading || 0;
      const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

      try {
        await sendLiveLocationUpdate(orderId, 'driver', driverName, {
          latitude: lat,
          longitude: lng,
          speedKmh: speed,
          heading
        });
        statusEl.innerHTML = `
          <div class="driver-share-active">
            <div class="live-dot" style="display:inline-block; margin-right:6px;"></div>
            <strong>Sharing live location</strong><br/>
            <small>📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}</small><br/>
            <small>🏎️ ${Math.round(speed)} km/h · Order #${orderId}</small><br/>
            <small>🎯 Accuracy ${accuracy ? accuracy + 'm' : 'N/A'} · Updated ${new Date().toLocaleTimeString()}</small>
          </div>`;
        await refreshLiveView();
      } catch (error) {
        statusEl.innerHTML = `<div class="driver-share-error">⚠️ Could not send location: ${error.message}</div>`;
      }
    };

    const onGpsError = (err) => {
      const help = err.code === 1
        ? 'Allow location permission in your browser settings and try again.'
        : 'Make sure GPS/location is enabled on your device and try again outdoors if needed.';
      statusEl.innerHTML = `<div class="driver-share-error">❌ GPS error: ${err.message}<br/><small>${help}</small></div>`;
      btn.disabled = false;
      btn.textContent = '📍 Start Sharing Location';
      btn.onclick = window.startDriverSharing;
    };

    navigator.geolocation.getCurrentPosition(sendLocation, onGpsError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 12000
    });
    driverWatchId = navigator.geolocation.watchPosition(sendLocation, onGpsError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 10000
    });
    driverSharingInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendLocation, onGpsError, {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 8000
      });
    }, 5000);

    btn.textContent = '🛑 Stop Sharing';
    btn.onclick = window.stopDriverSharing;
    btn.disabled = false;
  };

  window.stopDriverSharing = function stopDriverSharing() {
    if (driverSharingInterval) { clearInterval(driverSharingInterval); driverSharingInterval = null; }
    if (driverWatchId !== null) { navigator.geolocation.clearWatch(driverWatchId); driverWatchId = null; }
    if (state.driverTrackingPollInterval) { clearInterval(state.driverTrackingPollInterval); state.driverTrackingPollInterval = null; }

    const statusEl = document.getElementById('driverShareStatus');
    const btn = document.getElementById('driverShareBtn');
    const liveView = document.getElementById('driverLiveView');
    if (statusEl) statusEl.innerHTML = `<div style="color:var(--muted); font-size:0.85rem;">📴 Location sharing stopped.</div>`;
    if (btn) {
      btn.textContent = '📍 Start Sharing Location';
      btn.onclick = window.startDriverSharing;
      btn.disabled = false;
    }
    if (liveView) liveView.style.display = 'none';
    showToast('📴 Location sharing stopped');
  };

  renderActiveTrackingShortcut();
})();
