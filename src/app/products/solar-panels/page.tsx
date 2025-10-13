import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Sun,
  Star,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solar Panels - Green Energy Solutions',
  description: 'High-efficiency solar panels for residential and commercial use. Harness the power of the sun with our premium solar solutions.',
};

const solarProducts = [
  {
    id: 1,
    name: "Mono PERC 550W Solar Panel",
    slug: "mono-perc-550w-solar-panel",
    price: 18000,
    comparePrice: 22000,
    image: "/solar-550w.jpg",
    rating: 4.7,
    reviews: 34,
    inStock: true,
    features: ["550W Power", "22% Efficiency", "25 Year Warranty", "Mono PERC Technology"],
    description: "High-efficiency monocrystalline solar panel with PERC technology for maximum power generation."
  },
  {
    id: 2,
    name: "Poly 400W Solar Panel",
    slug: "poly-400w-solar-panel",
    price: 12000,
    comparePrice: 15000,
    image: "/solar-400w.jpg",
    rating: 4.4,
    reviews: 28,
    inStock: true,
    features: ["400W Power", "18% Efficiency", "15 Year Warranty", "Polycrystalline"],
    description: "Cost-effective polycrystalline solar panel suitable for residential installations."
  },
  {
    id: 3,
    name: "Bifacial 600W Solar Panel",
    slug: "bifacial-600w-solar-panel",
    price: 25000,
    comparePrice: 30000,
    image: "/bifacial-solar.jpg",
    rating: 4.8,
    reviews: 19,
    inStock: true,
    features: ["600W Power", "23% Efficiency", "25 Year Warranty", "Bifacial Technology"],
    description: "Advanced bifacial solar panel that captures light from both sides for higher output."
  },
  {
    id: 4,
    name: "Flexible 100W Solar Panel",
    slug: "flexible-100w-solar-panel",
    price: 8000,
    comparePrice: 10000,
    image: "/flexible-solar.jpg",
    rating: 4.3,
    reviews: 15,
    inStock: true,
    features: ["100W Power", "16% Efficiency", "5 Year Warranty", "Flexible Design"],
    description: "Lightweight and flexible solar panel perfect for curved surfaces and mobile applications."
  },
  {
    id: 5,
    name: "Commercial 700W Solar Panel",
    slug: "commercial-700w-solar-panel",
    price: 32000,
    comparePrice: 38000,
    image: "/commercial-solar.jpg",
    rating: 4.9,
    reviews: 12,
    inStock: false,
    features: ["700W Power", "24% Efficiency", "25 Year Warranty", "Commercial Grade"],
    description: "High-power commercial solar panel designed for large-scale installations."
  },
  {
    id: 6,
    name: "Half-Cut 450W Solar Panel",
    slug: "half-cut-450w-solar-panel",
    price: 16000,
    comparePrice: 19000,
    image: "/half-cut-solar.jpg",
    rating: 4.6,
    reviews: 22,
    inStock: true,
    features: ["450W Power", "21% Efficiency", "20 Year Warranty", "Half-Cut Cells"],
    description: "Innovative half-cut cell technology for improved performance in shaded conditions."
  }
];

export default function SolarPanelsPage() {
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
      <section className="relative bg-gradient-to-br from-yellow-50 to-orange-100 py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              ☀️ High-Efficiency Solar Panels
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Harness the Power of the Sun
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Premium quality solar panels with advanced technology for maximum energy generation and long-term reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View All Panels
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Solar Calculator
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
              Why Choose Our Solar Panels?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology and superior quality for maximum energy production
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">High Efficiency</CardTitle>
              <CardDescription>
                Up to 24% conversion efficiency for maximum power output
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Durable</CardTitle>
              <CardDescription>
                Weather-resistant construction for 25+ years of performance
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Advanced Tech</CardTitle>
              <CardDescription>
                Latest PERC and bifacial technology for enhanced performance
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Certified</CardTitle>
              <CardDescription>
                Internationally certified for quality and safety standards
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
              Our Solar Panel Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of solar panels for every application
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solarProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                  <Sun className="h-24 w-24 text-yellow-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Solar Panel
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

      {/* Solar Calculator */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Solar Panel Calculator
            </h2>
            
            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <CardTitle className="text-xl mb-4">Calculate Your Solar Needs</CardTitle>
                  <CardDescription className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Electricity Bill (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Enter your monthly bill"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Sunlight Hours
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="4">4-5 hours</option>
                        <option value="5">5-6 hours</option>
                        <option value="6">6-7 hours</option>
                        <option value="7">7+ hours</option>
                      </select>
                    </div>
                    
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Calculate Solar Needs
                    </Button>
                  </CardDescription>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <CardTitle className="text-xl mb-4 text-green-800">Estimated Results</CardTitle>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required Capacity:</span>
                      <span className="font-semibold">3 kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Panels:</span>
                      <span className="font-semibold">6 panels</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-semibold">₹1,20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payback Period:</span>
                      <span className="font-semibold">4-5 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Savings:</span>
                      <span className="font-semibold text-green-600">₹2,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Go Solar?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Get a free consultation and customized solar solution for your home or business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
              Get Free Consultation
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Download Solar Guide
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