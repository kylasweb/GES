import { useState, useEffect } from 'react';
import { User } from '@prisma/client';

type AuthUser = Omit<User, 'password'>;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function useAuth(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const login = async (email: string, password: string): Promise<AuthUser> => {
    console.log('[Auth] Login attempt for:', email);

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('[Auth] Login response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Auth] Login failed:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    console.log('[Auth] Login successful:', data);

    setState({
      user: data.user,
      token: data.token,
      isLoading: false,
      isAuthenticated: true,
    });

    return data.user;
  };

  const register = async (data: RegisterData): Promise<AuthUser> => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const responseData = await response.json();
    setState({
      user: responseData.user,
      token: responseData.token,
      isLoading: false,
      isAuthenticated: true,
    });

    return responseData.user;
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/me', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const response = await fetch('/api/v1/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }

    const responseData = await response.json();
    setState(prev => ({
      ...prev,
      user: responseData.user,
    }));
  };

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/v1/auth/me');

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or not present (expected on initial load)
          setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
        return;
      }

      const data = await response.json();
      setState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      // Silently handle errors on initial auth check
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };
}