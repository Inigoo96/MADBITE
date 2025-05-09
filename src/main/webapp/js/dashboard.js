// dashboard.js · MADBITE Intranet - Dashboard Unificado
import AuthService from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicializamos AuthService (gestiona callback y reemite auth:ready si ya hay tokens)
  AuthService.init();

  // Cuando estamos realmente autenticados:
  document.addEventListener("auth:ready", () => {
    if (!AuthService.isAuthenticated()) {
      AuthService.logout();
      return;
    }
    filterNavLinks();
    loadUserInfo();         // <-- carga nombre e imagen de perfil
    setupEventListeners();
    initComponents();
    handleResponsive();
  });
});

function filterNavLinks() {
  const userData = AuthService.getUserData() || {};
  const groups = Array.isArray(userData["cognito:groups"])
    ? userData["cognito:groups"]
    : [];
  const comiteLi = document
    .querySelector('nav .nav-list a[href*="comite.html"]')
    ?.closest("li.nav-item");
  if (comiteLi && !groups.some((r) => r === "admin" || r === "trabajador")) {
    comiteLi.style.display = "none";
  }
}

// ——————————————————————————————————————————————————————————
// · Carga nombre e imagen de perfil
function loadUserInfo() {
  const user = AuthService.getUserData();
  if (!user) return console.warn("No hay datos de usuario.");

  // 1) Nombre a mostrar: preferimos `name`, luego email, luego sub
  const displayName =
    user.name ||
    (user.email ? user.email.split("@")[0] : null) ||
    user.sub ||
    "Usuario";

  // 2) Avatar: si hay `picture`, lo usamos; si no, iniciales
  const avatarEl = document.querySelector(
    ".profile-toggle .profile-avatar"
  );
  avatarEl.innerHTML = ""; // limpio
  avatarEl.classList.remove("has-image");

  if (user.picture) {
    const img = document.createElement("img");
    img.src = user.picture;
    img.alt = `${displayName} avatar`;
    img.onload = () => {
      avatarEl.appendChild(img);
      avatarEl.classList.add("has-image");
    };
    img.onerror = () => {
      // si falló carga, fallback a inicial
      avatarEl.textContent = displayName.charAt(0).toUpperCase();
    };
  } else {
    // sin picture, inicial
    avatarEl.textContent = displayName.charAt(0).toUpperCase();
  }

  // 3) Nombre junto al avatar
  const nameEl = document.querySelector(".profile-toggle .profile-name");
  if (nameEl) nameEl.textContent = displayName;
}
// ——————————————————————————————————————————————————————————

function setupEventListeners() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const menuToggle = document.getElementById("menuToggle");
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("dropdownLogout"),
  ];

  sidebarToggle?.addEventListener("click", () =>
    sidebar.classList.toggle("collapsed")
  );
  menuToggle?.addEventListener("click", () =>
    sidebar.classList.toggle("open")
  );

  logoutBtns.forEach((btn) =>
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      AuthService.logout();
    })
  );

  document.addEventListener("click", (e) => {
    if (
      window.innerWidth < 992 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target)
    ) {
      sidebar.classList.remove("open");
    }
    document
      .querySelectorAll(".notification-dropdown, .user-dropdown")
      .forEach((dd) => {
        if (!dd.contains(e.target)) {
          const menu = dd.querySelector(
            ".notification-menu, .user-dropdown-menu"
          );
          if (menu) resetDropdown(menu);
        }
      });
    document.getElementById("profileDropdown")?.classList.remove("active");
  });

  document
    .getElementById("profileDropdown")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      e.currentTarget.classList.toggle("active");
    });
}

function resetDropdown(menu) {
  menu.style.opacity = "0";
  menu.style.visibility = "hidden";
  menu.style.transform = "translateY(10px)";
  setTimeout(() => menu.removeAttribute("style"), 300);
}

function initComponents() {
  const path = window.location.pathname;
  if (path.includes("comite.html")) {
    // lógica comité…
  } else if (path.includes("redireccion.html") || path.endsWith("/")) {
    initWelcomeVideo();
    setupCardInteractions();
    initStatsCounters();
    showWelcomeNotification();
  }
  highlightActiveNavLink();
}

function highlightActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    const li = link.closest("li");
    if (!li) return;
    li.classList.toggle("active", path.includes(link.getAttribute("href")));
  });
}

function initWelcomeVideo() {
  const video = document.querySelector('.video-container video');
  if (!video) return;

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.load();
        entry.target.getRootNode()?.getIntersectionObservers()?.forEach(obs => obs.disconnect());
      }
    });
  }, { threshold: 0.1 }).observe(video);

  ['play', 'pause', 'ended'].forEach(evt =>
    video.addEventListener(evt, () => console.log(`Vídeo ${evt}`))
  );
}

function handleResponsive() {
  const sidebar = document.getElementById('sidebar');
  const adapt = () => {
    if (window.innerWidth < 992) sidebar.classList.add('collapsed');
    else sidebar.classList.remove('collapsed');
  };
  window.addEventListener('resize', adapt);
  adapt();
}

function setupCardInteractions() {
  document.querySelectorAll(".dashboard-card").forEach((card) => {
    card.addEventListener("mouseenter", () => card.classList.add("card-hover"));
    card.addEventListener("mouseleave", () => card.classList.remove("card-hover"));
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("dashboard-card-button")) {
        const btn = card.querySelector(".dashboard-card-button");
        if (btn) btn.click();
      }
    });
  });
}

function initStatsCounters() {
  const elements = document.querySelectorAll(".stat-value");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  elements.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.textContent, 10);
  if (isNaN(target)) return;

  const duration = 2000;
  const frameDur = 1000 / 60;
  const totalFrames = Math.round(duration / frameDur);
  let frame = 0;

  el.setAttribute("data-value", target);
  el.textContent = "0";

  const update = () => {
    frame++;
    const progress = 1 - Math.pow(1 - frame / totalFrames, 4);
    el.textContent = Math.round(target * progress);
    if (frame < totalFrames) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  };
  requestAnimationFrame(update);
}

function showWelcomeNotification() {
  setTimeout(() => {
    notify("¡Bienvenido a tu dashboard! Tienes 2 nuevas promociones.");
  }, 3000);
}

function notify(message) {
  let container = document.querySelector(".notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container";
    document.body.appendChild(container);
  }

  const notif = document.createElement("div");
  notif.className = "notification";
  notif.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-bell"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(notif);

  setTimeout(() => notif.classList.add("show"), 10);
  notif.querySelector(".notification-close")
       .addEventListener("click", () => dismiss(notif));
  setTimeout(() => dismiss(notif), 5000);
}

function dismiss(notif) {
  notif.classList.remove("show");
  setTimeout(() => notif.remove(), 300);
}
