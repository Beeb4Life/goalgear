/**
 * GoalGear - Admin Management Portal JavaScript
 *
 * Handles admin authentication, dashboard metrics, product CRUD operations
 * across Footballs, Boots, and Socks, inventory management, and order fulfillment.
 */

const adminState = {
  token: localStorage.getItem('goalgear_token') || null,
  user: JSON.parse(localStorage.getItem('goalgear_user') || 'null'),
  products: [],
  orders: [],
  currentOrderFilter: ''
};

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  setupAdminListeners();
});

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
// Authentication & Protection
// ====================================================================
function checkAdminAuth() {
  const loginSection = document.getElementById('adminLoginSection');
  const dashSection = document.getElementById('adminDashboardSection');
  const authNav = document.getElementById('adminAuthNav');

  if (adminState.token && adminState.user && adminState.user.role === 'admin') {
    if (loginSection) loginSection.style.display = 'none';
    if (dashSection) dashSection.style.display = 'block';

    if (authNav) {
      authNav.innerHTML = `
        <span style="font-size: 13px; font-weight: bold; color: var(--primary-color);">
          Admin: ${escapeHtml(adminState.user.fullName || adminState.user.email)}
        </span>
        <button class="btn btn-secondary btn-sm" onclick="adminLogout()">Sign Out</button>
      `;
    }

    loadDashboardStats();
    loadAdminProducts();
    loadAdminOrders();
  } else {
    if (loginSection) loginSection.style.display = 'block';
    if (dashSection) dashSection.style.display = 'none';
    if (authNav) authNav.innerHTML = '';
  }
}

async function adminApiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (adminState.token) {
    headers['Authorization'] = `Bearer ${adminState.token}`;
  }

  const res = await fetch(endpoint, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    if (res.status === 403 && data.error && data.error.includes('Administrator privileges')) {
      alert('Access Denied: This account does not have administrator privileges.');
      adminLogout();
    }
  }

  if (!res.ok) {
    throw new Error(data.error || `Server HTTP ${res.status}: ${res.statusText || 'error'}`);
  }

  return data;
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const alertEl = document.getElementById('adminLoginAlert');
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  if (alertEl) alertEl.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.user.role !== 'admin') {
      throw new Error('Access denied: This user account is a customer, not an administrator.');
    }

    adminState.token = data.token;
    adminState.user = data.user;
    localStorage.setItem('goalgear_token', data.token);
    localStorage.setItem('goalgear_user', JSON.stringify(data.user));

    checkAdminAuth();
  } catch (err) {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.textContent = err.message;
    }
  }
}

function adminLogout() {
  adminState.token = null;
  adminState.user = null;
  localStorage.removeItem('goalgear_token');
  localStorage.removeItem('goalgear_user');
  checkAdminAuth();
}

