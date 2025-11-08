'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Eye,
    Check,
    Palette,
    Sparkles,
    Grid3x3,
    Loader2,
    Layout,
    Sun,
    Moon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Template {
    id: string;
    name: string;
    slug: string;
    description: string;
    thumbnail: string;
    isActive: boolean;
    features: string[];
    colorScheme: string;
    tags: string[];
    config: any;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/v1/admin/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load templates',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const activateTemplate = async (templateId: string) => {
        setActivating(templateId);
        try {
            const response = await fetch(`/api/v1/admin/templates/${templateId}/activate`, {
                method: 'POST',
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Template activated successfully',
                });
                // Refresh templates
                await fetchTemplates();
            } else {
                throw new Error('Failed to activate template');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to activate template',
                variant: 'destructive',
            });
        } finally {
            setActivating(null);
        }
    };

    const getColorSchemeIcon = (scheme: string) => {
        if (scheme === 'light') return <Sun className="h-4 w-4" />;
        if (scheme === 'dark') return <Moon className="h-4 w-4" />;
        return <Palette className="h-4 w-4" />;
    };

    const getTagColor = (tag: string) => {
        const colors: Record<string, string> = {
            modern: 'bg-blue-100 text-blue-800',
            clean: 'bg-green-100 text-green-800',
            professional: 'bg-purple-100 text-purple-800',
            'e-commerce': 'bg-orange-100 text-orange-800',
            marketplace: 'bg-red-100 text-red-800',
            categories: 'bg-yellow-100 text-yellow-800',
            elegant: 'bg-pink-100 text-pink-800',
            premium: 'bg-indigo-100 text-indigo-800',
            glassmorphism: 'bg-cyan-100 text-cyan-800',
        };
        return colors[tag] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Layout className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold">Landing Page Templates</h1>
                </div>
                <p className="text-muted-foreground">
                    Choose and activate your landing page design. Changes apply instantly to your homepage.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                        <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{templates.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Template</CardTitle>
                        <Check className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {templates.find(t => t.isActive)?.name || 'None'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Themes</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(templates.map(t => t.colorScheme)).size}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Templates Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card
                        key={template.id}
                        className={`relative overflow-hidden transition-all ${template.isActive
                                ? 'ring-2 ring-green-500 shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                    >
                        {/* Active Badge */}
                        {template.isActive && (
                            <div className="absolute top-4 right-4 z-10">
                                <Badge className="bg-green-500 text-white gap-1">
                                    <Check className="h-3 w-3" />
                                    Active
                                </Badge>
                            </div>
                        )}

                        {/* Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            {template.thumbnail ? (
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Layout className="h-16 w-16 text-gray-400" />
                                </div>
                            )}

                            {/* Color Scheme Overlay */}
                            <div className="absolute bottom-2 left-2">
                                <Badge variant="secondary" className="gap-1 bg-white/90">
                                    {getColorSchemeIcon(template.colorScheme)}
                                    {template.colorScheme}
                                </Badge>
                            </div>
                        </div>

                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{template.name}</span>
                            </CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {template.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className={getTagColor(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Features */}
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Features:</p>
                                <div className="flex flex-wrap gap-1">
                                    {template.features.slice(0, 3).map((feature) => (
                                        <Badge
                                            key={feature}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {feature}
                                        </Badge>
                                    ))}
                                    {template.features.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                            +{template.features.length - 3} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setPreviewTemplate(template)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1"
                                disabled={template.isActive || activating === template.id}
                                onClick={() => activateTemplate(template.id)}
                            >
                                {activating === template.id ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Activating...
                                    </>
                                ) : template.isActive ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Preview Modal */}
            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Layout className="h-5 w-5" />
                            {previewTemplate?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {previewTemplate?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {previewTemplate && (
                        <div className="space-y-4">
                            {/* Thumbnail */}
                            <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                                {previewTemplate.thumbnail ? (
                                    <img
                                        src={previewTemplate.thumbnail}
                                        alt={previewTemplate.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Layout className="h-24 w-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-semibold mb-2">Features</h4>
                                    <ul className="space-y-1">
                                        {previewTemplate.features.map((feature) => (
                                            <li key={feature} className="text-sm flex items-center gap-2">
                                                <Check className="h-3 w-3 text-green-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            {getColorSchemeIcon(previewTemplate.colorScheme)}
                                            <span className="font-medium">Color Scheme:</span>
                                            <span className="capitalize">{previewTemplate.colorScheme}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Tags:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {previewTemplate.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className={getTagColor(tag)}
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewTemplate(null)}
                                >
                                    Close
                                </Button>
                                {!previewTemplate.isActive && (
                                    <Button
                                        onClick={() => {
                                            activateTemplate(previewTemplate.id);
                                            setPreviewTemplate(null);
                                        }}
                                        disabled={activating === previewTemplate.id}
                                    >
                                        {activating === previewTemplate.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Activating...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Activate Template
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
