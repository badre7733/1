// =====================================================
// CONFIGURACIÓN DE PAGOS - MERCADO PAGO
// =====================================================
// Cuando Agale te pase el link de pago, pégalo aquí entre las comillas:
const MERCADOPAGO_LINK = "https://bold.co/pagos-en-linea/pasarela-de-pagos?utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content=158342019285&utm_term=pasarela%20de%20pago&gad_source=1&gad_campaignid=21099509655&gbraid=0AAAAACnKeuhSQNBUBwz2EY6tB8YvE7OFW&gclid=Cj0KCQjwhsrUBhDxARIsAN3AQSffEq1D8R6riAA2CRB9sp4fEAycrbDSvAUOHgTQ3ea7oqSLYV97SUMaAg_pEALw_wcB";
// Ejemplo: const MERCADOPAGO_LINK = "https://mpago.la/xxxxx";
// =====================================================

// ===== DATA =====


// ===== STATE =====
let products = [];
let cart = [];
let currentUser = null;
let currentCategory = 'all';
let currentSearch = '';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderFeatured();
  renderAllProducts();
  updateCartUI();
  updateUserUI();
  
  // Close menus on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    const btn = document.getElementById('userBtn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
});

function loadData() {
  const savedProducts = localStorage.getItem('agale_products');
  if (savedProducts) {
    products = JSON.parse(savedProducts);
  } else {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }
  
  const savedCart = localStorage.getItem('agale_cart');
  if (savedCart) cart = JSON.parse(savedCart);
  
  const savedUser = localStorage.getItem('agale_user');
  if (savedUser) currentUser = JSON.parse(savedUser);
}

function saveProducts() {
  localStorage.setItem('agale_products', JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem('agale_cart', JSON.stringify(cart));
}

function saveUser() {
  if (currentUser) {
    localStorage.setItem('agale_user', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('agale_user');
  }
}

// ===== NAVIGATION =====
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) {
    section.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  if (id === 'productos') renderAllProducts();
  if (id === 'mis-productos') renderMyProducts();
  if (id === 'pedidos') renderOrders();
  
  document.getElementById('userMenu').classList.remove('show');
}

// ===== PRODUCTS RENDER =====
function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO');
}

function calcDiscount(price, old) {
  if (!old || old <= price) return null;
  return Math.round((1 - price / old) * 100);
}

function productCardHTML(p) {
  const discount = calcDiscount(p.price, p.oldPrice);
  return `
    <div class="product-card" onclick="openProduct(${p.id})">
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'><i class=\\'fas fa-image\\'></i></div>'">` : `<div class="placeholder"><i class="fas fa-image"></i></div>`}
        ${p.dropship ? '<span class="product-badge dropship">Dropship</span>' : (discount ? `<span class="product-badge">-${discount}%</span>` : '')}
      </div>
      <div class="product-body">
        <h3>${p.title}</h3>
        <div class="product-seller">${p.seller}${p.provider ? ' · ' + p.provider : ''}</div>
        <div class="product-price">
          <span class="current">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ''}
          ${discount ? `<span class="discount">-${discount}%</span>` : ''}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn-primary" onclick="event.stopPropagation(); addToCart(${p.id})">
          <i class="fas fa-cart-plus"></i> Agregar
        </button>
      </div>
    </div>
  `;
}

function renderFeatured() {
  const featured = products.slice(0, 8);
  document.getElementById('featuredProducts').innerHTML = featured.map(productCardHTML).join('');
}

function getFilteredProducts() {
  let list = [...products];
  
  if (currentCategory !== 'all') {
    list = list.filter(p => p.category === currentCategory);
  }
  
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.desc.toLowerCase().includes(q) ||
      p.seller.toLowerCase().includes(q)
    );
  }
  
  const sort = document.getElementById('sortSelect')?.value || 'relevant';
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'newest') list.sort((a, b) => b.id - a.id);
  
  return list;
}

function renderAllProducts() {
  const list = getFilteredProducts();
  const container = document.getElementById('allProducts');
  if (list.length === 0) {
    container.innerHTML = '<p class="empty-msg">No se encontraron productos.</p>';
  } else {
    container.innerHTML = list.map(productCardHTML).join('');
  }
}

function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.cat-btn[data-cat="${cat}"]`)?.classList.add('active');
  showSection('productos');
  renderAllProducts();
}

function searchProducts() {
  currentSearch = document.getElementById('searchInput').value.trim();
  showSection('productos');
  renderAllProducts();
}

function sortProducts() {
  renderAllProducts();
}

document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchProducts();
});

