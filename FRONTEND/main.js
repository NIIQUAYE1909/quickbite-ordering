// =============================================
// QuickBite — Upgraded Food Ordering System
// main.js — Full app logic & interactivity
// =============================================

// ---------- MENU DATA ----------
const menuData = [
  {
    id: 1, name: "Double Smash Burger",
    description: "Two smashed beef patties, cheddar, caramelized onions & special sauce",
    price: 55.00, emoji: "🍔", category: "burger", rating: 4.9, reviews: 210, badge: "HOT",
    prepTime: "15–20 min", calories: 820, popular: true
  },
  {
    id: 2, name: "Classic Margherita Pizza",
    description: "12″ hand-tossed dough, San Marzano tomato, fresh mozzarella & basil",
    price: 70.00, emoji: "🍕", category: "pizza", rating: 4.7, reviews: 155, badge: null,
    prepTime: "20–25 min", calories: 680, popular: false
  },
  {
    id: 3, name: "Waakye Special",
    description: "Waakye, fried fish, boiled egg, spaghetti, stew & kelewele",
    price: 30.00, emoji: "🍜", category: "local", rating: 4.9, reviews: 340, badge: "FAN FAV",
    prepTime: "10–15 min", calories: 740, popular: true
  },
  {
    id: 4, name: "Grilled Chicken Combo",
    description: "Whole grilled chicken, jollof rice, coleslaw & chilled drink",
    price: 75.00, emoji: "🍗", category: "chicken", rating: 4.8, reviews: 190, badge: "DEAL",
    prepTime: "20–30 min", calories: 920, popular: true
  },
  {
    id: 5, name: "Pepperoni Pizza",
    description: "Premium pepperoni, triple mozzarella on a crispy thin crust",
    price: 80.00, emoji: "🍕", category: "pizza", rating: 4.6, reviews: 95, badge: null,
    prepTime: "20–25 min", calories: 750, popular: false
  },
  {
    id: 6, name: "Chicken Shawarma",
    description: "Grilled chicken strips, garlic mayo, veggies wrapped in warm pita",
    price: 35.00, emoji: "🌯", category: "chicken", rating: 4.8, reviews: 280, badge: null,
    prepTime: "10–15 min", calories: 560, popular: true
  },
  {
    id: 7, name: "Banku & Tilapia",
    description: "Freshly made banku with whole grilled tilapia and pepper sauce",
    price: 45.00, emoji: "🐟", category: "local", rating: 4.9, reviews: 410, badge: "LOCAL FAV",
    prepTime: "15–20 min", calories: 680, popular: true
  },
  {
    id: 8, name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center, served with vanilla ice cream",
    price: 28.00, emoji: "🍰", category: "dessert", rating: 4.7, reviews: 120, badge: null,
    prepTime: "10 min", calories: 480, popular: false
  },
  {
    id: 9, name: "Fresh Fruit Smoothie",
    description: "Blended mango, pineapple, strawberry with a hint of ginger",
    price: 20.00, emoji: "🥤", category: "drinks", rating: 4.6, reviews: 88, badge: null,
    prepTime: "5 min", calories: 180, popular: false
  },
  {
    id: 10, name: "Cheese Burger Deluxe",
    description: "Juicy beef patty, bacon, triple cheese, lettuce, tomato & pickle",
    price: 60.00, emoji: "🍔", category: "burger", rating: 4.8, reviews: 175, badge: null,
    prepTime: "15–20 min", calories: 890, popular: false
  },
  {
    id: 11, name: "Jollof Rice Special",
    description: "Party jollof rice with fried plantain, coleslaw & your choice of protein",
    price: 40.00, emoji: "🍚", category: "local", rating: 4.9, reviews: 520, badge: "BESTSELLER",
    prepTime: "10–15 min", calories: 620, popular: true
  },
  {
    id: 12, name: "Strawberry Cheesecake",
    description: "Creamy New York cheesecake on graham cracker crust, topped with strawberry coulis",
    price: 32.00, emoji: "🍓", category: "dessert", rating: 4.8, reviews: 76, badge: null,
    prepTime: "5 min", calories: 520, popular: false
  },
  {
    id: 13, name: "BBQ Chicken Pizza",
    description: "Smoky BBQ sauce, grilled chicken, red onions, jalapeños & mozzarella",
    price: 85.00, emoji: "🍕", category: "pizza", rating: 4.7, reviews: 112, badge: null,
    prepTime: "20–25 min", calories: 720, popular: false
  },
  {
    id: 14, name: "Sobolo Delight",
    description: "Chilled hibiscus drink with ginger, mint & a squeeze of lime",
    price: 15.00, emoji: "🍹", category: "drinks", rating: 4.8, reviews: 203, badge: "LOCAL FAV",
    prepTime: "3 min", calories: 90, popular: true
  },
  {
    id: 15, name: "Spicy Wings (12pc)",
    description: "Crispy chicken wings tossed in fiery scotch bonnet sauce, with ranch dip",
    price: 65.00, emoji: "🍗", category: "chicken", rating: 4.9, reviews: 330, badge: "HOT",
    prepTime: "20–25 min", calories: 760, popular: true
  }
];

