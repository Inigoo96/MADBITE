// auth.js
import jwtDecode from "https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js";


const CONFIG = {
  DOMAIN:        'https://us-east-19ns1g8vpk.auth.us-east-1.amazoncognito.com',
  CLIENT_ID:     '6omlacb6fjdnimu8dalu81ft0r',
  REDIRECT_URI:  'http://localhost:8090/back/html/callback.html',
  CALLBACK_URL:  'http://localhost:8090/back/cognito/callback',
  SCOPES:        'openid profile email',
  PKCE_KEY:      'pkce_verifier'
};

class AuthService {
  // Decodifica el id_token y devuelve el payload, o null si falla
  static getUserData() {
    const token = sessionStorage.getItem('id_token');
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (err) {
      console.error('[Auth] Error decoding JWT:', err);
      return null;
    }
  }

  // Genera code_verifier y code_challenge para PKCE
  static async createPkceChallenge() {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const verifier    = AuthService._base64UrlEncode(randomBytes);
    const hashBuffer  = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(verifier)
    );
    const challenge   = AuthService._base64UrlEncode(new Uint8Array(hashBuffer));
    localStorage.setItem(CONFIG.PKCE_KEY, verifier);
    return challenge;
  }

  static _base64UrlEncode(buffer) {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Redirige a Cognito para login/signup
  static async redirectToCognito(signUp = false) {
    try {
      const challenge = await AuthService.createPkceChallenge();

      // <<< AÑADE ESTAS LÍNEAS para inspeccionar/ver el challenge y el verifier >>>
      const verifier = localStorage.getItem(CONFIG.PKCE_KEY);
      console.log('[PKCE] code_verifier :', verifier);
      console.log('[PKCE] code_challenge:', challenge);
      // <<< fin de añadido >>>

      const params = new URLSearchParams({
        response_type:         'code',
        client_id:             CONFIG.CLIENT_ID,
        redirect_uri:          CONFIG.REDIRECT_URI,
        scope:                 CONFIG.SCOPES,
        code_challenge_method: 'S256',
        code_challenge:        challenge
      });
      if (signUp) {
        params.set('screen_hint','signup');
      }
      window.location.href = `${CONFIG.DOMAIN}/oauth2/authorize?${params.toString()}`;
      
    } catch (err) {
      console.error('[Auth] PKCE error:', err);
      alert('Error al iniciar autenticación. Consulta consola.');
    }
  }

  static login()  { return AuthService.redirectToCognito(false); }
  static signUp() { return AuthService.redirectToCognito(true); }

  // Maneja el callback de Cognito: intercambia code por tokens
  static async handleCallback() {
    const params   = new URLSearchParams(window.location.search);
    const code     = params.get('code');
    if (!code) return false;

    const verifier = localStorage.getItem(CONFIG.PKCE_KEY);
    if (!verifier) {
      alert('Sesión expirada. Vuelve a iniciar sesión.');
      return false;
    }

    try {
      const res  = await fetch(CONFIG.CALLBACK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, verifier })
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const data = await res.json();
      // 1) Guardar tokens
      sessionStorage.setItem('id_token',     data.id_token);
      sessionStorage.setItem('access_token', data.access_token);
      sessionStorage.setItem(
        'expires_at',
        (Date.now() + data.expires_in * 1000).toString()
      );
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      // 2) Limpiar PKCE
      localStorage.removeItem(CONFIG.PKCE_KEY);
      // 3) Avisar al resto de la app
      window.dispatchEvent(new Event('auth:ready'));
      return true;
    } catch (err) {
      console.error('[Auth] Token exchange failed:', err);
      alert('Error en autenticación. Consulta consola.');
      localStorage.removeItem(CONFIG.PKCE_KEY);
      return false;
    }
  }

  // ¿Hay sesión activa?
  static isAuthenticated() {
    // Verificar AMBOS tokens (id_token y access_token)
    const idToken = sessionStorage.getItem('id_token');
    const accessToken = sessionStorage.getItem('access_token');
    const expires = parseInt(sessionStorage.getItem('expires_at') || '0', 10);
    
    return Boolean(idToken && accessToken && Date.now() < expires);
  }

  static async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error('[Auth] No hay refresh_token disponible');
      return false;
    }
    
    try {
      console.log('[Auth] Intentando renovar tokens...');
      
      const res = await fetch('/back/cognito/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}`);
      
      const data = await res.json();
      
      // Actualizar tokens
      sessionStorage.setItem('id_token', data.id_token);
      sessionStorage.setItem('access_token', data.access_token);
      sessionStorage.setItem(
        'expires_at',
        (Date.now() + data.expires_in * 1000).toString()
      );
      
      console.log('[Auth] Tokens renovados correctamente');
      return true;
    } catch (error) {
      console.error('[Auth] Error al renovar tokens:', error);
      return false;
    }
  }

  // Logout limpio
  static logout() {
    sessionStorage.clear();
    localStorage.removeItem('refresh_token');
    window.location.href = '/index.html';
  }

  // Atacha botones de login/signup
  static attachLogin(btnId = 'loginBtn') {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', AuthService.login);
  }
  static attachSignUp(btnId = 'signUpBtn') {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', AuthService.signUp);
  }

  // Inicialización: procesa callback o dispara auth:ready
  static async init() {
    // 1) Si hay code en URL, lo intercambiamos
    if (window.location.search.includes('code=')) {
      const ok = await AuthService.handleCallback();
      // Limpiar querystring
      window.history.replaceState({}, document.title, window.location.pathname);
      if (ok) return;
    }
    // 2) Si ya estamos autenticados, avisamos
    if (AuthService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:ready'));
    }
  }
}

export default AuthService;