// ====================================================================
// Dashboard Statistics
// ====================================================================
async function loadDashboardStats() {
  try {
    const data = await adminApiRequest('/api/admin/stats');
    const stats = data.stats;

    document.getElementById('statRevenue').textContent = `£${stats.totalRevenue.toFixed(2)}`;
    document.getElementById('statOrders').textContent = stats.totalOrders;
    document.getElementById('statProducts').textContent = stats.totalProducts;
    document.getElementById('statLowStock').textContent = stats.lowStockCount;

    const banner = document.getElementById('lowStockAlertBanner');
    if (banner) {
      banner.style.display = stats.lowStockCount > 0 ? 'block' : 'none';
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
  }
}

// ====================================================================
// Product Management (CRUD & Inventory)
// ====================================================================
async function loadAdminProducts() {
  const tbody = document.getElementById('adminProductsTbody');
  if (!tbody) return;

  try {
    const data = await adminApiRequest('/api/products');
    adminState.products = data.products || [];

    if (adminState.products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="center">No products in database.</td></tr>';
      return;
    }

    tbody.innerHTML = adminState.products.map((p) => {
      const isLow = p.stock_quantity <= 10;
      const fallbackImg = getProductFallbackImage(p.department);
      const sizeDisplay = p.size_label || (p.ball_size ? `Size ${p.ball_size}` : 'Standard');

      return `
        <tr>
          <td style="width: 50px;">
            <img 
              src="${escapeHtml(p.image_url)}" 
              style="width: 40px; height: 40px; object-fit: contain;" 
              onerror="handleImageFallback(this, '${fallbackImg}');"
            >
          </td>
          <td>
            <strong>${escapeHtml(p.name)}</strong><br>
            <small style="color: #6c757d;">${escapeHtml(p.brand)} &bull; ${escapeHtml(p.fifa_rating || 'Standard')}</small>
          </td>
          <td><span class="productSpecsBadge">${escapeHtml(p.department || 'Balls')}</span></td>
          <td><span class="productSpecsBadge">${escapeHtml(p.category)}</span></td>
          <td>${escapeHtml(sizeDisplay)}</td>
          <td>${escapeHtml(p.surface)}</td>
          <td><strong>&pound;${parseFloat(p.price).toFixed(2)}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <input 
                type="number" 
                id="stockInput-${p.id}" 
                value="${p.stock_quantity}" 
                min="0" 
                style="width: 60px; padding: 4px 6px; font-size: 13px; border: 1px solid ${isLow ? 'var(--danger-color)' : '#ced4da'}; border-radius: 4px;"
              >
              <button class="btn btn-secondary btn-sm" onclick="quickUpdateStock('${p.id}')">Save</button>
            </div>
            ${isLow ? '<span style="font-size: 11px; color: var(--danger-color); font-weight: bold;">Low Stock!</span>' : ''}
          </td>
          <td class="center">${p.is_featured ? '&#10004;' : '&mdash;'}</td>
          <td>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-secondary btn-sm" onclick="openEditProductModal('${p.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}', '${escapeHtml(p.name)}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" class="alertBox alertError">Error loading products: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function handleDeptChange(dept) {
  const catSelect = document.getElementById('prodCategory');
  const sizeInput = document.getElementById('prodSizeLabel');
  if (!catSelect) return;

  if (dept === 'Boots') {
    catSelect.value = 'Football Boots';
    if (sizeInput && !sizeInput.value) sizeInput.value = 'UK 9.0';
  } else if (dept === 'Socks') {
    catSelect.value = 'Grip Socks';
    if (sizeInput && !sizeInput.value) sizeInput.value = 'M (UK 6-9)';
  } else {
    catSelect.value = 'Match Ball';
    if (sizeInput && !sizeInput.value) sizeInput.value = 'Size 5';
  }
}

function openAddProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('prodEditId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add New Football Product';
  document.getElementById('productModalAlert').style.display = 'none';
  document.getElementById('prodSizeLabel').value = 'Size 5';
  openModal('productModal');
}

function openEditProductModal(id) {
  const p = adminState.products.find((item) => item.id === id);
  if (!p) return;

  document.getElementById('prodEditId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodBrand').value = p.brand;
  document.getElementById('prodDepartment').value = p.department || 'Balls';
  document.getElementById('prodCategory').value = p.category;
  document.getElementById('prodSizeLabel').value = p.size_label || (p.ball_size ? `Size ${p.ball_size}` : 'Standard');
  document.getElementById('prodSurface').value = p.surface;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodStock').value = p.stock_quantity;
  document.getElementById('prodFifa').value = p.fifa_rating || 'Standard';
  document.getElementById('prodImageUrl').value = p.image_url;
  document.getElementById('prodDesc').value = p.description || '';
  document.getElementById('prodFeatured').checked = Boolean(p.is_featured);

  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productModalAlert').style.display = 'none';
  openModal('productModal');
}

async function handleProductFormSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('productModalAlert');
  const editId = document.getElementById('prodEditId').value;
  const isEditing = Boolean(editId);

  const dept = document.getElementById('prodDepartment').value;
  const sizeLabel = document.getElementById('prodSizeLabel').value.trim();

  let ballSize = null;
  if (dept === 'Balls') {
    const match = sizeLabel.match(/\d+/);
    if (match) ballSize = parseInt(match[0], 10);
  }

  const payload = {
    name: document.getElementById('prodName').value.trim(),
    brand: document.getElementById('prodBrand').value.trim(),
    department: dept,
    category: document.getElementById('prodCategory').value,
    ball_size: ballSize,
    size_label: sizeLabel,
    surface: document.getElementById('prodSurface').value,
    price: parseFloat(document.getElementById('prodPrice').value),
    stock_quantity: parseInt(document.getElementById('prodStock').value, 10),
    fifa_rating: document.getElementById('prodFifa').value.trim() || 'Standard',
    image_url: document.getElementById('prodImageUrl').value.trim() || getProductFallbackImage(dept),
    description: document.getElementById('prodDesc').value.trim(),
    is_featured: document.getElementById('prodFeatured').checked
  };

  try {
    const endpoint = isEditing ? `/api/admin/products/${editId}` : '/api/admin/products';
    const method = isEditing ? 'PUT' : 'POST';

    await adminApiRequest(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    closeModal('productModal');
    loadDashboardStats();
    loadAdminProducts();
    alert(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
  } catch (err) {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.textContent = err.message;
    }
  }
}

async function quickUpdateStock(productId) {
  const input = document.getElementById(`stockInput-${productId}`);
  const newStock = parseInt(input ? input.value : '0', 10);

  if (isNaN(newStock) || newStock < 0) {
    alert('Please enter a valid stock number.');
    return;
  }

  try {
    await adminApiRequest(`/api/admin/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock_quantity: newStock })
    });

    loadDashboardStats();
    loadAdminProducts();
  } catch (err) {
    alert(`Failed to update stock: ${err.message}`);
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}" from the catalogue?`)) {
    return;
  }

  try {
    await adminApiRequest(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });

    loadDashboardStats();
    loadAdminProducts();
    alert('Product deleted successfully.');
  } catch (err) {
    alert(`Failed to delete product: ${err.message}`);
  }
}

