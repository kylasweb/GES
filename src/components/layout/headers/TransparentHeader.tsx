'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
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

export function TransparentHeader() {
    const { user, isAuthenticated, logout } = useAuth();
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const cartCount = useCart((state) => state.getCartCount());
    const wishlistCount = useWishlistCount();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const isScrolled = scrollY > 50;

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
                    : 'bg-transparent border-transparent'
                }`}
        >
            <div className="container flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                        <Leaf className={`h-9 w-9 transition-all duration-300 group-hover:rotate-12 ${isScrolled ? 'text-green-600' : 'text-white'
                            }`} />
                        <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className={`text-xl font-bold transition-all duration-300 ${isScrolled
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                            : 'text-white drop-shadow-lg'
                        }`}>
                        Green Energy Solutions
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link
                        href="/products"
                        className={`font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-green-600' : 'text-white hover:text-green-300'
                            }`}
                    >
                        Products
                    </Link>
                    <Link
                        href="/about"
                        className={`font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-green-600' : 'text-white hover:text-green-300'
                            }`}
                    >
                        About
                    </Link>
                    <Link
                        href="/contact"
                        className={`font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-green-600' : 'text-white hover:text-green-300'
                            }`}
                    >
                        Contact
                    </Link>
                    <Link
                        href="/blog"
                        className={`font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-green-600' : 'text-white hover:text-green-300'
                            }`}
                    >
                        Blog
                    </Link>
                </nav>

                {/* Action Icons */}
                <div className="flex items-center space-x-2">
                    <Link href="/wishlist">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`relative ${isScrolled ? '' : 'text-white hover:bg-white/20'}`}
                        >
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {wishlistCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    <Link href="/cart">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`relative ${isScrolled ? '' : 'text-white hover:bg-white/20'}`}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <div className="hidden md:flex items-center space-x-2">
                            <Link href={user?.role === 'CUSTOMER' ? '/dashboard' : '/admin'}>
                                <Button
                                    variant={isScrolled ? 'ghost' : 'ghost'}
                                    size="sm"
                                    className={isScrolled ? '' : 'text-white hover:bg-white/20'}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    {user?.name || 'Account'}
                                </Button>
                            </Link>
                            <Button
                                variant={isScrolled ? 'ghost' : 'ghost'}
                                size="sm"
                                onClick={handleLogout}
                                className={isScrolled ? '' : 'text-white hover:bg-white/20'}
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/auth" className="hidden md:block">
                            <Button variant={isScrolled ? 'default' : 'secondary'} size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Login
                            </Button>
                        </Link>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`md:hidden ${isScrolled ? '' : 'text-white hover:bg-white/20'}`}
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>
        </header>
    );
}
