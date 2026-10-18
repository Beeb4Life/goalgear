/**
 * GoalGear - Customer Storefront Frontend JavaScript
 *
 * Handles dynamic product loading, searching, filtering, modal views,
 * shopping cart persistence, customer auth, demo checkout, and order history
 * across separate pages (Home, Catalogue, About, Contact).
 */

// ====================================================================
// Application State
// ====================================================================
const state = {
  products: [],
  featured: [],
  cart: JSON.parse(localStorage.getItem('goalgear_cart') || '[]'),
  token: localStorage.getItem('goalgear_token') || null,
  user: JSON.parse(localStorage.getItem('goalgear_user') || 'null'),
  currentFilter: {
    search: '',
    department: '',
    category: '',
    brand: '',
    size_label: '',
    surface: '',
    sort: 'newest'
  }
};

// ====================================================================
// Initialization
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  updateCartBadge();

  // Read URL parameters if present (e.g. ?department=Boots)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('department')) {
    state.currentFilter.department = urlParams.get('department');
  }
  if (urlParams.get('category')) {
    state.currentFilter.category = urlParams.get('category');
  }

  // Load appropriate page data
  if (document.getElementById('featuredGrid')) {
    fetchFeaturedProducts();
  }
  if (document.getElementById('catalogueGrid')) {
    fetchFilterOptions();
    fetchProducts();
  }

  setupEventListeners();
});

// Helper for fallback image according to product department
function getProductFallbackImage(dept) {
  if (dept === 'Boots') return 'images/products/adidas-predator-elite.png';
  if (dept === 'Socks') return 'images/products/goalgear-grip-socks.png';
  return 'images/products/adidas-ucl-pro.png';
}

function handleImageFallback(img, fallbackImg) {
  const src = img.getAttribute('src') || '';
  if (src.endsWith('.jpg')) {
    img.src = src.replace(/\.jpg$/, '.png');
  } else if (src.endsWith('.png') && !img.dataset.triedJpg) {
    img.dataset.triedJpg = 'true';
    img.src = src.replace(/\.png$/, '.jpg');
  } else {
    img.onerror = null;
    img.src = fallbackImg;
  }
}
window.handleImageFallback = handleImageFallback;

