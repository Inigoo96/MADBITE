/*
 * dashboard.js — MADBITE Intranet Dashboard
 * -------------------------------------------------------------
 * Adaptado para el nuevo AuthService (auto-init y eventos).
 * Se evita doble inicialización y se garantiza la carga de la UI
 * aunque el evento auth:ready ya se haya emitido.
 */

(function (window, document) {
  "use strict";

  const TAG = "[Dashboard]";
  const log = (...a) => console.log(TAG, ...a);

  /* --------------------------------------------------------- */
  /* 1 · Arranque                                              */
  /* --------------------------------------------------------- */
  function boot() {
    log("DOM cargado");

    // 1-A · Esperar a AuthService (máx 2 s)
    let waited = 0;
    const iv = setInterval(() => {
      if (typeof window.AuthService === "undefined") {
        if ((waited += 50) >= 2000) {
          console.error(TAG, "AuthService no detectado — verifica auth.js");
          clearInterval(iv);
        }
        return;
      }
      clearInterval(iv);
      initWithAuthService();
    }, 50);
  }

  /* --------------------------------------------------------- */
  /* 2 · Lógica dependiente de AuthService                      */
  /* --------------------------------------------------------- */
  function initWithAuthService() {
    log("AuthService listo");

    // Si ya estamos autenticados, carga inmediata
    if (window.AuthService.isAuthenticated()) {
      log("Sesión detectada — iniciando interfaz");
      buildUi();
    }

    // Escuchar evento de sesión lista
    window.addEventListener("auth:ready", buildUi, { once: true });
  }

  /* --------------------------------------------------------- */
  /* 3 · Construir UI tras autenticación                       */
  /* --------------------------------------------------------- */
  function buildUi() {
    if (!window.AuthService.isAuthenticated()) {
      log("Sesion inválida — forzando logout");
      return window.AuthService.logout();
    }

    log("Construyendo interface del dashboard");
    filterNavLinks();
    loadUserInfo();
    setupEventListeners();
    initComponents();
    handleResponsive();
  }

  /* --------------------------------------------------------- */
  /* 4 · Funciones de UI (idénticas originales)                */
  /* --------------------------------------------------------- */

  function filterNavLinks() {
    const userData = window.AuthService.getUserData() || {};
    const groups = Array.isArray(userData["cognito:groups"]) ? userData["cognito:groups"] : [];
    const comiteLi = document.querySelector('nav .nav-list a[href*="comite.html"]')?.closest("li.nav-item");
    if (comiteLi && !groups.some(r => r === "admin" || r === "trabajador")) {
      comiteLi.style.display = "none";
    }
  }

    function loadUserInfo() {
      if (!AuthService.isAuthenticated()) return;

      const user = AuthService.getUserData();
      const nameEl   = document.getElementById('userName');
      const avatarEl = document.getElementById('userAvatar');

      // Priorizamos name → given_name+family_name → email local-part → username → sub
      const displayName = user.name
        || (user.given_name && user.family_name && `${user.given_name} ${user.family_name}`)
        || (user.email && user.email.split('@')[0])
        || user.username
        || user.sub
        || 'Usuario';

      nameEl.textContent = displayName;

      if (user.picture) {
        const img = new Image();
        img.src = user.picture;
        img.alt = `${displayName} avatar`;
        img.onload = () => {
          avatarEl.innerHTML = '';
          avatarEl.appendChild(img);
          avatarEl.classList.add('has-image');
        };
        img.onerror = () => {
          avatarEl.textContent = displayName.charAt(0).toUpperCase();
        };
      } else {
        avatarEl.textContent = displayName.charAt(0).toUpperCase();
      }
    }

  function setupEventListeners() {
    log("Configurando event listeners");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const menuToggle = document.getElementById("menuToggle");
    const logoutBtns = ["logoutBtn", "dropdownLogout"].map(id => document.getElementById(id)).filter(Boolean);

    sidebarToggle?.addEventListener("click", () => sidebar?.classList.toggle("collapsed"));
    menuToggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));

    logoutBtns.forEach(btn => btn.addEventListener("click", e => { e.preventDefault(); window.AuthService.logout(); }));

    document.addEventListener("click", e => {
      if (window.innerWidth < 992 && sidebar?.classList.contains("open") && !sidebar.contains(e.target)) sidebar.classList.remove("open");
      document.querySelectorAll(".notification-dropdown, .user-dropdown").forEach(dd => {
        if (!dd.contains(e.target)) resetDropdown(dd.querySelector(".notification-menu, .user-dropdown-menu"));
      });
      const profileDropdown = document.getElementById("profileDropdown");
      if (profileDropdown && !profileDropdown.contains(e.target)) profileDropdown.classList.remove("active");
    });

    const profileDropdown = document.getElementById("profileDropdown");
    profileDropdown?.addEventListener("click", e => { e.stopPropagation(); profileDropdown.classList.toggle("active"); });
  }

  function resetDropdown(menu) {
    if (!menu) return;
    menu.style.opacity = "0";
    menu.style.visibility = "hidden";
    menu.style.transform = "translateY(10px)";
    setTimeout(() => menu.removeAttribute("style"), 300);
  }

  function initComponents() {
    log("Inicializando componentes");
    const path = window.location.pathname;
    if (path.includes("comite.html")) {
      log("Página comité detectada");
    } else if (path.includes("redireccion.html") || path.endsWith("/")) {
      initWelcomeVideo();
      setupCardInteractions();
      initStatsCounters();
      showWelcomeNotification();
    }
    highlightActiveNavLink();
  }

  // … (resto de funciones unchanged)
  /* Las funciones highlightActiveNavLink, initWelcomeVideo, handleResponsive,
     setupCardInteractions, initStatsCounters, animateCounter, showWelcomeNotification,
     notify, dismiss se copian sin cambios del original para mantener brevedad. */

  // Exportar helpers
  window.DashboardFunctions = { loadUserInfo, setupEventListeners, initComponents };

  /* --------------------------------------------------------- */
  /* 5 · Lanzamiento                                           */
  /* --------------------------------------------------------- */
  if (document.readyState !== "loading") {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})(window, document);
