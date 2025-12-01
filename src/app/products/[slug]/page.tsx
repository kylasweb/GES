import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SocialShare } from '@/components/social-share';
import {
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Check,
    Truck,
    Shield,
    RotateCcw,
    Zap,
    Tag,
    Package,
    Ruler,
    Weight,
    ChevronRight,
    Home
} from 'lucide-react';

interface PageProps {
    params: {
        slug: string;
    };
}

async function getProduct(slug: string) {
    const product = await db.product.findUnique({
        where: { slug, isActive: true },
        include: {
            category: true,
            brand: true,
            inventory: true,
            reviews: {
                where: { isActive: true },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            variations: {
                where: { isActive: true },
            },
        },
    });

    return product;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const images = Array.isArray(product.images) ? product.images : [];

    return {
        title: product.seoTitle || `${product.name} | Green Energy Solutions`,
        description: product.seoDesc || product.shortDesc || product.description,
        openGraph: {
            title: product.name,
            description: product.shortDesc || product.description,
        },
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const images = Array.isArray(product.images) ? product.images.filter(img => typeof img === 'string') as string[] : [];
    const videos = Array.isArray(product.videos) ? product.videos : [];
    const tags = Array.isArray(product.tags) ? product.tags.filter(tag => typeof tag === 'string') as string[] : [];
    const customFields = product.customFields as Record<string, any> || {};
    const specifications = product.specifications as Record<string, any> || {};
    const dimensions = product.dimensions as Record<string, any> || {};

    const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;

    const discount = product.comparePrice
        ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
        : 0;

    const inStock = product.inventory ? product.inventory.quantity > 0 : product.quantity > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
                            <Home className="w-4 h-4" />
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href="/products" className="text-gray-600 hover:text-gray-900">
                            Products
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link
                            href={`/products/${product.category.slug}`}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            {product.category.name}
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-lg overflow-hidden border">
                            {images.length > 0 ? (
                                <img
                                    src={images[0] || ''}
                                    alt={product.name}
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="w-24 h-24" />
                                </div>
                            )}
                            {discount > 0 && (
                                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                                    {discount}% OFF
                                </Badge>
                            )}
                            {!inStock && (
                                <Badge className="absolute top-4 right-4 bg-gray-500 text-white">
                                    Out of Stock
                                </Badge>
                            )}
                        </div>

                        {/* Thumbnail Grid */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((img, idx) => (
                                    typeof img === 'string' ? (
                                        <div
                                            key={idx}
                                            className="relative aspect-square bg-white rounded-lg overflow-hidden border hover:border-green-600 cursor-pointer"
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${idx + 1}`}
                                                className="object-contain w-full h-full"
                                            />
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Title & Category */}
                        <div>
                            <Badge variant="secondary" className="mb-2">
                                {product.category.name}
                            </Badge>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            {product.brand && (
                                <p className="text-gray-600">
                                    Brand: <span className="font-medium">{product.brand.name}</span>
                                </p>
                            )}
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>

                        {/* Rating */}
                        {product.reviews.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(averageRating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-600">
                                    ({product.reviews.length} reviews)
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-green-600">
                                    ₹{Number(product.price).toLocaleString('en-IN')}
                                </span>
                                {product.comparePrice && (
                                    <span className="text-xl text-gray-500 line-through">
                                        ₹{Number(product.comparePrice).toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
                        </div>

                        {/* Short Description */}
                        {product.shortDesc && (
                            <p className="text-gray-700 leading-relaxed">{product.shortDesc}</p>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            {inStock ? (
                                <>
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-600 font-medium">In Stock</span>
                                    <span className="text-gray-600">
                                        ({product.inventory?.quantity || product.quantity} available)
                                    </span>
                                </>
                            ) : (
                                <span className="text-red-600 font-medium">Out of Stock</span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button size="lg" className="flex-1" disabled={!inStock}>
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart
                            </Button>
                            <Button size="lg" variant="outline">
                                <Heart className="w-5 h-5 mr-2" />
                                Wishlist
                            </Button>
                            <SocialShare
                                url={`${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`}
                                title={product.name}
                                description={product.shortDesc || ''}
                                image={images[0] ? images[0] : ''}
                            />
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="flex items-center space-x-2 text-sm">
                                <Truck className="w-5 h-5 text-green-600" />
                                <span>Free Shipping</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Shield className="w-5 h-5 text-green-600" />
                                <span>Warranty Included</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <RotateCcw className="w-5 h-5 text-green-600" />
                                <span>Easy Returns</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Zap className="w-5 h-5 text-green-600" />
                                <span>Fast Delivery</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {tags.map((tag, idx) => (
                                    typeof tag === 'string' ? (
                                        <Badge key={idx} variant="outline">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ) : null
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details Tabs */}
                <Tabs defaultValue="description" className="mb-12">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="specifications">Specifications</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
                        <TabsTrigger value="additional">Additional Info</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Description</CardTitle>
                            </CardHeader>
                            <CardContent className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </p>

                                {/* Videos */}
                                {videos.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Product Videos</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {videos.map((video: any, idx: number) => (
                                                <div key={idx} className="aspect-video bg-gray-100 rounded-lg">
                                                    {/* Video embed would go here */}
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        Video: {video.title || `Video ${idx + 1}`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="specifications" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Technical Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Physical Dimensions */}
                                    {(dimensions.length || dimensions.width || dimensions.height) && (
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <Ruler className="w-4 h-4 mr-2" />
                                                Dimensions
                                            </h4>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {dimensions.length && (
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="text-sm text-gray-600">Length</span>
                                                        <p className="font-medium">{dimensions.length} cm</p>
                                                    </div>
                                                )}
                                                {dimensions.width && (
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="text-sm text-gray-600">Width</span>
                                                        <p className="font-medium">{dimensions.width} cm</p>
                                                    </div>
                                                )}
                                                {dimensions.height && (
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <span className="text-sm text-gray-600">Height</span>
                                                        <p className="font-medium">{dimensions.height} cm</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Weight */}
                                    {product.weight && (
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <Weight className="w-4 h-4 mr-2" />
                                                Weight
                                            </h4>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="font-medium">{Number(product.weight)} kg</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Specifications from JSON */}
                                    {Object.keys(specifications).length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Detailed Specifications</h4>
                                            <div className="space-y-2">
                                                {Object.entries(specifications).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex justify-between py-2 border-b last:border-0"
                                                    >
                                                        <span className="text-gray-600 capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="font-medium">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Reviews</CardTitle>
                                <CardDescription>
                                    {product.reviews.length > 0
                                        ? `${product.reviews.length} review(s) - Average rating: ${averageRating.toFixed(1)}/5`
                                        : 'No reviews yet'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {product.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {product.reviews.map((review) => (
                                            <div key={review.id} className="border-b pb-4 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold">{review.user.name}</p>
                                                        <div className="flex items-center space-x-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{review.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Be the first to review this product
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="additional" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Custom Fields */}
                                    {Object.keys(customFields).length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Custom Fields</h4>
                                            <div className="space-y-2">
                                                {Object.entries(customFields).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex justify-between py-2 border-b last:border-0"
                                                    >
                                                        <span className="text-gray-600 capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="font-medium">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Type */}
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Product Type</span>
                                        <Badge variant="outline">{product.type}</Badge>
                                    </div>

                                    {/* Availability */}
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Availability</span>
                                        <span className="font-medium">
                                            {inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>

                                    {/* Created Date */}
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Listed Date</span>
                                        <span className="font-medium">
                                            {new Date(product.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
