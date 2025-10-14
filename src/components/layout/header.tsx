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
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useWishlist, useWishlistCount } from '@/hooks/use-wishlist';
import { useUIStore } from '@/lib/store/ui';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isMobile, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
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

  const headerClasses = variant === 'transparent'
    ? `sticky top-0 z-50 w-full transition-all duration-300 ${scrollY > 50
      ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200'
      : 'bg-transparent border-transparent'
    }`
    : `sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl transition-all duration-300 ${scrollY > 50 ? 'shadow-lg' : ''
    }`;

  return (
    <>
      <header className={headerClasses}>
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Leaf className="h-8 w-8 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Green Energy
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
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:bg-green-50 hover:text-green-600 transition-all"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Wishlist - Hidden on mobile */}
            {!isMobile && (
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-600 transition-all relative"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Cart - Hidden on mobile */}
            {!isMobile && (
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-blue-50 hover:text-blue-600 transition-all relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Account */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/account">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user?.name?.split(' ')[0] || 'Account'}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
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
            </div>
          </div>
        )}
      </header>
    </>
  );
}