// ====================================================================
// Order Fulfillment Management
// ====================================================================
async function loadAdminOrders(statusFilter = '') {
  const tbody = document.getElementById('adminOrdersTbody');
  if (!tbody) return;

  try {
    const endpoint = statusFilter ? `/api/admin/orders?status=${encodeURIComponent(statusFilter)}` : '/api/admin/orders';
    const data = await adminApiRequest(endpoint);
    adminState.orders = data.orders || [];

    if (adminState.orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="center">No customer orders found.</td></tr>';
      return;
    }

    tbody.innerHTML = adminState.orders.map((o) => {
      const itemsList = (o.items || [])
        .map((i) => `${escapeHtml(i.product_name)} (${escapeHtml(i.size_label || '')}) x${i.quantity}`)
        .join('<br>');

      return `
        <tr>
          <td><strong>${escapeHtml(o.order_number)}</strong></td>
          <td style="font-size: 13px;">${new Date(o.created_at).toLocaleDateString()}</td>
          <td>
            <strong>${escapeHtml(o.customer_name)}</strong><br>
            <small style="color: #6c757d;">${escapeHtml(o.customer_email)}</small><br>
            <small>${escapeHtml(o.shipping_address)}, ${escapeHtml(o.city)}</small>
          </td>
          <td style="font-size: 13px;">${itemsList}</td>
          <td><strong>&pound;${parseFloat(o.total_amount).toFixed(2)}</strong></td>
          <td>
            <span class="statusBadge status-${escapeHtml(o.status)}">${escapeHtml(o.status)}</span>
          </td>
          <td>
            <select 
              onchange="changeOrderStatus('${o.id}', this.value)" 
              style="padding: 4px 6px; font-size: 13px; border: 1px solid var(--border-color); border-radius: 4px;"
            >
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="alertBox alertError">Error loading orders: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function changeOrderStatus(orderId, newStatus) {
  try {
    await adminApiRequest(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    loadDashboardStats();
    loadAdminOrders(adminState.currentOrderFilter);
  } catch (err) {
    alert(`Failed to update order status: ${err.message}`);
  }
}

function filterAdminOrders(status) {
  adminState.currentOrderFilter = status;
  loadAdminOrders(status);
}

// ====================================================================
// Utilities & Listeners
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

function setupAdminListeners() {
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);

  const productForm = document.getElementById('productForm');
  if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);
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

window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.handleDeptChange = handleDeptChange;
window.quickUpdateStock = quickUpdateStock;
window.deleteProduct = deleteProduct;
window.changeOrderStatus = changeOrderStatus;
window.filterAdminOrders = filterAdminOrders;
window.adminLogout = adminLogout;
window.closeModal = closeModal;
