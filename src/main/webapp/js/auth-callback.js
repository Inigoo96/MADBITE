/*
 * auth-callback.js — Landing page del flujo OAuth2 (PKCE + Amazon Cognito)
 * ----------------------------------------------------------------------
 * Funciona como "espera pasiva": deja que auth.js procese el código y
 * simplemente reacciona a los eventos que emite (`auth:ready`, `auth:error`,
 * `auth:needed`).
 * Así evitamos la doble invocación de `handleCallback()` y los fetch
 * cancelados.
 */

(function (window, document) {
  "use strict";

  /* ------------------------------------------------------------- */
  /* Utilidades                                                    */
  /* ------------------------------------------------------------- */
  const goHome = () => window.location.replace("../index.html");
  const goDash = () => window.location.replace("../html/redireccion.html");

  /* ------------------------------------------------------------- */
  /* Boot                                                          */
  /* ------------------------------------------------------------- */
  function boot() {
    console.log("[Auth-Callback] Inicializando");

    // 1 · Debe existir ?code= en la querystring
    const qs = new URLSearchParams(window.location.search);
    if (!qs.has("code")) {
      console.warn("[Auth-Callback] Falta parámetro code");
      return goHome();
    }

    // 2 · Esperar a que AuthService esté disponible (máx 2 s)
    let waited = 0;
    const iv = setInterval(() => {
      if (typeof window.AuthService === "undefined") {
        if ((waited += 50) >= 2_000) {
          console.error("[Auth-Callback] AuthService no detectado");
          clearInterval(iv);
          goHome();
        }
        return;
      }
      clearInterval(iv);
      hookEvents();
    }, 50);
  }

  /* ------------------------------------------------------------- */
  /* Registro de listeners                                         */
  /* ------------------------------------------------------------- */
  function hookEvents() {
    console.log("[Auth-Callback] AuthService disponible, esperando resultado…");

    // Sesión ya válida ⇒ directo al dashboard
    if (window.AuthService.isAuthenticated()) return goDash();

    // Reaccionar una sola vez a los eventos emitidos por auth.js
    window.addEventListener("auth:ready",  goDash,  { once: true });
    window.addEventListener("auth:error",  goHome,  { once: true });
    window.addEventListener("auth:needed", goHome,  { once: true });
  }

  /* ------------------------------------------------------------- */
  /* Lanzamiento cuando DOM esté listo                             */
  /* ------------------------------------------------------------- */
  if (document.readyState !== "loading") {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})(window, document);
