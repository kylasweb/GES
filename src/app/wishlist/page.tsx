'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft, 
  Search,
  Filter,
  Trash2,
  Eye,
  Share2,
  Star,
  Package,
  Bell
} from 'lucide-react';
import { useWishlist, useWishlistItems } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { Header } from '@/components/layout/header';

export default function WishlistPage() {
  const wishlistItems = useWishlistItems();
  const { removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [showNotifications, setShowNotifications] = useState(true);

  // Filter and sort wishlist items
  const filteredItems = wishlistItems
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        case 'dateAdded':
        default:
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
    });

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      category: item.category
    });
    removeItem(item.id);
  };

  const handleShareWishlist = () => {
    const shareText = `Check out my wishlist from Green Energy Solutions! I have ${wishlistItems.length} items saved.`;
    if (navigator.share) {
      navigator.share({
        title: 'My Green Energy Wishlist',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Wishlist link copied to clipboard!');
    }
  };

  const handleNotifyMe = (item: any) => {
    // Mock notification setup
    alert(`We'll notify you when ${item.name} is back in stock!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <Header />
        <div className="container px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
              <p className="text-gray-600 mb-8">
                Start adding your favorite green energy products to your wishlist. You can save items for later and get notified when they're on sale.
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <Header />
      
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Wishlist Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                <p className="text-gray-600">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleShareWishlist}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearWishlist()}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search wishlist items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="name">Name</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wishlist Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                  
                  {/* Discount Badge */}
                  {item.comparePrice && item.comparePrice > item.price && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
                    </Badge>
                  )}
                  
                  {/* Stock Status */}
                  <Badge 
                    className={`absolute top-2 right-2 ${
                      item.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>

                  {/* Quick Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/products/${item.slug}`}>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Product Info */}
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs mb-2">
                      {item.category}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-green-600">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.comparePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${item.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {item.inStock ? (
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleNotifyMe(item)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notify Me
                      </Button>
                    )}
                  </div>

                  {/* Added Date */}
                  <p className="text-xs text-gray-500 mt-2">
                    Added {new Date(item.addedDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State for Filtered Results */}
          {filteredItems.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Wishlist Summary */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Wishlist Summary</h3>
                  <p className="text-gray-600">
                    Total value: ${filteredItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {filteredItems.filter(item => !item.inStock).length} items out of stock
                  </p>
                </div>
                <div className="text-right">
                  <Button
                    variant="outline"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="mb-2"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {showNotifications ? 'Disable' : 'Enable'} Notifications
                  </Button>
                  <p className="text-sm text-gray-500">
                    Get notified about price drops and stock updates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Mock recommended products */}
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg mb-3"></div>
                    <h3 className="font-medium text-sm mb-2">Recommended Product {i}</h3>
                    <p className="text-green-600 font-bold mb-2">$299.99</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Wishlist
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}