// ---------- PROMO CODES ----------
const promoCodes = {
  'WELCOME50': { type: 'percent', value: 50, desc: '50% off your order' },
  'SAVE10':    { type: 'flat',    value: 10, desc: 'GH₵10 off your order' },
  'QUICKBITE': { type: 'percent', value: 15, desc: '15% off your order' },
  'FREEDEL':   { type: 'delivery',value: 0,  desc: 'Free delivery' },
  'LOCAL20':   { type: 'percent', value: 20, desc: '20% off local dishes' }
};

// ---------- STATE ----------
let cart = [];
let wishlist = [];
let orders = [];
let currentCategory = 'all';
let currentUser = null;
let activePromo = null;
let currentRating = 0;
let reviewItemId = null;
let deliveryFee = 5;

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  // Load saved state from localStorage
  loadState();
  renderMenu(menuData);
  renderOrders();
  updateAuthUI();
  updateWishlistUI();
  checkAdminLogin(); // Check admin login status
  loadAllOrdersAdmin(); // Load admin orders

  // Navbar scroll shrink
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      if (document.getElementById('cartSidebar').classList.contains('open')) toggleCart();
      if (document.getElementById('wishlistSidebar').classList.contains('open')) toggleWishlist();
    }
  });
});

// ---------- SAVE / LOAD STATE (localStorage) ----------
function saveState() {
  try {
    localStorage.setItem('qb_cart', JSON.stringify(cart));
    localStorage.setItem('qb_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('qb_orders', JSON.stringify(orders));
    localStorage.setItem('qb_user', JSON.stringify(currentUser));
  } catch (e) {}
}

function loadState() {
  try {
    cart      = JSON.parse(localStorage.getItem('qb_cart'))    || [];
    wishlist  = JSON.parse(localStorage.getItem('qb_wishlist')) || [];
    orders    = JSON.parse(localStorage.getItem('qb_orders'))   || [];
    currentUser = JSON.parse(localStorage.getItem('qb_user'))   || null;
    updateCartUI();
  } catch (e) {
    cart = []; wishlist = []; orders = []; currentUser = null;
  }
}

// ---------- RENDER MENU ----------
function renderMenu(items) {
  const grid  = document.getElementById('menuGrid');
  const count = document.getElementById('menuCount');

  if (items.length === 0) {
    grid.innerHTML = `<div style="color:var(--muted); grid-column:1/-1; padding:2rem 0; font-size:0.9rem;">
      😕 No items found. Try a different search or category!
    </div>`;
    count.textContent = '';
    return;
  }

  count.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} available`;

  grid.innerHTML = items.map((item, index) => {
    const isWishlisted = wishlist.some(w => w.id === item.id);
    return `
    <div class="menu-card" style="animation-delay:${index * 0.05}s;" onclick="showFoodDetails(${item.id})">
      <div class="menu-card-img">
        <span>${item.emoji}</span>
        ${item.badge ? `<div class="menu-badge">${item.badge}</div>` : ''}
        <button class="card-wishlist-btn ${isWishlisted ? 'liked' : ''}"
          onclick="event.stopPropagation(); toggleWishlistItem(${item.id})"
          title="${isWishlisted ? 'Remove from favourites' : 'Add to favourites'}">
          ${isWishlisted ? '♥' : '♡'}
        </button>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.description}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">GH₵ ${item.price.toFixed(2)}</div>
          <div class="menu-card-rating"><span>★</span> ${item.rating} (${item.reviews})</div>
        </div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${item.id})">
          + Add to Cart
        </button>
      </div>
    </div>`;
  }).join('');
}

// ---------- FOOD DETAIL MODAL ----------
function showFoodDetails(itemId) {
  const item = menuData.find(i => i.id === itemId);
  if (!item) return;

  const inCart = cart.find(c => c.id === itemId);
  const isWishlisted = wishlist.some(w => w.id === itemId);

  document.getElementById('foodModalBody').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:5.5rem; margin-bottom:1rem; line-height:1;">${item.emoji}</div>
      ${item.badge ? `<span class="menu-badge" style="position:relative; display:inline-block; margin-bottom:0.8rem;">${item.badge}</span><br/>` : ''}
      <h2 style="font-family:'Playfair Display',serif; margin-bottom:0.4rem;">${item.name}</h2>
      <p style="color:var(--muted); margin-bottom:1rem; font-size:0.88rem;">${item.description}</p>

      <div style="display:flex; gap:1.5rem; justify-content:center; margin-bottom:1.2rem; flex-wrap:wrap;">
        <div style="text-align:center;">
          <div style="font-size:1rem;">⭐</div>
          <div style="font-size:0.8rem; color:var(--muted);">${item.rating} (${item.reviews} reviews)</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1rem;">⏱️</div>
          <div style="font-size:0.8rem; color:var(--muted);">${item.prepTime}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1rem;">🔥</div>
          <div style="font-size:0.8rem; color:var(--muted);">${item.calories} cal</div>
        </div>
      </div>

      <div style="font-size:2rem; font-weight:700; color:var(--accent); margin-bottom:1.5rem; font-family:'Playfair Display',serif;">
        GH₵ ${item.price.toFixed(2)}
      </div>

      <button class="btn-primary full" onclick="addToCart(${item.id}); closeModal('foodModal');">
        ${inCart ? '+ Add Another' : '+ Add to Cart'}
      </button>
      <button onclick="toggleWishlistItem(${item.id}); closeModal('foodModal');"
        style="width:100%; background:transparent; border:1px solid var(--border2); color:${isWishlisted ? '#ff6b8a' : 'var(--muted)'}; padding:0.7rem; border-radius:12px; font-size:0.88rem; cursor:pointer; margin-top:0.6rem; transition:all 0.2s; font-family:'DM Sans',sans-serif;">
        ${isWishlisted ? '♥ Remove from Favourites' : '♡ Add to Favourites'}
      </button>
    </div>`;

  showModal('foodModal');
}

