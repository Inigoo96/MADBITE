// Inicialización del menú móvil y otras funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    console.log("Inicializando main.js");
    
    // Inicializar el menú móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (navToggle && navMenu && menuOverlay) {
      navToggle.addEventListener('click', function(e) {
        this.classList.toggle('open');
        navMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
        document.body.classList.toggle('menu-open');
      });
      
      // Cerrar el menú al hacer clic en el overlay
      menuOverlay.addEventListener('click', function() {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        this.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
      
      // Cerrar el menú al hacer clic en un enlace
      const navLinks = document.querySelectorAll('.nav-item a');
      navLinks.forEach(link => {
        link.addEventListener('click', function() {
          navToggle.classList.remove('open');
          navMenu.classList.remove('open');
          menuOverlay.classList.remove('open');
          document.body.classList.remove('menu-open');
        });
      });
    }
    
    // Añadir clase al hacer scroll
    window.addEventListener('scroll', function() {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }
      
      // Mostrar/ocultar el botón de volver arriba
      const scrollUpBtn = document.getElementById('scrollUp');
      if (scrollUpBtn) {
        if (window.scrollY > 300) {
          scrollUpBtn.classList.add('visible');
        } else {
          scrollUpBtn.classList.remove('visible');
        }
      }
    });

        // Añadir clase al hacer scroll
    window.addEventListener('scroll', function() {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }
    });  
    
    // Botón de volver arriba
    const scrollUpBtn = document.getElementById('scrollUp');
    if (scrollUpBtn) {
      scrollUpBtn.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  });
