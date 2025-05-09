// menu.js · MADBITE - Carga dinámica y efectos del Menú

// API endpoint (context-path unificado con tu back)
const API_URL = './back/api/menu';

// Mapa de categorías a secciones HTML
const CATEGORY_SECTION = {
  PREMIUM:   'hamburguesas',
  CHICKEN:   'pollo',
  VEGGIE:    'veggie',
  SIDES:     'para-picar',
  SAUCES:    'salsas',
  BEVERAGES: 'bebidas',
  DESSERTS:  'postres',
  COMBOS:    'combos'
};

// Espera a DOM y carga datos
document.addEventListener('DOMContentLoaded', async () => {
  // Debug tokens
  console.log('💡 [Menu] access_token:', sessionStorage.getItem('access_token'));
  console.log('💡 [Menu] id_token    :', sessionStorage.getItem('id_token'));
  console.log('💡 [Menu] refresh_token:', localStorage.getItem('refresh_token'));

  document.addEventListener('auth:ready', () => {
    console.log('🔔 [Menu][auth:ready] access_token:', sessionStorage.getItem('access_token'));
    console.log('🔔 [Menu][auth:ready] id_token    :', sessionStorage.getItem('id_token'));
  });

  initSectionTitles();

  try {
    // Construcción del header con Bearer token
    const token   = sessionStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const res = await fetch(API_URL, {
      method:      'GET',
      headers
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const { categorias } = await res.json();
    renderMenu(categorias);
    initDynamicEffects();
  } catch (err) {
    console.error('No se pudo cargar el menú:', err);
  }
});

// Reestructura títulos con <span> para neon y texto
function initSectionTitles() {
  document.querySelectorAll('.section-title').forEach(title => {
    if (title.querySelector('.title-text')) return;
    const text  = title.textContent.trim();
    const parts = text.match(/(.*)\s+(\S+)$/) || ['', '', text];
    title.innerHTML =
      `<span class="title-text">${parts[1].trim()}</span>` +
      `<span class="title-neon">${parts[2]}</span>`;
  });
}

// Genera tarjetas dinámicas en su sección
function renderMenu(categorias) {
  categorias.forEach(cat => {
    const secId = CATEGORY_SECTION[cat.nombre.toUpperCase()];
    const grid  = document.querySelector(`#${secId} .menu-grid`);
    if (!grid) return;

    grid.innerHTML = '';
    cat.productos.forEach(prod => {
      const item = document.createElement('div');
      item.className               = 'menu-item';
      item.dataset.productoId      = prod.id;
      item.dataset.ingredients     = prod.descripcion;
      item.innerHTML = `
        <div class="menu-item-image">
          <img src="${prod.imageUrl}" alt="${prod.nombre}">
        </div>
        <div class="menu-item-content">
          <h3 class="menu-item-title">${prod.nombre}</h3>
          <p class="menu-item-description">${prod.descripcion}</p>
          <div class="menu-item-footer">
            <span class="menu-item-price">$${prod.precio.toFixed(2)}</span>
            <button class="menu-item-action" aria-label="Añadir al carrito">
              <i class="fas fa-plus"></i>
            </button>
            <button class="menu-item-customize" aria-label="Personalizar ingredientes">
              <i class="fas fa-sliders-h"></i>
            </button>
          </div>
        </div>
      `;
      grid.appendChild(item);
    });
  });
}

// Inicializa animaciones, interacciones y navegación
function initDynamicEffects() {
  // Selección de secciones y items tras render
  const sections = {};
  Object.values(CATEGORY_SECTION).forEach(id => {
    sections[id] = document.getElementById(id);
  });
  const allItems = document.querySelectorAll('.menu-item');

  // GSAP + ScrollTrigger
  if (window.gsap) {
    if (gsap.plugins?.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    // Animaciones por sección
    Object.entries(sections).forEach(([key, section]) => {
      const items = section.querySelectorAll('.menu-item');
      if (!items.length) return;
      const animOpts = {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none none' }
      };
      gsap.from(items, animOpts);
      gsap.from(section.querySelector('.section-title'), {
        y: -30, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 90%' }
      });
    });
  } else {
    // Fallback con IntersectionObserver
    allItems.forEach(item => {
      item.style.opacity = '0'; item.style.transform = 'translateY(30px)';
    });
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)';
          o.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    allItems.forEach(i => obs.observe(i));
  }

  // Hover de tarjetas
  allItems.forEach(item => {
    const img = item.querySelector('img');
    item.addEventListener('mouseenter', () => {
      animateCard(item, img, true);
    });
    item.addEventListener('mouseleave', () => {
      animateCard(item, img, false);
    });
  });

  // Botón "añadir al carrito"
  document.querySelectorAll('.menu-item-action').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('adding');
      const menu = btn.closest('.menu-item');
      const name = menu.querySelector('.menu-item-title').textContent;
      const price = menu.querySelector('.menu-item-price').textContent;
      createCartNotification(name, price);
      setTimeout(() => btn.classList.remove('adding'), 500);
    });
  });

  // Personalizar ingredientes
  document.querySelectorAll('.menu-item-customize').forEach(btn => {
    btn.addEventListener('click', () => openCustomizeModal(btn.closest('.menu-item')));
  });

  // Navegación por categorías
  const links = document.querySelectorAll('.category-link');
  const sectionsList = Object.values(sections);
  window.addEventListener('scroll', () => highlightSection(links, sectionsList));
  links.forEach(link => link.addEventListener('click', e => {
    e.preventDefault(); scrollToSection(link.getAttribute('href').slice(1));
  }));
  highlightSection(links, sectionsList);

  // ScrollUp button
  initScrollUp();
  // Descarga menú animación
  initDownloadBtn();
}

