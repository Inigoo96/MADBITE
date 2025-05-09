// auth.js - Versión sin módulos ES6, compatible con entornos tradicionales
(function(window) {
  "use strict";

  // Cargar jwtDecode directamente si no está disponible
  if (typeof window.jwtDecode !== 'function') {
    // Añadimos la referencia a jwtDecode directamente en el HTML
    console.log("[Auth] Se recomienda añadir jwtDecode como script en el HTML");
  }

  // Configuración
  const CONFIG = {
    DOMAIN:        'https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com',
    CLIENT_ID:     '6omlacb6fjdnimu8dalu81ft0r',
    REDIRECT_URI:  'http://localhost:8090/back/html/callback.html',
    CALLBACK_URL:  'http://localhost:8090/back/cognito/callback',
    SCOPES:        'openid profile email',
    PKCE_KEY:      'pkce_verifier',
    DEBUG:         true
  };

  // Logger interno para controlar salida según CONFIG.DEBUG
  const logger = {
    log: function(msg, ...args) {
      if (CONFIG.DEBUG) console.log(`[Auth] ${msg}`, ...args);
    },
    warn: function(msg, ...args) {
      console.warn(`[Auth] ⚠️ ${msg}`, ...args);
    },
    error: function(msg, ...args) {
      console.error(`[Auth] 🔴 ${msg}`, ...args);
    },
    info: function(msg, ...args) {
      if (CONFIG.DEBUG) console.info(`[Auth] ℹ️ ${msg}`, ...args);
    }
  };

  // Definición del servicio de autenticación
  window.AuthService = {
    // Decodifica el id_token y devuelve el payload, o null si falla
    getUserData: function() {
      const token = sessionStorage.getItem('id_token');
      if (!token) {
        logger.warn("No hay token de ID disponible");
        return null;
      }

      try {
        // Usar la función jwtDecode global si está disponible
        if (typeof window.jwtDecode === 'function') {
          return window.jwtDecode(token);
        } else if (typeof jwt_decode === 'function') {
          // Compatibilidad con diferentes versiones
          return jwt_decode(token);
        } else {
          // Alternativa manual si no hay decodificador disponible
          logger.warn("jwtDecode no disponible, usando decodificación manual básica");
          const payload = token.split('.')[1];
          if (!payload) throw new Error("Token malformado");
          return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        }
      } catch (err) {
        logger.error("Error decodificando JWT:", err);
        return null;
      }
    },

    // Genera code_verifier y code_challenge para PKCE
    createPkceChallenge: async function() {
      logger.info("Generando PKCE challenge");
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const verifier = this._base64UrlEncode(randomBytes);
      const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verifier)
      );
      const challenge = this._base64UrlEncode(new Uint8Array(hashBuffer));
      localStorage.setItem(CONFIG.PKCE_KEY, verifier);
      return challenge;
    },

    _base64UrlEncode: function(buffer) {
      return btoa(String.fromCharCode(...buffer))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    },

    // Redirige a Cognito para login/signup
    redirectToCognito: async function(signUp = false) {
      try {
        logger.info(`Iniciando redirección para ${signUp ? 'signup' : 'login'}`);
        const challenge = await this.createPkceChallenge();

        // Logs para depuración
        const verifier = localStorage.getItem(CONFIG.PKCE_KEY);
        logger.info("PKCE code_verifier:", verifier);
        logger.info("PKCE code_challenge:", challenge);

        const params = new URLSearchParams({
          response_type:         'code',
          client_id:             CONFIG.CLIENT_ID,
          redirect_uri:          CONFIG.REDIRECT_URI,
          scope:                 CONFIG.SCOPES,
          code_challenge_method: 'S256',
          code_challenge:        challenge
        });

        if (signUp) {
          params.set('screen_hint', 'signup');
        }

        const redirectUrl = `${CONFIG.DOMAIN}/oauth2/authorize?${params.toString()}`;
        logger.info(`Redirigiendo a: ${redirectUrl}`);
        window.location.href = redirectUrl;

      } catch (err) {
        logger.error("PKCE error:", err);
        alert('Error al iniciar autenticación. Consulta la consola del navegador.');
      }
    },

    login: function() {
      logger.info("Iniciando login");
      return this.redirectToCognito(false);
    },

    signUp: function() {
      logger.info("Iniciando registro");
      return this.redirectToCognito(true);
    },

    // Maneja el callback de Cognito: intercambia code por tokens
    handleCallback: async function() {
      logger.info("Procesando callback OAuth");

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) {
        logger.warn("No se encontró código de autorización en la URL");
        return false;
      }

      const verifier = localStorage.getItem(CONFIG.PKCE_KEY);
      if (!verifier) {
        logger.error("Verifier no encontrado, la sesión puede haber expirado");
        alert('Sesión expirada. Vuelve a iniciar sesión.');
        return false;
      }

      try {
        logger.info("Intercambiando código por tokens...");
        const res = await fetch(CONFIG.CALLBACK_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ code, verifier })
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Error desconocido');
          throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
        }

        const data = await res.json();
        logger.info("Intercambio de tokens exitoso");

        // 1) Guardar tokens
        sessionStorage.setItem('id_token', data.id_token);
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem(
          'expires_at',
          (Date.now() + data.expires_in * 1000).toString()
        );

        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          logger.info("Token de actualización guardado para uso futuro");
        }

        // 2) Limpiar PKCE
        localStorage.removeItem(CONFIG.PKCE_KEY);

        // 3) Avisar al resto de la app
        logger.info("Emitiendo evento auth:ready");
        window.dispatchEvent(new Event('auth:ready'));
        return true;

      } catch (err) {
        logger.error("Error en intercambio de tokens:", err);
        alert('Error en autenticación. Consulta la consola del navegador.');
        localStorage.removeItem(CONFIG.PKCE_KEY);
        return false;
      }
    },

    // ¿Hay sesión activa?
    isAuthenticated: function() {
      // Verificar AMBOS tokens (id_token y access_token)
      const idToken = sessionStorage.getItem('id_token');
      const accessToken = sessionStorage.getItem('access_token');
      const expires = parseInt(sessionStorage.getItem('expires_at') || '0', 10);

      const isValid = Boolean(idToken && accessToken && Date.now() < expires);
      logger.info(`Usuario autenticado: ${isValid}`);

      // Si está a punto de expirar (menos de 5 minutos), intentar renovar
      if (isValid && (expires - Date.now() < 5 * 60 * 1000)) {
        logger.info("Tokens a punto de expirar, intentando renovación automática");
        this.refreshToken().catch(err => logger.error("Error en renovación automática:", err));
      }

      return isValid;
    },

    // Renovar tokens usando refresh_token
    refreshToken: async function() {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        logger.error("No hay refresh_token disponible");
        return false;
      }

      try {
        logger.info("Intentando renovar tokens...");

        const res = await fetch('/back/cognito/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Error desconocido');
          throw new Error(`${res.status}: ${errorText}`);
        }

        const data = await res.json();

        // Actualizar tokens
        sessionStorage.setItem('id_token', data.id_token);
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem(
          'expires_at',
          (Date.now() + data.expires_in * 1000).toString()
        );

        logger.info("Tokens renovados correctamente");
        // Notificar a la aplicación que los tokens se han renovado
        window.dispatchEvent(new Event('auth:refreshed'));
        return true;

      } catch (error) {
        logger.error("Error al renovar tokens:", error);
        return false;
      }
    },

    // Logout limpio
    logout: function() {
      logger.info("Iniciando proceso de logout");

      // Limpiar tokens
      sessionStorage.clear();
      localStorage.removeItem('refresh_token');

      // Limpiar cualquier estado relacionado con OAuth
      localStorage.removeItem(CONFIG.PKCE_KEY);

      // Emitir evento antes de la redirección
      window.dispatchEvent(new Event('auth:logout'));

      // Redireccionar a home
      logger.info("Redirigiendo a página de inicio");
      window.location.href = '/back';
    },

    // Configurar botones de login/signup
    attachLogin: function(btnId = 'loginBtn') {
      const btn = document.getElementById(btnId);
      if (btn) {
        logger.info(`Configurando botón de login (${btnId})`);
        // Usar bind para mantener el contexto de 'this'
        btn.addEventListener('click', this.login.bind(this));
      } else {
        logger.warn(`Botón de login (${btnId}) no encontrado`);
      }
    },

    attachSignUp: function(btnId = 'signUpBtn') {
      const btn = document.getElementById(btnId);
      if (btn) {
        logger.info(`Configurando botón de signup (${btnId})`);
        // Usar bind para mantener el contexto de 'this'
        btn.addEventListener('click', this.signUp.bind(this));
      } else {
        logger.warn(`Botón de signup (${btnId}) no encontrado`);
      }
    },

    // Inicialización: procesa callback o dispara auth:ready
    init: function() {
      logger.info("Iniciando AuthService");

      // Autoiniciación asíncrona
      const self = this;
      (async function() {
        try {
          // 1) Si hay code en URL, lo intercambiamos
          if (window.location.search.includes('code=')) {
            logger.info("Código detectado en URL, procesando callback");
            const ok = await self.handleCallback();
            // Limpiar querystring
            window.history.replaceState({}, document.title, window.location.pathname);
            if (ok) return;
          }

          // 2) Si ya estamos autenticados, avisamos
          if (self.isAuthenticated()) {
            logger.info("Usuario ya autenticado, emitiendo auth:ready");
            window.dispatchEvent(new Event('auth:ready'));
          } else {
            logger.info("Usuario no autenticado, emitiendo auth:needed");
            window.dispatchEvent(new Event('auth:needed'));
          }
        } catch (err) {
          logger.error("Error durante la inicialización:", err);
          // Intentar recuperarse emitiendo auth:needed
          window.dispatchEvent(new Event('auth:needed'));
        }
      })();
    },

    // Métodos adicionales
    getAccessToken: function() {
      return sessionStorage.getItem('access_token');
    },

    willExpireSoon: function(minutesThreshold = 5) {
      const expires = parseInt(sessionStorage.getItem('expires_at') || '0', 10);
      const timeUntilExpiry = expires - Date.now();
      return timeUntilExpiry < (minutesThreshold * 60 * 1000);
    },

    getExpirationTime: function() {
      const expires = parseInt(sessionStorage.getItem('expires_at') || '0', 10);
      if (!expires) return 'No disponible';

      const date = new Date(expires);
      return date.toLocaleString();
    },

    hasRoles: function(requiredRoles = []) {
      if (!this.isAuthenticated()) return false;

      const userData = this.getUserData() || {};
      const userGroups = Array.isArray(userData["cognito:groups"])
        ? userData["cognito:groups"]
        : [];

      return requiredRoles.some(role => userGroups.includes(role));
    },

    isAdmin: function() {
      return this.hasRoles(['admin']);
    },

    isWorker: function() {
      return this.hasRoles(['trabajador']);
    }
  };

  // Iniciar automáticamente si se incluye este script
  logger.info("Script auth.js cargado, esperando DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', function() {
    logger.info("DOMContentLoaded, iniciando AuthService");
    window.AuthService.init();
  });

})(window);