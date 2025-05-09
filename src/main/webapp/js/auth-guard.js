// auth-guard.js - Versión sin módulos ES6
// Este script gestiona la autenticación y el auto-logout por inactividad

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth-guard: Inicializando...");

    // Verificar si AuthService está disponible
    if (typeof window.AuthService === 'undefined') {
      console.error("Auth-guard: Error - AuthService no está disponible. ¿El archivo auth.js está cargado correctamente?");
      return;
    }

    // Cuando AuthService haya terminado el flujo de autenticación
    // Usamos window para capturar el evento correctamente
    window.addEventListener('auth:ready', function() {
      console.log("Auth-guard: Evento auth:ready recibido");
      if (!window.AuthService.isAuthenticated()) {
        console.log("Auth-guard: Usuario no autenticado, haciendo logout");
        window.AuthService.logout();        // token caducado o ausente ➜ logout
      } else {
        console.log("Auth-guard: Usuario autenticado correctamente");
      }
    });

    // Inicia autenticación o valida sesión existente
    console.log("Auth-guard: Iniciando AuthService");
    window.AuthService.init();

    /* ------------------------------------------------------------------
       Lógica de auto-logout tras 1 h de inactividad
    ------------------------------------------------------------------ */
    const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hora en milisegundos
    let idleTimer;

    function resetIdleTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function() {
        console.log("Auth-guard: Tiempo de inactividad superado, haciendo logout");
        window.AuthService.logout();
      }, INACTIVITY_LIMIT);
    }

    // Eventos que consideramos "actividad" del usuario
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function(evt) {
      document.addEventListener(evt, resetIdleTimer, true);
    });

    // Arranca el contador en la primera carga
    resetIdleTimer();
    console.log("Auth-guard: Timer de inactividad iniciado (" + (INACTIVITY_LIMIT/60000) + " minutos)");
  });

  // Opcional: exponer funciones para debugging si es necesario
  window.AuthGuard = {
    version: '1.0.0'
  };
})();