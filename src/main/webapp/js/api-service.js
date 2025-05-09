// api-service.js
js<br>const API_BASE_URL = '/back';<br>

export default class ApiService {
  static async request(path, options = {}) {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.error('[API] No hay token de acceso disponible');
      throw new Error('No autenticado');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    };
    
    try {
      console.log(`[API] Enviando ${options.method || 'GET'} a ${path}`);
      
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers,
        ...options
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('[API] Error 401: Token inválido o expirado');
          // Aquí podrías implementar renovación de token o logout
        }
        
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }
      
      if (options.method === 'DELETE' || response.status === 204) {
        return null;
      }
      
      return response.json();
    } catch (error) {
      console.error(`[API] Error en ${path}:`, error);
      throw error;
    }
  }
  
  // Métodos específicos
  static getMenu() {
    return this.request('/api/menu');
  }
  
  static getCart() {
    return this.request('/api/carrito');
  }
  
  static addToCart(productoId, cantidad = 1) {
    return this.request('/api/carrito', {
      method: 'POST',
      body: JSON.stringify({ productoId, cantidad })
    });
  }
  
  // ... otros métodos específicos
}