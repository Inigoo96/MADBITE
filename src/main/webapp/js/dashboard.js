// dashboard.js · MADBITE Intranet - Dashboard Unificado
// Versión sin módulos ES6 (para mejor compatibilidad)

// Función autoejecutada para evitar contaminar el ámbito global
(function() {
  document.addEventListener("DOMContentLoaded", function() {
    // Inicializamos AuthService (gestiona callback y reemite auth:ready si ya hay tokens)
    console.log("Dashboard: DOM cargado");

    // Verificar si AuthService está disponible
    if (typeof window.AuthService === 'undefined') {
      console.error("Dashboard: Error - AuthService no está disponible. ¿El archivo auth.js está cargado correctamente?");
      return;
    }

    window.AuthService.init();
    console.log("Dashboard: AuthService inicializado");

    // Evento auth:ready en WINDOW, no en document
    window.addEventListener("auth:ready", function() {
      console.log("Dashboard: Evento auth:ready recibido");
      if (!window.AuthService.isAuthenticated()) {
        console.log("Dashboard: Usuario no autenticado, haciendo logout");
        window.AuthService.logout();
        return;
      }
      console.log("Dashboard: Usuario autenticado, cargando interfaz");
      filterNavLinks();
      loadUserInfo();
      setupEventListeners();
      initComponents();
      handleResponsive();
    });
  });

  function filterNavLinks() {
    const userData = window.AuthService.getUserData() || {};
    const groups = Array.isArray(userData["cognito:groups"]) ? userData["cognito:groups"] : [];
    const comiteLi = document.querySelector('nav .nav-list a[href*="comite.html"]')?.closest("li.nav-item");
    if (comiteLi && !groups.some(function(r) { return r === "admin" || r === "trabajador"; })) {
      comiteLi.style.display = "none";
    }
  }

  // ——————————————————————————————————————————————————————————
  // Modificación para dashboard.js en la función loadUserInfo()
  function loadUserInfo() {
    console.log("Dashboard: Cargando información del usuario...");
    const user = window.AuthService.getUserData();
    if (!user) {
      console.warn("Dashboard: No hay datos de usuario.");
      return;
    }

    console.log("Dashboard: Datos de usuario obtenidos", user);

    // 1) Construir displayName
    let displayName = "Usuario";
    if (user.name) {
      displayName = user.name;
    } else if (user.given_name && user.family_name) {
      displayName = user.given_name + " " + user.family_name;
    } else if (user.email) {
      displayName = user.email.split("@")[0];
    } else if (user.sub) {
      displayName = user.sub;
    }

    // 2) URL de la foto (si viene en el token)
    const pictureUrl = user.picture || null;

    // 3) Renderizar avatar - Con verificación de existencia
    const avatarEl = document.getElementById("userAvatar");
    if (avatarEl) {
      avatarEl.innerHTML = "";
      avatarEl.classList.remove("has-image");

      if (pictureUrl) {
        const img = document.createElement("img");
        img.src = pictureUrl;
        img.alt = displayName + " avatar";
        img.onload = function() {
          avatarEl.appendChild(img);
          avatarEl.classList.add("has-image");
        };
        img.onerror = function() {
          console.warn("Dashboard: Error al cargar imagen, usando inicial");
          avatarEl.textContent = displayName.charAt(0).toUpperCase();
        };
      } else {
        avatarEl.textContent = displayName.charAt(0).toUpperCase();
      }
    } else {
      console.warn("Dashboard: Elemento userAvatar no encontrado en el DOM");
      // Crear el elemento si no existe
      createAvatarIfNeeded(displayName, pictureUrl);
    }

    // 4) Renderizar nombre de perfil - Con verificación de existencia
    const nameEl = document.getElementById("userName");
    if (nameEl) {
      nameEl.textContent = displayName;
    } else {
      console.warn("Dashboard: Elemento userName no encontrado en el DOM");
      // Opcionalmente, crear el elemento si no existe
      createUserNameIfNeeded(displayName);
    }
  }

  // Funciones auxiliares para crear elementos si es necesario
  function createAvatarIfNeeded(displayName, pictureUrl) {
    // Puedes implementar la creación del elemento si lo necesitas
    console.log("Dashboard: Se podría crear un avatar para:", displayName);
  }

  function createUserNameIfNeeded(displayName) {
    // Puedes implementar la creación del elemento si lo necesitas
    console.log("Dashboard: Se podría crear un elemento para mostrar el nombre:", displayName);
  }

  // ——————————————————————————————————————————————————————————
  function setupEventListeners() {
    console.log("Dashboard: Configurando event listeners");
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const menuToggle = document.getElementById("menuToggle");
    const logoutBtns = [
      document.getElementById("logoutBtn"),
      document.getElementById("dropdownLogout")
    ];

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function() {
        sidebar.classList.toggle("collapsed");
      });
    }

    if (menuToggle) {
      menuToggle.addEventListener("click", function() {
        sidebar.classList.toggle("open");
      });
    }

    logoutBtns.forEach(function(btn) {
      if (btn) {
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          window.AuthService.logout();
        });
      }
    });

    document.addEventListener("click", function(e) {
      // Cerrar sidebar en móvil si se hace clic fuera
      if (window.innerWidth < 992 && sidebar && sidebar.classList.contains("open") && !sidebar.contains(e.target)) {
        sidebar.classList.remove("open");
      }

      // Cerrar dropdowns si se hace clic fuera
      document.querySelectorAll(".notification-dropdown, .user-dropdown").forEach(function(dd) {
        if (!dd.contains(e.target)) {
          const menu = dd.querySelector(".notification-menu, .user-dropdown-menu");
          if (menu) resetDropdown(menu);
        }
      });

      // Desactivar profileDropdown al hacer clic fuera
      const profileDropdown = document.getElementById("profileDropdown");
      if (profileDropdown && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("active");
      }
    });

    // Alternar dropdown de perfil
    const profileDropdown = document.getElementById("profileDropdown");
    if (profileDropdown) {
      profileDropdown.addEventListener("click", function(e) {
        e.stopPropagation();
        this.classList.toggle("active");
      });
    }
  }

  function resetDropdown(menu) {
    menu.style.opacity = "0";
    menu.style.visibility = "hidden";
    menu.style.transform = "translateY(10px)";
    setTimeout(function() {
      menu.removeAttribute("style");
    }, 300);
  }

  function initComponents() {
    console.log("Dashboard: Inicializando componentes");
    const path = window.location.pathname;
    if (path.includes("comite.html")) {
      // lógica comité…
      console.log("Dashboard: Página de comité detectada");
    } else if (path.includes("redireccion.html") || path.endsWith("/")) {
      console.log("Dashboard: Página de dashboard/redireccion detectada");
      initWelcomeVideo();
      setupCardInteractions();
      initStatsCounters();
      showWelcomeNotification();
    }
    highlightActiveNavLink();
  }

  function highlightActiveNavLink() {
    const path = window.location.pathname;
    document.querySelectorAll(".sidebar-link").forEach(function(link) {
      const li = link.closest("li");
      if (!li) return;
      if (path.includes(link.getAttribute("href"))) {
        li.classList.add("active");
      } else {
        li.classList.remove("active");
      }
    });
  }

  function initWelcomeVideo() {
    const video = document.querySelector('.video-container video');
    if (!video) return;

    new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          video.load();
          try {
            // Versión segura para evitar errores con getRootNode/getIntersectionObservers
            const observer = entry.target.getRootNode()?.getIntersectionObservers?.();
            if (observer && Array.isArray(observer)) {
              observer.forEach(function(obs) {
                obs.disconnect();
              });
            }
          } catch (e) {
            console.warn("Error al desconectar observer:", e);
          }
        }
      });
    }, { threshold: 0.1 }).observe(video);

    ['play', 'pause', 'ended'].forEach(function(evt) {
      video.addEventListener(evt, function() {
        console.log("Vídeo " + evt);
      });
    });
  }

  function handleResponsive() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    function adapt() {
      if (window.innerWidth < 992) {
        sidebar.classList.add('collapsed');
      } else {
        sidebar.classList.remove('collapsed');
      }
    }

    window.addEventListener('resize', adapt);
    adapt(); // Aplicar inmediatamente
  }

  function setupCardInteractions() {
    document.querySelectorAll(".dashboard-card").forEach(function(card) {
      card.addEventListener("mouseenter", function() {
        this.classList.add("card-hover");
      });

      card.addEventListener("mouseleave", function() {
        this.classList.remove("card-hover");
      });

      card.addEventListener("click", function(e) {
        if (!e.target.classList.contains("dashboard-card-button")) {
          const btn = this.querySelector(".dashboard-card-button");
          if (btn) btn.click();
        }
      });
    });
  }

  function initStatsCounters() {
    const elements = document.querySelectorAll(".stat-value");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    elements.forEach(function(el) {
      observer.observe(el);
    });
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

    function update() {
      frame++;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 4);
      el.textContent = Math.round(target * progress);

      if (frame < totalFrames) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  function showWelcomeNotification() {
    setTimeout(function() {
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
      <div class="notification-content"><i class="fas fa-bell"></i><span>${message}</span></div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(notif);
    setTimeout(function() {
      notif.classList.add("show");
    }, 10);

    notif.querySelector(".notification-close").addEventListener("click", function() {
      dismiss(notif);
    });

    setTimeout(function() {
      dismiss(notif);
    }, 5000);
  }

  function dismiss(notif) {
    notif.classList.remove("show");
    setTimeout(function() {
      notif.remove();
    }, 300);
  }

  // Hacer funciones disponibles globalmente en caso necesario
  window.DashboardFunctions = {
    loadUserInfo: loadUserInfo,
    setupEventListeners: setupEventListeners,
    initComponents: initComponents,
    handleResponsive: handleResponsive
  };

})();