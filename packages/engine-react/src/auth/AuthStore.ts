import { create } from 'zustand';
import { sendJSON } from '../lib/Fetch';

interface UserState {
  email: string;
  username: string;
}

interface LoginResponse {
  authenticated: boolean;
  token: string;
  user: UserState;
}

interface RegisterResponse {
  message: string;
}

interface ErrorResponse {
  message: string;
}

interface AuthState {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  loginLoading: boolean;
  loginError: string | null;
  registerLoading: boolean;
  registerError: string | null;
  registerSuccess: string | null;

  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  clearAuthMessages: () => void;
  verifyAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthLoading: true,
  loginLoading: false,
  loginError: null,
  registerLoading: false,
  registerError: null,
  registerSuccess: null,

  login: async (identifier, password) => {
    set({ loginLoading: true, loginError: null, registerError: null, registerSuccess: null });
    try {
      const response = await sendJSON<LoginResponse>('/api/auth/login', {
        method: 'POST',
        json: { identifier, password },
      });

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loginLoading: false,
      });

    } catch (error: any) {
      const errorBody = error.body as ErrorResponse;
      set({
        loginLoading: false,
        loginError: errorBody.message || 'Erro desconhecido. Tente novamente.',
      });
    }
  },

  logout: async () => {
    try {
      sendJSON('/api/auth/logout', { method: 'POST' });
    } finally {
      // Nota: 'isPlaying: false' foi removido daqui
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  register: async (email, username, password) => {
    set({ registerLoading: true, registerError: null, registerSuccess: null, loginError: null });
    try {
      const response = await sendJSON<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        json: { email, username, password },
      });

      set({
        registerLoading: false,
        registerSuccess: response.message,
      });

    } catch (error: any)
    {
      const errorBody = error.body as ErrorResponse;
      set({
        registerLoading: false,
        registerError: errorBody.message || 'Erro desconhecido ao registrar.',
      });
    }
  },
  
  clearAuthMessages: () => {
    set({ 
      loginError: null, 
      registerError: null, 
      registerSuccess: null 
    });
  },
  
  verifyAuth: async () => {
    try {
      const response = await sendJSON<LoginResponse>('/api/auth/verify', {
        method: 'GET',
      });

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isAuthLoading: false,
      });

    } catch (error: any) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAuthLoading: false,
      });
    }
  },
}));