// ===== PRODUCT DETAIL =====
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  
  const discount = calcDiscount(p.price, p.oldPrice);
  document.getElementById('productDetail').innerHTML = `
    <div class="product-detail-img">
      ${p.image ? `<img src="${p.image}" alt="${p.title}">` : '<div class="placeholder"><i class="fas fa-image"></i></div>'}
    </div>
    <div class="product-detail-info">
      <h2>${p.title}</h2>
      <div class="seller">Vendido por <strong>${p.seller}</strong>${p.provider ? ' · Proveedor: ' + p.provider : ''}</div>
      <div class="price-block">
        <span class="current">${formatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="old">${formatPrice(p.oldPrice)}</span>` : ''}
        ${discount ? `<span class="discount">-${discount}%</span>` : ''}
      </div>
      <p class="desc">${p.desc}</p>
      <div class="meta">
        <span><i class="fas fa-box"></i> Stock: ${p.stock}</span>
        <span><i class="fas fa-tag"></i> ${p.category}</span>
        ${p.dropship ? '<span><i class="fas fa-truck"></i> Dropshipping</span>' : ''}
      </div>
      <button class="btn-primary btn-lg" onclick="addToCart(${p.id}); closeModal('productModal')">
        <i class="fas fa-cart-plus"></i> Agregar al carrito
      </button>
    </div>
  `;
  openModal('productModal');
}

// ===== CART =====
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast('Producto agregado al carrito', 'success');
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else {
    saveCart();
    updateCartUI();
  }
}

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;
  
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart" style="font-size:40px;margin-bottom:12px;opacity:0.3"></i><p>Tu carrito está vacío</p></div>';
  } else {
    container.innerHTML = cart.map(c => `
      <div class="cart-item">
        ${c.image ? `<img src="${c.image}" alt="">` : '<div style="width:64px;height:64px;background:#f1f5f9;border-radius:8px;"></div>'}
        <div class="cart-item-info">
          <h4>${c.title}</h4>
          <div class="price">${formatPrice(c.price)}</div>
          <div class="cart-item-qty">
            <button onclick="changeQty(${c.id}, -1)">−</button>
            <span>${c.qty}</span>
            <button onclick="changeQty(${c.id}, 1)">+</button>
            <button onclick="removeFromCart(${c.id})" style="margin-left:auto;border:none;color:#ef4444;background:none;cursor:pointer"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('show');
  document.getElementById('cartOverlay').classList.toggle('show');
}

function saveCurrentOrder(status, checkoutData = {}) {
  const buyerName = checkoutData.name || (currentUser ? currentUser.name : 'Cliente');
  const buyerEmail = checkoutData.email || (currentUser ? currentUser.email : '');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const orderId = Date.now();
  const orders = JSON.parse(localStorage.getItem('agale_orders') || '[]');
  orders.push({
    id: orderId,
    userId: buyerEmail || 'invitado',
    buyerName,
    buyerEmail,
    phone: checkoutData.phone || '',
    shippingAddress: checkoutData.address || '',
    city: checkoutData.city || '',
    department: checkoutData.department || '',
    notes: checkoutData.notes || '',
    items: [...cart],
    total,
    date: new Date().toISOString(),
    status: status || 'Pendiente de pago'
  });
  localStorage.setItem('agale_orders', JSON.stringify(orders));
  return { orderId, total, buyerName, buyerEmail };
}

function openCheckout() {
  if (cart.length === 0) {
    showToast('El carrito está vacío', 'error');
    return;
  }
  if (!MERCADOPAGO_LINK || MERCADOPAGO_LINK.trim() === '') {
    showToast('Falta configurar el link de Mercado Pago en js/app.js', 'error');
    return;
  }

  document.getElementById('checkoutName').value = currentUser?.name || '';
  document.getElementById('checkoutEmail').value = currentUser?.email || '';

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const items = cart.map(c => `${c.qty} × ${c.title} — ${formatPrice(c.price * c.qty)}`).join('<br>');
  document.getElementById('checkoutSummary').innerHTML =
    `<strong>Resumen del pedido</strong><br>${items}<hr style="border:0;border-top:1px solid #e2e8f0;margin:10px 0"><strong>Total: ${formatPrice(total)}</strong>`;

  toggleCart();
  openModal('checkoutModal');
}

