// auth-callback.js - Versión sin módulos ES6
// Maneja el procesamiento del callback OAuth después de la autenticación

(function() {
  // Función autoejecutada principal
  function initCallback() {
    console.log('[Auth-Callback] Iniciando procesamiento de callback OAuth');

    // Verificar si AuthService está disponible
    if (typeof window.AuthService === 'undefined') {
      console.error('[Auth-Callback] Error: AuthService no está disponible. ¿El archivo auth.js está cargado correctamente?');
      window.location.replace('/index.html');
      return;
    }

    // Función asíncrona para procesar el callback
    async function processCallback() {
      try {
        // Verificar si estamos en una URL con código de autorización
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          console.warn('[Auth-Callback] No se encontró código de autorización en la URL');
          // No hay código - posiblemente acceso directo a esta página
          window.location.replace('/index.html');
          return;
        }

        console.log('[Auth-Callback] Código de autorización detectado, procesando...');

        // Procesa el código de autorización mediante AuthService
        const success = await window.AuthService.handleCallback();

        if (success) {
          console.log('[Auth-Callback] Autenticación exitosa, redirigiendo al dashboard');
          // Limpio el query-string y redirijo al dashboard
          // Uso timeout para asegurar que el evento auth:ready se propague completamente
          setTimeout(function() {
            window.location.replace('./redireccion.html');
          }, 100);
        } else {
          console.error('[Auth-Callback] Fallo en procesamiento de autenticación');
          // Sesión fallida → forzar logout y volver al login
          window.AuthService.logout();
        }
      } catch (error) {
        console.error('[Auth-Callback] Error inesperado durante el callback:', error);
        // En caso de error inesperado, redireccionar al login
        window.location.replace('/index.html');
      }
    }

    // Iniciar el procesamiento
    processCallback();
  }

  // Si el DOM ya está cargado, iniciar inmediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCallback);
  } else {
    initCallback();
  }
})();