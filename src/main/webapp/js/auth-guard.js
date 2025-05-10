/*
 * auth-guard.js — Vigilancia de sesión e inactividad
 * --------------------------------------------------
 * Se apoya en los eventos que emite auth.js (auth:ready, auth:logout, …)
 * y aplica un auto‑logout tras 60 minutos de desuso.
 */

(function (window, document) {
  "use strict";

  const TAG = "[Auth‑guard]";
  const log = (...a) => console.log(TAG, ...a);

  const INACTIVITY_LIMIT = 60 * 60 * 1_000; // 60 min
  let idleTimer;

  /* --------------------------------------------------------- */
  /* 1 · Control de inactividad                                */
  /* --------------------------------------------------------- */
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      log("Tiempo de inactividad excedido («logout» automático)");
      window.AuthService.logout();
    }, INACTIVITY_LIMIT);
  }

  /* --------------------------------------------------------- */
  /* 2 · Arranque                                              */
  /* --------------------------------------------------------- */
  function boot() {
    log("Iniciando guard…");

    // Esperar a AuthService (máx 2 s)
    let waited = 0;
    const iv = setInterval(() => {
      if (typeof window.AuthService === "undefined") {
        if ((waited += 50) >= 2_000) {
          console.error(TAG, "AuthService no detectado");
          clearInterval(iv);
        }
        return;
      }
      clearInterval(iv);

      // Evento que confirma sesión lista
      window.addEventListener("auth:ready", () => {
        log("Evento auth:ready recibido");
        if (!window.AuthService.isAuthenticated()) {
          log("Sesión no válida — forzando logout");
          window.AuthService.logout();
        }
      });

      // Eventos de actividad
      ["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach(e =>
        document.addEventListener(e, resetIdle, true)
      );

      resetIdle();
      log(`Temporizador de inactividad activo (${INACTIVITY_LIMIT / 60000} min)`);
    }, 50);
  }

  /* --------------------------------------------------------- */
  /* 3 · Lanzamiento                                           */
  /* --------------------------------------------------------- */
  if (document.readyState !== "loading") {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }

  /* --------------------------------------------------------- */
  /* 4 · API mínima para debugging                             */
  /* --------------------------------------------------------- */
  window.AuthGuard = { version: "2.0.0", resetIdle };
})(window, document);
