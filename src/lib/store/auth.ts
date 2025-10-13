'use client';

import { create } from 'zustand';
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

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    setToken: (token) => set({ token }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null, token: null, isLoading: false }),
}));