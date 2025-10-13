'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ShoppingCart, 
  Heart, 
  Star,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });

  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  // Mock categories
  const categories = ['all', 'solar-panels', 'batteries', 'accessories', 'kits'];

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Solar Panel 400W',
      slug: 'premium-solar-panel-400w',
      price: 899.99,
      comparePrice: 1299.99,
      image: '/solar-panel.jpg',
      category: 'solar-panels',
      rating: 4.8,
      reviews: 124,
      inStock: true,
      featured: true
    },
    {
      id: '2',
      name: 'Lithium Battery 12V 100Ah',
      slug: 'lithium-battery-12v-100ah',
      price: 699.99,
      image: '/battery.jpg',
      category: 'batteries',
      rating: 4.6,
      reviews: 89,
      inStock: true
    },
    {
      id: '3',
      name: 'Solar Installation Kit',
      slug: 'solar-installation-kit',
      price: 2499.99,
      image: '/solar-kit.jpg',
      category: 'kits',
      rating: 4.9,
      reviews: 56,
      inStock: true
    }
  ];

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };

  const handleAddToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      addToWishlist({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.image,
        category: product.category,
        inStock: product.inStock
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max;
    return categoryMatch && priceMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for solar panels, batteries, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600">
                Search
              </Button>
            </form>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {query ? `Search Results for "${query}"` : 'All Products'}
                </h1>
                <p className="text-gray-600">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="w-64 flex-shrink-0">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </h3>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="text-green-600"
                          />
                          <span className="text-sm capitalize">
                            {category.replace('-', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Min: ${priceRange.min}</label>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Max: ${priceRange.max}</label>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange({ min: 0, max: 5000 });
                      setSortBy('relevance');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching...</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Link href="/products">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Browse All Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {sortedProducts.map((product) => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="relative">
                        {/* Product Image */}
                        <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.png';
                            }}
                          />
                        </div>
                        
                        {/* Discount Badge */}
                        {product.comparePrice && product.comparePrice > product.price && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                          </Badge>
                        )}
                        
                        {/* Stock Status */}
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>

                        {/* Quick Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAddToWishlist(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* Product Info */}
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs mb-2">
                            {product.category.replace('-', ' ')}
                          </Badge>
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            <Link href={`/products/${product.slug}`} className="hover:text-green-600">
                              {product.name}
                            </Link>
                          </h3>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-1 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating) 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {product.rating} ({product.reviews})
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg font-bold text-green-600">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}