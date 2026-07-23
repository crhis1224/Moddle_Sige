/* import type { AuthState } from "./authSlice";

const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'auth_user_info';
const EXPIRE_TIME = 1000 * 60 * 60 * 2; // 2 horas

interface UserDataPayload {
  email: string | null;
  id: string | null;
  role: string | null;
  timestamp: number;
}

export const saveToStorage = (state: AuthState): void => {
  try {
    if (!state.token) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      return;
    }

    // 1. Guardamos el token por un lado
    sessionStorage.setItem(TOKEN_KEY, state.token);

    // 2. Guardamos el resto de los datos con el timestamp por otro
    const userData: UserDataPayload = {
      email: state.email,
      id: state.id,
      role: state.role,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (err) {
    console.error("Error al guardar en sessionStorage", err);
  }
};

export const loadFromStorage = (): AuthState | undefined => {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const userDataRaw = sessionStorage.getItem(USER_DATA_KEY);

    if (!token || !userDataRaw) return undefined;

    const userData: UserDataPayload = JSON.parse(userDataRaw);

    // Verificar si la sesión expiró basándonos en el timestamp de los datos
    if (Date.now() - userData.timestamp > EXPIRE_TIME) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      return undefined;
    }

    return {
      token,
      email: userData.email,
      id: userData.id,
      role: userData.role,
      isAuthenticated: true,
    };
  } catch {
    return undefined;
  }
}; */