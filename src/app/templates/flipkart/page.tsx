'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChevronRight,
    Star,
    ShoppingCart,
    Zap,
    TrendingUp,
    Gift,
    Truck,
    Shield,
    Tag
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: string[];
    category: { name: string };
    rating?: number;
    reviews?: number;
}

interface Deal {
    id: string;
    name: string;
    discount: number;
    productId: string;
}

export default function FlipkartTemplate() {
    const [products, setProducts] = useState<Product[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, dealsRes] = await Promise.all([
                    fetch('/api/v1/products?featured=true&limit=20'),
                    fetch('/api/v1/deals/active')
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data.products || []);
                }

                if (dealsRes.ok) {
                    const data = await dealsRes.json();
                    setDeals(data.deals || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const categories = [
        { name: 'Solar Panels', icon: '☀️', color: 'bg-yellow-500', href: '/products/solar-panels' },
        { name: 'Batteries', icon: '🔋', color: 'bg-blue-500', href: '/products/batteries' },
        { name: 'Accessories', icon: '⚡', color: 'bg-green-500', href: '/products/accessories' },
        { name: 'Deals', icon: '🔥', color: 'bg-red-500', href: '/products?deals=true' },
        { name: 'Best Sellers', icon: '⭐', color: 'bg-purple-500', href: '/products?sort=popular' },
        { name: 'New Arrivals', icon: '✨', color: 'bg-pink-500', href: '/products?sort=newest' },
    ];

    const banners = [
        {
            title: 'Mega Solar Sale',
            subtitle: 'Up to 50% OFF on Solar Panels',
            color: 'from-yellow-400 to-orange-500',
            image: '/banners/solar-sale.jpg'
        },
        {
            title: 'Battery Bonanza',
            subtitle: 'Extra 30% OFF on all Batteries',
            color: 'from-blue-400 to-cyan-500',
            image: '/banners/battery-sale.jpg'
        },
        {
            title: 'Green Friday Deals',
            subtitle: 'Massive discounts on everything',
            color: 'from-green-400 to-emerald-500',
            image: '/banners/green-friday.jpg'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header - Deals Banner */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                        <Zap className="h-4 w-4 animate-pulse" />
                        <span>FLASH SALE: Extra 20% OFF on Solar Products | Code: SOLAR20</span>
                        <Zap className="h-4 w-4 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Categories Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-3 overflow-x-auto">
                        {categories.map((cat, index) => (
                            <Link
                                key={index}
                                href={cat.href}
                                className="flex flex-col items-center min-w-[80px] hover:opacity-75 transition-opacity"
                            >
                                <div className={`${cat.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1`}>
                                    {cat.icon}
                                </div>
                                <span className="text-xs font-medium text-center">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Banners */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {banners.map((banner, index) => (
                        <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                            <div className={`bg-gradient-to-br ${banner.color} p-6 h-40 flex flex-col justify-between text-white`}>
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
                                    <p className="text-sm opacity-90">{banner.subtitle}</p>
                                </div>
                                <Button variant="secondary" size="sm" className="w-fit">
                                    Shop Now <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Features Bar */}
            <div className="bg-white border-y">
                <div className="container mx-auto px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <Truck className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="font-semibold text-sm">Free Delivery</p>
                                <p className="text-xs text-gray-600">On orders above ₹1000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="font-semibold text-sm">2 Year Warranty</p>
                                <p className="text-xs text-gray-600">On all products</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Gift className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="font-semibold text-sm">Gift Vouchers</p>
                                <p className="text-xs text-gray-600">Available now</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tag className="h-8 w-8 text-red-600" />
                            <div>
                                <p className="font-semibold text-sm">Best Prices</p>
                                <p className="text-xs text-gray-600">Guaranteed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Deals Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Top Deals
                    </h2>
                    <Link href="/products?deals=true">
                        <Button variant="link" className="text-blue-600">
                            View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {products.slice(0, 6).map((product) => (
                        <Link key={product.id} href={`/products/${product.slug}`}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="aspect-square relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
                                        {product.images[0] && (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                        {product.comparePrice && (
                                            <Badge className="absolute top-2 left-2 bg-red-500">
                                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-green-600 font-bold">₹{product.price.toLocaleString()}</span>
                                        {product.comparePrice && (
                                            <span className="text-gray-400 text-sm line-through">₹{product.comparePrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{product.rating || 4.5}</span>
                                        <span className="text-gray-500">({product.reviews || 128})</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Trending Products Section */}
            <div className="bg-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-green-500" />
                            Trending Now
                        </h2>
                        <Link href="/products">
                            <Button variant="link" className="text-blue-600">
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.slice(6, 16).map((product) => (
                            <Link key={product.id} href={`/products/${product.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardContent className="p-3">
                                        <div className="aspect-square relative mb-2 bg-gray-100 rounded-lg overflow-hidden">
                                            {product.images[0] && (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                                        <div className="text-green-600 font-bold text-sm">₹{product.price.toLocaleString()}</div>
                                        <Badge variant="secondary" className="mt-2 text-xs">{product.category.name}</Badge>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 h-48 flex flex-col justify-between">
                            <h3 className="text-2xl font-bold text-white">Solar Panels</h3>
                            <Button variant="secondary" size="sm" className="w-fit">
                                Explore <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </Card>
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-8 h-48 flex flex-col justify-between">
                            <h3 className="text-2xl font-bold text-white">Batteries</h3>
                            <Button variant="secondary" size="sm" className="w-fit">
                                Explore <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </Card>
                    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-8 h-48 flex flex-col justify-between">
                            <h3 className="text-2xl font-bold text-white">Accessories</h3>
                            <Button variant="secondary" size="sm" className="w-fit">
                                Explore <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
