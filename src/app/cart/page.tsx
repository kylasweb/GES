'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  ArrowRight,
  Truck,
  Shield,
  RefreshCw,
  Tag
} from 'lucide-react';
import { useCart, useCartItems, useCartTotal } from '@/hooks/use-cart';
import { Header } from '@/components/layout/header';

export default function CartPage() {
  const cartItems = useCartItems();
  const cartTotal = useCartTotal();
  const { updateQuantity, removeItem, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const shipping = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08; // 8% tax
  const finalTotal = cartTotal + shipping + tax - discount;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toUpperCase() === 'GREEN10') {
      setDiscount(cartTotal * 0.1);
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(cartTotal * 0.2);
    } else {
      alert('Invalid promo code');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <Header />
        <div className="container px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any green energy products to your cart yet.
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
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
          {/* Cart Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.png';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-green-600">
                            ${item.price.toFixed(2)}
                          </span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            In Stock
                          </Badge>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center h-8"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Cart Actions */}
              <div className="flex items-center justify-between pt-4">
                <Link href="/products">
                  <Button variant="outline" className="hover:bg-green-50 hover:border-green-300 hover:text-green-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tag className="h-5 w-5" />
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Promo Code</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={applyPromoCode}
                        disabled={!promoCode}
                      >
                        Apply
                      </Button>
                    </div>
                    {discount > 0 && (
                      <p className="text-sm text-green-600">
                        Promo code applied! You saved ${discount.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {shipping === 0 ? 'Free Shipping' : `Free shipping on orders over $100`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-800">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Secure checkout</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-800">
                      <RefreshCw className="h-4 w-4" />
                      <span className="text-sm">30-day returns</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link href="/checkout">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>

                  {/* Security Badge */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      <Shield className="h-3 w-3 inline mr-1" />
                      Secure SSL Encryption
                    </p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}