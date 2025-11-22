'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Flag,
    Search,
    AlertCircle,
    CheckCircle2,
    Zap,
    ShoppingBag,
    Sparkles,
    BarChart,
    CreditCard,
    Headphones,
    Settings,
    Percent
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useToast } from '@/hooks/use-toast';

interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string | null;
    enabled: boolean;
    rollout: number;
    category: string | null;
    config: any;
    createdAt: string;
    updatedAt: string;
}

const categoryIcons: Record<string, any> = {
    ai: Sparkles,
    templates: Settings,
    admin: Settings,
    products: ShoppingBag,
    inventory: BarChart,
    analytics: BarChart,
    payments: CreditCard,
    features: Zap,
    support: Headphones
};

const categoryColors: Record<string, string> = {
    ai: 'bg-purple-100 text-purple-800 border-purple-200',
    templates: 'bg-blue-100 text-blue-800 border-blue-200',
    admin: 'bg-gray-100 text-gray-800 border-gray-200',
    products: 'bg-green-100 text-green-800 border-green-200',
    inventory: 'bg-orange-100 text-orange-800 border-orange-200',
    analytics: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    payments: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    features: 'bg-pink-100 text-pink-800 border-pink-200',
    support: 'bg-cyan-100 text-cyan-800 border-cyan-200'
};

export default function FeatureFlagsPage() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            const response = await fetch('/api/v1/admin/feature-flags', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFlags(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch feature flags:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFlag = async (flagId: string, enabled: boolean) => {
        try {
            const response = await fetch(`/api/v1/admin/feature-flags/${flagId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enabled })
            });

            const data = await response.json();
            if (data.success) {
                setFlags(flags.map(f => f.id === flagId ? { ...f, enabled } : f));
                toast({
                    title: enabled ? 'Feature Enabled' : 'Feature Disabled',
                    description: `${data.data.name} has been ${enabled ? 'enabled' : 'disabled'} successfully.`,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update feature flag',
                variant: 'destructive'
            });
        }
    };

    const updateRollout = async (flagId: string, rollout: number) => {
        try {
            const response = await fetch(`/api/v1/admin/feature-flags/${flagId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rollout })
            });

            const data = await response.json();
            if (data.success) {
                setFlags(flags.map(f => f.id === flagId ? { ...f, rollout } : f));
            }
        } catch (error) {
            console.error('Failed to update rollout:', error);
        }
    };

    const categories = ['all', ...Array.from(new Set(flags.map(f => f.category).filter((cat): cat is string => cat !== null)))];

    const filteredFlags = flags.filter(flag => {
        const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flag.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flag.key.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const enabledCount = flags.filter(f => f.enabled).length;
    const partialRolloutCount = flags.filter(f => f.enabled && f.rollout < 100).length;

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading feature flags...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Flag className="w-8 h-8 mr-3 text-green-600" />
                            Feature Flags Manager
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Control feature availability and rollout in real-time without code deployments.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Features</p>
                                        <p className="text-3xl font-bold text-gray-900">{flags.length}</p>
                                    </div>
                                    <Flag className="w-10 h-10 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Enabled</p>
                                        <p className="text-3xl font-bold text-green-600">{enabledCount}</p>
                                    </div>
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Disabled</p>
                                        <p className="text-3xl font-bold text-red-600">{flags.length - enabledCount}</p>
                                    </div>
                                    <AlertCircle className="w-10 h-10 text-red-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Partial Rollout</p>
                                        <p className="text-3xl font-bold text-orange-600">{partialRolloutCount}</p>
                                    </div>
                                    <Percent className="w-10 h-10 text-orange-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search features by name, description, or key..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                                    <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
                                        {categories.map(cat => (
                                            <TabsTrigger key={cat} value={cat} className="capitalize">
                                                {cat === 'all' ? 'All' : cat}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feature Flags List */}
                    <div className="space-y-4">
                        {filteredFlags.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No feature flags found matching your criteria.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredFlags.map((flag) => {
                                const CategoryIcon = flag.category ? categoryIcons[flag.category] || Flag : Flag;
                                const categoryColor = flag.category ? categoryColors[flag.category] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';

                                return (
                                    <Card key={flag.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <div className={`p-3 rounded-lg ${categoryColor} border`}>
                                                        <CategoryIcon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">{flag.name}</h3>
                                                            {flag.category && (
                                                                <Badge variant="outline" className={categoryColor}>
                                                                    {flag.category}
                                                                </Badge>
                                                            )}
                                                            {flag.enabled ? (
                                                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                    Active
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                                    Inactive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{flag.key}</code>

                                                        {flag.enabled && flag.rollout < 100 && (
                                                            <div className="mt-4 space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <Label>Rollout Percentage</Label>
                                                                    <span className="font-semibold text-orange-600">{flag.rollout}%</span>
                                                                </div>
                                                                <Slider
                                                                    value={[flag.rollout]}
                                                                    onValueChange={([value]) => updateRollout(flag.id, value)}
                                                                    max={100}
                                                                    step={10}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <Switch
                                                            checked={flag.enabled}
                                                            onCheckedChange={(checked) => toggleFlag(flag.id, checked)}
                                                        />
                                                        <span className="text-xs text-gray-500">
                                                            {flag.enabled ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