// ---------- FILTERS ----------
function filterCategory(category, btn) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentCategory = category;
  applyFilters();
}

function filterMenu() { applyFilters(); }

function applyFilters() {
  const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
  const sortVal    = document.getElementById('sortSelect').value;

  let filtered = [...menuData];

  // If search text is entered, search across ALL categories
  // Otherwise, filter by current category
  if (searchText) {
    // Search across everything - ignore category filter when searching
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(searchText) ||
      i.description.toLowerCase().includes(searchText) ||
      i.category.toLowerCase().includes(searchText)
    );
  } else if (currentCategory !== 'all') {
    filtered = filtered.filter(i => i.category === currentCategory);
  }

  // Sort
  if (sortVal === 'price-asc')   filtered.sort((a, b) => a.price - b.price);
  if (sortVal === 'price-desc')  filtered.sort((a, b) => b.price - a.price);
  if (sortVal === 'rating')      filtered.sort((a, b) => b.rating - a.rating);
  if (sortVal === 'popular')     filtered.sort((a, b) => b.reviews - a.reviews);

  renderMenu(filtered);
}

// ---------- CART ----------
function addToCart(itemId) {
  const item = menuData.find(i => i.id === itemId);
  if (!item) return;

  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  updateCartUI();
  saveState();
  showToast(`${item.emoji} ${item.name} added to cart!`);

  // Bump animation on cart count
  const cc = document.getElementById('cartCount');
  cc.classList.add('bump');
  setTimeout(() => cc.classList.remove('bump'), 300);
}

function changeQty(itemId, change) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  }

  updateCartUI();
  saveState();
}

function clearCart() {
  if (cart.length === 0) return;
  if (!confirm('Clear all items from your cart?')) return;
  cart = [];
  activePromo = null;
  updateCartUI();
  saveState();
  showToast('🗑️ Cart cleared');
}

function updateCartUI() {
  const cartItemsEl  = document.getElementById('cartItems');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartCountEl  = document.getElementById('cartCount');
  const promoSection = document.getElementById('promoSection');
  const cartInstructions = document.getElementById('cartInstructions');

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-cart">Your cart is empty 😔<br/><small>Add some delicious food!</small></div>`;
    cartFooterEl.style.display = 'none';
    if (promoSection) promoSection.style.display = 'none';
    if (cartInstructions) cartInstructions.style.display = 'none';
    return;
  }

  if (promoSection) promoSection.style.display = 'block';
  if (cartInstructions) cartInstructions.style.display = 'block';

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">GH₵ ${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>`).join('');

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  let discount = 0;

  if (activePromo) {
    const p = promoCodes[activePromo];
    if (p.type === 'percent')   discount = subtotal * (p.value / 100);
    if (p.type === 'flat')      discount = Math.min(p.value, subtotal);
    if (p.type === 'delivery')  deliveryFee = 0;
  }

  const grandTotal = subtotal - discount + deliveryFee;

  document.getElementById('cartTotal').textContent = `GH₵ ${subtotal.toFixed(2)}`;
  document.getElementById('deliveryFeeDisplay').textContent = `GH₵ ${deliveryFee.toFixed(2)}`;
  document.getElementById('cartGrandTotal').textContent = `GH₵ ${grandTotal.toFixed(2)}`;

  const discountRow = document.getElementById('discountRow');
  if (discount > 0 && discountRow) {
    discountRow.style.display = 'flex';
    document.getElementById('discountAmt').textContent = `-GH₵ ${discount.toFixed(2)}`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }

  cartFooterEl.style.display = 'block';
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  // Close wishlist if open
  if (document.getElementById('wishlistSidebar').classList.contains('open')) {
    document.getElementById('wishlistSidebar').classList.remove('open');
    document.getElementById('wishlistOverlay').classList.remove('open');
  }
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

