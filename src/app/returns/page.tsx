import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Refunds - Green Energy Solutions',
  description: 'Learn about our hassle-free return policy and refund process. Shop with confidence at Green Energy Solutions.',
};

export default function ReturnsPage() {
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
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
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
              🔄 Easy Returns
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Shop with Confidence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our hassle-free return policy ensures you can shop with complete peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Return Policy Overview */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Return Policy Highlights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and customer-friendly return terms
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl mb-2">30 Days</CardTitle>
              <CardDescription>
                Return window for most products
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl mb-2">Original Condition</CardTitle>
              <CardDescription>
                Products must be unused and in original packaging
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl mb-2">Full Refund</CardTitle>
              <CardDescription>
                Complete refund for eligible returns
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl mb-2">Free Pickup</CardTitle>
              <CardDescription>
                Complimentary return pickup service
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Return Eligibility */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Eligible for Return</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Wrong Product Delivered</h3>
                      <p className="text-gray-600">If you receive a different product than what you ordered.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Manufacturing Defects</h3>
                      <p className="text-gray-600">Products with defects or quality issues.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Damaged in Transit</h3>
                      <p className="text-gray-600">Products damaged during delivery.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Change of Mind</h3>
                      <p className="text-gray-600">Return within 30 days if you're not satisfied.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Not Eligible for Return</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">After 30 Days</h3>
                      <p className="text-gray-600">Returns requested after the 30-day window.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Used Products</h3>
                      <p className="text-gray-600">Products that have been installed or used.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Missing Accessories</h3>
                      <p className="text-gray-600">Returns without all original accessories and packaging.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Custom Orders</h3>
                      <p className="text-gray-600">Products ordered specifically for your requirements.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Return a Product
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 4-step return process
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg mb-2">1. Initiate Return</CardTitle>
              <CardDescription>
                Log into your account and request a return from order history.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg mb-2">2. Package Product</CardTitle>
              <CardDescription>
                Pack the item in original packaging with all accessories.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-lg mb-2">3. Schedule Pickup</CardTitle>
              <CardDescription>
                Our courier partner will pick up the product from your address.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg mb-2">4. Get Refund</CardTitle>
              <CardDescription>
                Refund processed within 5-7 business days after inspection.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Refund Timeline */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Refund Timeline
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 bg-white/10 border-white/20">
                <CardTitle className="text-xl mb-4 text-white">Refund Method</CardTitle>
                <CardDescription className="text-green-100 space-y-2">
                  <div>• Original payment method (preferred)</div>
                  <div>• Bank transfer for COD orders</div>
                  <div>• Store credit (instant processing)</div>
                  <div>• Exchange for other products</div>
                </CardDescription>
              </Card>
              
              <Card className="p-6 bg-white/10 border-white/20">
                <CardTitle className="text-xl mb-4 text-white">Processing Time</CardTitle>
                <CardDescription className="text-green-100 space-y-2">
                  <div>• Pickup: 2-3 business days</div>
                  <div>• Inspection: 1-2 business days</div>
                  <div>• Refund initiation: 1 business day</div>
                  <div>• Credit to account: 5-7 business days</div>
                </CardDescription>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Important Notes
            </h2>
            
            <Card className="p-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Return Shipping</h3>
                    <p className="text-gray-600">Return shipping is free for all eligible returns. We'll arrange pickup from your address.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Order Cancellation</h3>
                    <p className="text-gray-600">Orders can be cancelled before dispatch. After dispatch, the return policy applies.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Partial Returns</h3>
                    <p className="text-gray-600">You can return individual items from an order. Refund will be processed for returned items only.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Documentation</h3>
                    <p className="text-gray-600">Keep your invoice and return reference number until the refund is complete.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Need Help with Returns?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our customer support team is here to assist you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Initiate Return Online</CardTitle>
              <CardDescription>
                Start your return request through your account dashboard
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Start Return
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Return Policy Details</CardTitle>
              <CardDescription>
                Read our complete return policy terms and conditions
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                View Policy
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Contact Support</CardTitle>
              <CardDescription>
                Get help from our customer service team
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Get Help
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="text-lg font-bold">Green Energy Solutions</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for sustainable energy solutions in India.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products/batteries" className="hover:text-white">Batteries</Link></li>
                <li><Link href="/products/solar-panels" className="hover:text-white">Solar Panels</Link></li>
                <li><Link href="/products/accessories" className="hover:text-white">Accessories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/warranty" className="hover:text-white">Warranty</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Green Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}