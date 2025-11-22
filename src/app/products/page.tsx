'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Leaf, 
  Search,
  Filter,
  Star,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Package,
  ChevronDown,
  SlidersHorizontal,
  Wrench
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  featured: boolean;
  quantity?: number;
  category: {
    name: string;
    slug: string;
  };
  inventory?: {
    quantity: number;
  };
  _count: {
    reviews: number;
  };
  reviews?: {
    rating: number;
  }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/v1/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || data.data?.products || []);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate average ratings
  const productsWithRatings = products.map(product => {
    const averageRating = product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0;
    
    return {
      ...product,
      averageRating,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading products...</h3>
          <p className="text-gray-600">Please wait while we fetch our product catalog.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading products</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Green Energy Solutions</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-900 font-medium transition-colors">
              All Products
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </nav>

          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
              🌱 Eco-Friendly Energy Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Products
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover our premium range of eco-friendly batteries, solar panels, and energy solutions designed for a sustainable tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Shop All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Installation Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 border-b bg-gray-50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 py-6"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  Sort by: Newest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="py-12 bg-white">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                  <Zap className="h-24 w-24 text-yellow-600" />
                </div>
                <CardHeader>
                  <CardTitle>Solar Panels</CardTitle>
                  <CardDescription>High-efficiency solar panels for residential and commercial use</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/products/solar-panels">
                    <Button variant="outline">
                      View Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Package className="h-24 w-24 text-blue-600" />
                </div>
                <CardHeader>
                  <CardTitle>Batteries</CardTitle>
                  <CardDescription>Long-lasting batteries for energy storage and backup power</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/products/batteries">
                    <Button variant="outline">
                      View Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <Wrench className="h-24 w-24 text-green-600" />
                </div>
                <CardHeader>
                  <CardTitle>Accessories</CardTitle>
                  <CardDescription>Complete your setup with our range of accessories</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/products/accessories">
                    <Button variant="outline">
                      View Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">All Products</h2>
              <p className="text-gray-600">{products.length} products found</p>
            </div>
            
            {loading ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading products...</h3>
                <p className="text-gray-600">Please wait while we fetch our product catalog.</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading products</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : productsWithRatings.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">We're working on adding more products to our catalog.</p>
                <Link href="/">
                  <Button>Back to Home</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsWithRatings.map((product) => {
                  const discount = product.comparePrice
                    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
                    : 0;
                  
                  const inStock = product.inventory ? product.inventory.quantity > 0 : (product.quantity || 0) > 0;
                  
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <Link href={`/products/${product.slug}`}>
                        <div className="relative">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            {product.images && Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-contain p-4"
                                width={300}
                                height={300}
                              />
                            ) : (
                              <Package className="h-16 w-16 text-gray-400" />
                            )}
                          </div>
                          
                          {discount > 0 && (
                            <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                              {discount}% OFF
                            </Badge>
                          )}
                          
                          {!inStock && (
                            <Badge className="absolute top-3 right-3 bg-gray-500 text-white">
                              Out of Stock
                            </Badge>
                          )}
                          
                          {product.featured && (
                            <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <CardHeader className="pb-2">
                          <Badge variant="secondary" className="mb-2 w-fit">
                            {product.category.name}
                          </Badge>
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="pb-3">
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.shortDesc || 'No description available'}
                          </p>
                          
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.averageRating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {product.averageRating.toFixed(1)} ({product._count.reviews})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            {product.comparePrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{Number(product.comparePrice).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Link>
                      
                      <CardFooter className="pt-0">
                        <Button className="w-full" disabled={!inStock}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Products</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  All our products undergo rigorous testing to ensure maximum performance and longevity.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Our team of energy experts is here to help you choose the right solution for your needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
                <p className="text-gray-600">
                  Sustainable products designed to reduce your carbon footprint and save on energy costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}