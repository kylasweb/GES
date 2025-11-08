'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    ShoppingCart,
    User,
    Heart,
    Menu,
    X,
    Leaf,
    Sparkles,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useWishlistCount } from '@/hooks/use-wishlist';
import { useUIStore } from '@/lib/store/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export function DefaultHeader() {
    const { user, isAuthenticated, logout } = useAuth();
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const cartCount = useCart((state) => state.getCartCount());
    const wishlistCount = useWishlistCount();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <header className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl transition-all duration-300 ${scrollY > 50 ? 'shadow-lg' : ''}`}>
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                        <Leaf className="h-8 w-8 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
                        <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Green Energy Solutions
                    </span>
                </Link>

                {/* Desktop Navigation */}
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
                </nav>

                {/* Action Icons */}
                <div className="flex items-center space-x-2">
                    <ThemeToggle />

                    {/* Search */}
                    <div className="relative">
                        {isSearchOpen ? (
                            <form onSubmit={handleSearch} className="flex items-center">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 h-9"
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="ml-1"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </form>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSearchOpen(true)}
                                className="hidden sm:flex"
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {/* Wishlist */}
                    <Link href="/wishlist">
                        <Button variant="ghost" size="icon" className="relative">
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {wishlistCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {/* Cart */}
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="hidden md:flex items-center space-x-2">
                            <Link href={user?.role === 'CUSTOMER' ? '/dashboard' : '/admin'}>
                                <Button variant="ghost" size="sm">
                                    <User className="h-4 w-4 mr-2" />
                                    {user?.name || 'Account'}
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/auth" className="hidden md:block">
                            <Button variant="default" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Login
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>
        </header>
    );
}
