import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
/* import { loadFromStorage } from './browserStorage';
 */
export interface AuthState {
  email: string | null;
  id: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Nuevo: para saber si ya verificamos la sesión
}

const initialState: AuthState = {
  email: null,
  id: null,
  role: null,
  isAuthenticated: false,
  isInitialized: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Solo guardamos los datos del perfil, NO el token
    setCredentials: (state, action: PayloadAction<{ email: string; id: string; role: string }>) => {
      state.email = action.payload.email;
      state.id = action.payload.id;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    setFinishedLoading: (state) => {
      state.isInitialized = true; // Se llamó al perfil pero no había sesión
    },
    logout: (state) => {
      state.email = null;
      state.id = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
  },
});

export const { setCredentials,setFinishedLoading, logout } = authSlice.actions;
export default authSlice.reducer;