'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart,
    User,
    Menu,
    X,
    Leaf
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useUIStore } from '@/lib/store/ui';

export function MinimalHeader() {
    const { user, isAuthenticated, logout } = useAuth();
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const cartCount = useCart((state) => state.getCartCount());

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
            <div className="container flex h-14 items-center justify-between px-4">
                {/* Compact Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Leaf className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-semibold text-gray-900">GES</span>
                </Link>

                {/* Minimal Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/products" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                        Products
                    </Link>
                    <Link href="/about" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                        Contact
                    </Link>
                </nav>

                {/* Minimal Actions */}
                <div className="flex items-center space-x-1">
                    <Link href="/cart">
                        <Button variant="ghost" size="sm" className="relative">
                            <ShoppingCart className="h-4 w-4" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <Link href={user?.role === 'CUSTOMER' ? '/dashboard' : '/admin'}>
                            <Button variant="ghost" size="sm">
                                <User className="h-4 w-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/auth">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </header>
    );
}
