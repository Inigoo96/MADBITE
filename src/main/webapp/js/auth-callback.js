// auth-callback.js
import AuthService from './auth.js';

(async () => {
  // Procesa únicamente la URL con ?code=PKCE
  const success = await AuthService.handleCallback();

  if (success) {
    // Limpio el query-string y redirijo al dashboard
    window.location.replace('./redireccion.html');
  } else {
    // Sesión fallida → forzar logout y volver al login
    AuthService.logout();
  }
})();
