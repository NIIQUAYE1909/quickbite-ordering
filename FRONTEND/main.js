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
let trackedOrdersHistory = [];
let pendingComplaints = [];
let isSubmittingOrder = false;

const PASSWORD_RULES = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /\d/,
  special: /[^A-Za-z0-9]/
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- THEME TOGGLE ----------
function toggleTheme() {
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  const nextMode = currentMode === 'light' ? 'dark' : 'light';
  const preferredMode = prefersLight ? 'light' : 'dark';

  applyThemeMode(nextMode);

  try {
    localStorage.setItem('qb_theme', nextMode);
    if (nextMode === preferredMode) {
      localStorage.removeItem('qb_theme');
    }
  } catch (e) {}

  showToast(nextMode === 'light' ? '☀️ Light mode on' : '🌙 Dark mode on');
}

function applyTheme() {
  try {
    const saved = localStorage.getItem('qb_theme');
    if (saved === 'light' || saved === 'dark') {
      applyThemeMode(saved);
      return;
    }
  } catch(e) {}

  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyThemeMode(prefersLight ? 'light' : 'dark');
}

function applyThemeMode(mode) {
  const btn = document.getElementById('themeToggleBtn');
  const isLight = mode === 'light';
  document.body.classList.toggle('light-mode', isLight);
  if (btn) btn.textContent = isLight ? '🌙' : '☀️';
}

function watchSystemTheme() {
  if (!window.matchMedia) return;
  const media = window.matchMedia('(prefers-color-scheme: light)');
  const applySystemTheme = () => {
    let saved = null;
    try { saved = localStorage.getItem('qb_theme'); } catch (e) {}
    if (!saved) {
      applyThemeMode(media.matches ? 'light' : 'dark');
    }
  };

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', applySystemTheme);
  } else if (typeof media.addListener === 'function') {
    media.addListener(applySystemTheme);
  }
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', async () => {
  // Apply saved theme first (before anything renders)
  applyTheme();
  watchSystemTheme();
  syncAdminPortalUI();

  // Load saved state from localStorage
  loadState();
  await loadFoods();
  renderOrders();
  updateAuthUI();
  updateWishlistUI();
  enforceAuthState();
  checkAdminLogin();

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

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      showAdminLogin();
    }
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitSearch();
      }
    });
  }
});

