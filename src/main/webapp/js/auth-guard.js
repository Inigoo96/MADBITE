// auth-guard.js
import AuthService from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Cuando AuthService haya terminado el flujo de autenticación
  document.addEventListener('auth:ready', () => {
    if (!AuthService.isAuthenticated()) {
      AuthService.logout();        // token caducado o ausente ➜ logout
    }
  });

  // Inicia autenticación o valida sesión existente
  AuthService.init();

  /* ------------------------------------------------------------------
     Lógica de auto-logout tras 1 h de inactividad
  ------------------------------------------------------------------ */
  const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hora en milisegundos
  let idleTimer;

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => AuthService.logout(), INACTIVITY_LIMIT);
  }

  // Eventos que consideramos “actividad” del usuario
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    .forEach(evt => document.addEventListener(evt, resetIdleTimer, true));

  // Arranca el contador en la primera carga
  resetIdleTimer();
});
