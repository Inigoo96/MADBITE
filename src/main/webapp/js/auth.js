/*
 * auth.js — Servicio corporativo de autenticación PKCE para Amazon Cognito
 * -------------------------------------------------------------------------
 * Diseño clásico, sin módulos ES‑6. Compatible con proyectos legacy servidos
 * por Tomcat. Optimizado para: simplicidad, trazabilidad y ausencia de
 * condiciones de carrera.
 */

(function (window) {
  "use strict";

  /* ---------------------------------------------------------------------- */
  /* 1 · Configuración de entorno                                           */
  /* ---------------------------------------------------------------------- */

  const CONFIG = {
    DOMAIN:        "https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com",
    CLIENT_ID:     "6omlacb6fjdnimu8dalu81ft0r",
    REDIRECT_URI:  "http://localhost:8090/back/cognito/callback", // Debe
                                                             // coincidir al
                                                             // 100 % con AWS

    // Endpoint interno (servlet) que canjea el código por los tokens.
    CALLBACK_URL:  "/back/cognito/callback",

    SCOPES:        "openid profile email",
    PKCE_KEY:      "pkce_verifier",          // sessionStorage key
    PROCESS_FLAG:  "cognito_processing",      // sessionStorage flag
    DEBUG:         true                       // activar/desactivar logs
  };

  /* ---------------------------------------------------------------------- */
  /* 2 · Logger minimalista (respeta CONFIG.DEBUG)                           */
  /* ---------------------------------------------------------------------- */

  const log = {
    _p: (lvl, msg, args) => {
      if (!CONFIG.DEBUG && lvl === "log") return;
      // eslint-disable-next-line no-console
      console[lvl](`[Auth] ${msg}`, ...args);
    },
    log:   function (m, ...a) { this._p("log", m, a); },
    info:  function (m, ...a) { this._p("info", m, a); },
    warn:  function (m, ...a) { this._p("warn", m, a); },
    error: function (m, ...a) { this._p("error", m, a); }
  };

  /* ---------------------------------------------------------------------- */
  /* 3 · Utilidades de codificación Base64URL                                */
  /* ---------------------------------------------------------------------- */

  function b64urlEncode(bytes) {
    return btoa(String.fromCharCode.apply(null, bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /* ---------------------------------------------------------------------- */
  /* 4 · Servicio de autenticación                                          */
  /* ---------------------------------------------------------------------- */

  const AuthService = {

    /* ------------------------------------------------------------------ */
    /* 4.1 · PKCE                                                         */
    /* ------------------------------------------------------------------ */

    async _generatePkce() {
      log.info("Generando challenge PKCE");
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const verifier    = b64urlEncode(randomBytes);

      const hash        = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(verifier)
      );
      const challenge   = b64urlEncode(new Uint8Array(hash));

      sessionStorage.setItem(CONFIG.PKCE_KEY, verifier);
      return challenge;
    },

    /* ------------------------------------------------------------------ */
    /* 4.2 · Redirección a Cognito                                        */
    /* ------------------------------------------------------------------ */

    async _redirectToCognito(signUp) {
      const challenge = await this._generatePkce();

      const qs = new URLSearchParams({
        response_type:         "code",
        client_id:             CONFIG.CLIENT_ID,
        redirect_uri:          CONFIG.REDIRECT_URI,
        scope:                 CONFIG.SCOPES,
        code_challenge_method: "S256",
        code_challenge:        challenge
      });
      if (signUp) qs.set("screen_hint", "signup");

      const url = `${CONFIG.DOMAIN}/oauth2/authorize?${qs.toString()}`;
      log.info("Redirigiendo a Cognito →", url);
      window.location.href = url;
    },

    login()  { this._redirectToCognito(false); },
    signUp() { this._redirectToCognito(true);  },

    /* ------------------------------------------------------------------ */
    /* 4.3 · Callback: canjear código por tokens                           */
    /* ------------------------------------------------------------------ */

    async handleCallback() {
      // Candado contra ejecuciones duplicadas
      if (sessionStorage.getItem(CONFIG.PROCESS_FLAG)) {
        log.warn("handleCallback() duplicado — abortado");
        return false;
      }
      sessionStorage.setItem(CONFIG.PROCESS_FLAG, "1");

      const clearFlag = () => sessionStorage.removeItem(CONFIG.PROCESS_FLAG);

      try {
        const params   = new URLSearchParams(window.location.search);
        const code     = params.get("code");
        if (!code) {
          log.warn("URL sin parámetro code");
          return false;
        }

        const verifier = sessionStorage.getItem(CONFIG.PKCE_KEY);
        if (!verifier) throw new Error("code_verifier ausente (sesión caducada)");

        log.info("Intercambiando código por tokens…");
        const res = await fetch(CONFIG.CALLBACK_URL, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ code, verifier })
        });

        const body = await res.text();
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body}`);

        const data = JSON.parse(body);

        sessionStorage.setItem("id_token",     data.id_token);
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("expires_at",   `${Date.now() + data.expires_in * 1000}`);
        if (data.refresh_token) sessionStorage.setItem("refresh_token", data.refresh_token);

        sessionStorage.removeItem(CONFIG.PKCE_KEY);
        log.info("Tokens almacenados con éxito");
        window.dispatchEvent(new Event("auth:ready"));
        return true;
      } catch (err) {
        log.error("Error en callback:", err);
        window.dispatchEvent(new Event("auth:error"));
        return false;
      } finally {
        clearFlag();
      }
    },

    /* ------------------------------------------------------------------ */
    /* 4.4 · Estado de sesión                                             */
    /* ------------------------------------------------------------------ */

    _now()        { return Date.now(); },
    _expiresAt()  { return parseInt(sessionStorage.getItem("expires_at") || "0", 10); },

    isAuthenticated() {
      const valid = Boolean(
        sessionStorage.getItem("id_token") &&
        sessionStorage.getItem("access_token") &&
        this._now() < this._expiresAt()
      );
      log.info("Usuario autenticado:", valid);
      return valid;
    },

    /* ------------------------------------------------------------------ */
    /* 4.5 · Renovación de tokens mediante refresh_token                   */
    /* ------------------------------------------------------------------ */

    async refreshToken() {
      const refresh = sessionStorage.getItem("refresh_token");
      if (!refresh) return false;

      try {
        const res  = await fetch("/back/cognito/refresh", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ refresh_token: refresh })
        });
        const body = await res.text();
        if (!res.ok) throw new Error(body);

        const data = JSON.parse(body);
        sessionStorage.setItem("id_token",     data.id_token);
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("expires_at",   `${this._now() + data.expires_in * 1000}`);

        window.dispatchEvent(new Event("auth:refreshed"));
        return true;
      } catch (err) {
        log.error("Fallo al renovar tokens:", err);
        return false;
      }
    },

    /* ------------------------------------------------------------------ */
    /* 4.6 · Logout limpio                                                */
    /* ------------------------------------------------------------------ */

    logout() {
      log.info("Ejecutando logout");
      sessionStorage.clear();
      window.dispatchEvent(new Event("auth:logout"));
      window.location.href = "/back"; // Home del contexto
    },

    /* ------------------------------------------------------------------ */
    /* 4.7 · Helpers públicos                                              */
    /* ------------------------------------------------------------------ */

    getAccessToken() { return sessionStorage.getItem("access_token"); },
    attachLogin (id = "loginBtn")   { document.getElementById(id)?.addEventListener("click", () => this.login()); },
    attachSignUp(id = "signUpBtn")  { document.getElementById(id)?.addEventListener("click", () => this.signUp()); },

    /* ---------------------------------------------------------------------- */
    /* 4.8 · Get ID-token raw y claims del usuario                            */
    /* ---------------------------------------------------------------------- */
    getIdToken() {
      return sessionStorage.getItem("id_token") || null;
    },

    getUserData() {
      const token = this.getIdToken();
      if (!token) return {};
      try {
        const claims = jwt_decode(token);
        return {
          sub:            claims.sub,
          username:       claims.sub,
          email:          claims.email,
          email_verified: claims.email_verified,
          given_name:     claims.names || '',
          name:           claims.names || '',
          family_name:    claims.family_name,
          phone_number:   claims.phoneNumbers || '',
          picture:        claims.picture
        };
      } catch (e) {
        log.error('Decodificación JWT fallida', e);
        return {};
      }
}

  };

  /* ---------------------------------------------------------------------- */
  /* 5 · Inicialización automática                                          */
  /* ---------------------------------------------------------------------- */

  log.info("auth.js cargado — esperando DOMContentLoaded");

  document.addEventListener("DOMContentLoaded", () => {
    log.info("DOM listo — inicializando AuthService");

    (async () => {
      // 1) Procesar callback si procede
      if (window.location.search.includes("code=")) {
        const ok = await AuthService.handleCallback();
        // Limpiar querystring
        history.replaceState({}, document.title, window.location.pathname);
        if (ok) return;
      }

      // 2) Emitir evento según estado actual
      if (AuthService.isAuthenticated()) {
        window.dispatchEvent(new Event("auth:ready"));
      } else {
        window.dispatchEvent(new Event("auth:needed"));
      }
    })();
  });

  /* ---------------------------------------------------------------------- */
  /* 6 · Exponer servicio global                                           */
  /* ---------------------------------------------------------------------- */

  window.AuthService = AuthService;

})(window);