// ---------- PROMO CODES ----------
function applyPromo(code) {
  const promo = promoCodes[code.toUpperCase()];
  if (!promo) {
    showToast('❌ Invalid promo code');
    return;
  }
  activePromo = code.toUpperCase();
  deliveryFee = promo.type === 'delivery' ? 0 : 5;
  updateCartUI();
  showToast(`🎉 Promo applied: ${promo.desc}!`);
}

function applyPromoFromCart() {
  const code = document.getElementById('promoInput').value.trim();
  const promo = promoCodes[code.toUpperCase()];
  const msg = document.getElementById('promoMsg');

  if (!code) {
    msg.innerHTML = `<span style="color:var(--error);">Please enter a code.</span>`;
    return;
  }

  if (!promo) {
    msg.innerHTML = `<span style="color:var(--error);">Invalid promo code.</span>`;
    return;
  }

  activePromo = code.toUpperCase();
  deliveryFee = promo.type === 'delivery' ? 0 : 5;
  msg.innerHTML = `<span style="color:var(--success);">✅ ${promo.desc} applied!</span>`;
  updateCartUI();
}

// ---------- WISHLIST ----------
function toggleWishlistItem(itemId) {
  const item = menuData.find(i => i.id === itemId);
  if (!item) return;

  const idx = wishlist.findIndex(w => w.id === itemId);
  if (idx === -1) {
    wishlist.push(item);
    showToast(`♥ ${item.name} added to favourites!`);
  } else {
    wishlist.splice(idx, 1);
    showToast(`💔 ${item.name} removed from favourites`);
  }

  updateWishlistUI();
  saveState();

  // Re-render menu to update heart icons
  applyFilters();
}

