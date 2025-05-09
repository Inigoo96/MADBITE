// comite.js · MADBITE Intranet - Comité de Empresa
// Si auth.js no está disponible, proporcionar una implementación de respaldo
let AuthService;

try {
  // import dinámico relativo (funciona sin bundler)
  import('./auth.js')
    .then(module => {
      AuthService = module.default;
      init();
    })
    .catch(err => {
      console.error('Error al cargar auth.js:', err);
      useBackupAuth();
      init();
    });
} catch (error) {
  console.error('Import dinámico falló:', error);
  useBackupAuth();
  init();
}

/* ---------- implementación de respaldo ---------- */
function useBackupAuth() {
  console.warn('Usando AuthService de respaldo');
  AuthService = {
    init() {
      console.log('AuthService de respaldo inicializado');
      setTimeout(() => document.dispatchEvent(new Event('auth:ready')), 100);
    },
    isAuthenticated() { return true; },
    getUserData() {
      return {
        name: 'Usuario Demo',
        email: 'usuario@ejemplo.com',
        'cognito:groups': ['trabajador']
      };
    }
  };
}



/* ---------- arranque principal ---------- */
function init() {
  document.addEventListener('DOMContentLoaded', () => {
    if (AuthService) {
      AuthService.init();
      document.addEventListener('auth:ready', initAfterAuth);
    } else {
      console.warn('AuthService no disponible, iniciando sin autenticación');
      initAfterAuth();
    }
  });
}

/* ---------- lógica tras autenticación ---------- */
function initAfterAuth() {
  if (AuthService && (!AuthService.isAuthenticated() || !hasCommitteeAccess())) {
    console.warn('Usuario no autenticado o sin acceso al comité');
    // window.location.href = './redireccion.html';  // descomenta en producción
    // return;
  }

  try {
    initAccordion();
    initTabs();
    setupOrgChart();
    setupAnimations();
    setupEventListeners();
  } catch (e) {
    console.error('Error al inicializar componentes:', e);
  }

  console.log('Página del comité inicializada correctamente');
}

/** Comprueba si el usuario pertenece a los grupos 'admin' o 'trabajador' */
function hasCommitteeAccess() {
    try {
        const userData = AuthService.getUserData() || {};
        const groups = Array.isArray(userData['cognito:groups'])
            ? userData['cognito:groups']
            : [];
        return groups.includes('admin') || groups.includes('trabajador');
    } catch (error) {
        console.error("Error al verificar acceso:", error);
        return true; // Permitir acceso en caso de error para depuración
    }
}

/** Inicializa los acordeones para la sección de información */
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (!accordionItems.length) {
        console.log("No se encontraron acordeones para inicializar");
        return;
    }

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                accordionItems.forEach(i => i.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        }
    });
    
    // Activar el primer acordeón por defecto
    accordionItems[0].classList.add('active');
}

/** Inicializa las pestañas para la sección de convenio */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    if (!tabButtons.length || !tabPanes.length) {
        console.log("No se encontraron pestañas para inicializar");
        return;
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            button.classList.add('active');
            const targetId = button.getAttribute('data-tab');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');
        });
    });
    
    // Activar la primera pestaña por defecto
    if (tabButtons[0] && tabButtons[0].getAttribute('data-tab')) {
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        const firstTab = document.getElementById(firstTabId);
        if (firstTab) {
            tabButtons[0].classList.add('active');
            firstTab.classList.add('active');
        }
    }
}

/** Configura el organigrama interactivo */
function setupOrgChart() {
    const orgBoxes = document.querySelectorAll('.org-box');
    if (!orgBoxes.length) {
        console.log("No se encontraron elementos del organigrama");
        return;
    }

    // Añadir iniciales a avatares como respaldo
    orgBoxes.forEach(box => {
        const avatar = box.querySelector('.org-avatar');
        const nameElement = box.querySelector('h3');
        if (avatar && nameElement) {
            const name = nameElement.textContent || '';
            const initials = getInitials(name);
            if (!avatar.getAttribute('data-initials')) {
                avatar.setAttribute('data-initials', initials);
            }
        }
    });

    // Efectos de interacción
    orgBoxes.forEach(box => {
        box.addEventListener('mouseenter', () => {
            orgBoxes.forEach(b => {
                if (b !== box) {
                    b.style.opacity = '0.6';
                    b.style.transform = 'scale(0.95)';
                }
            });
            box.style.transform = 'translateY(-10px) scale(1.05)';
            box.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
            box.style.zIndex = '2';
        });
        
        box.addEventListener('mouseleave', () => {
            orgBoxes.forEach(b => {
                b.style.opacity = '';
                b.style.transform = '';
                b.style.boxShadow = '';
                b.style.zIndex = '';
            });
        });
        
        box.addEventListener('click', () => {
            const name = box.querySelector('h3')?.textContent || '';
            const role = box.querySelector('span')?.textContent || '';
            showMemberModal(name, role, getMemberInfo(name));
        });
    });
}

