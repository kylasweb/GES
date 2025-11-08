'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ShoppingCart,
    User,
    Heart,
    Menu,
    X,
    Leaf,
    Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useWishlistCount } from '@/hooks/use-wishlist';
import { useUIStore } from '@/lib/store/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export function CenteredHeader() {
    const { user, isAuthenticated, logout } = useAuth();
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const cartCount = useCart((state) => state.getCartCount());
    const wishlistCount = useWishlistCount();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
            {/* Top Bar - Actions */}
            <div className="border-b border-gray-100">
                <div className="container flex h-12 items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link href="/wishlist">
                            <Button variant="ghost" size="sm" className="relative">
                                <Heart className="h-4 w-4" />
                                {wishlistCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                                        {wishlistCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>

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
                            <>
                                <Link href={user?.role === 'CUSTOMER' ? '/dashboard' : '/admin'}>
                                    <Button variant="ghost" size="sm">
                                        <User className="h-4 w-4 mr-1" />
                                        <span className="hidden sm:inline">{user?.name}</span>
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/auth">
                                <Button variant="default" size="sm">
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
            </div>

            {/* Main Header - Centered Logo & Nav */}
            <div className="container px-4 py-4">
                <div className="flex flex-col items-center space-y-4">
                    {/* Centered Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <Leaf className="h-10 w-10 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
                            <Sparkles className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            Green Energy Solutions
                        </span>
                    </Link>

                    {/* Centered Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/products" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                            Products
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                            Contact
                        </Link>
                        <Link href="/blog" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                            Blog
                        </Link>
                        <Link href="/careers" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                            Careers
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
