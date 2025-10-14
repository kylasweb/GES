'use client';

import { create } from 'zustand';

interface UIState {
    // Mobile navigation state
    isMobileMenuOpen: boolean;
    isBottomNavVisible: boolean;
    activeBottomNavTab: string;

    // Responsive breakpoints
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;

    // Layout preferences
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';

    // Search state
    isSearchOpen: boolean;
    searchQuery: string;

    // Actions
    setMobileMenuOpen: (open: boolean) => void;
    setBottomNavVisible: (visible: boolean) => void;
    setActiveBottomNavTab: (tab: string) => void;
    updateResponsiveState: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setSearchOpen: (open: boolean) => void;
    setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    // Initial state
    isMobileMenuOpen: false,
    isBottomNavVisible: true,
    activeBottomNavTab: 'home',

    isMobile: false,
    isTablet: false,
    isDesktop: true,

    sidebarCollapsed: false,
    theme: 'system',

    isSearchOpen: false,
    searchQuery: '',

    // Actions
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

    setBottomNavVisible: (visible) => set({ isBottomNavVisible: visible }),

    setActiveBottomNavTab: (tab) => set({ activeBottomNavTab: tab }),

    updateResponsiveState: () => {
        if (typeof window === 'undefined') return;

        const width = window.innerWidth;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const isDesktop = width >= 1024;

        set({ isMobile, isTablet, isDesktop });
    },

    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    setTheme: (theme) => set({ theme }),

    setSearchOpen: (open) => set({ isSearchOpen: open }),

    setSearchQuery: (query) => set({ searchQuery: query }),
}));

// Initialize responsive state on client-side
if (typeof window !== 'undefined') {
    useUIStore.getState().updateResponsiveState();

    // Listen for window resize
    window.addEventListener('resize', () => {
        useUIStore.getState().updateResponsiveState();
    });
}