/** Obtiene iniciales de un nombre */
function getInitials(name) {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[1].charAt(0);
}

/** Devuelve información adicional del miembro */
function getMemberInfo(name) {
    const data = {
        'María González': { 
            email: 'maria.gonzalez@madbite.com', 
            phone: '+34 912 345 678', 
            department: 'Administración', 
            description: 'Presidenta del Comité desde 2021. Especialista en negociación colectiva y relaciones laborales.' 
        },
        'Juan Martínez': { 
            email: 'juan.martinez@madbite.com', 
            phone: '+34 912 345 679', 
            department: 'Recursos Humanos', 
            description: 'Secretario del Comité. Responsable de documentación y comunicación interna.' 
        },
        'Ana Rodríguez': { 
            email: 'ana.rodriguez@madbite.com', 
            phone: '+34 912 345 680', 
            department: 'Cocina', 
            description: 'Vocal representante del área de cocina. Especialista en seguridad alimentaria.' 
        },
        'Pedro Sánchez': { 
            email: 'pedro.sanchez@madbite.com', 
            phone: '+34 912 345 681', 
            department: 'Servicio', 
            description: 'Vocal representante del área de servicio. Enfocado en atención al cliente y formación.' 
        },
        'Carmen López': { 
            email: 'carmen.lopez@madbite.com', 
            phone: '+34 912 345 682', 
            department: 'Logística', 
            description: 'Vocal representante del área de logística. Experta en organización y planificación.' 
        }
    };
    
    return data[name] || {
        email: 'comite@madbite.com',
        phone: '+34 912 345 678',
        department: 'No disponible',
        description: 'No hay información adicional disponible.'
    };
}

/** Muestra un modal con la información detallada del miembro */
function showMemberModal(name, role, info) {
    const modalId = 'memberModal';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        console.error("Modal no encontrado en el DOM");
        return;
    }
    
    // Actualizar contenido del modal
    const modalHeader = modal.querySelector('.modal-header');
    const modalBody = modal.querySelector('.modal-body');
    
    if (modalHeader) {
        modalHeader.innerHTML = `
            <h3>${name}</h3>
            <p class="modal-role">${role}</p>
        `;
    }
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="modal-info">
                <div class="info-item"><i class="fas fa-envelope"></i><span>${info.email || 'No disponible'}</span></div>
                <div class="info-item"><i class="fas fa-phone-alt"></i><span>${info.phone || 'No disponible'}</span></div>
                <div class="info-item"><i class="fas fa-building"></i><span>${info.department || 'No disponible'}</span></div>
            </div>
            <p class="modal-description">${info.description || 'No hay información adicional disponible.'}</p>
            <div class="modal-actions">
                <a href="mailto:${info.email}" class="modal-btn"><i class="fas fa-envelope"></i><span>Enviar email</span></a>
                <a href="tel:${info.phone}" class="modal-btn"><i class="fas fa-phone-alt"></i><span>Llamar</span></a>
            </div>
        `;
    }
    
    // Mostrar el modal
    modal.classList.add('active');
    
    // Configurar cierre
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    modal.addEventListener('click', e => { 
        if (e.target === modal) closeModal(modal); 
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

/** Cierra el modal */
function closeModal(modal) {
    modal.classList.remove('active');
}

/** Configurar animaciones y efectos visuales */
function setupAnimations() {
    // Animar estadísticas
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    if (statValues.length) {
        statValues.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'), 10);
            let current = 0;
            const duration = 1500; // ms
            const increment = Math.ceil(target / (duration / 20));
            
            const interval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                    
                    // Añadir % a porcentajes
                    if (target === 85) {
                        stat.textContent = target + '%';
                    }
                } else {
                    stat.textContent = current;
                }
            }, 20);
        });
    }
}

/** Configurar listeners de eventos */
function setupEventListeners() {
    // Toggle sidebar
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const dashboardMain = document.getElementById('dashboardMain');
    
    if (menuToggle && sidebar && dashboardMain) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            dashboardMain.classList.toggle('sidebar-open');
        });
    }
    
    // Cerrar menú al hacer clic fuera
    if (sidebar && dashboardMain) {
        dashboardMain.addEventListener('click', (e) => {
            if (window.innerWidth < 992 && sidebar.classList.contains('active') && 
                !e.target.closest('#menuToggle')) {
                sidebar.classList.remove('active');
                dashboardMain.classList.remove('sidebar-open');
            }
        });
    }
    
    // Dropdown de perfil
    const profileToggle = document.querySelector('.profile-toggle');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', () => {
            profileDropdown.classList.toggle('active');
        });
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (profileDropdown && !profileDropdown.contains(e.target) && 
                !profileToggle.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
}

// Hacer funciones globales para respaldo
window.initAccordion = initAccordion;
window.initTabs      = initTabs;
window.setupOrgChart = setupOrgChart;
window.showMemberModal = showMemberModal;
window.closeModal    = closeModal;