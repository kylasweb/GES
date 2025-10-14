'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { BottomNavigation } from './bottom-navigation';
import { useUIStore } from '@/lib/store/ui';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showBottomNav?: boolean;
    headerVariant?: 'default' | 'transparent';
}

export function ResponsiveLayout({
    children,
    showHeader = true,
    showBottomNav = true,
    headerVariant = 'default'
}: ResponsiveLayoutProps) {
    const pathname = usePathname();
    const { updateResponsiveState, setBottomNavVisible } = useUIStore();

    // Update responsive state on mount and pathname change
    useEffect(() => {
        updateResponsiveState();
    }, [pathname, updateResponsiveState]);

    // Determine if bottom nav should be visible based on current route
    useEffect(() => {
        // Hide bottom nav on admin pages, auth pages, and checkout flow
        const hideBottomNavRoutes = [
            '/admin',
            '/auth',
            '/checkout',
            '/payment',
            '/dashboard',
            '/account'
        ];

        const shouldHide = hideBottomNavRoutes.some(route =>
            pathname.startsWith(route)
        );

        setBottomNavVisible(!shouldHide && showBottomNav);
    }, [pathname, setBottomNavVisible, showBottomNav]);

    return (
        <div className="min-h-screen flex flex-col">
            {showHeader && <Header variant={headerVariant} />}
            <main className="flex-1">
                {children}
            </main>
            <BottomNavigation />
        </div>
    );
}