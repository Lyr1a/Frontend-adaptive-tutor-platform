import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  
  // Actions
  login: (user: User, token: string, refreshToken: string, rememberMe?: boolean) => void;
  logout: () => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  isRole: (role: UserRole) => boolean;
}

const authStorage: StateStorage = {
  getItem: (name) => {
    return localStorage.getItem(name) ?? sessionStorage.getItem(name);
  },
  setItem: (name, value) => {
    let rememberMe = false;

    try {
      const persisted = JSON.parse(value) as { state?: { rememberMe?: boolean } };
      rememberMe = persisted.state?.rememberMe === true;
    } catch {
      // If persisted data cannot be read, keep it in the current session only.
    }

    if (rememberMe) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      rememberMe: false,

      login: (user, token, refreshToken, rememberMe = false) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          rememberMe,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          rememberMe: false,
        });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      updateUser: (user) => {
        set({ user });
      },

      isRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
