// auth-callback.js - Versión super-tolerante
(function() {
  function initCallback() {
    console.log('[Auth-Callback] Iniciando procesamiento de callback OAuth');

    // Función asíncrona para procesar el callback
    async function processCallback() {
      try {
        // Verificar si AuthService está disponible
        if (typeof window.AuthService === 'undefined') {
          console.error('[Auth-Callback] AuthService no disponible');
          setTimeout(processCallback, 100); // Reintentar
          return;
        }

        console.log('[Auth-Callback] AuthService disponible, continuando...');

        // Verificar código en URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          console.warn('[Auth-Callback] No se encontró código de autorización en la URL');
          window.location.replace('../index.html');
          return;
        }

        console.log('[Auth-Callback] Código de autorización detectado');

        // Intentar handleCallback hasta 3 veces con pausas entre intentos
        let success = false;
        let attempts = 0;

        while (!success && attempts < 3) {
          attempts++;
          try {
            console.log(`[Auth-Callback] Intento ${attempts} de handleCallback`);
            success = await window.AuthService.handleCallback();

            if (success) {
              console.log('[Auth-Callback] Autenticación exitosa, redirigiendo al dashboard');
              window.location.replace('../html/redireccion.html');
              return;
            } else if (window.AuthService.isAuthenticated()) {
              // Si no funcionó pero aún así estamos autenticados
              console.log('[Auth-Callback] handleCallback reportó fallo pero usuario está autenticado');
              window.location.replace('../html/redireccion.html');
              return;
            }

            console.log(`[Auth-Callback] Intento ${attempts} falló, esperando antes de reintentar...`);
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
          } catch (err) {
            console.error(`[Auth-Callback] Error en intento ${attempts}:`, err);

            // Verificar si a pesar del error estamos autenticados
            if (window.AuthService.isAuthenticated()) {
              console.log('[Auth-Callback] A pesar del error, el usuario está autenticado');
              window.location.replace('../html/redireccion.html');
              return;
            }

            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
          }
        }

        // Si llegamos aquí, todos los intentos fallaron
        console.log('[Auth-Callback] Todos los intentos fallaron, redirigiendo al inicio');
        window.location.replace('../index.html');
      } catch (error) {
        console.error('[Auth-Callback] Error general:', error);
        window.location.replace('../index.html');
      }
    }

    // Iniciar el proceso
    processCallback();
  }

  // Iniciar cuando el DOM esté cargado
  if (document.readyState !== 'loading') {
    initCallback();
  } else {
    document.addEventListener('DOMContentLoaded', initCallback);
  }
})();