// ====================================================================
// API Calls
// ====================================================================
async function apiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  const res = await fetch(endpoint, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Server HTTP ${res.status}: ${res.statusText || 'request failed'}`);
  }
  return data;
}

async function fetchFeaturedProducts() {
  try {
    const data = await apiRequest('/api/products/featured');
    state.featured = data.products || [];
    renderFeaturedProducts();
  } catch (err) {
    console.error('Failed to fetch featured gear:', err);
  }
}

async function fetchFilterOptions() {
  try {
    const data = await apiRequest('/api/products/filter-options');
    populateFilterDropdowns(data);
  } catch (err) {
    console.error('Failed to load filter options:', err);
  }
}

async function fetchProducts() {
  const container = document.getElementById('catalogueGrid');
  if (container) {
    container.innerHTML = '<div class="center" style="grid-column: 1/-1; padding: 30px;">Loading football gear...</div>';
  }

  try {
    const params = new URLSearchParams();
    if (state.currentFilter.department) params.append('department', state.currentFilter.department);
    if (state.currentFilter.category) params.append('category', state.currentFilter.category);
    if (state.currentFilter.brand) params.append('brand', state.currentFilter.brand);
    if (state.currentFilter.size_label) params.append('size_label', state.currentFilter.size_label);
    if (state.currentFilter.surface) params.append('surface', state.currentFilter.surface);
    if (state.currentFilter.sort) params.append('sort', state.currentFilter.sort);
    if (state.currentFilter.search) params.append('search', state.currentFilter.search);

    const data = await apiRequest(`/api/products?${params.toString()}`);
    state.products = data.products || [];
    renderCatalogue();
  } catch (err) {
    if (container) {
      container.innerHTML = `<div class="alertBox alertError" style="grid-column: 1/-1;">Error loading products: ${escapeHtml(err.message)}</div>`;
    }
  }
}

// ====================================================================
// Rendering Methods
// ====================================================================
function renderFeaturedProducts() {
  const container = document.getElementById('featuredGrid');
  if (!container) return;

  if (state.featured.length === 0) {
    container.innerHTML = '<p class="center">No featured gear available right now.</p>';
    return;
  }

  container.innerHTML = state.featured.slice(0, 6).map((p) => createProductCardHtml(p)).join('');
}

function renderCatalogue() {
  const container = document.getElementById('catalogueGrid');
  const countEl = document.getElementById('catalogueCount');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `Showing ${state.products.length} product${state.products.length === 1 ? '' : 's'}`;
  }

  if (state.products.length === 0) {
    container.innerHTML = '<div class="center" style="grid-column: 1/-1; padding: 40px; color: #6c757d;">No products match your search or filter selection.</div>';
    return;
  }

  container.innerHTML = state.products.map((p) => createProductCardHtml(p)).join('');
}

function createProductCardHtml(p) {
  const inStock = p.stock_quantity > 0;
  const stockText = inStock ? `In Stock (${p.stock_quantity})` : 'Out of Stock';
  const stockClass = inStock ? 'inStock' : 'outOfStock';
  const fallbackImg = getProductFallbackImage(p.department);
  const sizeDisplay = p.size_label || (p.ball_size ? `Size ${p.ball_size}` : '');

  return `
    <div class="productCard" data-id="${p.id}">
      <div>
        <div class="productImageWrap" onclick="openProductDetail('${p.id}')">
          <img 
            src="${escapeHtml(p.image_url)}" 
            alt="${escapeHtml(p.name)}" 
            onerror="handleImageFallback(this, '${fallbackImg}');"
          >
        </div>
        <div class="productMeta">
          <span>${escapeHtml(p.brand)}</span>
          <span>${escapeHtml(sizeDisplay)}</span>
        </div>
        <div class="productName" onclick="openProductDetail('${p.id}')">${escapeHtml(p.name)}</div>
        <div>
          <span class="productSpecsBadge">${escapeHtml(p.category)}</span>
          <span class="productSpecsBadge">${escapeHtml(p.surface)}</span>
        </div>
        <div class="productPrice">&#8377;${parseFloat(p.price).toFixed(2)}</div>
        <div class="stockBadge ${stockClass}">${stockText}</div>
      </div>
      <div class="cardButtons">
        <button class="btn btn-secondary btn-sm" onclick="openProductDetail('${p.id}')">Details</button>
        <button 
          class="btn btn-primary btn-sm" 
          onclick="addToCart('${p.id}')" 
          ${inStock ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"'}
        >
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function populateFilterDropdowns(options) {
  const deptSelect = document.getElementById('filterDepartment');
  const catSelect = document.getElementById('filterCategory');
  const brandSelect = document.getElementById('filterBrand');
  const sizeSelect = document.getElementById('filterSize');
  const surfaceSelect = document.getElementById('filterSurface');

  if (deptSelect && options.departments) {
    deptSelect.innerHTML = '<option value="">All Departments</option>' +
      options.departments.map((d) => `<option value="${escapeHtml(d)}" ${state.currentFilter.department === d ? 'selected' : ''}>${d === 'Balls' ? '⚽ Footballs' : (d === 'Boots' ? '👟 Boots & Shoes' : '🧦 Socks & Grip Gear')}</option>`).join('');
  }

  if (catSelect && options.categories) {
    catSelect.innerHTML = '<option value="">All Categories</option>' +
      options.categories.map((c) => `<option value="${escapeHtml(c)}" ${state.currentFilter.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
  }

  if (brandSelect && options.brands) {
    brandSelect.innerHTML = '<option value="">All Brands</option>' +
      options.brands.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
  }

  if (sizeSelect && options.sizes) {
    sizeSelect.innerHTML = '<option value="">All Sizes</option>' +
      options.sizes.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  }

  if (surfaceSelect && options.surfaces) {
    surfaceSelect.innerHTML = '<option value="">All Surfaces</option>' +
      options.surfaces.map((sf) => `<option value="${escapeHtml(sf)}">${escapeHtml(sf)}</option>`).join('');
  }
}

// ====================================================================
// Shopping Cart Operations
// ====================================================================
function saveCart() {
  localStorage.setItem('goalgear_cart', JSON.stringify(state.cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartCountBadge');
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) {
    badge.textContent = totalItems;
  }
}

function addToCart(productId, qty = 1) {
  if (!state.user || !state.token) {
    alert('Please sign in or register to add items to your shopping cart.');
    openAuthModal('login');
    return;
  }

  const product = state.products.find((p) => p.id === productId) ||
                  state.featured.find((p) => p.id === productId);

  if (!product) {
    // Attempt fast fetch if not in active state array
    apiRequest(`/api/products/${productId}`).then((data) => {
      performAddToCart(data.product, qty);
    }).catch(() => {
      alert('Product details could not be found.');
    });
    return;
  }

  performAddToCart(product, qty);
}

function performAddToCart(product, qty) {
  if (product.stock_quantity <= 0) {
    alert('This item is currently out of stock.');
    return;
  }

  const existing = state.cart.find((item) => item.productId === product.id);
  const currentInCart = existing ? existing.quantity : 0;

  if (currentInCart + qty > product.stock_quantity) {
    alert(`Only ${product.stock_quantity} units available in stock.`);
    return;
  }

  if (existing) {
    existing.quantity += qty;
  } else {
    state.cart.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      department: product.department || 'Balls',
      size_label: product.size_label || (product.ball_size ? `Size ${product.ball_size}` : 'Standard'),
      price: parseFloat(product.price),
      image_url: product.image_url,
      quantity: qty
    });
  }

  saveCart();
  alert(`Added ${qty}x "${product.name}" to your shopping cart!`);
}

function changeCartQty(productId, delta) {
  const item = state.cart.find((i) => i.productId === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((i) => i.productId !== productId);
  }
  saveCart();
  renderCartModal();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter((i) => i.productId !== productId);
  saveCart();
  renderCartModal();
}

// ====================================================================
// Modals Control
// ====================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modalOverlay')) {
    e.target.classList.remove('active');
  }
});

// Product Details Modal
async function openProductDetail(productId) {
  const modal = document.getElementById('productDetailModal');
  const content = document.getElementById('productDetailContent');
  if (!modal || !content) return;

  content.innerHTML = '<div class="center" style="padding: 30px;">Loading specifications...</div>';
  openModal('productDetailModal');

  try {
    const data = await apiRequest(`/api/products/${productId}`);
    const p = data.product;
    const fallbackImg = getProductFallbackImage(p.department);
    const sizeDisplay = p.size_label || (p.ball_size ? `Size ${p.ball_size}` : 'Standard');

    const inStock = p.stock_quantity > 0;
    content.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <div style="flex: 1 1 220px; text-align: center; background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
          <img 
            src="${escapeHtml(p.image_url)}" 
            alt="${escapeHtml(p.name)}" 
            style="max-width: 100%; max-height: 240px; object-fit: contain;" 
            onerror="handleImageFallback(this, '${fallbackImg}');"
          >
        </div>
        <div style="flex: 2 1 280px;">
          <h2 style="margin: 0 0 6px 0; color: var(--primary-color);">${escapeHtml(p.name)}</h2>
          <div style="color: var(--text-muted); font-size: 13px; margin-bottom: 12px;">
            Brand: <strong>${escapeHtml(p.brand)}</strong> &bull; Size: <strong>${escapeHtml(sizeDisplay)}</strong>
          </div>
          <div style="font-size: 22px; font-weight: bold; margin-bottom: 12px;">&#8377;${parseFloat(p.price).toFixed(2)}</div>
          
          <table class="dataTable" style="margin-bottom: 15px;">
            <tr><th>Department</th><td>${escapeHtml(p.department || 'Balls')}</td></tr>
            <tr><th>Category</th><td>${escapeHtml(p.category)}</td></tr>
            <tr><th>Surface Type</th><td>${escapeHtml(p.surface)}</td></tr>
            <tr><th>Rating / Grade</th><td>${escapeHtml(p.fifa_rating)}</td></tr>
            <tr><th>Inventory</th><td class="${inStock ? 'inStock' : 'outOfStock'}" style="font-weight: bold;">
              ${inStock ? `Available (${p.stock_quantity} in stock)` : 'Out of Stock'}
            </td></tr>
          </table>

          <p style="color: #495057; font-size: 14px; margin-bottom: 18px;">${escapeHtml(p.description)}</p>

          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="number" id="detailQtyInput" value="1" min="1" max="${p.stock_quantity}" style="width: 70px; padding: 7px; border: 1px solid #ced4da; border-radius: 4px;" ${inStock ? '' : 'disabled'}>
            <button class="btn btn-primary" onclick="addToCartFromDetail('${p.id}')" ${inStock ? '' : 'disabled style="opacity: 0.5;"'}>
              Add to Shopping Cart
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="alertBox alertError">Could not load details: ${escapeHtml(err.message)}</div>`;
  }
}

function addToCartFromDetail(productId) {
  const qtyInput = document.getElementById('detailQtyInput');
  const qty = parseInt(qtyInput ? qtyInput.value : '1', 10) || 1;
  addToCart(productId, qty);
  closeModal('productDetailModal');
}

// Shopping Cart Modal
function openCartModal() {
  renderCartModal();
  openModal('cartModal');
}

function renderCartModal() {
  const container = document.getElementById('cartItemsContainer');
  const totalEl = document.getElementById('cartTotalDisplay');
  const checkoutBtn = document.getElementById('proceedCheckoutBtn');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = '<div class="center" style="padding: 30px; color: #6c757d;">Your shopping cart is currently empty.</div>';
    if (totalEl) totalEl.textContent = '₹0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  let total = 0;
  const itemsHtml = state.cart.map((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const fallbackImg = getProductFallbackImage(item.department);
    return `
      <tr>
        <td style="width: 50px;">
          <img src="${escapeHtml(item.image_url)}" style="width: 40px; height: 40px; object-fit: contain;" onerror="handleImageFallback(this, '${fallbackImg}');">
        </td>
        <td>
          <strong>${escapeHtml(item.name)}</strong><br>
          <small style="color: #6c757d;">${escapeHtml(item.brand)} &bull; ${escapeHtml(item.size_label)}</small>
        </td>
        <td>&#8377;${item.price.toFixed(2)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="changeCartQty('${item.productId}', -1)">-</button>
          <span style="display: inline-block; width: 24px; text-align: center; font-weight: bold;">${item.quantity}</span>
          <button class="btn btn-secondary btn-sm" onclick="changeCartQty('${item.productId}', 1)">+</button>
        </td>
        <td>&#8377;${itemTotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="removeCartItem('${item.productId}')">&times;</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="tableResponsive">
      <table class="dataTable">
        <thead>
          <tr>
            <th></th>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>
  `;

  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
}

// Checkout Modal
function openCheckoutModal() {
  if (state.cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  closeModal('cartModal');
  openModal('checkoutModal');

  if (state.user) {
    const nameInput = document.getElementById('checkoutName');
    const emailInput = document.getElementById('checkoutEmail');
    if (nameInput && !nameInput.value) nameInput.value = state.user.fullName || '';
    if (emailInput && !emailInput.value) emailInput.value = state.user.email || '';
  }

  const summaryEl = document.getElementById('checkoutOrderSummary');
  const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="background-color: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
        <strong>Items (${state.cart.length}):</strong> &#8377;${total.toFixed(2)}<br>
        <strong style="color: var(--success-color);">Standard Delivery:</strong> FREE<br>
        <hr style="margin: 8px 0;">
        <strong style="font-size: 16px;">Total: &#8377;${total.toFixed(2)}</strong>
      </div>
    `;
  }
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const alertEl = document.getElementById('checkoutAlert');
  const btn = document.getElementById('submitOrderBtn');

  if (alertEl) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
  }

  const payload = {
    customerName: document.getElementById('checkoutName').value.trim(),
    customerEmail: document.getElementById('checkoutEmail').value.trim(),
    shippingAddress: document.getElementById('checkoutAddress').value.trim(),
    city: document.getElementById('checkoutCity').value.trim(),
    postalCode: document.getElementById('checkoutPostal').value.trim(),
    country: document.getElementById('checkoutCountry').value.trim() || 'India',
    paymentMethod: 'Credit / Debit Card',
    items: state.cart.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  };

  if (btn) btn.disabled = true;

  try {
    const res = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    state.cart = [];
    saveCart();

    const content = document.getElementById('checkoutContentArea');
    if (content) {
      content.innerHTML = `
        <div class="center" style="padding: 20px;">
          <div style="font-size: 48px; color: var(--success-color);">✓</div>
          <h3 style="color: var(--primary-color); margin-top: 5px;">Order Placed Successfully!</h3>
          <p>Thank you, <strong>${escapeHtml(payload.customerName)}</strong>.</p>
          <div style="background-color: #e8f5e9; padding: 12px; border-radius: 4px; margin: 15px auto; max-width: 380px;">
            Order Reference: <strong>${escapeHtml(res.order.order_number)}</strong><br>
            Total Amount: <strong>&#8377;${parseFloat(res.order.total_amount).toFixed(2)}</strong><br>
            Status: <span class="statusBadge status-processing">Processing</span>
          </div>
          <p style="font-size: 13px; color: #6c757d;">
            Your order has been confirmed and registered in the system. You can track its status under My Orders.
          </p>
          <button class="btn btn-primary" onclick="closeModal('checkoutModal'); location.reload();">Continue Shopping</button>
        </div>
      `;
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (alertEl) {
      alertEl.className = 'alertBox alertError';
      alertEl.style.display = 'block';
      alertEl.textContent = err.message || 'Error processing order.';
    }
  }
}

// ====================================================================
// Customer Order History Modal
// ====================================================================
async function openOrderHistoryModal() {
  if (!state.token) {
    openAuthModal('login');
    return;
  }

  const container = document.getElementById('orderHistoryContainer');
  if (!container) return;

  container.innerHTML = '<div class="center" style="padding: 30px;">Loading your order history...</div>';
  openModal('orderHistoryModal');

  try {
    const data = await apiRequest('/api/orders/my-orders');
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = '<div class="center" style="padding: 30px; color: #6c757d;">You have not placed any orders yet.</div>';
      return;
    }

    container.innerHTML = orders.map((o) => `
      <div style="border: 1px solid #dee2e6; border-radius: 6px; padding: 14px; margin-bottom: 14px; background-color: #fdfdfd;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
          <div>
            <strong>${escapeHtml(o.order_number)}</strong> &bull; 
            <small style="color: #6c757d;">${new Date(o.created_at).toLocaleDateString()}</small>
          </div>
          <div>
            <span class="statusBadge status-${escapeHtml(o.status)}">${escapeHtml(o.status)}</span>
          </div>
        </div>
        <div style="font-size: 13px; margin-bottom: 8px;">
          <strong>Deliver to:</strong> ${escapeHtml(o.shipping_address)}, ${escapeHtml(o.city)} (${escapeHtml(o.postal_code)})
        </div>
        <div class="tableResponsive">
          <table class="dataTable" style="font-size: 13px; margin: 6px 0;">
            <tbody>
              ${(o.items || []).map((i) => `
                <tr>
                  <td>${escapeHtml(i.product_name)} (${escapeHtml(i.size_label || '')})</td>
                  <td>x${i.quantity}</td>
                  <td>&#8377;${parseFloat(i.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="text-align: right; font-size: 15px; font-weight: bold; margin-top: 6px;">
          Total: &#8377;${parseFloat(o.total_amount).toFixed(2)}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="alertBox alertError">Could not fetch orders: ${escapeHtml(err.message)}</div>`;
  }
}

// ====================================================================
// Authentication UI & State
// ====================================================================
function initAuthUI() {
  const userSection = document.getElementById('userNavSection');
  const cartBtn = document.getElementById('cartNavBtn');
  if (!userSection) return;

  if (state.user && state.token) {
    if (cartBtn) cartBtn.style.display = 'inline-block';
    const isAdmin = state.user.role === 'admin';
    userSection.innerHTML = `
      <span style="font-size: 13px; font-weight: bold; color: var(--primary-color);">Hello, ${escapeHtml(state.user.fullName || 'Player')}</span>
      <button class="btn btn-secondary btn-sm" onclick="openOrderHistoryModal()">My Orders</button>
      ${isAdmin ? '<a href="admin.html" class="btn btn-secondary btn-sm" style="color: #856404; background-color: #fff3cd;">Admin Panel ↗</a>' : ''}
      <button class="btn btn-secondary btn-sm" onclick="logout()">Logout</button>
    `;
  } else {
    if (cartBtn) cartBtn.style.display = 'none';
    userSection.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="openAuthModal('login')">Sign In</button>
      <button class="btn btn-primary btn-sm" onclick="openAuthModal('register')">Register</button>
    `;
  }
}

function openAuthModal(view = 'login') {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authModalTitle');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const alertEl = document.getElementById('authAlert');

  if (alertEl) alertEl.style.display = 'none';

  if (view === 'login') {
    if (title) title.textContent = 'Customer Login';
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  } else {
    if (title) title.textContent = 'Create Customer Account';
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
  }

  openModal('authModal');
}

async function handleLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.token = res.token;
    state.user = res.user;
    localStorage.setItem('goalgear_token', res.token);
    localStorage.setItem('goalgear_user', JSON.stringify(res.user));

    closeModal('authModal');
    initAuthUI();
    alert(`Welcome back, ${res.user.fullName}!`);
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alertBox alertError';
      alertEl.style.display = 'block';
      alertEl.textContent = err.message || 'Login failed.';
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const alertEl = document.getElementById('authAlert');
  const fullName = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password })
    });

    state.token = res.token;
    state.user = res.user;
    localStorage.setItem('goalgear_token', res.token);
    localStorage.setItem('goalgear_user', JSON.stringify(res.user));

    closeModal('authModal');
    initAuthUI();
    alert(`Account created successfully! Welcome to GoalGear, ${res.user.fullName}!`);
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'alertBox alertError';
      alertEl.style.display = 'block';
      alertEl.textContent = err.message || 'Registration failed.';
    }
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('goalgear_token');
  localStorage.removeItem('goalgear_user');
  initAuthUI();
  alert('You have been logged out.');
}

// ====================================================================
// Event Listeners Setup
// ====================================================================
function setupEventListeners() {
  // Search input with debounce
  let searchTimeout = null;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.currentFilter.search = e.target.value.trim();
        fetchProducts();
      }, 300);
    });
  }

  // Filter dropdowns
  const deptSelect = document.getElementById('filterDepartment');
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      state.currentFilter.department = e.target.value;
      fetchProducts();
    });
  }

  const catSelect = document.getElementById('filterCategory');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      state.currentFilter.category = e.target.value;
      fetchProducts();
    });
  }

  const brandSelect = document.getElementById('filterBrand');
  if (brandSelect) {
    brandSelect.addEventListener('change', (e) => {
      state.currentFilter.brand = e.target.value;
      fetchProducts();
    });
  }

  const sizeSelect = document.getElementById('filterSize');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      state.currentFilter.size_label = e.target.value;
      fetchProducts();
    });
  }

  const surfaceSelect = document.getElementById('filterSurface');
  if (surfaceSelect) {
    surfaceSelect.addEventListener('change', (e) => {
      state.currentFilter.surface = e.target.value;
      fetchProducts();
    });
  }

  const sortSelect = document.getElementById('filterSort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.currentFilter.sort = e.target.value;
      fetchProducts();
    });
  }

  // Forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) checkoutForm.addEventListener('submit', handlePlaceOrder);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.openProductDetail = openProductDetail;
window.addToCart = addToCart;
window.addToCartFromDetail = addToCartFromDetail;
window.changeCartQty = changeCartQty;
window.removeCartItem = removeCartItem;
window.openCartModal = openCartModal;
window.openCheckoutModal = openCheckoutModal;
window.openOrderHistoryModal = openOrderHistoryModal;
window.openAuthModal = openAuthModal;
window.closeModal = closeModal;
window.logout = logout;
