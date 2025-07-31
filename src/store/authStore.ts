import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// Mock API calls - replace with real API
const mockLogin = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  if (email === 'demo@example.com' && password === 'demo123') {
    return {
      user: {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        lastActive: new Date(),
        preferences: {
          theme: 'light',
          defaultView: 'kanban',
          workMode: 'pomodoro',
          notifications: {
            email: true,
            push: true,
            taskReminders: true,
            workModeAlerts: true,
            collaborationUpdates: true,
          },
          timezone: 'UTC',
        },
      },
      token: 'mock-jwt-token-12345',
    };
  }
  
  throw new Error('Invalid credentials');
};

const mockRegister = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    user: {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: 'user',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    token: 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9),
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, token } = await mockLogin(email, password);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, token } = await mockRegister(name, email, password);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);