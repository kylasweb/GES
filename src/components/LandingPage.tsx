'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Star,
  ShoppingCart,
  Zap,
  TrendingUp,
  Gift,
  Truck,
  Shield,
  Tag,
  Leaf,
  Sun,
  Battery,
  Wrench,
  Menu,
  X
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: { name: string };
  rating?: number;
  reviews?: number;
}

interface Deal {
  id: string;
  name: string;
  discount: number;
  productId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, dealsRes, categoriesRes] = await Promise.all([
          fetch('/api/v1/products?featured=true&limit=20'),
          fetch('/api/v1/deals/active'),
          fetch('/api/v1/categories?limit=8')
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data?.products || data.products || []);
        }

        if (dealsRes.ok) {
          const data = await dealsRes.json();
          setDeals(data.deals || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data?.categories || data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredCategories = [
    { name: 'Solar Panels', icon: Sun, color: 'bg-yellow-500', href: '/products/solar-panels' },
    { name: 'Batteries', icon: Battery, color: 'bg-blue-500', href: '/products/batteries' },
    { name: 'Accessories', icon: Wrench, color: 'bg-green-500', href: '/products/accessories' },
    { name: 'Deals', icon: Zap, color: 'bg-red-500', href: '/products?deals=true' },
    { name: 'Best Sellers', icon: TrendingUp, color: 'bg-purple-500', href: '/products?sort=popular' },
    { name: 'New Arrivals', icon: Leaf, color: 'bg-pink-500', href: '/products?sort=newest' },
  ];

  const banners = [
    {
      title: 'Mega Solar Sale',
      subtitle: 'Up to 50% OFF on Solar Panels',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      title: 'Battery Bonanza',
      subtitle: 'Extra 30% OFF on all Batteries',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      title: 'Green Friday Deals',
      subtitle: 'Massive discounts on everything',
      color: 'from-green-400 to-emerald-500',
    }
  ];

  const features = [
    {
      icon: Truck,
      title: "Free Delivery",
      description: "On orders above ₹1000"
    },
    {
      icon: Shield,
      title: "2 Year Warranty",
      description: "On all products"
    },
    {
      icon: Gift,
      title: "Gift Vouchers",
      description: "Available now"
    },
    {
      icon: Tag,
      title: "Best Prices",
      description: "Guaranteed"
    }
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                GreenEnergy
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-gray-700 hover:text-green-600 font-medium">Products</Link>
              <Link href="/categories" className="text-gray-700 hover:text-green-600 font-medium">Categories</Link>
              <Link href="/deals" className="text-gray-700 hover:text-green-600 font-medium">Deals</Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium">Contact</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-6 w-6" />
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 hidden md:flex">
                Sign In
              </Button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <Link href="/products" className="text-gray-700 hover:text-green-600 font-medium">Products</Link>
                <Link href="/categories" className="text-gray-700 hover:text-green-600 font-medium">Categories</Link>
                <Link href="/deals" className="text-gray-700 hover:text-green-600 font-medium">Deals</Link>
                <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium">About</Link>
                <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium">Contact</Link>
                <Button className="bg-green-600 hover:bg-green-700 w-full">
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              🌱 Eco-Friendly Energy Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Power Your Future with Clean Energy
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
              Discover our premium range of solar panels, batteries, and renewable energy solutions designed for a sustainable tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                Shop All Products
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                Installation Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 overflow-x-auto">
            {featuredCategories.map((cat, index) => (
              <Link
                key={index}
                href={cat.href}
                className="flex flex-col items-center min-w-[80px] hover:opacity-75 transition-opacity"
              >
                <div className={`${cat.color} w-12 h-12 rounded-full flex items-center justify-center text-white mb-1`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Banners */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-br ${banner.color} p-6 h-40 flex flex-col justify-between text-white`}>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
                  <p className="text-sm opacity-90">{banner.subtitle}</p>
                </div>
                <Button variant="secondary" size="sm" className="w-fit">
                  Shop Now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white border-y">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.icon className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Deals Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Top Deals
          </h2>
          <Link href="/products?deals=true">
            <Button variant="link" className="text-blue-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    )}
                    {product.comparePrice && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold">₹{product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="text-gray-400 text-sm line-through">₹{product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating || 4.5}</span>
                    <span className="text-gray-500">({product.reviews || 128})</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Products Section */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Trending Now
            </h2>
            <Link href="/products">
              <Button variant="link" className="text-blue-600">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(6, 16).map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="aspect-square relative mb-2 bg-gray-100 rounded-lg overflow-hidden">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <div className="text-green-600 font-bold text-sm">₹{product.price.toLocaleString()}</div>
                    <Badge variant="secondary" className="mt-2 text-xs">{product.category.name}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Card key={category.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 h-32 flex flex-col justify-center items-center">
                <div className="bg-white p-3 rounded-full mb-2">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-center">{category.name}</h3>
              </div>
              <CardContent className="p-4">
                <Link href={`/products?category=${category.slug}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Explore <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make the Switch to Green Energy?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
            Join thousands of satisfied customers who are reducing their carbon footprint while saving money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
              Get a Free Consultation
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">GreenEnergy</h3>
              <p className="text-gray-400 mb-4">
                Providing sustainable energy solutions for homes and businesses since 2015.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products/solar-panels" className="hover:text-white">Solar Panels</Link></li>
                <li><Link href="/products/batteries" className="hover:text-white">Batteries</Link></li>
                <li><Link href="/products/accessories" className="hover:text-white">Accessories</Link></li>
                <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/support" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/warranty" className="hover:text-white">Warranty</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Green Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}