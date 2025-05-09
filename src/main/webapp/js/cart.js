// cart.js

// Punto de entrada al API del carrito (mismo context-path que tu back)
const BASE_URL = '/back/api/carrito';

let cartButton, cartOverlay, cartSidebar, cartClose;
let cartItems, cartTotal, cartCount;

document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  bindEvents();
  updateCartCount();
  document.addEventListener('auth:ready', updateCartCount);
});

function cacheDOM() {
  cartButton  = document.getElementById('cart-button');
  cartOverlay = document.getElementById('cart-overlay');
  cartSidebar = document.getElementById('cart-sidebar');
  cartClose   = document.getElementById('cart-close');
  cartItems   = document.getElementById('cart-items');
  cartTotal   = document.getElementById('cart-total');
  cartCount   = document.getElementById('cart-count');
}

function bindEvents() {
  cartButton.addEventListener('click', openCart);
  cartOverlay.addEventListener('click', closeCart);
  cartClose.addEventListener('click', closeCart);

  cartItems.addEventListener('click', handleCartClick);
  cartItems.addEventListener('change', handleCartChange);

  document.querySelectorAll('.menu-item-action').forEach(btn => {
    btn.addEventListener('click', async () => {
      const menu   = btn.closest('.menu-item');
      const prodId = +menu.dataset.productoId;
      btn.classList.add('adding');
      createCartNotification(
        menu.querySelector('.menu-item-title').textContent,
        menu.querySelector('.menu-item-price').textContent
      );
      try {
        await apiRequest('', {
          method: 'POST',
          body: JSON.stringify({ productoId: prodId, cantidad: 1 })
        });
        await updateCartCount();
      } catch (err) {
        console.error('Error añadiendo línea:', err);
      }
      setTimeout(() => btn.classList.remove('adding'), 500);
    });
  });
}

async function apiRequest(path = '', options = {}) {
  const token   = sessionStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options
  });

  if (!res.ok) {
    if (res.status === 404) return { lineas: [], total: 0 };
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }

  if (options.method === 'DELETE' || res.status === 204) return null;
  return res.json();
}

async function openCart() {
  const data = await apiRequest();
  renderCart(data);
  cartOverlay.classList.add('open');
  cartSidebar.classList.add('open');
}

function closeCart() {
  cartOverlay.classList.remove('open');
  cartSidebar.classList.remove('open');
}

function renderCart({ lineas, total }) {
  if (!lineas || lineas.length === 0) {
    cartItems.innerHTML = '<li class="empty">Tu carrito está vacío</li>';
  } else {
    cartItems.innerHTML = lineas.map(l => `
      <li class="cart-item neon" data-id="${l.id}">
        <span class="item-name">${l.nombreProducto}</span>
        <div class="item-controls">
          <button class="decrease">–</button>
          <input type="number" min="1" value="${l.cantidad}" class="item-qty"/>
          <button class="increase">+</button>
        </div>
        <span class="item-subtotal">$${(l.precioUnitario * l.cantidad).toFixed(2)}</span>
        <button class="remove-item">&times;</button>
      </li>
    `).join('');
  }
  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = lineas ? lineas.length : '0';
}

function handleCartClick(e) {
  const li = e.target.closest('li[data-id]');
  if (!li) return;
  const id    = li.dataset.id;
  const input = li.querySelector('.item-qty');
  if (e.target.matches('.increase')) {
    updateLinea(id, +input.value + 1);
  } else if (e.target.matches('.decrease')) {
    const n = +input.value - 1;
    if (n > 0) updateLinea(id, n);
  } else if (e.target.matches('.remove-item')) {
    deleteLinea(id);
  }
}

function handleCartChange(e) {
  if (!e.target.matches('.item-qty')) return;
  const li  = e.target.closest('li[data-id]');
  const qty = Math.max(1, +e.target.value || 1);
  e.target.value = qty;
  updateLinea(li.dataset.id, qty);
}

async function updateLinea(id, cantidad) {
  await apiRequest(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad })
  });
  const data = await apiRequest();
  renderCart(data);
}

async function deleteLinea(id) {
  await apiRequest(`/${id}`, { method: 'DELETE' });
  const data = await apiRequest();
  renderCart(data);
}

async function updateCartCount() {
  try {
    const data = await apiRequest();
    cartCount.textContent = data.lineas ? data.lineas.length : '0';
  } catch {
    cartCount.textContent = '0';
  }
}

// Placeholder: define esta función en tu main.js o donde muestres notificaciones
function createCartNotification(nombre, precio) {
  // Implementa tu lógica de tostada o popup corporativa aquí
}
