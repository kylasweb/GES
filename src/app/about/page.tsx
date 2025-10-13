import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  Award, 
  Leaf, 
  Target,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Green Energy Solutions',
  description: 'Learn about Green Energy Solutions - your trusted partner for sustainable energy solutions in India.',
};

export default function AboutPage() {
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
              About Our Company
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Powering a Sustainable Future
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We are committed to providing high-quality, eco-friendly energy solutions that make a difference in people's lives and protect our planet.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl mb-4">Our Mission</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                To make renewable energy accessible and affordable for everyone by providing innovative, high-quality solar panels and batteries that reduce carbon footprints and promote sustainable living.
              </CardDescription>
            </Card>

            <Card className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-4">Our Vision</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                To be India's leading provider of green energy solutions, empowering millions of homes and businesses to transition to clean, renewable energy sources for a brighter, sustainable future.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Sustainability</CardTitle>
              <CardDescription>
                Every product we offer is designed with environmental impact in mind, promoting a cleaner, greener planet.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Quality</CardTitle>
              <CardDescription>
                We never compromise on quality, ensuring our products meet the highest standards of performance and reliability.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Customer Focus</CardTitle>
              <CardDescription>
                Our customers are at the heart of everything we do, providing exceptional service and support.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5 Years</div>
              <div className="text-green-100">Warranty</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Join the Green Revolution?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our range of eco-friendly energy solutions and take the first step towards a sustainable future.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Explore Our Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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