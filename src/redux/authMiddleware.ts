import type { Middleware } from '@reduxjs/toolkit';
import { logout } from './authSlice';

const EXPIRE_TIME = 1000 * 60 * 60 * 1; 

export const authExpirationMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();

  // Solo revisamos si el usuario está autenticado
  if (state.auth.isAuthenticated) {
    const userDataRaw = sessionStorage.getItem('auth_user_info');
    
    if (userDataRaw) {
      const { timestamp } = JSON.parse(userDataRaw);
      const currentTime = Date.now();

      if (currentTime - timestamp > EXPIRE_TIME) {
        // ¡Sesión expirada! Limpiamos todo
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user_info');
        
        // Forzamos el logout en el estado de Redux
        store.dispatch(logout());
        
        // Opcional: Redirigir o avisar al usuario
        alert("Tu sesión ha expirado por inactividad.");
        return; // Detenemos la acción original
      }
    }
  }

  return next(action);
};