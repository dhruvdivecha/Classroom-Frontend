import { AuthProvider } from '@refinedev/core';
import { authClient } from '@/lib/auth-client';
import type { User } from '@/types';

export const authProvider: AuthProvider = {
  login: async ({ email, password, role }) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        return {
          success: false,
          error: {
            name: 'LoginError',
            message: result.error.message || 'Login failed',
          },
        };
      }

      return {
        success: true,
        redirectTo: '/',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error instanceof Error ? error.message : 'Login failed',
        },
      };
    }
  },
  logout: async () => {
    try {
      await authClient.signOut();
      return {
        success: true,
        redirectTo: '/login',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'LogoutError',
          message: error instanceof Error ? error.message : 'Logout failed',
        },
      };
    }
  },
  check: async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        return {
          authenticated: true,
        };
      }
      return {
        authenticated: false,
        redirectTo: '/login',
        logout: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: '/login',
        logout: true,
      };
    }
  },
  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return {
        logout: true,
        redirectTo: '/login',
        error,
      };
    }
    return { error };
  },
  getIdentity: async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        const user = session.data.user;
        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          avatar: user.image,
          role: (user.role as User['role']) || 'student',
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },
  register: async ({ email, password, name, role }) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        body: {
          role: role || 'student',
        },
      });

      if (result.error) {
        return {
          success: false,
          error: {
            name: 'RegisterError',
            message: result.error.message || 'Registration failed',
          },
        };
      }

      return {
        success: true,
        redirectTo: '/login',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'RegisterError',
          message: error instanceof Error ? error.message : 'Registration failed',
        },
      };
    }
  },
};
