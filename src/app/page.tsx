'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { 
  Battery, 
  Sun, 
  Zap, 
  Leaf, 
  Shield, 
  TrendingUp,
  Star,
  ArrowRight,
  ShoppingCart,
  User,
  LogOut,
  Sparkles,
  Globe,
  Award,
  Users,
  CheckCircle,
  Play,
  BarChart3,
  Lightbulb,
  Wind,
  Droplets,
  Heart
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  featured: boolean;
  category: {
    name: string;
    slug: string;
  };
}

interface ContentBlock {
  id: string;
  type: string;
  title?: string;
  content: any;
  order: number;
  isActive: boolean;
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const productsResponse = await fetch('/api/v1/products?featured=true&limit=8');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products || []);
        }

        // Fetch content blocks for landing page
        const contentResponse = await fetch('/api/v1/content/landing');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setContentBlocks(contentData.contentBlocks || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const heroContent = contentBlocks.find(block => block.type === 'HERO_BANNER');
  const featuredProductsContent = contentBlocks.find(block => block.type === 'FEATURED_PRODUCTS');
  const testimonialsContent = contentBlocks.find(block => block.type === 'TESTIMONIALS');

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Homeowner",
      content: "Green Energy Solutions transformed my home with solar panels. I'm saving 70% on my electricity bills!",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Priya Sharma",
      role: "Business Owner",
      content: "Excellent service and quality products. The team helped us choose the perfect solar solution for our office.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Amit Patel",
      role: "Engineer",
      content: "The battery backup system is incredible. Power outages are no longer a concern for our family.",
      rating: 5,
      avatar: "👨‍🔧"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
      
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">🌱 Sustainable Energy Solutions</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                    Power Your Future
                  </span>
                  <br />
                  <span className="text-gray-900">with Green Energy</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {heroContent?.content?.subtext || 
                    "Discover our premium range of eco-friendly batteries and solar panels designed for a sustainable tomorrow."}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="#products">
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                      <ShoppingCart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                      Shop Products
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#about">
                    <Button variant="outline" size="lg" className="border-2 border-green-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all duration-300 hover:scale-105 group">
                      <Play className="mr-2 h-5 w-5 group-hover:scale-110" />
                      Learn More
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-gray-700 font-medium">4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 font-medium">500+ Happy Customers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                    <span className="text-gray-700 font-medium">Award Winning</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <div className="aspect-square bg-gradient-to-br from-green-200 to-emerald-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Sun className="h-32 w-32 text-yellow-500 animate-pulse" />
                        <div className="flex space-x-2 justify-center">
                          <Battery className="h-16 w-16 text-green-600 animate-bounce" />
                          <Zap className="h-16 w-16 text-blue-600 animate-pulse" />
                          <Leaf className="h-16 w-16 text-emerald-600 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-60 animate-pulse animation-delay-2000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "500+", label: "Happy Customers", icon: Users },
              { number: "50+", label: "Products", icon: Battery },
              { number: "5 Years", label: "Warranty", icon: Shield },
              { number: "24/7", label: "Support", icon: Heart }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-yellow-300 group-hover:animate-bounce" />
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-green-100 text-lg">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
              <Lightbulb className="h-4 w-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Why Choose Green Energy Solutions?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide cutting-edge renewable energy solutions with unmatched quality and service for a sustainable future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Battery,
                title: "Premium Batteries",
                description: "High-capacity, long-lasting batteries with advanced technology for all your energy storage needs.",
                gradient: "from-green-400 to-emerald-500",
                features: ["Long Life", "Fast Charging", "Eco-Friendly"]
              },
              {
                icon: Sun,
                title: "Solar Panels",
                description: "Efficient solar panels that harness the power of the sun to reduce your carbon footprint.",
                gradient: "from-yellow-400 to-orange-500",
                features: ["High Efficiency", "Weather Proof", "Easy Install"]
              },
              {
                icon: Shield,
                title: "Warranty & Support",
                description: "Comprehensive warranty and dedicated support to ensure your peace of mind.",
                gradient: "from-blue-400 to-cyan-500",
                features: ["5 Year Warranty", "24/7 Support", "Expert Team"]
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    {feature.features.map((feat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        {feat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 border-emerald-200">
              <Heart className="h-4 w-4 mr-2" />
              Customer Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                What Our Customers Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real customers who have transformed their lives with green energy
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <div className="flex items-center mb-6">
                  <div className="text-6xl mr-4">{testimonials[currentTestimonial].avatar}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{testimonials[currentTestimonial].name}</h3>
                    <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>
              
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 w-8' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
              <Sparkles className="h-4 w-4 mr-2" />
              Featured Products
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {featuredProductsContent?.title || "Featured Products"}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular green energy solutions
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-200 opacity-50"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {product.category.name === 'Batteries' && <Battery className="h-24 w-24 text-green-600" />}
                      {product.category.name === 'Solar Panels' && <Sun className="h-24 w-24 text-yellow-500" />}
                      {product.category.name === 'Accessories' && <Zap className="h-24 w-24 text-blue-600" />}
                    </div>
                    {product.comparePrice && (
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                        -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                      {product.category.name}
                    </Badge>
                    <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-4">
                      {product.shortDesc}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white group-hover:scale-110 transition-transform">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Globe className="h-4 w-4 mr-2" />
              Join the Green Revolution
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Start your journey towards sustainable energy today and be part of the solution for a cleaner tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-green-600 transition-all duration-300">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
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
                <li><Link href="/products/batteries" className="hover:text-white transition-colors">Batteries</Link></li>
                <li><Link href="/products/solar-panels" className="hover:text-white transition-colors">Solar Panels</Link></li>
                <li><Link href="/products/accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/warranty" className="hover:text-white transition-colors">Warranty</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Green Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}