function updateWishlistUI() {
  const countEl = document.getElementById('wishlistCount');
  countEl.textContent = wishlist.length;

  const listEl = document.getElementById('wishlistItems');
  if (wishlist.length === 0) {
    listEl.innerHTML = `<div class="empty-cart">No favourites yet 💔<br/><small>Tap ♡ on any item!</small></div>`;
    return;
  }

  listEl.innerHTML = wishlist.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">GH₵ ${item.price.toFixed(2)}</div>
      </div>
      <button class="qty-btn" onclick="addToCart(${item.id}); toggleWishlist();" title="Add to cart" style="background:var(--accent); min-width:26px;">+</button>
    </div>`).join('');
}

function toggleWishlist() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = document.getElementById('wishlistOverlay');
  if (document.getElementById('cartSidebar').classList.contains('open')) {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
  }
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

// ---------- CHECKOUT & ORDER ----------
function initiateCheckout() {
  if (cart.length === 0) return;

  // Prefill name if logged in
  if (currentUser) {
    document.getElementById('checkoutName').value = currentUser.name || '';
    document.getElementById('checkoutPhone').value = currentUser.phone || '';
  }

  renderCheckoutSummary();
  toggleCart();
  showModal('checkoutModal');
}

function renderCheckoutSummary() {
  const summaryEl = document.getElementById('checkoutSummary');
  const totalsEl  = document.getElementById('checkoutTotals');

  summaryEl.innerHTML = cart.map(item => `
    <div class="checkout-summary-item">
      <span>${item.emoji} ${item.name} × ${item.qty}</span>
      <span>GH₵ ${(item.price * item.qty).toFixed(2)}</span>
    </div>`).join('');

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  let discount = 0;
  if (activePromo) {
    const p = promoCodes[activePromo];
    if (p.type === 'percent') discount = subtotal * (p.value / 100);
    if (p.type === 'flat')    discount = Math.min(p.value, subtotal);
  }
  const fee = deliveryFee;
  const grand = subtotal - discount + fee;

  totalsEl.innerHTML = `
    <div class="checkout-total-row"><span>Subtotal</span><strong>GH₵ ${subtotal.toFixed(2)}</strong></div>
    ${discount > 0 ? `<div class="checkout-total-row"><span style="color:var(--success)">Discount</span><strong style="color:var(--success)">-GH₵ ${discount.toFixed(2)}</strong></div>` : ''}
    <div class="checkout-total-row"><span>Delivery</span><strong>GH₵ ${fee.toFixed(2)}</strong></div>
    <div class="checkout-total-row grand"><span>Total</span><strong>GH₵ ${grand.toFixed(2)}</strong></div>`;
}

function updateDeliveryFee() {
  const sel = document.getElementById('checkoutZone');
  deliveryFee = parseInt(sel.value) || 5;
  renderCheckoutSummary();
  updateCartUI();
}

function togglePaymentFields() {
  const method = document.querySelector('input[name="payment"]:checked').value;
  document.getElementById('momoFields').style.display  = method === 'momo' ? 'block' : 'none';
  document.getElementById('cardFields').style.display  = method === 'card' ? 'block' : 'none';
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

const API_BASE = 'http://localhost:8080/api';

async function placeOrder() {
  // Validate fields
  const name    = document.getElementById('checkoutName').value.trim();
  const phone   = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const method  = document.querySelector('input[name="payment"]:checked').value;
  const instructions = document.getElementById('specialInstructions')?.value.trim() || '';

  if (!name || !phone || !address) {
    showToast('⚠️ Please fill in your delivery details');
    return;
  }

  if (method === 'momo' && !document.getElementById('momoNumber').value.trim()) {
    showToast('⚠️ Please enter your MoMo number');
    return;
  }

  if (method === 'card') {
    const card = document.getElementById('cardNumber').value.replace(/\s/g, '');
    if (card.length < 16) { showToast('⚠️ Invalid card number'); return; }
  }

  const subtotal   = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  let discount = 0;
  if (activePromo) {
    const p = promoCodes[activePromo];
    if (p.type === 'percent') discount = subtotal * (p.value / 100);
    if (p.type === 'flat')    discount = Math.min(p.value, subtotal);
  }
  const grandTotal = subtotal - discount + deliveryFee;
  const orderId = `QB-${Date.now()}`;

  // Data for backend (simple format)
  const backendOrderData = {
    customer_name: name,
    phone: phone,
    address: address,
    total: grandTotal
  };

  // Data for local display (complex format)
  const orderData = {
    id: orderId,
    customer: { name, phone, address },
    items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    subtotal, discount, deliveryFee, grandTotal,
    payment: method,
    instructions,
    promo: activePromo,
    time: new Date().toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }),
    status: 'Confirmed'
  };

  // Try backend, fallback to local
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendOrderData)
    });
    if (res.ok) {
      const result = await res.json();
      orderData.id = `QB-${result.orderId || Date.now()}`;
      orderData.status = result.status || 'Confirmed';
    }
  } catch (_) {
    // Use local fallback — already set above
  }

  // Save order
  orders.unshift(orderData);
  saveState();

  // Clear cart
  cart = [];
  activePromo = null;
  deliveryFee = 5;
  updateCartUI();

  closeModal('checkoutModal');
  renderOrders();
  scrollToSection('orders');
  showOrderSuccess(orderData);
}

function showOrderSuccess(order) {
  document.getElementById('successMsg').textContent =
    `Your food is being prepared for delivery to ${order.customer.address}.`;
  document.getElementById('successOrderId').textContent = order.id;
  showModal('successModal');

  // Simulate order status progression
  const steps = ['step1','step2','step3','step4'];
  let current = 0;
  steps[0].split && document.getElementById(steps[0]).classList.add('active');

  const interval = setInterval(() => {
    current++;
    if (current >= steps.length) { clearInterval(interval); return; }

    const el = document.getElementById(steps[current]);
    el.classList.add('active');
    document.getElementById(steps[current - 1]).classList.add('done');
    document.getElementById(steps[current - 1]).classList.remove('active');

    // Update order status in list
    const statusMap = { 1:'Preparing', 2:'On the way', 3:'Delivered' };
    if (statusMap[current]) {
      const ord = orders.find(o => o.id === order.id);
      if (ord) { ord.status = statusMap[current]; saveState(); renderOrders(); }
    }
  }, 4000);
}

// ---------- RENDER ORDERS ----------
function renderOrders() {
  const list = document.getElementById('ordersList');
  const clearBtn = document.getElementById('clearOrdersBtn');

  if (orders.length === 0) {
    list.innerHTML = `<div class="empty-orders">No orders yet. Start ordering! 🍽️</div>`;
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  if (clearBtn) clearBtn.style.display = 'inline-flex';

  list.innerHTML = orders.map(order => {
    const statusClass = {
      'Confirmed': '', 'Preparing': 'preparing', 'On the way': 'transit',
      'Delivered': '', 'Cancelled': 'pending'
    }[order.status] || '';

    return `
    <div class="order-card">
      <div class="order-info">
        <strong>Order ${order.id}</strong>
        <span>${order.items.map(i => `${i.emoji || ''} ${i.name} ×${i.qty}`).join(' · ')}</span><br/>
        <span style="margin-top:0.15rem; display:block;">${order.time}</span>
      </div>
      <div class="order-right">
        <div class="price">GH₵ ${order.grandTotal.toFixed(2)}</div>
        <div class="order-status ${statusClass}">${order.status}</div>
        <div class="order-actions">
          <button onclick="trackOrderById('${order.id}')">📍 Track</button>
          <button onclick="reorder('${order.id}')">🔁 Reorder</button>
          <button onclick="openReview('${order.id}')">⭐ Review</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function clearOrders() {
  if (!confirm('Clear your entire order history?')) return;
  orders = [];
  saveState();
  renderOrders();
  showToast('🗑️ Order history cleared');
}

// ========== ADMIN PANEL FUNCTIONS ==========
// Simple admin password protection
const ADMIN_PASSWORD = 'quickbite2025'; // Change this to your desired password
let isAdminLoggedIn = false;

function showAdminLogin() {
  if (isAdminLoggedIn) {
    // Already logged in, scroll to admin section
    scrollToSection('admin');
  } else {
    showModal('adminLoginModal');
  }
}

function verifyAdmin() {
  const password = document.getElementById('adminPassword').value;
  const errorMsg = document.getElementById('adminLoginError');
  
  if (password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    closeModal('adminLoginModal');
    scrollToSection('admin');
    showToast('✅ Welcome to Admin Panel!');
    // Save admin state
    try {
      localStorage.setItem('qb_admin_logged_in', 'true');
    } catch(e) {}
  } else {
    errorMsg.style.display = 'block';
  }
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  try {
    localStorage.removeItem('qb_admin_logged_in');
  } catch(e) {}
  showToast('👋 Admin logged out');
  // Hide admin section
  document.getElementById('admin').scrollIntoView({behavior: 'smooth'});
}

// Check admin login on page load
function checkAdminLogin() {
  try {
    if (localStorage.getItem('qb_admin_logged_in') === 'true') {
      isAdminLoggedIn = true;
    }
  } catch(e) {}
}

// ========== ADMIN PANEL FUNCTIONS ==========
async function loadAllOrdersAdmin() {
  const list = document.getElementById('adminOrdersList');
  const stats = document.getElementById('adminStats');
  
  if (!list) { showToast('Admin panel not found'); return; }
  
  list.innerHTML = '<div class="empty-orders">Loading orders from database...</div>';
  
  try {
    const response = await fetch(`${API_BASE}/orders`);
    const dbOrders = await response.json();
    
    if (!Array.isArray(dbOrders) || dbOrders.length === 0) {
      list.innerHTML = '<div class="empty-orders">No orders in database yet! 🍽️</div>';
      if (stats) stats.innerHTML = '';
      return;
    }
    
    // Calculate stats
    const totalRevenue = dbOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const confirmed = dbOrders.filter(o => o.status === 'Confirmed').length;
    const preparing = dbOrders.filter(o => o.status === 'Preparing').length;
    const onTheWay = dbOrders.filter(o => o.status === 'On the way').length;
    const delivered = dbOrders.filter(o => o.status === 'Delivered').length;
    
    if (stats) {
      stats.innerHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; margin-bottom:1.5rem;"><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:var(--accent);">${dbOrders.length}</div><div style="font-size:0.8rem; color:var(--muted);">Total Orders</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:var(--success);">GH₵ ${totalRevenue.toFixed(2)}</div><div style="font-size:0.8rem; color:var(--muted);">Total Revenue</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:orange;">${confirmed}</div><div style="font-size:0.8rem; color:var(--muted);">Confirmed</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:blue;">${onTheWay}</div><div style="font-size:0.8rem; color:var(--muted);">On the Way</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:green;">${delivered}</div><div style="font-size:0.8rem; color:var(--muted);">Delivered</div></div></div>`;
    }
    
    list.innerHTML = dbOrders.map(order => `<div class="order-card" style="flex-direction:column; gap:0.5rem;"><div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;"><div><strong style="font-size:1.1rem;">📦 Order #${order.id}</strong><span style="margin-left:0.5rem; padding:0.2rem 0.5rem; border-radius:6px; font-size:0.75rem; background:${order.status === 'Delivered' ? 'green' : order.status === 'On the way' ? 'blue' : order.status === 'Preparing' ? 'orange' : 'var(--accent)'};">${order.status}</span></div><div style="font-weight:700; color:var(--accent); font-size:1.2rem;">GH₵ ${parseFloat(order.total || 0).toFixed(2)}</div></div><div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:0.5rem; font-size:0.85rem; color:var(--muted);"><div><strong>👤 Customer:</strong> ${order.customer_name || 'N/A'}</div><div><strong>📱 Phone:</strong> ${order.phone || 'N/A'}</div><div><strong>📍 Address:</strong> ${order.address || 'N/A'}</div><div><strong>🕐 Time:</strong> ${order.created_at || 'N/A'}</div>${order.driver_name ? `<div><strong>🚗 Driver:</strong> ${order.driver_name} (${order.driver_phone || 'N/A'})</div>` : ''}</div><div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border);">${order.status === 'Confirmed' ? `<button onclick="updateOrderStatus(${order.id}, 'Preparing')" style="background:orange; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer;">🍳 Start Preparing</button>` : ''}${order.status === 'Preparing' ? `<button onclick="showAssignDriverModal(${order.id}, '${order.customer_name}', '${order.phone}', '${order.address}', ${order.total})" style="background:blue; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer;">🚗 Assign Driver</button>` : ''}${order.status === 'On the way' ? `<button onclick="updateOrderStatus(${order.id}, 'Delivered')" style="background:green; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer;">✅ Mark Delivered</button>` : ''}</div></div>`).join('');
    
  } catch (error) {
    console.error('Error loading orders:', error);
    list.innerHTML = '<div class="empty-orders">❌ Error loading orders. Is the backend running?</div>';
  }
}

function showAssignDriverModal(orderId, customerName, phone, address, total) {
  const modal = document.createElement('div');
  modal.id = 'driverModal';
  modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;';
  modal.innerHTML = `<div style="background:var(--card); padding:2rem; border-radius:16px; max-width:400px; width:90%; box-shadow:0 10px 40px rgba(0,0,0,0.3);"><h3 style="margin:0 0 1rem; color:var(--text);">🚗 Assign Driver - Order #${orderId}</h3><div style="margin-bottom:1rem; padding:0.8rem; background:var(--bg); border-radius:8px; font-size:0.85rem;"><div><strong>Customer:</strong> ${customerName}</div><div><strong>Phone:</strong> ${phone}</div><div><strong>Address:</strong> ${address}</div><div><strong>Total:</strong> GH₵${parseFloat(total).toFixed(2)}</div></div><input type="text" id="driverName" placeholder="Driver name" style="width:100%; padding:0.8rem; margin-bottom:0.8rem; border:1px solid var(--border); border-radius:8px; background:var(--bg); color:var(--text); box-sizing:border-box;"><input type="tel" id="driverPhone" placeholder="Driver phone number" style="width:100%; padding:0.8rem; margin-bottom:1rem; border:1px solid var(--border); border-radius:8px; background:var(--bg); color:var(--text); box-sizing:border-box;"><div style="display:flex; gap:0.5rem;"><button onclick="assignDriver(${orderId})" style="flex:1; background:var(--accent); color:white; border:none; padding:0.8rem; border-radius:8px; cursor:pointer; font-weight:600;">✅ Assign & Send</button><button onclick="document.getElementById('driverModal').remove()" style="flex:1; background:var(--border); color:var(--text); border:none; padding:0.8rem; border-radius:8px; cursor:pointer;">Cancel</button></div></div>`;
  document.body.appendChild(modal);
}

async function assignDriver(orderId) {
  const driverName = document.getElementById('driverName').value.trim();
  const driverPhone = document.getElementById('driverPhone').value.trim();
  
  if (!driverName || !driverPhone) {
    showToast('⚠️ Please enter driver name and phone');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/driver`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_name: driverName, driver_phone: driverPhone })
    });
    
    if (response.ok) {
      showToast('🚗 Driver assigned! Customer notified.');
      document.getElementById('driverModal')?.remove();
      loadAllOrdersAdmin();
    } else {
      showToast('❌ Failed to assign driver');
    }
  } catch (error) {
    console.error('Error assigning driver:', error);
    showToast('❌ Error assigning driver');
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.ok) {
      showToast(`📋 Order status updated to ${newStatus}`);
      loadAllOrdersAdmin();
    } else {
      showToast('❌ Failed to update status');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('❌ Error updating status');
  }
}

function reorder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.items.forEach(i => {
    const menuItem = menuData.find(m => m.id === i.id);
    if (!menuItem) return;
    const existing = cart.find(c => c.id === i.id);
    if (existing) existing.qty += i.qty;
    else cart.push({ ...menuItem, qty: i.qty });
  });

  updateCartUI();
  saveState();
  showToast('🔁 Items added to cart!');
  toggleCart();
}

// ---------- ORDER TRACKING ----------
async function trackOrder() {
  const input = document.getElementById('trackInput').value.trim();
  if (!input) { showToast('⚠️ Enter an order ID'); return; }
  
  const result = document.getElementById('trackResult');
  if (!result) return;
  
  result.innerHTML = '<p style="color:var(--muted);">Loading order details...</p>';
  
  try {
    // Fetch order from backend
    const response = await fetch(`${API_BASE}/orders`);
    const dbOrders = await response.json();
    const order = dbOrders.find(o => o.id === parseInt(input));
    
    if (!order) {
      result.innerHTML = `<p style="color:var(--error); font-size:0.85rem;">❌ Order not found. Check the ID and try again.</p>`;
      return;
    }
    
    // Determine status color and icon
    const statusColors = {
      'Confirmed': 'var(--accent)',
      'Preparing': 'orange',
      'On the way': 'blue',
      'Delivered': 'green'
    };
    const statusIcons = {
      'Confirmed': '✅',
      'Preparing': '🍳',
      'On the way': '🚗',
      'Delivered': '🎉'
    };
    const statusColor = statusColors[order.status] || 'var(--accent)';
    const statusIcon = statusIcons[order.status] || '📦';
    
    // Build driver info if available
    const driverInfo = order.driver_name ? `
      <div style="margin-top:1rem; padding:1rem; background:blue; border-radius:8px; color:white;">
        <div style="font-size:0.9rem; font-weight:600;">🚗 Your Delivery Driver</div>
        <div style="font-size:1.1rem; margin-top:0.3rem;">${order.driver_name}</div>
        <div style="font-size:0.85rem; opacity:0.9;">📱 ${order.driver_phone || 'N/A'}</div>
        <div style="font-size:0.75rem; opacity:0.8; margin-top:0.5rem;">Call driver when arriving</div>
      </div>
    ` : '';
    
    result.innerHTML = `
      <div class="track-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <strong style="font-size:1.2rem;">📦 Order #${order.id}</strong>
          <span style="padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; background:${statusColor}; color:white; font-weight:600;">${statusIcon} ${order.status}</span>
        </div>
        <div style="font-size:0.85rem; color:var(--muted); margin-bottom:0.8rem;">
          <div><strong>Customer:</strong> ${order.customer_name || 'N/A'}</div>
          <div><strong>Total:</strong> GH₵${parseFloat(order.total || 0).toFixed(2)}</div>
          <div><strong>Ordered:</strong> ${order.created_at || 'N/A'}</div>
        </div>
        <div style="padding:0.8rem; background:var(--bg); border-radius:8px; font-size:0.85rem;">
          <div style="margin-bottom:0.5rem;"><strong>📍 Delivery Address:</strong></div>
          <div>${order.address || 'N/A'}</div>
        </div>
        ${driverInfo}
        <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border);">
          <div style="font-size:0.8rem; color:var(--muted); margin-bottom:0.5rem;">Delivery Progress:</div>
          <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.75rem;">
            <span style="color:${order.status !== 'Confirmed' ? 'green' : 'var(--muted)'}">✅ Confirmed</span>
            <span style="flex:1; height:2px; background:${order.status !== 'Confirmed' ? 'green' : 'var(--border)'};"></span>
            <span style="color:${order.status === 'Preparing' || order.status === 'On the way' || order.status === 'Delivered' ? 'green' : 'var(--muted)'}">🍳 Preparing</span>
            <span style="flex:1; height:2px; background:${order.status === 'On the way' || order.status === 'Delivered' ? 'green' : 'var(--border)'};"></span>
            <span style="color:${order.status === 'On the way' || order.status === 'Delivered' ? 'blue' : 'var(--muted)'}">🚗 On the way</span>
            <span style="flex:1; height:2px; background:${order.status === 'Delivered' ? 'green' : 'var(--border)'};"></span>
            <span style="color:${order.status === 'Delivered' ? 'green' : 'var(--muted)'}">🎉 Delivered</span>
          </div>
        </div>
      </div>`;
    
  } catch (error) {
    console.error('Error tracking order:', error);
    result.innerHTML = `<p style="color:var(--error); font-size:0.85rem;">❌ Error loading order. Try again later.</p>`;
  }
}

function trackOrderById(orderId, fromModal = false) {
  if (fromModal) {
    const result = document.getElementById('trackResult');
    if (!result) return;
    
    document.getElementById('trackInput').value = orderId;
    trackOrder();
  } else {
    showModal('trackModal');
    document.getElementById('trackInput').value = orderId;
    trackOrder();
  }
}

// ---------- REVIEW ----------
function openReview(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  reviewItemId = orderId;
  currentRating = 0;
  document.getElementById('reviewItemName').textContent = `Order ${orderId}`;
  document.querySelectorAll('.star-rating span').forEach(s => s.classList.remove('active'));
  document.getElementById('reviewText').value = '';
  showModal('reviewModal');
}

function setRating(val) {
  currentRating = val;
  document.querySelectorAll('.star-rating span').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

function submitReview() {
  if (!currentRating) { showToast('⭐ Please select a rating'); return; }
  const text = document.getElementById('reviewText').value.trim();
  closeModal('reviewModal');
  showToast(`⭐ Thank you for your review!`);
  console.log('Review submitted:', { orderId: reviewItemId, rating: currentRating, text });
}

// ---------- AUTH ----------
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) { showToast('⚠️ Please fill in all fields'); return; }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) { showToast('⚠️ Invalid email address'); return; }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const result = await res.json();
      currentUser = { name: result.name || email.split('@')[0], email, phone: result.phone || '' };
    } else {
      throw new Error('Backend unavailable');
    }
  } catch (_) {
    // Demo fallback
    currentUser = { name: email.split('@')[0], email, phone: '' };
  }

  saveState();
  updateAuthUI();
  showToast(`✅ Welcome back, ${currentUser.name}!`);
  closeModal('loginModal');
}

async function register() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!name || !email || !password) { showToast('⚠️ Please fill in all required fields'); return; }
  if (password.length < 6) { showToast('⚠️ Password must be at least 6 characters'); return; }

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    if (!res.ok) throw new Error();
  } catch (_) { /* fallback */ }

  showToast(`🎉 Account created! Welcome, ${name}!`);
  closeModal('registerModal');
  showModal('loginModal');
}

function logout() {
  currentUser = null;
  saveState();
  updateAuthUI();
  showToast('👋 You have been signed out');
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  if (currentUser) {
    authBtn.innerHTML = `
      <span class="user-name">👤 ${currentUser.name}</span>
      <button class="btn-signin" onclick="logout()">Sign Out</button>`;
  } else {
    authBtn.innerHTML = `<button class="btn-signin" onclick="showModal('loginModal')">Sign In</button>`;
  }
}

// ---------- MODAL HELPERS ----------
function showModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOutside(event, id) {
  if (event.target.id === id) closeModal(id);
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

// ---------- TOAST ----------
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ---------- PASSWORD TOGGLE ----------
function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === 'password' ? 'text' : 'password';
}

// ---------- NAV HELPERS ----------
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToMenu() {
  const el = document.getElementById('menu');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.getElementById('mobileDrawer').classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobileDrawer').classList.remove('open');
}