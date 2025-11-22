'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Battery,
  Sun,
  Zap,
  Leaf,
  Shield,
  Star,
  ArrowRight,
  ShoppingCart,
  Users,
  CheckCircle,
  Play,
  BarChart3,
  Lightbulb,
  Wind,
  Droplets,
  Heart,
  Globe,
  Sparkles,
  Award
} from 'lucide-react';
import Link from 'next/link';

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero section animation
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-element');
      if (heroElements && heroElements.length > 0) {
        animate(Array.from(heroElements), {
          translateX: [40, 0],
          opacity: [0, 1],
          delay: stagger(100),
          duration: 1200,
          easing: 'easeOutExpo'
        });
      }

      const heroButtons = heroRef.current.querySelector('.hero-buttons');
      if (heroButtons) {
        animate(heroButtons as HTMLElement, {
          translateY: [20, 0],
          opacity: [0, 1],
          delay: 600,
          duration: 800,
          easing: 'easeOutExpo'
        });
      }
    }

    // Features section animation
    if (featuresRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
            if (featureCards && featureCards.length > 0) {
              animate(Array.from(featureCards), {
                translateY: [50, 0],
                opacity: [0, 1],
                delay: stagger(150),
                duration: 1000,
                easing: 'easeOutQuart'
              });
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(featuresRef.current);
      return () => observer.disconnect();
    }

    // Stats section animation
    if (statsRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const statItems = statsRef.current?.querySelectorAll('.stat-item');
            if (statItems && statItems.length > 0) {
              animate(Array.from(statItems), {
                scale: [0.8, 1],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 800,
                easing: 'spring(1, 80, 10, 0)'
              });
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(statsRef.current);
      return () => observer.disconnect();
    }

    // Testimonials section animation
    if (testimonialsRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const testimonialCard = testimonialsRef.current?.querySelector('.testimonial-card');
            if (testimonialCard) {
              animate(testimonialCard as HTMLElement, {
                translateX: [40, 0],
                opacity: [0, 1],
                duration: 1000,
                easing: 'easeOutQuart'
              });
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(testimonialsRef.current);
      return () => observer.disconnect();
    }

    // Products section animation
    if (productsRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const productCards = productsRef.current?.querySelectorAll('.product-card');
            if (productCards && productCards.length > 0) {
              animate(Array.from(productCards), {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 800,
                easing: 'easeOutQuart'
              });
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(productsRef.current);
      return () => observer.disconnect();
    }

    // CTA section animation
    if (ctaRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const ctaElements = ctaRef.current?.querySelectorAll('.cta-element');
            if (ctaElements && ctaElements.length > 0) {
              animate(Array.from(ctaElements), {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(150),
                duration: 1000,
                easing: 'easeOutQuart'
              });
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(ctaRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const features = [
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
  ];

  const stats = [
    { number: "500+", label: "Happy Customers", icon: Users },
    { number: "50+", label: "Products", icon: Battery },
    { number: "5 Years", label: "Warranty", icon: Shield },
    { number: "24/7", label: "Support", icon: Heart }
  ];

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

  const products = [
    {
      id: "1",
      name: "Solar Charge Controller 20A",
      slug: "solar-charge-controller-20a",
      shortDesc: "Efficient PWM charge controller for solar panels",
      price: 1800,
      comparePrice: 2200,
      images: ["https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop"],
      featured: true,
      category: {
        name: "Accessories",
        slug: "accessories"
      }
    },
    {
      id: "2",
      name: "12V 100Ah Solar Battery",
      slug: "12v-100ah-solar-battery",
      shortDesc: "High-capacity deep cycle battery for solar systems",
      price: 8500,
      comparePrice: 10500,
      images: ["https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=400&fit=crop"],
      featured: true,
      category: {
        name: "Batteries",
        slug: "batteries"
      }
    },
    {
      id: "3",
      name: "300W Monocrystalline Solar Panel",
      slug: "300w-monocrystalline-solar-panel",
      shortDesc: "High-efficiency solar panel with 25-year warranty",
      price: 12500,
      comparePrice: 15000,
      images: ["https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=400&fit=crop"],
      featured: true,
      category: {
        name: "Solar Panels",
        slug: "solar-panels"
      }
    },
    {
      id: "4",
      name: "Hybrid Inverter 5kW",
      slug: "hybrid-inverter-5kw",
      shortDesc: "Smart inverter with battery management system",
      price: 45000,
      comparePrice: 52000,
      images: ["https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=400&fit=crop"],
      featured: true,
      category: {
        name: "Accessories",
        slug: "accessories"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-900 dark:to-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 dark:opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 dark:opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 dark:opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-32 overflow-hidden">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div className="hero-element inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 px-4 py-2 rounded-full border border-green-200 dark:border-green-700">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-medium">🌱 Sustainable Energy Solutions</span>
                </div>

                <h1 className="hero-element text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    Power Your Future
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-gray-100">with Green Energy Solutions</span>
                </h1>

                <p className="hero-element text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Discover our premium range of eco-friendly batteries and solar panels designed for a sustainable tomorrow.
                </p>

                <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="#products">
                    <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                      <ShoppingCart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                      Shop Products
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#about">
                    <Button variant="outline" size="lg" className="border-2 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-300 dark:text-gray-200 transition-all duration-300 hover:scale-105 group">
                      <Play className="mr-2 h-5 w-5 group-hover:scale-110" />
                      Learn More
                    </Button>
                  </Link>
                </div>

                <div className="hero-element flex items-center justify-center lg:justify-start space-x-8 pt-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 dark:text-yellow-300 fill-current" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">500+ Happy Customers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Award Winning</span>
                  </div>
                </div>
              </div>

              <div className="relative hero-element">
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
      <section ref={statsRef} className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 dark:from-green-800 dark:via-emerald-800 dark:to-cyan-800"></div>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="container px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item group">
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-yellow-300 dark:text-yellow-200 group-hover:animate-bounce" />
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-green-100 dark:text-green-200 text-lg">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
              <Lightbulb className="h-4 w-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Why Choose Green Energy Solutions?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide cutting-edge renewable energy solutions with unmatched quality and service for a sustainable future.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 dark:text-gray-100 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="flex flex-wrap justify-center gap-2">
                    {feature.features.map((feat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-200">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500 dark:text-green-400" />
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
      <section ref={testimonialsRef} className="py-20 bg-gradient-to-br from-emerald-50 to-cyan-50">
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
              <div className="testimonial-card bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <div className="flex items-center mb-6">
                  <div className="text-6xl mr-4">👨‍💼</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Rajesh Kumar</h3>
                    <p className="text-gray-600">Homeowner</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                  &quot;Green Energy Solutions transformed my home with solar panels. I&apos;m saving 70% on my electricity bills!&quot;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" ref={productsRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Featured Products
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Best Selling Products
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore our top-rated products that are making a difference in the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="product-card overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group bg-white dark:bg-gray-800">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">{product.category.name}</div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                      {product.comparePrice && (
                        <span className="text-sm text-gray-500 line-through">₹{product.comparePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gradient-to-br from-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="container px-4 relative z-10 text-center">
          <div className="cta-element mb-8">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Switch to Green Energy?</h2>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Join thousands of satisfied customers who are making a positive impact on the environment while saving money.
            </p>
          </div>
          <div className="cta-element flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-green-900 hover:bg-green-50 text-lg px-8 py-6">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}