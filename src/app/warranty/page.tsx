import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  Wrench
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Warranty - Green Energy Solutions',
  description: 'Learn about our comprehensive warranty coverage for solar panels, batteries, and accessories. Protect your green energy investment.',
};

export default function WarrantyPage() {
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
              🛡️ Warranty Protection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Peace of Mind Guaranteed
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our comprehensive warranty coverage ensures your green energy investment is protected for years to come.
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Overview */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warranty Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading warranty terms for all our products
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl mb-2">5 Years</CardTitle>
              <CardDescription className="text-lg">
                <div className="font-semibold text-green-600 mb-2">Solar Panels</div>
                <div>Performance Guarantee</div>
                <div>Manufacturing Defects</div>
                <div>Free Replacement</div>
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-2">3 Years</CardTitle>
              <CardDescription className="text-lg">
                <div className="font-semibold text-blue-600 mb-2">Batteries</div>
                <div>Capacity Retention</div>
                <div>Manufacturing Defects</div>
                <div>Free Service</div>
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl mb-2">2 Years</CardTitle>
              <CardDescription className="text-lg">
                <div className="font-semibold text-yellow-600 mb-2">Accessories</div>
                <div>Manufacturing Defects</div>
                <div>Quality Assurance</div>
                <div>Free Replacement</div>
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What's Covered</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Manufacturing Defects</h3>
                      <p className="text-gray-600">Any defects in materials or workmanship under normal use.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Performance Issues</h3>
                      <p className="text-gray-600">Failure to meet specified performance standards.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Component Failure</h3>
                      <p className="text-gray-600">Internal component failures affecting product functionality.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Free Service & Support</h3>
                      <p className="text-gray-600">Complimentary service and technical support during warranty period.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What's Not Covered</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Improper Installation</h3>
                      <p className="text-gray-600">Damage due to incorrect installation or unauthorized modifications.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Natural Disasters</h3>
                      <p className="text-gray-600">Damage from floods, earthquakes, lightning, or extreme weather.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Normal Wear & Tear</h3>
                      <p className="text-gray-600">Gradual deterioration from normal use over time.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Accidental Damage</h3>
                      <p className="text-gray-600">Damage caused by accidents, misuse, or negligence.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Claim Process */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warranty Claim Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple and hassle-free warranty claim process
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg mb-2">1. Document Issue</CardTitle>
              <CardDescription>
                Take photos/videos of the issue and note the problem details.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg mb-2">2. Submit Claim</CardTitle>
              <CardDescription>
                Email warranty@greenenergy.com with proof of purchase and issue details.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-lg mb-2">3. Assessment</CardTitle>
              <CardDescription>
                Our team will assess your claim within 48-72 hours.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg mb-2">4. Resolution</CardTitle>
              <CardDescription>
                Receive repair, replacement, or refund as per warranty terms.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Extended Warranty */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Extended Warranty Protection
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Extend your warranty coverage for additional peace of mind
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <Card className="p-6 text-white border-white/20">
                <CardTitle className="text-xl mb-2">1 Year Extension</CardTitle>
                <CardDescription className="text-green-100 mb-4">
                  Additional 12 months of coverage
                </CardDescription>
                <div className="text-2xl font-bold">₹2,999</div>
              </Card>
              
              <Card className="p-6 text-white border-white/20">
                <CardTitle className="text-xl mb-2">2 Year Extension</CardTitle>
                <CardDescription className="text-green-100 mb-4">
                  Additional 24 months of coverage
                </CardDescription>
                <div className="text-2xl font-bold">₹4,999</div>
              </Card>
              
              <Card className="p-6 text-white border-white/20">
                <CardTitle className="text-xl mb-2">3 Year Extension</CardTitle>
                <CardDescription className="text-green-100 mb-4">
                  Additional 36 months of coverage
                </CardDescription>
                <div className="text-2xl font-bold">₹6,999</div>
              </Card>
            </div>
            
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
              Purchase Extended Warranty
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warranty Support
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our warranty team is here to help you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Call Warranty Support</CardTitle>
              <CardDescription>
                <div className="text-lg font-semibold text-green-600 mb-2">
                  +91 80123 45678
                </div>
                <div className="text-sm text-gray-500">
                  Mon-Sat: 9AM-7PM
                </div>
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Call Now
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Email Warranty Team</CardTitle>
              <CardDescription>
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  warranty@greenenergy.com
                </div>
                <div className="text-sm text-gray-500">
                  24-48 hour response
                </div>
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Send Email
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Claim Status</CardTitle>
              <CardDescription>
                <div className="text-lg font-semibold text-yellow-600 mb-2">
                  Track Your Claim
                </div>
                <div className="text-sm text-gray-500">
                  Check claim status online
                </div>
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Track Claim
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