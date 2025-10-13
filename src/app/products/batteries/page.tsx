import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Battery,
  Star,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Batteries - Green Energy Solutions',
  description: 'Explore our range of high-performance batteries for solar energy storage and backup power solutions.',
};

const batteryProducts = [
  {
    id: 1,
    name: "Solar Pro 200Ah Battery",
    slug: "solar-pro-200ah-battery",
    price: 15000,
    comparePrice: 18000,
    image: "/battery-200ah.jpg",
    rating: 4.5,
    reviews: 23,
    inStock: true,
    features: ["200Ah Capacity", "5 Year Warranty", "Deep Cycle", "Maintenance Free"],
    description: "High-capacity solar battery designed for residential solar energy storage systems."
  },
  {
    id: 2,
    name: "Eco Power 150Ah Battery",
    slug: "eco-power-150ah-battery",
    price: 12000,
    comparePrice: 14500,
    image: "/battery-150ah.jpg",
    rating: 4.3,
    reviews: 18,
    inStock: true,
    features: ["150Ah Capacity", "3 Year Warranty", "Fast Charging", "Low Self-Discharge"],
    description: "Efficient and reliable battery for medium-sized solar installations."
  },
  {
    id: 3,
    name: "Green Storage 100Ah Battery",
    slug: "green-storage-100ah-battery",
    price: 8500,
    comparePrice: 10000,
    image: "/battery-100ah.jpg",
    rating: 4.4,
    reviews: 31,
    inStock: true,
    features: ["100Ah Capacity", "3 Year Warranty", "Compact Design", "High Efficiency"],
    description: "Compact yet powerful battery perfect for small solar setups and backup power."
  },
  {
    id: 4,
    name: "Premium Lithium 200Ah",
    slug: "premium-lithium-200ah",
    price: 25000,
    comparePrice: 30000,
    image: "/lithium-battery.jpg",
    rating: 4.8,
    reviews: 12,
    inStock: true,
    features: ["200Ah Capacity", "8 Year Warranty", "Lithium Technology", "Lightweight"],
    description: "Advanced lithium battery technology for superior performance and longer life."
  },
  {
    id: 5,
    name: "Industrial 300Ah Battery",
    slug: "industrial-300ah-battery",
    price: 22000,
    comparePrice: 26000,
    image: "/industrial-battery.jpg",
    rating: 4.6,
    reviews: 8,
    inStock: false,
    features: ["300Ah Capacity", "5 Year Warranty", "Heavy Duty", "Commercial Grade"],
    description: "Heavy-duty battery designed for industrial and commercial applications."
  },
  {
    id: 6,
    name: "Smart Battery 120Ah",
    slug: "smart-battery-120ah",
    price: 13500,
    comparePrice: 16000,
    image: "/smart-battery.jpg",
    rating: 4.7,
    reviews: 15,
    inStock: true,
    features: ["120Ah Capacity", "4 Year Warranty", "Smart Monitoring", "IoT Enabled"],
    description: "Smart battery with built-in monitoring and IoT connectivity for real-time tracking."
  }
];

export default function BatteriesPage() {
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
              🔋 High-Performance Batteries
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Reliable Energy Storage
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Premium quality batteries designed for solar energy storage, backup power, and off-grid applications. Built to last and perform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View All Batteries
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Battery Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Batteries?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology and superior quality for reliable performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Battery className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">High Capacity</CardTitle>
              <CardDescription>
                Large storage capacity for extended power backup
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Durable Build</CardTitle>
              <CardDescription>
                Robust construction for long-lasting performance
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Fast Charging</CardTitle>
              <CardDescription>
                Quick charging technology for minimal downtime
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Warranty</CardTitle>
              <CardDescription>
                Comprehensive warranty for peace of mind
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Battery Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of batteries for every need
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {batteryProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <Battery className="h-24 w-24 text-green-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Battery
                    </Badge>
                    {!product.inStock && (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {product.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.comparePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!product.inStock}
                    variant={product.inStock ? "default" : "secondary"}
                  >
                    {product.inStock ? (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Out of Stock
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Battery Guide */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Battery Buying Guide
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardTitle className="text-xl mb-4 flex items-center">
                  <Battery className="h-6 w-6 mr-2 text-green-600" />
                  Choose the Right Capacity
                </CardTitle>
                <CardDescription className="space-y-2">
                  <p>• <strong>100-150Ah:</strong> Small homes, basic backup</p>
                  <p>• <strong>150-200Ah:</strong> Medium homes, partial solar</p>
                  <p>• <strong>200Ah+:</strong> Large homes, full solar systems</p>
                  <p>• <strong>300Ah+:</strong> Commercial/Industrial use</p>
                </CardDescription>
              </Card>
              
              <Card className="p-6">
                <CardTitle className="text-xl mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-blue-600" />
                  Battery Types
                </CardTitle>
                <CardDescription className="space-y-2">
                  <p>• <strong>Tubular:</strong> Long life, deep cycle</p>
                  <p>• <strong>Lithium:</strong> Lightweight, fast charging</p>
                  <p>• <strong>AGM:</strong> Maintenance free, spill-proof</p>
                  <p>• <strong>Gel:</strong> Deep discharge resistant</p>
                </CardDescription>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Help Choosing the Right Battery?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Our experts are here to help you select the perfect battery for your energy needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
              Get Expert Advice
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Download Battery Guide
            </Button>
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