async function submitCheckout(e) {
  e.preventDefault();

  const submitButton = document.getElementById('checkoutSubmit');
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando datos...';

  const checkoutData = {
    name: document.getElementById('checkoutName').value.trim(),
    email: document.getElementById('checkoutEmail').value.trim().toLowerCase(),
    phone: document.getElementById('checkoutPhone').value.trim(),
    address: document.getElementById('checkoutAddress').value.trim(),
    city: document.getElementById('checkoutCity').value.trim(),
    department: document.getElementById('checkoutDepartment').value.trim(),
    notes: document.getElementById('checkoutNotes').value.trim()
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const orderId = Date.now();
  const itemsText = cart.map(c => `${c.qty} x ${c.title} — ${formatPrice(c.price * c.qty)}`).join('\n');

  try {
    // FormSubmit permite enviar el formulario por AJAX desde GitHub Pages,
    // sin Node.js, PHP ni otro servidor propio.
    const response = await fetch('https://formsubmit.co/ajax/agalecolombia@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: checkoutData.name,
        email: checkoutData.email,
        phone: checkoutData.phone,
        address: checkoutData.address,
        city: checkoutData.city,
        department: checkoutData.department,
        notes: checkoutData.notes || 'Sin indicaciones',
        order_id: orderId,
        products: itemsText,
        total: formatPrice(total),
        _subject: `Nuevo pedido Agale #${orderId}`,
        _template: 'table'
      })
    });

    const result = await response.json();
    if (!response.ok || result.success !== 'true') {
      throw new Error('No se pudieron enviar los datos del pedido.');
    }

    saveCurrentOrder('Datos enviados - Pendiente de pago', checkoutData);
    closeModal('checkoutModal');
    window.location.href = MERCADOPAGO_LINK;
  } catch (error) {
    console.error(error);
    showToast('No se pudieron enviar los datos. Inténtalo de nuevo.', 'error');
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-credit-card"></i> Enviar datos y continuar al pago';
  }
}

