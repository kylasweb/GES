import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HeadphonesIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Green Energy Solutions',
  description: 'Get in touch with Green Energy Solutions. Find our contact information, office locations, and reach out for any inquiries.',
};

export default function ContactPage() {
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
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
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
              📞 Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              We're Here to Help
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions about our products or services? Our team of green energy experts is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Call Us</CardTitle>
              <CardDescription className="text-lg">
                <div className="mb-2">Customer Support:</div>
                <a href="tel:+918012345678" className="text-green-600 hover:text-green-700 font-semibold">
                  +91 80123 45678
                </a>
                <div className="mt-2 text-sm text-gray-500">
                  Mon-Sat: 9AM-7PM
                </div>
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Email Us</CardTitle>
              <CardDescription className="text-lg">
                <div className="mb-2">General Inquiries:</div>
                <a href="mailto:info@greenenergy.com" className="text-green-600 hover:text-green-700 font-semibold">
                  info@greenenergy.com
                </a>
                <div className="mt-2 text-sm text-gray-500">
                  24-48 hour response time
                </div>
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Visit Us</CardTitle>
              <CardDescription className="text-lg">
                <div className="mb-2">Head Office:</div>
                <div className="text-green-600 hover:text-green-700 font-semibold">
                  Bangalore, Karnataka
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  By appointment only
                </div>
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <Card className="p-6">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="warranty">Warranty Claim</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

            {/* Office Locations */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Office Locations</h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <CardTitle className="text-lg mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Head Office - Bangalore
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div>123, Green Energy Park,</div>
                    <div>Electronic City Phase 1,</div>
                    <div>Bangalore - 560100,</div>
                    <div>Karnataka, India</div>
                    <div className="pt-2">
                      <strong>Phone:</strong> +91 80123 45678
                    </div>
                    <div>
                      <strong>Email:</strong> bangalore@greenenergy.com
                    </div>
                  </CardDescription>
                </Card>

                <Card className="p-6">
                  <CardTitle className="text-lg mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Regional Office - Mumbai
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div>456, Solar Tower,</div>
                    <div>Andheri West,</div>
                    <div>Mumbai - 400053,</div>
                    <div>Maharashtra, India</div>
                    <div className="pt-2">
                      <strong>Phone:</strong> +91 22123 45678
                    </div>
                    <div>
                      <strong>Email:</strong> mumbai@greenenergy.com
                    </div>
                  </CardDescription>
                </Card>

                <Card className="p-6">
                  <CardTitle className="text-lg mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Regional Office - Delhi
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div>789, Renewable Plaza,</div>
                    <div>Connaught Place,</div>
                    <div>New Delhi - 110001,</div>
                    <div>Delhi, India</div>
                    <div className="pt-2">
                      <strong>Phone:</strong> +91 11234 56789
                    </div>
                    <div>
                      <strong>Email:</strong> delhi@greenenergy.com
                    </div>
                  </CardDescription>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Other Ways to Reach Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the support option that works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Live Chat</CardTitle>
              <CardDescription>
                Chat with our support team in real-time for quick answers to your questions.
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Start Chat
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Schedule a Call</CardTitle>
              <CardDescription>
                Book a consultation with our experts to discuss your energy needs in detail.
              </CardDescription>
              <Button variant="outline" className="mt-4 w-full">
                Schedule Call
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Business Hours</CardTitle>
              <CardDescription>
                <div className="space-y-1">
                  <div><strong>Monday - Saturday:</strong> 9AM - 7PM</div>
                  <div><strong>Sunday:</strong> 10AM - 4PM</div>
                  <div><strong>Support:</strong> 24/7 Emergency</div>
                </div>
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Have a Quick Question?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Check out our FAQ section for instant answers to common questions about our products and services.
          </p>
          <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
            View FAQ
          </Button>
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