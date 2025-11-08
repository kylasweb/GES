'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { Star, Heart, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    description: string;
    shortDesc?: string;
    images: any;
    category?: { name: string };
    brand?: { name: string };
    quantity: number;
    rating?: number;
    reviewCount?: number;
}

interface ProductQuickViewProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
    const { toast } = useToast();
    const cart = useCart();
    const wishlist = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    if (!product) return null;

    const images = Array.isArray(product.images) ? product.images : [];
    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    const handleAddToCart = () => {
        cart.addItem({
            id: product.id,
            name: product.name,
            slug: product.id,
            price: product.price,
            image: images[0] || '/placeholder.jpg',
            category: product.category?.name || 'Uncategorized',
        });

        toast({
            title: 'Added to Cart',
            description: `${product.name} has been added to your cart`,
        });
    };

    const toggleWishlist = () => {
        if (wishlist.isInWishlist(product.id)) {
            wishlist.removeItem(product.id);
            toast({
                title: 'Removed from Wishlist',
                description: `${product.name} has been removed from your wishlist`,
            });
        } else {
            wishlist.addItem({
                id: product.id,
                name: product.name,
                slug: product.id,
                price: product.price,
                comparePrice: product.comparePrice || undefined,
                image: images[0] || '/placeholder.jpg',
                category: product.category?.name || 'Uncategorized',
                inStock: (product as any).stock > 0 || true,
            });
            toast({
                title: 'Added to Wishlist',
                description: `${product.name} has been added to your wishlist`,
            });
        }
    }; return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-4 rounded-full"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="grid md:grid-cols-2 gap-8 pt-6">
                    {/* Images */}
                    <div>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                            {images.length > 0 ? (
                                <Image
                                    src={images[selectedImage] || images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}

                            {discount > 0 && (
                                <Badge className="absolute top-4 left-4 bg-red-500">
                                    -{discount}%
                                </Badge>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === idx
                                            ? 'border-green-600'
                                            : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-4">
                            {product.category && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    {product.category.name}
                                </p>
                            )}
                            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

                            {product.brand && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    by {product.brand.name}
                                </p>
                            )}

                            {product.rating && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.rating || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        ({product.reviewCount || 0} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-green-600">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.comparePrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                        ₹{product.comparePrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Inclusive of all taxes
                            </p>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-gray-700 dark:text-gray-300">
                                {product.shortDesc || product.description}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.quantity > 0 ? (
                                <Badge className="bg-green-500">In Stock ({product.quantity} available)</Badge>
                            ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {product.quantity > 0 && (
                            <div className="mb-6">
                                <Label className="mb-2 block">Quantity</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                        disabled={quantity >= product.quantity}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={product.quantity === 0}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleWishlist}
                                className={wishlist.isInWishlist(product.id) ? 'text-red-600 border-red-600' : ''}
                            >
                                <Heart className={`h-4 w-4 ${wishlist.isInWishlist(product.id) ? 'fill-red-600' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={`text-sm font-medium ${className || ''}`}>{children}</label>;
}
