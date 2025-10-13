import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Wrench,
  Star,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Cable
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accessories - Green Energy Solutions',
  description: 'Complete your solar setup with our range of high-quality accessories including inverters, mounting systems, and wiring components.',
};

const accessoryProducts = [
  {
    id: 1,
    name: "Solar Inverter 3kW",
    slug: "solar-inverter-3kw",
    price: 25000,
    comparePrice: 30000,
    image: "/inverter-3kw.jpg",
    rating: 4.6,
    reviews: 28,
    inStock: true,
    features: ["3kW Capacity", "Pure Sine Wave", "WiFi Enabled", "5 Year Warranty"],
    description: "High-efficiency solar inverter with smart monitoring capabilities for residential use."
  },
  {
    id: 2,
    name: "Mounting Structure Kit",
    slug: "mounting-structure-kit",
    price: 8000,
    comparePrice: 10000,
    image: "/mounting-kit.jpg",
    rating: 4.4,
    reviews: 19,
    inStock: true,
    features: ["Rooftop Mounting", "Rust Proof", "Easy Installation", "10 Panels"],
    description: "Complete mounting structure kit for secure rooftop solar panel installation."
  },
  {
    id: 3,
    name: "MC4 Connectors (10 pcs)",
    slug: "mc4-connectors-10pcs",
    price: 1200,
    comparePrice: 1500,
    image: "/mc4-connectors.jpg",
    rating: 4.5,
    reviews: 45,
    inStock: true,
    features: ["10 Pieces", "Waterproof", "UV Resistant", "High Quality"],
    description: "Professional grade MC4 connectors for secure and weatherproof solar connections."
  },
  {
    id: 4,
    name: "Solar Cable 100m",
    slug: "solar-cable-100m",
    price: 3500,
    comparePrice: 4200,
    image: "/solar-cable.jpg",
    rating: 4.3,
    reviews: 22,
    inStock: true,
    features: ["100m Length", "6mm²", "UV Protected", "Fire Resistant"],
    description: "High-quality solar cable designed for outdoor use with excellent UV protection."
  },
  {
    id: 5,
    name: "Charge Controller 20A",
    slug: "charge-controller-20a",
    price: 4500,
    comparePrice: 5500,
    image: "/charge-controller.jpg",
    rating: 4.7,
    reviews: 16,
    inStock: false,
    features: ["20A Capacity", "PWM Technology", "LCD Display", "USB Port"],
    description: "Intelligent charge controller for optimal battery charging and protection."
  },
  {
    id: 6,
    name: "Battery Monitor",
    slug: "battery-monitor",
    price: 2800,
    comparePrice: 3500,
    image: "/battery-monitor.jpg",
    rating: 4.5,
    reviews: 31,
    inStock: true,
    features: ["Digital Display", "Real-time Data", "Alarm System", "Easy Install"],
    description: "Smart battery monitor for tracking battery status and performance metrics."
  },
  {
    id: 7,
    name: "DC Breaker 32A",
    slug: "dc-breaker-32a",
    price: 1800,
    comparePrice: 2200,
    image: "/dc-breaker.jpg",
    rating: 4.4,
    reviews: 12,
    inStock: true,
    features: ["32A Rating", "DC Rated", "Trip Protection", "Safety Certified"],
    description: "DC circuit breaker for overload protection in solar systems."
  },
  {
    id: 8,
    name: "Earthing Kit",
    slug: "earthing-kit",
    price: 2200,
    comparePrice: 2800,
    image: "/earthing-kit.jpg",
    rating: 4.6,
    reviews: 18,
    inStock: true,
    features: ["Complete Kit", "Copper Rod", "Safety Compliant", "Easy Setup"],
    description: "Complete earthing solution for safety and protection of solar equipment."
  },
  {
    id: 9,
    name: "Solar Cleaning Kit",
    slug: "solar-cleaning-kit",
    price: 1500,
    comparePrice: 2000,
    image: "/cleaning-kit.jpg",
    rating: 4.3,
    reviews: 24,
    inStock: true,
    features: ["Soft Brush", "Extension Pole", "Cleaning Solution", "Microfiber Cloth"],
    description: "Professional cleaning kit to maintain optimal solar panel performance."
  }
];

export default function AccessoriesPage() {
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
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
              🔧 Complete Solar Setup
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Solar Accessories
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Everything you need to complete your solar installation - from inverters and mounting systems to wiring and monitoring devices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View All Accessories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Installation Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the right accessories for your solar setup
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Inverters</CardTitle>
              <CardDescription>
                Solar inverters and charge controllers
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Mounting</CardTitle>
              <CardDescription>
                Mounting structures and hardware
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cable className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Wiring</CardTitle>
              <CardDescription>
                Cables, connectors, and wiring components
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="mb-2">Safety</CardTitle>
              <CardDescription>
                Breakers, earthing, and safety equipment
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
              All Accessories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete your solar system with our premium accessories
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {accessoryProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <Wrench className="h-24 w-24 text-blue-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Accessory
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

      {/* Installation Guide */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Essential Accessories Guide
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardTitle className="text-xl mb-4 flex items-center">
                  <Zap className="h-6 w-6 mr-2 text-blue-600" />
                  Must-Have Components
                </CardTitle>
                <CardDescription className="space-y-2">
                  <p>• <strong>Solar Inverter:</strong> Converts DC to AC power</p>
                  <p>• <strong>Mounting Structure:</strong> Secure panel installation</p>
                  <p>• <strong>DC Cables:</strong> Connect panels to inverter</p>
                  <p>• <strong>MC4 Connectors:</strong> Weatherproof connections</p>
                  <p>• <strong>Charge Controller:</strong> Battery protection</p>
                </CardDescription>
              </Card>
              
              <Card className="p-6">
                <CardTitle className="text-xl mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-red-600" />
                  Safety Equipment
                </CardTitle>
                <CardDescription className="space-y-2">
                  <p>• <strong>DC Breakers:</strong> Overload protection</p>
                  <p>• <strong>Earthing Kit:</strong> Grounding for safety</p>
                  <p>• <strong>Surge Protector:</strong> Lightning protection</p>
                  <p>• <strong>Fuse Holder:</strong> Additional safety</p>
                  <p>• <strong>Warning Signs:</strong> Safety indicators</p>
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
            Need Help with Installation?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Our team of experts can help you choose the right accessories and provide professional installation services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
              Get Installation Quote
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Download Installation Guide
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