// Helper: anima tarjeta on hover
function animateCard(card, img, enter) {
  if (window.gsap) {
    gsap.to(card, { y: enter ? -10 : 0, boxShadow: enter
        ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.3)', duration: 0.3 });
    if (img) gsap.to(img, { scale: enter ? 1.05 : 1, duration: 0.4 });
  } else {
    card.style.transform = enter ? 'translateY(-10px)' : 'translateY(0)';
    card.style.boxShadow = enter
      ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.3)';
  }
}

// Crear notificación carrito
function createCartNotification(name, price) {
  const notif = document.createElement('div'); notif.className = 'cart-notification';
  notif.innerHTML = `<div class="cart-notification-content">` +
    `<i class="fas fa-shopping-cart"></i>` +
    `<div><strong>${name}</strong><p>Añadido</p><span>${price}</span></div>` +
    `</div>`;
  document.body.appendChild(notif);
  if (window.gsap) {
    gsap.fromTo(notif, { x:100, opacity:0 }, { x:0, opacity:1, duration:0.5, ease:'power2.out' });
    gsap.to(notif, { x:100, opacity:0, delay:2.5, duration:0.5, onComplete:() => notif.remove() });
  } else {
    setTimeout(() => notif.remove(), 3000);
  }
}

// Modal personalizar
function openCustomizeModal(item) {
  const ingredients = (item.dataset.ingredients||'').split(',').map(s=>s.trim());
  const overlay = document.createElement('div'); overlay.className='customize-overlay';
  const formHtml = ingredients.map(ing=>
    `<label><input type=checkbox name=ing value="${ing}" checked>${ing}</label>`).join('');
  overlay.innerHTML = `
    <div class="customize-modal">
      <h3>Personaliza tu burger</h3>
      <form class="custom-form">${formHtml}
        <div><button type="button" class="cancel">Cancelar</button><button type="submit">Guardar</button></div>
      </form>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.remove(); });
  overlay.querySelector('.cancel').onclick = ()=> overlay.remove();
  overlay.querySelector('.custom-form').onsubmit = e=>{
    e.preventDefault(); overlay.remove();
  };
}

// Resalta sección visible
function highlightSection(links, sections) {
  const y = window.scrollY + 150;
  sections.forEach(sec => {
    const top = sec.offsetTop, h = sec.offsetHeight;
    const link = document.querySelector(`.category-link[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', y>=top && y<top+h);
  });
}

// Scroll suave a sección
function scrollToSection(id) {
  const sec = document.getElementById(id);
  if (sec) window.scrollTo({ top: sec.offsetTop-100, behavior:'smooth' });
}

// ScrollUp button init
function initScrollUp() {
  const btn = document.getElementById('scrollUp');
  if (!btn) return;
  window.addEventListener('scroll', ()=>{
    btn.style.opacity = window.scrollY>500?'1':'0';
    btn.style.pointerEvents = window.scrollY>500?'auto':'none';
  });
  btn.onclick = ()=> window.scrollTo({top:0,behavior:'smooth'});
}

// Animación botón descargar
function initDownloadBtn() {
  const btn = document.getElementById('downloadMenuBtn');
  if (!btn) return;
  btn.addEventListener('click', ()=>{
    if (window.gsap) gsap.to(btn,{scale:0.95,duration:0.1,yoyo:true,repeat:1});
    else { btn.style.transform='scale(0.95)'; setTimeout(()=>btn.style.transform='',200); }
  });
}
