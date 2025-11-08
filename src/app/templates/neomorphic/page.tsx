'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ShoppingCart,
    Heart,
    User,
    Sun,
    Battery,
    Zap,
    Sparkles,
    ArrowRight,
    Star
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: string[];
    category: { name: string };
}

export default function NeomorphicTemplate() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/v1/products?featured=true&limit=12');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            {/* Neomorphic Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-100/80">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="neo-button-inset w-14 h-14 rounded-2xl flex items-center justify-center">
                                <Sun className="h-7 w-7 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                GES
                            </span>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:block flex-1 max-w-2xl mx-8">
                            <div className="neo-inset rounded-full p-1">
                                <div className="flex items-center px-4 py-2">
                                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Search for eco-friendly products..."
                                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="neo-button w-11 h-11 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow">
                                <Heart className="h-5 w-5 text-gray-600" />
                            </button>
                            <button className="neo-button w-11 h-11 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow relative">
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>
                            <button className="neo-button w-11 h-11 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow">
                                <User className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block">
                            <div className="neo-button px-6 py-2 rounded-full">
                                <span className="text-green-600 font-semibold text-sm">🌿 Sustainable Energy</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Power Your
                            <br />
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                Green Future
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600">
                            Discover premium solar panels and renewable energy solutions with elegant design and superior performance.
                        </p>
                        <div className="flex gap-4">
                            <Button className="neo-button-hover px-8 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold">
                                Explore Products
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button variant="ghost" className="neo-button px-8 py-6 rounded-2xl font-semibold">
                                Learn More
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="neo-card rounded-[3rem] p-8 bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="aspect-square bg-white/50 rounded-3xl flex items-center justify-center">
                                <Sun className="h-32 w-32 text-green-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="absolute -top-6 -right-6 neo-float">
                            <div className="neo-button w-24 h-24 rounded-2xl flex flex-col items-center justify-center">
                                <Sparkles className="h-8 w-8 text-yellow-500 mb-1" />
                                <span className="text-xs font-bold">Premium</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="neo-card rounded-3xl p-8 hover:shadow-2xl transition-shadow">
                        <div className="neo-button-inset w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <Sun className="h-8 w-8 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Solar Panels</h3>
                        <p className="text-gray-600">High-efficiency panels with sleek design and maximum power output.</p>
                    </div>

                    <div className="neo-card rounded-3xl p-8 hover:shadow-2xl transition-shadow">
                        <div className="neo-button-inset w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <Battery className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Energy Storage</h3>
                        <p className="text-gray-600">Advanced battery systems for reliable backup power solutions.</p>
                    </div>

                    <div className="neo-card rounded-3xl p-8 hover:shadow-2xl transition-shadow">
                        <div className="neo-button-inset w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <Zap className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Smart Control</h3>
                        <p className="text-gray-600">Intelligent monitoring and optimization for your energy system.</p>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="container mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
                    <p className="text-xl text-gray-600">Handpicked renewable energy solutions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <Link key={product.id} href={`/products/${product.slug}`}>
                            <div className="neo-card rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                                <div className="neo-inset rounded-2xl mb-4 overflow-hidden aspect-square relative bg-gray-100">
                                    {product.images[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Badge className="neo-button-sm text-xs">{product.category.name}</Badge>
                                    <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium">4.8</span>
                                        </div>
                                        <span className="text-sm text-gray-500">(124)</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</div>
                                            {product.comparePrice && (
                                                <div className="text-sm text-gray-400 line-through">₹{product.comparePrice.toLocaleString()}</div>
                                            )}
                                        </div>
                                        <button className="neo-button-sm w-10 h-10 rounded-xl flex items-center justify-center hover:shadow-lg transition-shadow">
                                            <ShoppingCart className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 py-16">
                <div className="neo-card rounded-[3rem] p-12 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-4xl font-bold">Start Your Green Journey Today</h2>
                        <p className="text-xl text-gray-600">
                            Join thousands of satisfied customers who have switched to renewable energy
                        </p>
                        <Button className="neo-button-hover px-10 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-lg">
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Custom Neomorphic Styles */}
            <style jsx global>{`
        .neo-card {
          background: #e0e5ec;
          box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6),
                     -9px -9px 16px rgba(255, 255, 255, 0.5);
        }

        .neo-button {
          background: #e0e5ec;
          box-shadow: 5px 5px 10px rgba(163, 177, 198, 0.6),
                     -5px -5px 10px rgba(255, 255, 255, 0.5);
        }

        .neo-button-sm {
          background: #e0e5ec;
          box-shadow: 3px 3px 6px rgba(163, 177, 198, 0.6),
                     -3px -3px 6px rgba(255, 255, 255, 0.5);
        }

        .neo-button-inset {
          background: #e0e5ec;
          box-shadow: inset 3px 3px 6px rgba(163, 177, 198, 0.6),
                     inset -3px -3px 6px rgba(255, 255, 255, 0.5);
        }

        .neo-inset {
          background: #e0e5ec;
          box-shadow: inset 5px 5px 10px rgba(163, 177, 198, 0.6),
                     inset -5px -5px 10px rgba(255, 255, 255, 0.5);
        }

        .neo-button-hover:hover {
          box-shadow: 7px 7px 14px rgba(163, 177, 198, 0.6),
                     -7px -7px 14px rgba(255, 255, 255, 0.5);
        }

        .neo-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
}
