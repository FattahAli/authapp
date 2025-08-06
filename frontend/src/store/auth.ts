import { create } from 'zustand';
import { User, OAuthProvider, ApiResponse } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  oauthLogin: (provider: OAuthProvider, accessToken: string, userData?: any) => Promise<ApiResponse>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  setUser: (user: User | null) => void;
  reset: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true, 
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      if (response.user) {
        set({ user: response.user, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({ user: response.user, isAuthenticated: true }));
        }
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  oauthLogin: async (provider: OAuthProvider, accessToken: string, userData?: any) => {
    set({ isLoading: true });
    try {
      console.log('Auth store: Starting OAuth login for provider:', provider);
      console.log('Auth store: Access token length:', accessToken?.length);
      console.log('Auth store: User data:', userData);
      
      const response = await authApi.oauthLogin({ provider, accessToken, userData });
      console.log('Auth store: API response:', response);
      
      if (response.user) {
        console.log('Auth store: Setting user and authentication state');
        console.log('Auth store: User data to set:', response.user);
        set({ user: response.user, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({ user: response.user, isAuthenticated: true }));
          console.log('Auth store: Saved to localStorage');
        }
      } else {
        console.log('Auth store: No user in response');
      }

      return response; 
    } catch (error) {
      console.error('Auth store: OAuth login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (formData: FormData) => {
    set({ isLoading: true });
    try {
      const response = await authApi.signup(formData);
      if (response.user) {
        set({ user: response.user, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({ user: response.user, isAuthenticated: true }));
        }
      }
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({ user: null, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, reset the state
      set({ user: null, isAuthenticated: false });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  getMe: async () => {
    set({ isLoading: true });
    try {
      console.log('Auth store: Calling getMe to verify authentication');
      const response = await authApi.getMe();
      console.log('Auth store: getMe response:', response);
      
      if (response.user) {
        console.log('Auth store: getMe successful, setting user');
        set({ user: response.user, isAuthenticated: true });
        // Persist auth state
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({ user: response.user, isAuthenticated: true }));
        }
      } else {
        console.log('Auth store: getMe returned no user');
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth');
        }
      }
    } catch (error: any) {
      console.log('Auth store: getMe error:', error);
      console.log('Auth store: Error status:', error.response?.status);
      console.log('Auth store: Error message:', error.response?.data?.message);
      
      // If user is not authenticated 
      if (error.response?.status === 401) {
        console.log('Auth store: 401 error, logging out user');
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth');
        }
      } else {
        // For other errors
        console.error('Auth check error:', error);
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth');
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('auth', JSON.stringify({ user, isAuthenticated: true }));
      } else {
        localStorage.removeItem('auth');
      }
    }
  },

  reset: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      try {
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
          const { user, isAuthenticated } = JSON.parse(savedAuth);
          set({ user, isAuthenticated, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem('auth');
        set({ isLoading: false });
      }
    }
  },
})); 