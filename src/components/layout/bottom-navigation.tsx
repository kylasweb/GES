'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Home,
    Search,
    ShoppingCart,
    Heart,
    User,
    Menu
} from 'lucide-react';
import { useUIStore } from '@/lib/store/ui';
import { useCart } from '@/hooks/use-cart';
import { useWishlistCount } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';

interface BottomNavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    requiresAuth?: boolean;
}

const bottomNavItems: BottomNavItem[] = [
    {
        id: 'home',
        label: 'Home',
        href: '/',
        icon: Home,
    },
    {
        id: 'search',
        label: 'Search',
        href: '/search',
        icon: Search,
    },
    {
        id: 'cart',
        label: 'Cart',
        href: '/cart',
        icon: ShoppingCart,
        badge: 0, // Will be updated dynamically
    },
    {
        id: 'wishlist',
        label: 'Wishlist',
        href: '/wishlist',
        icon: Heart,
        badge: 0, // Will be updated dynamically
        requiresAuth: true,
    },
    {
        id: 'account',
        label: 'Account',
        href: '/account',
        icon: User,
        requiresAuth: true,
    },
];

export function BottomNavigation() {
    const pathname = usePathname();
    const { isMobile, isBottomNavVisible, activeBottomNavTab, setActiveBottomNavTab } = useUIStore();
    const { isAuthenticated } = useAuth();
    const cartCount = useCart((state) => state.getCartCount());
    const wishlistCount = useWishlistCount();

    // Update active tab based on current path
    useEffect(() => {
        const currentItem = bottomNavItems.find(item => {
            if (item.href === '/') {
                return pathname === '/';
            }
            return pathname.startsWith(item.href);
        });

        if (currentItem) {
            setActiveBottomNavTab(currentItem.id);
        }
    }, [pathname, setActiveBottomNavTab]);

    // Don't render on desktop or when bottom nav is hidden
    if (!isMobile || !isBottomNavVisible) {
        return null;
    }

    const handleNavClick = (itemId: string) => {
        setActiveBottomNavTab(itemId);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
            <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
                {bottomNavItems.map((item) => {
                    // Hide auth-required items if not authenticated
                    if (item.requiresAuth && !isAuthenticated) {
                        return null;
                    }

                    const isActive = activeBottomNavTab === item.id;
                    const Icon = item.icon;

                    // Get dynamic badge count
                    let badgeCount = 0;
                    if (item.id === 'cart') {
                        badgeCount = cartCount;
                    } else if (item.id === 'wishlist') {
                        badgeCount = wishlistCount;
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => handleNavClick(item.id)}
                            className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-w-0"
                        >
                            <div className="relative">
                                <Icon
                                    className={`h-6 w-6 transition-colors ${isActive
                                            ? 'text-green-600'
                                            : 'text-gray-500 hover:text-green-600'
                                        }`}
                                />
                                {badgeCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                    >
                                        {badgeCount > 99 ? '99+' : badgeCount}
                                    </Badge>
                                )}
                            </div>
                            <span
                                className={`text-xs mt-1 font-medium transition-colors ${isActive
                                        ? 'text-green-600'
                                        : 'text-gray-500 hover:text-green-600'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}