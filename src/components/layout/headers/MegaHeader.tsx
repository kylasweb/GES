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
    Sparkles,
    ChevronDown,
    Battery,
    Zap,
    Plug
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useWishlistCount } from '@/hooks/use-wishlist';
import { useUIStore } from '@/lib/store/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export function MegaHeader() {
    const { user, isAuthenticated, logout } = useAuth();
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const cartCount = useCart((state) => state.getCartCount());
    const wishlistCount = useWishlistCount();
    const [scrollY, setScrollY] = useState(0);
    const [showProductsMega, setShowProductsMega] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl transition-all duration-300 ${scrollY > 50 ? 'shadow-lg' : ''}`}>
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

                {/* Desktop Navigation with Mega Menu */}
                <nav className="hidden md:flex items-center space-x-8">
                    <div
                        className="relative"
                        onMouseEnter={() => setShowProductsMega(true)}
                        onMouseLeave={() => setShowProductsMega(false)}
                    >
                        <button className="flex items-center text-gray-600 hover:text-green-600 transition-colors font-medium">
                            Products
                            <ChevronDown className="ml-1 h-4 w-4" />
                        </button>

                        {/* Mega Menu Dropdown */}
                        {showProductsMega && (
                            <div className="absolute left-0 top-full mt-2 w-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                            Solar Panels
                                        </h3>
                                        <ul className="space-y-2">
                                            <li>
                                                <Link href="/products/solar-panels" className="text-sm text-gray-600 hover:text-green-600">
                                                    All Solar Panels
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/products/solar-panels?type=residential" className="text-sm text-gray-600 hover:text-green-600">
                                                    Residential
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/products/solar-panels?type=commercial" className="text-sm text-gray-600 hover:text-green-600">
                                                    Commercial
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Battery className="h-4 w-4 mr-2 text-blue-500" />
                                            Batteries
                                        </h3>
                                        <ul className="space-y-2">
                                            <li>
                                                <Link href="/products/batteries" className="text-sm text-gray-600 hover:text-green-600">
                                                    All Batteries
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/products/batteries?type=lithium" className="text-sm text-gray-600 hover:text-green-600">
                                                    Lithium-ion
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/products/batteries?type=lead-acid" className="text-sm text-gray-600 hover:text-green-600">
                                                    Lead-acid
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <Plug className="h-4 w-4 mr-2 text-green-500" />
                                            Accessories
                                        </h3>
                                        <ul className="space-y-2">
                                            <li>
                                                <Link href="/products/accessories" className="text-sm text-gray-600 hover:text-green-600">
                                                    All Accessories
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/products/accessories?type=inverters" className="text-sm text-gray-600 hover:text-green-600">
                                                    Inverters
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href="/products/accessories?type=cables" className="text-sm text-gray-600 hover:text-green-600">
                                                    Cables & Wiring
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <Link
                                        href="/products"
                                        className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center"
                                    >
                                        View All Products →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

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
