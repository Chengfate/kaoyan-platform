import { create } from 'zustand';
import type { User } from '../types';
import { auth } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,

  login: async (username, password) => {
    try {
      const res = await auth.login(username, password);
      if (res.data.success) {
        const token = res.data.data.access_token;
        localStorage.setItem('token', token);
        set({ token });
        // Fetch user info
        const meRes = await auth.me();
        if (meRes.data.success) {
          localStorage.setItem('user', JSON.stringify(meRes.data.data));
          set({ user: meRes.data.data });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const res = await auth.me();
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.data));
        set({ user: res.data.data });
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },
}));
