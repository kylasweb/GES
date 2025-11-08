'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Clock, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    category: {
        name: string;
        slug: string;
    };
}

interface Deal {
    id: string;
    title: string;
    description: string | null;
    discount: number;
    endDate: string;
    product: Product;
}interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

function CountdownTimer({ endDate }: { endDate: string }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();

            if (difference > 0) {
                return {
                    hours: Math.floor(difference / (1000 * 60 * 60)),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }

            return { hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
}

export function FlashDeals() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const cart = useCart();
    const { toast } = useToast();

    useEffect(() => {
        fetchActiveDeals();
    }, []);

    const fetchActiveDeals = async () => {
        try {
            const response = await fetch('/api/v1/deals/active');
            const data = await response.json();
            setDeals(data);
        } catch (error) {
            console.error('Error fetching flash deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
        return originalPrice - (originalPrice * discount) / 100;
    };

    const handleAddToCart = (deal: Deal) => {
        cart.addItem({
            id: deal.product.id,
            name: deal.product.name,
            slug: deal.product.slug,
            price: calculateDiscountedPrice(deal.product.price, deal.discount),
            image: deal.product.images[0] || '/placeholder.jpg',
            category: deal.product.category.name,
        });

        toast({
            title: 'Added to Cart',
            description: `${deal.product.name} has been added to your cart at the deal price!`,
        });
    }; if (loading) {
        return (
            <div className="py-8">
                <div className="text-center">Loading deals...</div>
            </div>
        );
    }

    if (deals.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Zap className="h-8 w-8 text-orange-600 fill-orange-600" />
                    <div>
                        <h2 className="text-3xl font-bold">Flash Deals</h2>
                        <p className="text-muted-foreground">Limited time offers - Hurry up!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deals.map((deal) => {
                        const discountedPrice = calculateDiscountedPrice(
                            deal.product.price,
                            deal.discount
                        );

                        return (
                            <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <Badge className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700">
                                        {deal.discount}% OFF
                                    </Badge>
                                    <Link href={`/products/${deal.product.slug}`}>
                                        <div className="relative h-48 w-full">
                                            <Image
                                                src={deal.product.images[0] || '/placeholder.jpg'}
                                                alt={deal.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </Link>
                                </div>

                                <CardHeader className="pb-3">
                                    <Link href={`/products/${deal.product.slug}`}>
                                        <CardTitle className="text-base line-clamp-2 hover:text-primary">
                                            {deal.product.name}
                                        </CardTitle>
                                    </Link>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {/* Price */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-green-600">
                                            ₹{discountedPrice.toFixed(2)}
                                        </span>
                                        <span className="text-sm line-through text-muted-foreground">
                                            ₹{deal.product.price.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Countdown */}
                                    <div className="bg-orange-100 dark:bg-orange-900/20 rounded-md p-2">
                                        <CountdownTimer endDate={deal.endDate} />
                                    </div>

                                    {/* Description */}
                                    {deal.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {deal.description}
                                        </div>
                                    )}

                                    {/* Add to Cart Button */}
                                    <Button
                                        className="w-full"
                                        onClick={() => handleAddToCart(deal)}
                                        disabled={deal.product.stock === 0}
                                    >
                                        {deal.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}