// Mantiene el nombre de la función que ya utiliza el botón de pago.
function checkout() {
  if (cart.length === 0) {
    showToast('El carrito está vacío', 'error');
    return;
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  document.getElementById('checkoutOrder').value =
    cart.map(c => `${c.qty}x ${c.title}`).join('\n');

  document.getElementById('checkoutTotal').value =
    formatPrice(total);

  document.getElementById('checkoutSummary').innerHTML =
    `<div class="checkout-summary">
      <strong>Resumen del pedido</strong><br>
      ${cart.map(c => `${c.qty} × ${c.title} — ${formatPrice(c.price * c.qty)}`).join('<br>')}
      <br><br>
      <strong>Total: ${formatPrice(total)}</strong>
    </div>`;

  // Después de enviar el formulario, vuelve a tu enlace de Mercado Pago
  document.getElementById('checkoutNext').value = MERCADOPAGO_LINK;

  openModal('checkoutModal');
}

// ===== AUTH =====
function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('show');
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.getElementById('userMenu').classList.remove('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function register(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass = document.getElementById('regPass').value;
  const isSeller = document.getElementById('regSeller').checked;
  
  const users = JSON.parse(localStorage.getItem('agale_users') || '[]');
  if (users.find(u => u.email === email)) {
    showToast('Este email ya está registrado', 'error');
    return;
  }
  
  const user = { name, email, pass, isSeller, createdAt: Date.now() };
  users.push(user);
  localStorage.setItem('agale_users', JSON.stringify(users));
  
  currentUser = { name, email, isSeller };
  saveUser();
  updateUserUI();
  closeModal('registerModal');
  showToast('¡Cuenta creada con éxito!', 'success');
}

function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  
  const users = JSON.parse(localStorage.getItem('agale_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === pass);
  
  if (!user) {
    showToast('Email o contraseña incorrectos', 'error');
    return;
  }
  
  currentUser = { name: user.name, email: user.email, isSeller: user.isSeller };
  saveUser();
  updateUserUI();
  closeModal('loginModal');
  showToast('¡Bienvenido, ' + user.name + '!', 'success');
}

function logout() {
  currentUser = null;
  saveUser();
  updateUserUI();
  document.getElementById('userMenu').classList.remove('show');
  showToast('Sesión cerrada', 'success');
  showSection('home');
}

function updateUserUI() {
  const nameEl = document.getElementById('userName');
  const loggedOut = document.getElementById('loggedOutMenu');
  const loggedIn = document.getElementById('loggedInMenu');
  
  if (currentUser) {
    nameEl.textContent = currentUser.name.split(' ')[0];
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'block';
  } else {
    nameEl.textContent = 'Ingresar';
    loggedOut.style.display = 'block';
    loggedIn.style.display = 'none';
  }
}

// ===== SELLER =====
function switchSellerTab(tab) {
  document.querySelectorAll('.seller-tabs .tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('manualTab').style.display = tab === 'manual' ? 'block' : 'none';
  document.getElementById('importTab').style.display = tab === 'import' ? 'block' : 'none';
}

function addProduct(e) {
  e.preventDefault();
  if (!currentUser) {
    showToast('Debes iniciar sesión para publicar', 'error');
    openModal('loginModal');
    return;
  }
  
  const title = document.getElementById('prodTitle').value.trim();
  const category = document.getElementById('prodCategory').value;
  const price = parseInt(document.getElementById('prodPrice').value);
  const oldPrice = parseInt(document.getElementById('prodOldPrice').value) || null;
  const stock = parseInt(document.getElementById('prodStock').value);
  const desc = document.getElementById('prodDesc').value.trim();
  const image = document.getElementById('prodImage').value.trim() || null;
  const dropship = document.getElementById('prodDropship').checked;
  
  const newProduct = {
    id: Date.now(),
    title,
    category,
    price,
    oldPrice,
    stock,
    desc,
    image,
    seller: currentUser.name,
    sellerId: currentUser.email,
    dropship,
    provider: dropship ? 'Manual' : null
  };
  
  products.unshift(newProduct);
  saveProducts();
  renderFeatured();
  renderAllProducts();
  
  document.getElementById('productForm').reset();
  showToast('¡Producto publicado con éxito!', 'success');
  showSection('mis-productos');
}

function renderMyProducts() {
  if (!currentUser) {
    document.getElementById('myProducts').innerHTML = '';
    document.getElementById('noMyProducts').style.display = 'block';
    document.getElementById('noMyProducts').innerHTML = 'Debes <a href="#" onclick="openModal(\'loginModal\')">iniciar sesión</a> para ver tus productos.';
    return;
  }
  
  const mine = products.filter(p => p.sellerId === currentUser.email);
  const container = document.getElementById('myProducts');
  const empty = document.getElementById('noMyProducts');
  
  if (mine.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    empty.innerHTML = 'Aún no has publicado productos. <a href="#" onclick="showSection(\'vender\')">Publica el primero</a>';
  } else {
    empty.style.display = 'none';
    container.innerHTML = mine.map(productCardHTML).join('');
  }
}

function renderOrders() {
  if (!currentUser) {
    document.getElementById('ordersList').innerHTML = '';
    document.getElementById('noOrders').style.display = 'block';
    document.getElementById('noOrders').textContent = 'Inicia sesión para ver tus pedidos.';
    return;
  }
  
  const orders = JSON.parse(localStorage.getItem('agale_orders') || '[]')
    .filter(o => o.userId === currentUser.email)
    .reverse();
  
  const container = document.getElementById('ordersList');
  const empty = document.getElementById('noOrders');
  
  if (orders.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    container.innerHTML = orders.map(o => `
      <div style="background:white;padding:20px;border-radius:12px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <strong>Pedido #${o.id}</strong>
          <span style="background:#fef3c7;color:#92400e;padding:4px 10px;border-radius:6px;font-size:13px">${o.status}</span>
        </div>
        <div style="font-size:13px;color:#64748b;margin-bottom:8px">${new Date(o.date).toLocaleString('es-CO')}</div>
        <div style="font-size:14px">${o.items.map(i => `${i.qty}x ${i.title}`).join(', ')}</div>
        <div style="margin-top:10px;font-weight:700">${formatPrice(o.total)}</div>
      </div>
    `).join('');
  }
}

// ===== PROVIDERS =====
function connectProvider(name) {
  if (!currentUser) {
    showToast('Inicia sesión para conectar proveedores', 'error');
    openModal('loginModal');
    return;
  }
  showToast(`Conexión con ${name} simulada. En producción se usaría la API real.`, 'success');
}

function importFromProvider(name) {
  if (!currentUser) {
    showToast('Inicia sesión primero', 'error');
    openModal('loginModal');
    return;
  }
  
  const results = document.getElementById('importResults');
  results.innerHTML = `<p style="margin-bottom:12px">Productos de ejemplo de <strong>${name}</strong> (demo):</p>`;
  
  // Simulate import of 3 products
  const samples = [
    { title: `Producto ${name} #1 - Auriculares`, price: 75000, category: 'tecnologia' },
    { title: `Producto ${name} #2 - Funda celular`, price: 25000, category: 'accesorios' },
    { title: `Producto ${name} #3 - Cable USB-C`, price: 18000, category: 'tecnologia' }
  ];
  
  results.innerHTML += samples.map((s, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:8px">
      <div>
        <strong>${s.title}</strong><br>
        <span style="color:#0d9488;font-weight:600">${formatPrice(s.price)}</span>
      </div>
      <button class="btn-primary btn-sm" onclick="importProduct('${name}', '${s.title}', ${s.price}, '${s.category}')">
        Importar
      </button>
    </div>
  `).join('');
}

function importProduct(provider, title, price, category) {
  if (!currentUser) return;
  
  const newProduct = {
    id: Date.now() + Math.random(),
    title,
    category,
    price,
    oldPrice: Math.round(price * 1.3),
    stock: 99,
    desc: `Producto importado desde ${provider}. Envío dropshipping automático.`,
    image: null,
    seller: currentUser.name,
    sellerId: currentUser.email,
    dropship: true,
    provider
  };
  
  products.unshift(newProduct);
  saveProducts();
  renderFeatured();
  showToast(`Producto importado desde ${provider}`, 'success');
}

// ===== TOAST =====
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