// ---------- LOAD MENU FROM BACKEND ----------
async function loadFoods() {
  try {
    const res = await fetch(`${API_BASE}/foods`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const foods = await res.json();
    
    if (!Array.isArray(foods) || foods.length === 0) {
      throw new Error('Empty menu from backend');
    }

    // Keep local fields that UI expects, with safe defaults
    const normalized = foods.map((f) => ({
      id: Number(f.id),
      name: f.name || 'Unnamed item',
      description: f.description || '',
      price: Number(f.price || 0),
      emoji: f.emoji || '🍽️',
      imageUrl: f.image_url || f.imageUrl || getFoodImageForItem(f),
      category: (f.category || 'other').toLowerCase(),
      rating: Number(f.rating || 0),
      reviews: Number(f.reviews || 0),
      badge: f.badge || null,
      prepTime: f.prepTime || '15–20 min',
      calories: Number(f.calories || 0),
      popular: Boolean(f.popular)
    }));

    // Mutate existing array so all references remain valid
    menuData.length = 0;
    menuData.push(...normalized);

    renderMenu(menuData);
  } catch (error) {
    console.warn('Failed to load foods from backend:', error);
    menuData.forEach((item) => {
      if (!item.imageUrl) item.imageUrl = getFoodImageForItem(item);
    });
    renderMenu(menuData);
    showToast('Backend menu is unavailable. Showing backup menu.');
  }
}

function getFoodImageForItem(item) {
  const name = (item?.name || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();

  // Real food photos (stable links), matched by item name first
  const byName = [
    { key: 'double smash burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80' },
    { key: 'cheese burger deluxe', url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1000&q=80' },
    { key: 'classic margherita', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80' },
    { key: 'pepperoni pizza', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1000&q=80' },
    { key: 'bbq chicken pizza', url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1000&q=80' },
    { key: 'waakye special', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80' },
    { key: 'jollof rice special', url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=1000&q=80' },
    { key: 'grilled chicken combo', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1000&q=80' },
    { key: 'spicy wings', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80' },
    { key: 'chicken shawarma', url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1000&q=80' },
    { key: 'banku & tilapia', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80' },
    { key: 'chocolate lava cake', url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1000&q=80' },
    { key: 'strawberry cheesecake', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80' },
    { key: 'fresh fruit smoothie', url: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=1000&q=80' },
    { key: 'sobolo delight', url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1000&q=80' }
  ];

  const exact = byName.find((x) => name.includes(x.key));
  if (exact) return exact.url;

  // Category-based food photos
  if (category === 'burger') return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80';
  if (category === 'pizza') return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
  if (category === 'chicken') return 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1000&q=80';
  if (category === 'local') return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80';
  if (category === 'dessert') return 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1000&q=80';
  if (category === 'drinks') return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80';

  return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80';
}

// ---------- SAVE / LOAD STATE (localStorage) ----------
function saveState() {
  try {
    localStorage.setItem('qb_cart', JSON.stringify(cart));
    localStorage.setItem('qb_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('qb_orders', JSON.stringify(orders));
    localStorage.setItem('qb_user', JSON.stringify(currentUser));
    localStorage.setItem('qb_track_history', JSON.stringify(trackedOrdersHistory));
    localStorage.setItem('qb_pending_complaints', JSON.stringify(pendingComplaints));
  } catch (e) {}
}

function loadState() {
  try {
    cart      = JSON.parse(localStorage.getItem('qb_cart'))    || [];
    wishlist  = JSON.parse(localStorage.getItem('qb_wishlist')) || [];
    orders    = JSON.parse(localStorage.getItem('qb_orders'))   || [];
    currentUser = JSON.parse(localStorage.getItem('qb_user'))   || null;
    trackedOrdersHistory = JSON.parse(localStorage.getItem('qb_track_history')) || [];
    pendingComplaints = JSON.parse(localStorage.getItem('qb_pending_complaints')) || [];
    updateCartUI();
  } catch (e) {
    cart = []; wishlist = []; orders = []; currentUser = null; trackedOrdersHistory = []; pendingComplaints = [];
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
        ${item.imageUrl
          ? `<img src="${item.imageUrl}" alt="${item.name}" class="menu-card-photo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"/><span class="menu-emoji-display" style="display:none;">${item.emoji}</span>`
          : `<span>${item.emoji}</span>`}
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
      ${item.imageUrl
        ? `<img src="${item.imageUrl}" alt="${item.name}" class="food-modal-photo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"/><div class="food-modal-emoji-display" style="display:none;">${item.emoji}</div>`
        : `<div style="font-size:5.5rem; margin-bottom:1rem; line-height:1;">${item.emoji}</div>`}
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

function submitSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  applyFilters();

  const hasQuery = searchInput.value.trim().length > 0;
  scrollToMenu();

  if (hasQuery) {
    showToast(`Searching for "${searchInput.value.trim()}"`);
  }
}

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
  if (!currentUser) {
    setAuthFeedback('loginFeedback', 'You can browse and build your cart first. Sign in when you are ready to checkout.');
  }

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
  syncPromoUI(activePromo, promo);
  updateCartUI();
  showToast(`🎉 Promo applied: ${promo.desc}!`);
}

function syncPromoUI(code, promo) {
  const promoInput = document.getElementById('promoInput');
  const promoMsg = document.getElementById('promoMsg');
  if (promoInput) promoInput.value = code;
  if (promoMsg && promo) {
    promoMsg.innerHTML = `<span style="color:var(--success);">✅ ${promo.desc} ready to use.</span>`;
  }
}

function activateOffer(code, category = null) {
  const promo = promoCodes[code.toUpperCase()];
  if (!promo) {
    showToast('❌ This offer is unavailable right now.');
    return;
  }

  applyPromo(code);

  if (category) {
    const activeCategoryButton = document.querySelector(`.cat-pill[data-cat="${category}"]`);
    filterCategory(category, activeCategoryButton || undefined);
  }

  if (cart.length > 0) {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && !cartSidebar.classList.contains('open')) {
      toggleCart();
    }
    return;
  }

  scrollToMenu();
  const guidance = category
    ? `Offer ready. Browse the ${category} dishes and add one to your cart to use it.`
    : 'Offer ready. Add an item to your cart to use it at checkout.';
  showToast(guidance);
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
  syncPromoUI(activePromo, promo);
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
  if (!requireAuth('Sign in to complete your order. If you do not have an account yet, create one first.')) return;

  if (cart.length === 0) return;

  // Prefill name if logged in
  if (currentUser) {
    document.getElementById('checkoutName').value  = currentUser.name  || '';
    document.getElementById('checkoutPhone').value = currentUser.phone || '';
    const emailEl = document.getElementById('checkoutEmail');
    if (emailEl) emailEl.value = currentUser.email || '';
  }
  const landmarkEl = document.getElementById('checkoutLandmark');
  if (landmarkEl) landmarkEl.value = '';

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

// API Base URL - runtime-configurable for hosted deployments.
const API_BASE = (() => {
  const configured = window.env && typeof window.env.API_URL === 'string'
    ? window.env.API_URL.trim().replace(/\/$/, '')
    : '';

  const isLocalRuntime = window.location.protocol === 'file:'
    || ['', 'localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalRuntime) return 'http://localhost:8080/api';

  if (configured) return configured;

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return isLocalhost ? 'http://localhost:8080/api' : '/api';
})();

async function placeOrder() {
  if (isSubmittingOrder) return;

  // Validate fields
  const name    = document.getElementById('checkoutName').value.trim();
  const email   = document.getElementById('checkoutEmail')?.value.trim().toLowerCase() || '';
  const phone   = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const landmark = document.getElementById('checkoutLandmark')?.value.trim() || '';
  const method  = document.querySelector('input[name="payment"]:checked').value;
  const instructions = document.getElementById('specialInstructions')?.value.trim() || '';
  const fullAddress = landmark ? `${address} (Landmark: ${landmark})` : address;

  if (!name || !email || !phone || !address) {
    showToast('⚠️ Please fill in your delivery details, including email');
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    showToast('⚠️ Please enter a valid email address');
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

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  isSubmittingOrder = true;
  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Placing Order...';
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
    customer_email: email,
    phone: phone,
    address: fullAddress,
    total: grandTotal,
    items: cart.map(i => ({ id: i.id, qty: i.qty, price: i.price }))
  };

  // Data for local display (complex format)
  const orderData = {
    id: orderId,
    customer: { name, phone, address: fullAddress, landmark },
    customer_name: name,
    customer_email: email,
    phone,
    address: fullAddress,
    landmark,
    items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    subtotal, discount, deliveryFee, grandTotal,
    payment: method,
    instructions,
    promo: activePromo,
    time: new Date().toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }),
    orderedAt: new Date().toISOString(),
    status: 'Confirmed'
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendOrderData)
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(result.error || 'Unable to place your order right now.');
      resetPlaceOrderState();
      return;
    }
    orderData.id = Number(result.orderId || Date.now());
    orderData.status = result.status || 'Confirmed';
    orderData.orderedAt = new Date().toISOString();
    orderData.driver_name = result.driver_name || '';
    orderData.driver_phone = result.driver_phone || '';
    if (Array.isArray(result.items) && result.items.length) orderData.items = result.items;
  } catch (_) {
    resetPlaceOrderState();
    orderData.status = 'Pending Sync';
    orderData.sync_status = 'offline';
    orderData.orderedAt = new Date().toISOString();
    orders.unshift(orderData);
    saveState();
    cart = [];
    activePromo = null;
    deliveryFee = 5;
    updateCartUI();
    closeModal('checkoutModal');
    renderOrders();
    scrollToSection('orders');
    showToast('Server is unavailable. Your order was saved on this device as Pending Sync.');
    return;
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
  resetPlaceOrderState();
}

function resetPlaceOrderState() {
  isSubmittingOrder = false;
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Confirm & Place Order 🚀';
  }
}

function showOrderSuccess(order) {
  const driverLine = order.driver_name
    ? ` Your rider is ${order.driver_name}${order.driver_phone ? ` (${order.driver_phone})` : ''}.`
    : '';
  const itemCodes = Array.isArray(order.items)
    ? order.items.map((item) => item.item_code).filter(Boolean)
    : [];
  document.getElementById('successMsg').textContent =
    `Your order has been received for delivery to ${order.customer.address}.${driverLine}${itemCodes.length ? ` Save these food reference codes for support: ${itemCodes.join(', ')}.` : ''}`;
  document.getElementById('successOrderId').textContent = order.id;
  showModal('successModal');

  const steps = ['step1','step2','step3','step4'];
  steps.forEach(stepId => {
    const stepEl = document.getElementById(stepId);
    if (!stepEl) return;
    stepEl.classList.remove('active', 'done');
  });
  document.getElementById(steps[0])?.classList.add('active');
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
      'Pending Sync': 'pending', 'Delivered': '', 'Cancelled': 'pending'
    }[order.status] || '';
    const itemSummary = Array.isArray(order.items)
      ? order.items.map(i => {
          const qty = i.qty || i.quantity || 1;
          const refLine = i.item_code ? ` <small style="display:block; color:var(--muted);">Ref: ${i.item_code}</small>` : '';
          return `${i.emoji || ''} ${i.name || 'Item'} x${qty}${refLine}`;
        }).join(' · ')
      : 'No item details';
    const totalPrice = Number(order.grandTotal ?? order.total ?? 0);

    return `
    <div class="order-card">
      <div class="order-info">
        <strong>Order ${order.id}</strong>
        <span>${order.items.map(i => `${i.emoji || ''} ${i.name} ×${i.qty}`).join(' · ')}</span><br/>
        <span style="margin-top:0.15rem; display:block;">${order.time || formatOrderDate(order.orderedAt)}</span>
        ${order.sync_status === 'offline' ? `<span style="margin-top:0.2rem; display:block; color:var(--accent2); font-size:0.8rem;">Saved offline on this device. Backend sync is still pending.</span>` : ''}
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

  list.querySelectorAll('.order-card .order-info span:first-of-type').forEach((span, index) => {
    const order = orders[index];
    if (!order || !Array.isArray(order.items)) return;
    span.innerHTML = order.items.map((item) => {
      const qty = item.qty || item.quantity || 1;
      const refLine = item.item_code ? ` <small style="display:block; color:var(--muted);">Ref: ${item.item_code}</small>` : '';
      return `${item.emoji || ''} ${item.name || 'Item'} x${qty}${refLine}`;
    }).join(' · ');
  });
}

function clearOrders() {
  if (!confirm('Clear your entire order history?')) return;
  orders = [];
  saveState();
  renderOrders();
  showToast('🗑️ Order history cleared');
}

// ========== ADMIN PANEL FUNCTIONS ==========
// Simple admin credential protection
let isAdminLoggedIn = localStorage.getItem('qb_admin_logged_in') === 'true' && !!localStorage.getItem('qb_admin_token');

function getAdminHeaders() {
  const token = localStorage.getItem('qb_admin_token') || '';
  return token ? { 'X-Admin-Token': token } : {};
}

function syncRoleEntryGate() {
  const gate = document.getElementById('roleEntryGate');
  if (!gate) return;
  const chosenRole = localStorage.getItem('qb_entry_role');
  gate.style.display = (chosenRole || isAdminLoggedIn || isAdminPortal()) ? 'none' : 'flex';
}

function isAdminPortal() {
  try {
    return new URLSearchParams(window.location.search).get('portal') === 'admin';
  } catch (_) {
    return false;
  }
}

function getAdminPortalUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('portal', 'admin');
  url.hash = 'admin';
  return url.toString();
}

function syncAdminPortalUI() {
  document.body.classList.toggle('admin-portal-mode', isAdminPortal());
}

function syncAdminAccess() {
  const adminSection = document.getElementById('admin');
  const adminLinks = document.querySelectorAll('.admin-nav-link');
  const adminPortalButtons = document.querySelectorAll('.admin-portal-btn');

  adminLinks.forEach((link) => {
    link.style.display = isAdminLoggedIn ? '' : 'none';
  });

  adminPortalButtons.forEach((button) => {
    button.classList.toggle('active', isAdminLoggedIn);
    button.textContent = isAdminLoggedIn ? 'Admin Open' : 'Admin';
    button.title = isAdminLoggedIn ? 'Open Admin Panel' : 'Open Admin Portal';
  });

  if (adminSection) {
    adminSection.style.display = isAdminLoggedIn ? '' : 'none';
  }
}

function showAdminLogin() {
  if (isAdminLoggedIn) {
    window.open(getAdminPortalUrl(), '_blank', 'noopener');
  } else {
    showModal('adminLoginModal');
  }
}

function beginAdminEntry() {
  showModal('adminLoginModal');
}

function enterAsUser() {
  localStorage.setItem('qb_entry_role', 'user');
  syncRoleEntryGate();
  closeModal('adminLoginModal');
}

function verifyAdmin() {
  const username = document.getElementById('adminUsername').value.trim().toLowerCase();
  const password = document.getElementById('adminPassword').value;
  const errorEl = document.getElementById('adminLoginError');

  fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(async (res) => {
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.token) {
        throw new Error(payload.error || 'Invalid admin credentials.');
      }

      isAdminLoggedIn = true;
      localStorage.setItem('qb_admin_logged_in', 'true');
      localStorage.setItem('qb_admin_token', payload.token);
      localStorage.setItem('qb_entry_role', 'admin');
      closeModal('adminLoginModal');
      errorEl.style.display = 'none';
      document.getElementById('adminUsername').value = '';
      document.getElementById('adminPassword').value = '';
      syncRoleEntryGate();
      syncAdminAccess();
      loadAllOrdersAdmin();
      loadAllComplaintsAdmin();
      showToast('✅ Admin logged in successfully');
      const adminTab = window.open(getAdminPortalUrl(), '_blank', 'noopener');
      if (!adminTab) window.location.href = getAdminPortalUrl();
    })
    .catch(() => {
      errorEl.style.display = 'block';
      document.getElementById('adminUsername').value = '';
      document.getElementById('adminPassword').value = '';
    });
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  localStorage.removeItem('qb_admin_logged_in');
  localStorage.removeItem('qb_admin_token');
  localStorage.removeItem('qb_entry_role');
  syncAdminAccess();
  syncRoleEntryGate();
  if (isAdminPortal()) {
    const url = new URL(window.location.href);
    url.searchParams.delete('portal');
    url.hash = 'home';
    setTimeout(() => {
      window.location.href = url.toString();
    }, 300);
  }
  showToast('👋 Admin logged out');
}

// Check admin login on page load
function checkAdminLogin() {
  isAdminLoggedIn = localStorage.getItem('qb_admin_logged_in') === 'true' && !!localStorage.getItem('qb_admin_token');
  syncRoleEntryGate();
  syncAdminAccess();
  if (isAdminPortal() && !isAdminLoggedIn) {
    showModal('adminLoginModal');
    return;
  }
  if (isAdminLoggedIn) {
    loadAllOrdersAdmin();
    loadAllComplaintsAdmin();
    if (isAdminPortal()) {
      setTimeout(() => scrollToSection('admin'), 100);
    }
  }
}

// ========== ADMIN PANEL FUNCTIONS ==========
async function loadAllOrdersAdmin() {
  const list = document.getElementById('adminOrdersList');
  const stats = document.getElementById('adminStats');
  const usersList = document.getElementById('adminUsersList');
  
  if (!list) { showToast('Admin panel not found'); return; }
  if (!isAdminLoggedIn) {
    list.innerHTML = '<div class="empty-orders">Admin sign-in is required to view live orders and tracking.</div>';
    if (usersList) usersList.innerHTML = '<div class="empty-orders">Admin sign-in is required to view customer accounts.</div>';
    if (stats) stats.innerHTML = '';
    return;
  }
  
  list.innerHTML = '<div class="empty-orders">Loading orders from database...</div>';
  if (usersList) usersList.innerHTML = '<div class="empty-orders">Loading registered users...</div>';
  
  try {
    const adminHeaders = getAdminHeaders();
    const [response, usersResponse, usersListResponse] = await Promise.all([
      fetch(`${API_BASE}/orders`, { headers: adminHeaders }),
      fetch(`${API_BASE}/users/stats`, { headers: adminHeaders }).catch(() => null),
      fetch(`${API_BASE}/users`, { headers: adminHeaders }).catch(() => null)
    ]);
    const dbOrders = await response.json();
    const userStats = usersResponse && usersResponse.ok
      ? await usersResponse.json().catch(() => ({ total_users: 0 }))
      : { total_users: 0 };
    const users = usersListResponse && usersListResponse.ok
      ? await usersListResponse.json().catch(() => [])
      : [];
    
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
    const totalUsers = Number(userStats.total_users || 0);
    
    if (stats) {
      stats.innerHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem; margin-bottom:1.5rem;"><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:var(--accent);">${dbOrders.length}</div><div style="font-size:0.8rem; color:var(--muted);">Total Orders</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:var(--success);">GH₵ ${totalRevenue.toFixed(2)}</div><div style="font-size:0.8rem; color:var(--muted);">Total Revenue</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:orange;">${confirmed}</div><div style="font-size:0.8rem; color:var(--muted);">Confirmed</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:blue;">${onTheWay}</div><div style="font-size:0.8rem; color:var(--muted);">On the Way</div></div><div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:green;">${delivered}</div><div style="font-size:0.8rem; color:var(--muted);">Delivered</div></div></div>`;
    }
    
    if (stats?.firstElementChild) {
      stats.firstElementChild.insertAdjacentHTML('afterbegin', `<div style="background:var(--card); padding:1rem; border-radius:12px; text-align:center; border:1px solid var(--border);"><div style="font-size:1.8rem; font-weight:700; color:#8b5cf6;">${totalUsers}</div><div style="font-size:0.8rem; color:var(--muted);">Total Users</div></div>`);
    }

    if (usersList) {
      if (!Array.isArray(users) || users.length === 0) {
        usersList.innerHTML = '<div class="empty-orders">No registered users found yet.</div>';
      } else {
        usersList.innerHTML = `
          <div class="admin-users-card">
            <div class="admin-users-head">
              <strong>Customer Directory</strong>
              <span>${users.length} users</span>
            </div>
            <div class="admin-users-table-wrap">
              <table class="admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map((user) => `
                    <tr>
                      <td>${user.name || 'N/A'}</td>
                      <td>${user.email || 'N/A'}</td>
                      <td>${user.phone || 'N/A'}</td>
                      <td>#${user.id}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
    }

    list.innerHTML = dbOrders.map(order => {
      const canTrackOrder = Boolean(order.driver_name) || ['Preparing', 'On the way', 'Delivered'].includes(order.status);
      return `<div class="order-card" style="flex-direction:column; gap:0.5rem;"><div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;"><div><strong style="font-size:1.1rem;">📦 Order #${order.id}</strong><span style="margin-left:0.5rem; padding:0.2rem 0.5rem; border-radius:6px; font-size:0.75rem; background:${order.status === 'Delivered' ? '#22c55e' : order.status === 'On the way' ? '#3b82f6' : order.status === 'Preparing' ? '#f59e0b' : 'var(--accent)'};">${order.status}</span></div><div style="font-weight:700; color:var(--accent); font-size:1.2rem;">GH₵ ${parseFloat(order.total || 0).toFixed(2)}</div></div><div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:0.5rem; font-size:0.85rem; color:var(--muted);"><div><strong>👤 Customer:</strong> ${order.customer_name || 'N/A'}</div><div><strong>📱 Phone:</strong> ${order.phone || 'N/A'}</div><div><strong>📍 Address:</strong> ${order.address || 'N/A'}</div><div><strong>🕐 Time:</strong> ${order.created_at || 'N/A'}</div>${order.driver_name ? `<div><strong>🚗 Driver:</strong> ${order.driver_name} (${order.driver_phone || 'N/A'})</div>` : ''}</div><div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border);">${order.status === 'Confirmed' ? `<button onclick="updateOrderStatus(${order.id}, 'Preparing')" style="background:#f59e0b; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-family:'DM Sans',sans-serif;">🍳 Start Preparing</button>` : ''}${order.status === 'Preparing' ? `<button onclick="showAssignDriverModal(${order.id}, '${order.customer_name}', '${order.phone}', '${order.address}', ${order.total})" style="background:#3b82f6; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-family:'DM Sans',sans-serif;">🚗 Assign Driver</button>` : ''}${order.status === 'On the way' ? `<button onclick="updateOrderStatus(${order.id}, 'Delivered')" style="background:#22c55e; color:white; border:none; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer; font-family:'DM Sans',sans-serif;">✅ Mark Delivered</button>` : ''}${canTrackOrder ? `<button class="track-live-btn" onclick="trackOrderById(${order.id})">📍 View Tracking</button>` : ''}</div></div>`;
    }).join('');
    
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
    const adminHeaders = { 'Content-Type': 'application/json', ...getAdminHeaders() };
    const response = await fetch(`${API_BASE}/orders/${orderId}/driver`, {
      method: 'PUT',
      headers: adminHeaders,
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
    const adminHeaders = { 'Content-Type': 'application/json', ...getAdminHeaders() };
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: adminHeaders,
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
  const order = findOrderById(orderId);
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

// =============================================
// REAL-TIME ORDER TRACKING
// =============================================
let trackingPollInterval = null;
let currentTrackedOrderId = null;

function stopTrackingPoll() {
  if (trackingPollInterval) {
    clearInterval(trackingPollInterval);
    trackingPollInterval = null;
  }
  currentTrackedOrderId = null;
  const mapContainer = document.getElementById('liveMapContainer');
  if (mapContainer) mapContainer.style.display = 'none';
}

async function trackOrder() {
  const input = document.getElementById('trackInput').value.trim();
  if (!input) { showToast('⚠️ Enter an order ID'); return; }

  const orderId = normalizeOrderId(input);
  if (!orderId) { showToast('⚠️ Enter a valid numeric order ID'); return; }

  const result = document.getElementById('trackResult');
  if (!result) return;

  result.innerHTML = '<p style="color:var(--muted); text-align:center; padding:1rem;">⏳ Loading order details...</p>';

  // Stop any previous poll
  stopTrackingPoll();
  currentTrackedOrderId = orderId;

  // Initial fetch
  await fetchAndRenderTracking(orderId);

  // Poll every 5 seconds for live updates
  trackingPollInterval = setInterval(async () => {
    if (currentTrackedOrderId !== orderId) { clearInterval(trackingPollInterval); return; }
    await fetchAndRenderTracking(orderId);
  }, 5000);
}

async function fetchAndRenderTracking(orderId) {
  const result = document.getElementById('trackResult');
  if (!result) return;

  try {
    const trackRes = await fetch(`${API_BASE}/tracking?order_id=${orderId}`);

    if (trackRes.status === 404) {
      result.innerHTML = `<div class="track-error">❌ Order #${orderId} was not found. Check the ID and try again.</div>`;
      stopTrackingPoll();
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

    recordTrackedOrder(trackData);
    renderTrackingResult(trackData);

  } catch (error) {
    console.error('Error tracking order:', error);
    const snapshot = getTrackedOrderSnapshot(orderId);
    if (snapshot) {
      renderTrackingResult({
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
}

function renderTrackingResult(data) {
  const result = document.getElementById('trackResult');
  if (!result) return;

  const statusColors = { 'Confirmed':'var(--accent)', 'Preparing':'#f59e0b', 'On the way':'#3b82f6', 'Delivered':'#22c55e' };
  const statusIcons  = { 'Confirmed':'✅', 'Preparing':'🍳', 'On the way':'🚗', 'Delivered':'🎉' };
  const statusColor  = statusColors[data.status] || 'var(--accent)';
  const statusIcon   = statusIcons[data.status]  || '📦';

  const steps = ['Confirmed','Preparing','On the way','Delivered'];
  const stepIdx = steps.indexOf(data.status);

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
      <div class="track-progress">
        ${steps.map((s, i) => `
          <div class="track-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}">
            <div class="track-step-dot">${i < stepIdx ? '✓' : statusIcons[s] || '●'}</div>
            <div class="track-step-label">${s}</div>
          </div>
          ${i < steps.length - 1 ? `<div class="track-step-line ${i < stepIdx ? 'done' : ''}"></div>` : ''}
        `).join('')}
      </div>
      ${data.driver_name ? `
        <div class="track-driver-info">
          <div class="track-driver-icon">🚗</div>
          <div>
            <div class="track-driver-name">${data.driver_name}</div>
            <div class="track-driver-phone">📱 <a href="tel:${data.driver_phone}" style="color:inherit;">${data.driver_phone || 'N/A'}</a></div>
          </div>
          ${data.latitude ? `<div class="track-driver-speed">${data.speed_kmh > 0 ? Math.round(data.speed_kmh) + ' km/h' : 'Stopped'}</div>` : ''}
        </div>
      ` : '<div class="track-no-driver">Driver not yet assigned.</div>'}
      ${!data.latitude && data.driver_name ? '<div class="track-no-driver">Driver assigned. Live GPS will appear once the rider starts sharing location.</div>' : ''}
      ${data.updated_at ? `<div class="track-updated">Last updated: ${new Date(data.updated_at).toLocaleTimeString()}</div>` : ''}
    </div>`;
  result.innerHTML += renderTrackingHistoryPoints(data.tracking_points || []);

  // Show live map if GPS data is available
  const mapContainer = document.getElementById('liveMapContainer');
  if (data.latitude && data.longitude && mapContainer) {
    mapContainer.style.display = 'block';

    // Update OpenStreetMap iframe
    const lat = data.latitude;
    const lng = data.longitude;
    const zoom = 15;
    const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    const osmMap = document.getElementById('osmMap');
    if (osmMap && osmMap.src !== osmSrc) osmMap.src = osmSrc;

    // Update driver card
    document.getElementById('driverCardName').textContent  = '🚗 ' + (data.driver_name || 'Driver');
    document.getElementById('driverCardPhone').textContent = '📱 ' + (data.driver_phone || 'N/A');
    document.getElementById('driverCardSpeed').textContent = data.speed_kmh > 0
      ? `🏎️ ${Math.round(data.speed_kmh)} km/h`
      : '🅿️ Stopped';
    document.getElementById('driverCardEta').textContent   = data.status === 'Delivered' ? '✅ Delivered' : '🕐 En route';
    document.getElementById('liveMapTitle').textContent    = 'Live Driver Location';
    document.getElementById('liveMapUpdated').textContent  = 'Updated ' + new Date().toLocaleTimeString();
  } else if (mapContainer) {
    mapContainer.style.display = 'none';
  }

  // Stop polling if delivered
  if (data.status === 'Delivered') {
    stopTrackingPoll();
  }
}

function trackOrderById(orderId) {
  showModal('trackModal');
  const input = document.getElementById('trackInput');
  if (input) {
    // Extract numeric ID from QB-XXXXXXX format or use as-is
    const numId = String(normalizeOrderId(orderId) || '').replace(/[^0-9]/g, '');
    input.value = numId || orderId;
  }
  trackOrder();
}

function normalizeOrderId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value || '').replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function findOrderById(orderId) {
  const target = normalizeOrderId(orderId);
  return orders.find(o => normalizeOrderId(o.id) === target);
}

function formatOrderDate(dateValue) {
  if (!dateValue) return 'N/A';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleString();
}

function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) return 'No item data';
  return items.map(i => `${i.emoji || ''} ${i.name || 'Item'} x${i.qty || i.quantity || 1}`).join(' · ');
}

function recordTrackedOrder(trackData) {
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
    speed_kmh: trackData.speed_kmh ?? 0,
    heading: trackData.heading ?? 0,
    updated_at: trackData.updated_at || null
  };

  const existingIdx = trackedOrdersHistory.findIndex(h => normalizeOrderId(h.order_id) === normalizedId);
  if (existingIdx >= 0) trackedOrdersHistory.splice(existingIdx, 1);
  trackedOrdersHistory.unshift(historyEntry);
  trackedOrdersHistory = trackedOrdersHistory.slice(0, 12);
  saveState();
}

function getTrackedOrderSnapshot(orderId) {
  const normalizedId = normalizeOrderId(orderId);
  return trackedOrdersHistory.find((entry) => normalizeOrderId(entry.order_id) === normalizedId) || null;
}

function renderTrackedHistoryHtml() {
  if (!Array.isArray(trackedOrdersHistory) || trackedOrdersHistory.length === 0) return '';
  return `
    <div class="track-card" style="margin-top:0.9rem;">
      <div class="track-card-header">
        <strong>🕘 Previous Tracked IDs</strong>
      </div>
      ${trackedOrdersHistory.map(h => `
        <div style="padding:0.55rem 0; border-top:1px solid var(--border); font-size:0.84rem;">
          <div><strong>#${h.order_id}</strong> · ${h.status || 'Confirmed'}</div>
          <div style="color:var(--muted);">Bought: ${formatOrderDate(h.ordered_at)}</div>
          <div style="color:var(--muted);">Items: ${formatOrderItems(h.items)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTrackingHistoryPoints(points) {
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

  const recentPoints = points.slice(-5).reverse();
  return `
    <div class="track-card" style="margin-top:0.9rem;">
      <div class="track-card-header">
        <strong>Recent Driver Updates</strong>
      </div>
      ${recentPoints.map(point => `
        <div class="tracking-history-row">
          <div>
            <div class="tracking-history-time">${formatOrderDate(point.recorded_at)}</div>
            <div class="tracking-history-meta">${point.driver_name || 'Driver'} · ${Number(point.latitude).toFixed(5)}, ${Number(point.longitude).toFixed(5)}</div>
          </div>
          <div class="tracking-history-speed">${point.speed_kmh > 0 ? Math.round(point.speed_kmh) + ' km/h' : 'Stopped'}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// =============================================
// DRIVER LOCATION SHARING
// =============================================
let driverSharingInterval = null;
let driverWatchId = null;

function startDriverSharing() {
  const driverName = document.getElementById('driverShareName').value.trim();
  const orderId    = parseInt(document.getElementById('driverShareOrderId').value.trim());
  const statusEl   = document.getElementById('driverShareStatus');
  const btn        = document.getElementById('driverShareBtn');

  if (!driverName) { showToast('⚠️ Enter your name'); return; }
  if (!orderId)    { showToast('⚠️ Enter the order ID'); return; }

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

  async function sendLocation(position) {
    const lat      = position.coords.latitude;
    const lng      = position.coords.longitude;
    const speed    = position.coords.speed ? (position.coords.speed * 3.6) : 0; // m/s → km/h
    const heading  = position.coords.heading || 0;
    const accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : null;

    try {
      const res = await fetch(`${API_BASE}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id:    orderId,
          driver_name: driverName,
          latitude:    lat,
          longitude:   lng,
          speed_kmh:   Math.round(speed * 10) / 10,
          heading:     Math.round(heading || 0)
        })
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Unable to send GPS update.');
      }

      statusEl.innerHTML = `
        <div class="driver-share-active">
          <div class="live-dot" style="display:inline-block; margin-right:6px;"></div>
          <strong>Sharing live location</strong><br/>
          <small>📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}</small><br/>
          <small>🏎️ ${Math.round(speed)} km/h · Order #${orderId}</small><br/>
          <small>🎯 Accuracy ${accuracy ? accuracy + 'm' : 'N/A'} · Updated ${new Date().toLocaleTimeString()}</small>
        </div>`;
    } catch (error) {
      statusEl.innerHTML = `<div class="driver-share-error">⚠️ Could not send location: ${error.message}</div>`;
    }
  }

  function onGpsError(err) {
    const help = err.code === 1
      ? 'Allow location permission in your browser settings and try again.'
      : 'Make sure GPS/location is enabled on your device and try again outdoors if needed.';
    statusEl.innerHTML = `<div class="driver-share-error">❌ GPS error: ${err.message}<br/><small>${help}</small></div>`;
    btn.disabled = false;
    btn.textContent = '📍 Start Sharing Location';
    btn.onclick = startDriverSharing;
  }

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

  // Change button to stop
  btn.textContent = '🛑 Stop Sharing';
  btn.onclick = stopDriverSharing;
  btn.disabled = false;
}

function stopDriverSharing() {
  if (driverSharingInterval) { clearInterval(driverSharingInterval); driverSharingInterval = null; }
  if (driverWatchId !== null) { navigator.geolocation.clearWatch(driverWatchId); driverWatchId = null; }

  const statusEl = document.getElementById('driverShareStatus');
  const btn      = document.getElementById('driverShareBtn');
  if (statusEl) statusEl.innerHTML = `<div style="color:var(--muted); font-size:0.85rem;">📴 Location sharing stopped.</div>`;
  if (btn) {
    btn.textContent = '📍 Start Sharing Location';
    btn.onclick = startDriverSharing;
    btn.disabled = false;
  }
  showToast('📴 Location sharing stopped');
}

// Alias for HTML button onclick="loadAllOrders()"
function loadAllOrders() {
  loadAllOrdersAdmin();
  loadAllComplaintsAdmin();
}

// ---------- REVIEW ----------
function openReview(orderId) {
  const order = findOrderById(orderId);
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

async function submitReview() {
  if (!currentRating) { showToast('⭐ Please select a rating'); return; }
  const order = findOrderById(reviewItemId);
  if (!order) {
    showToast('Unable to find that order for review.');
    return;
  }
  const text = document.getElementById('reviewText').value.trim();
  const payload = {
    order_id: Number(normalizeOrderId(reviewItemId)) || null,
    customer_name: currentUser?.name || order.customer_name || order.customer?.name || 'Customer',
    rating: currentRating,
    comment: text
  };

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(result.error || 'Unable to submit your review right now.');
      return;
    }

    order.review_status = 'pending';
    saveState();
    renderOrders();
    closeModal('reviewModal');
    showToast('⭐ Review submitted for approval!');
  } catch (_) {
    showToast('Unable to submit your review right now.');
  }
}

// ---------- AUTH ----------
async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  setAuthFeedback('loginFeedback', '');

  if (!email || !password) {
    const message = 'Please fill in all fields.';
    setAuthFeedback('loginFeedback', message, true);
    showToast(`Warning: ${message}`);
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    const message = 'Enter a valid email address.';
    setAuthFeedback('loginFeedback', message, true);
    showToast(`Warning: ${message}`);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = result.error || 'Unable to sign in right now.';
      setAuthFeedback('loginFeedback', message, true);
      showToast(`Sign in failed: ${message}`);
      return;
    }

    currentUser = {
      id: result.userId || null,
      name: result.name || email.split('@')[0],
      email: result.email || email,
      phone: result.phone || ''
    };
  } catch (_) {
    const message = 'Sign in failed. Please try again in a moment.';
    setAuthFeedback('loginFeedback', message, true);
    showToast(message);
    return;
  }

  saveState();
  updateAuthUI();
  enforceAuthState();
  clearAuthForms();
  showToast(`Welcome back, ${currentUser.name}!`);
  closeModal('loginModal');
}

async function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  setAuthFeedback('registerFeedback', '');

  if (!name || !email || !password || !confirmPassword) {
    const message = 'Please fill in all required fields.';
    setAuthFeedback('registerFeedback', message, true);
    showToast(`Warning: ${message}`);
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    const message = 'Enter a valid email address.';
    setAuthFeedback('registerFeedback', message, true);
    showToast(`Warning: ${message}`);
    return;
  }

  if (password !== confirmPassword) {
    const message = 'Passwords do not match.';
    setAuthFeedback('registerFeedback', message, true);
    showToast(`Warning: ${message}`);
    return;
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    setAuthFeedback('registerFeedback', passwordCheck.message, true);
    showToast(`Warning: ${passwordCheck.message}`);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = result.error || 'Unable to create your account.';
      setAuthFeedback('registerFeedback', message, true);
      showToast(`Registration failed: ${message}`);
      return;
    }
  } catch (_) {
    const message = 'Registration failed. Please try again in a moment.';
    setAuthFeedback('registerFeedback', message, true);
    showToast(message);
    return;
  }

  setAuthFeedback('registerFeedback', 'Account created successfully. Sign in to continue.');
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = '';
  clearRegisterForm();
  showToast(`Account created for ${name}. Please sign in.`);
  closeModal('registerModal');
  showModal('loginModal');
}

function logout() {
  currentUser = null;
  saveState();
  updateAuthUI();
  enforceAuthState();
  showToast('You have been signed out.');
}

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  if (currentUser) {
    authBtn.innerHTML = `
      <span class="user-name">Account: ${currentUser.name}</span>
      <button class="btn-signin" onclick="logout()">Sign Out</button>`;
  } else {
    authBtn.innerHTML = `<button class="btn-signin" onclick="showModal('loginModal')">Sign In</button>`;
  }
}

function enforceAuthState() {
  const gate = document.getElementById('authGate');
  document.body.classList.remove('auth-locked');
  if (gate) gate.classList.remove('open');
}

function closeProtectedPanels() {
  ['cartSidebar', 'wishlistSidebar', 'cartOverlay', 'wishlistOverlay'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  });
}

function requireAuth(message = 'Please sign in to continue.') {
  if (currentUser) return true;
  setAuthFeedback('loginFeedback', message);
  showToast(message);
  showModal('loginModal');
  return false;
}

function validatePassword(password) {
  if (password.length < PASSWORD_RULES.minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!PASSWORD_RULES.upper.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!PASSWORD_RULES.lower.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' };
  }
  if (!PASSWORD_RULES.digit.test(password)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }
  if (!PASSWORD_RULES.special.test(password)) {
    return { valid: false, message: 'Password must include at least one special character.' };
  }
  return { valid: true, message: '' };
}

function setAuthFeedback(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message || '';
  el.classList.toggle('error', Boolean(message) && isError);
  el.classList.toggle('success', Boolean(message) && !isError);
}

function clearRegisterForm() {
  ['regName', 'regEmail', 'regPhone', 'regPassword', 'regConfirmPassword'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
}

function clearAuthForms() {
  ['loginEmail', 'loginPassword'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  clearRegisterForm();
  setAuthFeedback('loginFeedback', '');
  setAuthFeedback('registerFeedback', '');
}

async function submitComplaint() {
  const itemCode = document.getElementById('complaintItemCode')?.value.trim().toUpperCase() || '';
  const email = document.getElementById('complaintEmail')?.value.trim().toLowerCase() || '';
  const message = document.getElementById('complaintMessage')?.value.trim() || '';

  setAuthFeedback('complaintFeedback', '');

  if (!itemCode || !email || !message) {
    setAuthFeedback('complaintFeedback', 'Please enter the food reference code, your email, and your concern.', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_code: itemCode,
        email,
        name: currentUser?.name || '',
        message
      })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAuthFeedback('complaintFeedback', result.error || 'Unable to submit your concern right now.', true);
      return;
    }

    setAuthFeedback('complaintFeedback', `Concern submitted for ${result.food_name || 'your item'} with code ${result.item_code}.`);
    showToast(`Concern submitted. Ref ${result.item_code}`);
    document.getElementById('complaintItemCode').value = '';
    document.getElementById('complaintMessage').value = '';
  } catch (_) {
    pendingComplaints.unshift({
      id: `LOCAL-${Date.now()}`,
      item_code: itemCode,
      customer_email: email,
      customer_name: currentUser?.name || '',
      message,
      status: 'Pending Sync',
      created_at: new Date().toISOString()
    });
    pendingComplaints = pendingComplaints.slice(0, 20);
    saveState();
    setAuthFeedback('complaintFeedback', `Server unavailable. Your concern was saved on this device with code ${itemCode} and marked Pending Sync.`, false);
    showToast(`Concern saved locally. Ref ${itemCode}`);
  }
}

async function loadAllComplaintsAdmin() {
  const list = document.getElementById('adminComplaintsList');
  const badge = document.getElementById('adminComplaintBadge');
  const refreshBtn = document.getElementById('adminComplaintRefreshBtn');
  if (!list) return;
  if (!isAdminLoggedIn) {
    list.innerHTML = '<div class="empty-orders">Admin sign-in is required to view customer concerns.</div>';
    if (badge) badge.style.display = 'none';
    if (refreshBtn) refreshBtn.textContent = 'Refresh Concerns';
    return;
  }

  list.innerHTML = '<div class="empty-orders">Loading customer concerns...</div>';

  try {
    const response = await fetch(`${API_BASE}/complaints`, { headers: getAdminHeaders() });
    const complaints = await response.json();
    const localDrafts = pendingComplaints.map((complaint) => ({ ...complaint, local_only: true }));
    const mergedComplaints = Array.isArray(complaints) ? [...localDrafts, ...complaints] : localDrafts;

    if (mergedComplaints.length === 0) {
      list.innerHTML = '<div class="empty-orders">No customer concerns yet.</div>';
      if (badge) badge.style.display = 'none';
      if (refreshBtn) refreshBtn.textContent = 'Refresh Concerns';
      return;
    }

    const pendingCount = mergedComplaints.filter((complaint) => String(complaint.status || '').toLowerCase() !== 'resolved').length;
    if (badge) {
      badge.textContent = String(pendingCount);
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
    if (refreshBtn) {
      refreshBtn.textContent = pendingCount > 0 ? `Refresh Concerns (${pendingCount} pending)` : 'Refresh Concerns';
    }

    list.innerHTML = mergedComplaints.map((complaint) => `
      <div class="order-card" style="flex-direction:column; gap:0.6rem;">
        <div style="display:flex; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
          <div>
            <strong>Concern #${complaint.id}</strong>
            <div style="color:var(--muted); font-size:0.88rem; margin-top:0.25rem;">${complaint.food_name || 'Food item'} · Ref ${complaint.item_code || 'N/A'}${complaint.local_only ? ' · Local Draft' : ''}</div>
          </div>
          <div class="order-status ${complaint.status === 'resolved' ? '' : 'pending'}">${complaint.status || 'pending'}</div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:0.5rem; color:var(--muted); font-size:0.9rem;">
          <div><strong>Order:</strong> #${complaint.order_id || 'N/A'}</div>
          <div><strong>Food ID:</strong> ${complaint.food_id || 'N/A'}</div>
          <div><strong>User:</strong> ${complaint.customer_name || 'N/A'}</div>
          <div><strong>Email:</strong> ${complaint.customer_email || 'N/A'}</div>
        </div>
        <div style="padding:0.75rem; background:var(--bg); border-radius:10px;">${complaint.message || ''}</div>
      </div>
    `).join('');
  } catch (_) {
    if (pendingComplaints.length > 0) {
      if (badge) {
        badge.textContent = String(pendingComplaints.length);
        badge.style.display = 'inline-block';
      }
      if (refreshBtn) refreshBtn.textContent = `Refresh Concerns (${pendingComplaints.length} local)`;
      list.innerHTML = pendingComplaints.map((complaint) => `
        <div class="order-card" style="flex-direction:column; gap:0.6rem;">
          <div style="display:flex; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
            <div>
              <strong>Concern #${complaint.id}</strong>
              <div style="color:var(--muted); font-size:0.88rem; margin-top:0.25rem;">Ref ${complaint.item_code || 'N/A'} · Local Draft</div>
            </div>
            <div class="order-status pending">${complaint.status || 'Pending Sync'}</div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:0.5rem; color:var(--muted); font-size:0.9rem;">
            <div><strong>User:</strong> ${complaint.customer_name || 'N/A'}</div>
            <div><strong>Email:</strong> ${complaint.customer_email || 'N/A'}</div>
          </div>
          <div style="padding:0.75rem; background:var(--bg); border-radius:10px;">${complaint.message || ''}</div>
        </div>
      `).join('');
      return;
    }
    list.innerHTML = '<div class="empty-orders">Unable to load customer concerns right now.</div>';
    if (badge) badge.style.display = 'none';
    if (refreshBtn) refreshBtn.textContent = 'Refresh Concerns';
  }
}
// ---------- MODAL HELPERS ----------
function showModal(id) {
  if (id === 'complaintModal') {
    const emailInput = document.getElementById('complaintEmail');
    if (emailInput && currentUser?.email) emailInput.value = currentUser.email;
    setAuthFeedback('complaintFeedback', '');
  }
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  if (id === 'checkoutModal') resetPlaceOrderState();
}

function closeModalOutside(event, id) {
  if (event.target.id === id) closeModal(id);
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  resetPlaceOrderState();
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

function navigateFooterSection(id, label) {
  scrollToSection(id);
  showToast(`${label} section opened`);
}

function openFooterModal(id, label) {
  showModal(id);
  showToast(`${label} opened`);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToMenu() {
  const el = document.getElementById('menu');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
  const drawer = document.getElementById('mobileDrawer');
  const hamburger = document.getElementById('hamburger');
  if (!drawer) return;
  drawer.classList.toggle('open');
  if (hamburger) hamburger.classList.toggle('active', drawer.classList.contains('open'));
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobileDrawer');
  const hamburger = document.getElementById('hamburger');
  if (drawer) drawer.classList.remove('open');
  if (hamburger) hamburger.classList.remove('active');
}
