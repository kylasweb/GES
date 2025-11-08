'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser } from '@/lib/auth';

interface AuthStore {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: true,
            setUser: (user) => set({ user, isLoading: false }),
            setToken: (token) => {
                set({ token });
                // Also store in localStorage for API calls
                if (typeof window !== 'undefined') {
                    if (token) {
                        localStorage.setItem('token', token);
                    } else {
                        localStorage.removeItem('token');
                    }
                }
            },
            setLoading: (isLoading) => set({ isLoading }),
            logout: () => {
                set({ user: null, token: null, isLoading: false });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);