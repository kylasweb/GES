'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin/sidebar';
import {
    Loader2,
    Layout,
    Menu,
    Columns,
    Check,
    Eye,
    Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SiteSettings {
    id: string;
    headerStyle: string;
    footerStyle: string;
    menuStyle: string;
}

const headerStyles = [
    {
        value: 'default',
        name: 'Default Header',
        description: 'Classic header with logo, navigation, and CTA buttons',
        preview: '/previews/header-default.png',
        features: ['Logo left', 'Center navigation', 'Right CTA buttons', 'Sticky on scroll']
    },
    {
        value: 'minimal',
        name: 'Minimal Header',
        description: 'Clean and minimal design with focused content',
        preview: '/previews/header-minimal.png',
        features: ['Compact design', 'Simple navigation', 'Minimal clutter', 'Fast loading']
    },
    {
        value: 'centered',
        name: 'Centered Header',
        description: 'Centered logo with balanced navigation on both sides',
        preview: '/previews/header-centered.png',
        features: ['Center logo', 'Balanced layout', 'Elegant design', 'Professional look']
    },
    {
        value: 'transparent',
        name: 'Transparent Header',
        description: 'Overlay header that blends with hero section',
        preview: '/previews/header-transparent.png',
        features: ['Transparent background', 'Overlay effect', 'Modern design', 'Hero integration']
    },
    {
        value: 'mega',
        name: 'Mega Menu Header',
        description: 'Full-width dropdown menus with rich content',
        preview: '/previews/header-mega.png',
        features: ['Large dropdowns', 'Rich content', 'Product showcase', 'Category display']
    }
];

const footerStyles = [
    {
        value: 'default',
        name: 'Default Footer',
        description: 'Multi-column footer with links, contact, and social',
        preview: '/previews/footer-default.png',
        features: ['4 columns', 'Links organized', 'Contact info', 'Social media']
    },
    {
        value: 'minimal',
        name: 'Minimal Footer',
        description: 'Simple single-row footer with essential links',
        preview: '/previews/footer-minimal.png',
        features: ['Single row', 'Essential links', 'Compact design', 'Clean look']
    },
    {
        value: 'newsletter',
        name: 'Newsletter Footer',
        description: 'Prominent newsletter signup with multi-column links',
        preview: '/previews/footer-newsletter.png',
        features: ['Newsletter signup', 'Email collection', 'Multi-column', 'Marketing focused']
    },
    {
        value: 'social',
        name: 'Social Footer',
        description: 'Social media focused with large icons and feeds',
        preview: '/previews/footer-social.png',
        features: ['Large social icons', 'Social feeds', 'Community focus', 'Engagement driven']
    }
];

const menuStyles = [
    {
        value: 'default',
        name: 'Default Menu',
        description: 'Horizontal navigation bar with simple dropdowns',
        preview: '/previews/menu-default.png',
        features: ['Horizontal layout', 'Simple dropdowns', 'Clean design', 'Easy navigation']
    },
    {
        value: 'dropdown',
        name: 'Dropdown Menu',
        description: 'Enhanced dropdown menus with icons and descriptions',
        preview: '/previews/menu-dropdown.png',
        features: ['Rich dropdowns', 'Icons included', 'Descriptions', 'Visual hierarchy']
    },
    {
        value: 'mega',
        name: 'Mega Menu',
        description: 'Full-width mega menus with categories and images',
        preview: '/previews/menu-mega.png',
        features: ['Full-width panels', 'Category groups', 'Product images', 'Rich content']
    },
    {
        value: 'sidebar',
        name: 'Sidebar Menu',
        description: 'Collapsible sidebar navigation for mobile-first design',
        preview: '/previews/menu-sidebar.png',
        features: ['Sidebar panel', 'Mobile optimized', 'Collapsible', 'Touch friendly']
    }
];

export default function AppearancePage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/v1/admin/appearance');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load appearance settings',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStyle = async (type: 'header' | 'footer' | 'menu', value: string) => {
        setSaving(true);
        try {
            const response = await fetch('/api/v1/admin/appearance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [`${type}Style`]: value
                })
            });

            if (response.ok) {
                const updated = await response.json();
                setSettings(updated);
                toast({
                    title: 'Success',
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} style updated`,
                });
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update style',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const StyleCard = ({
        style,
        currentValue,
        onSelect,
        type
    }: {
        style: any;
        currentValue: string;
        onSelect: (value: string) => void;
        type: string;
    }) => {
        const isActive = currentValue === style.value;

        return (
            <Card className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-md'
                }`}>
                {isActive && (
                    <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-green-500 text-white gap-1">
                            <Check className="h-3 w-3" />
                            Active
                        </Badge>
                    </div>
                )}

                <CardHeader>
                    <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3">
                        <Layout className="h-12 w-12 text-gray-400" />
                        <div className="absolute bottom-2 right-2">
                            <Badge variant="secondary">{style.value}</Badge>
                        </div>
                    </div>
                    <CardTitle className="text-lg">{style.name}</CardTitle>
                    <CardDescription>{style.description}</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Features:</p>
                            <div className="grid grid-cols-2 gap-1">
                                {style.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1 text-xs">
                                        <Check className="h-3 w-3 text-green-600" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1"
                                disabled={isActive || saving}
                                onClick={() => onSelect(style.value)}
                            >
                                {isActive ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Active
                                    </>
                                ) : (
                                    <>
                                        Select
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-bold">Appearance Settings</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Customize the look and feel of your website header, footer, and navigation menu
                        </p>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="header" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="header" className="gap-2">
                                <Layout className="h-4 w-4" />
                                Header Styles
                            </TabsTrigger>
                            <TabsTrigger value="footer" className="gap-2">
                                <Columns className="h-4 w-4" />
                                Footer Styles
                            </TabsTrigger>
                            <TabsTrigger value="menu" className="gap-2">
                                <Menu className="h-4 w-4" />
                                Menu Styles
                            </TabsTrigger>
                        </TabsList>

                        {/* Header Styles */}
                        <TabsContent value="header" className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Header Styles</h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose a header style that best represents your brand
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {headerStyles.map((style) => (
                                    <StyleCard
                                        key={style.value}
                                        style={style}
                                        currentValue={settings?.headerStyle || 'default'}
                                        onSelect={(value) => updateStyle('header', value)}
                                        type="header"
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        {/* Footer Styles */}
                        <TabsContent value="footer" className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Footer Styles</h2>
                                <p className="text-sm text-muted-foreground">
                                    Select a footer layout that provides the right information
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {footerStyles.map((style) => (
                                    <StyleCard
                                        key={style.value}
                                        style={style}
                                        currentValue={settings?.footerStyle || 'default'}
                                        onSelect={(value) => updateStyle('footer', value)}
                                        type="footer"
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        {/* Menu Styles */}
                        <TabsContent value="menu" className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Menu Styles</h2>
                                <p className="text-sm text-muted-foreground">
                                    Pick a navigation menu style for optimal user experience
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {menuStyles.map((style) => (
                                    <StyleCard
                                        key={style.value}
                                        style={style}
                                        currentValue={settings?.menuStyle || 'default'}
                                        onSelect={(value) => updateStyle('menu', value)}
                                        type="menu"
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
