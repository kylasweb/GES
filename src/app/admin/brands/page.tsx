'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    RefreshCw,
    Eye,
    Package
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { toast } from 'sonner';

interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    isActive: boolean;
    _count?: {
        products: number;
    };
    createdAt: string;
    updatedAt: string;
}

export default function AdminBrandsPage() {
    const { user, token } = useAuthStore();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: '',
        website: '',
        isActive: true,
    });

    const fetchBrands = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v1/admin/brands', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch brands');
            }

            const data = await response.json();
            setBrands(data.success ? data.data : data.brands || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [token]);

    const handleCreate = async () => {
        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            const response = await fetch('/api/v1/admin/brands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, slug }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create brand');
            }

            toast.success('Brand created successfully');
            setIsCreateDialogOpen(false);
            setFormData({ name: '', description: '', logo: '', website: '', isActive: true });
            fetchBrands();
        } catch (error) {
            console.error('Error creating brand:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create brand');
        }
    };

    const handleUpdate = async () => {
        if (!selectedBrand) return;

        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            const response = await fetch(`/api/v1/admin/brands/${selectedBrand.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, slug }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update brand');
            }

            toast.success('Brand updated successfully');
            setIsEditDialogOpen(false);
            setSelectedBrand(null);
            setFormData({ name: '', description: '', logo: '', website: '', isActive: true });
            fetchBrands();
        } catch (error) {
            console.error('Error updating brand:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update brand');
        }
    };

    const handleDelete = async (brandId: string) => {
        try {
            const response = await fetch(`/api/v1/admin/brands/${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete brand');
            }

            toast.success('Brand deleted successfully');
            fetchBrands();
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete brand');
        }
    };

    const openEditDialog = (brand: Brand) => {
        setSelectedBrand(brand);
        setFormData({
            name: brand.name,
            description: brand.description || '',
            logo: brand.logo || '',
            website: brand.website || '',
            isActive: brand.isActive,
        });
        setIsEditDialogOpen(true);
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage product brands and manufacturers
                                </p>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Brand
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Brand</DialogTitle>
                                        <DialogDescription>
                                            Add a new brand to your product catalog.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="col-span-3"
                                                placeholder="Brand name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="col-span-3"
                                                placeholder="Brand description"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="logo" className="text-right">
                                                Logo URL
                                            </Label>
                                            <Input
                                                id="logo"
                                                value={formData.logo}
                                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                className="col-span-3"
                                                placeholder="https://example.com/logo.jpg"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="website" className="text-right">
                                                Website
                                            </Label>
                                            <Input
                                                id="website"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                className="col-span-3"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleCreate}>
                                            Create Brand
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>All Brands ({brands.length})</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search brands..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={fetchBrands}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading brands...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Products</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBrands.map((brand) => (
                                                <TableRow key={brand.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center">
                                                            {brand.image && (
                                                                <img
                                                                    src={brand.image}
                                                                    alt={brand.name}
                                                                    className="w-8 h-8 rounded-full mr-3 object-cover"
                                                                />
                                                            )}
                                                            {brand.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">{brand.slug}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            <Package className="w-3 h-3 mr-1" />
                                                            {brand._count?.products || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                                                            {brand.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">
                                                        {new Date(brand.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(brand)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="outline" size="sm">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{brand.name}"? This action cannot be undone.
                                                                            {(brand._count?.products || 0) > 0 && (
                                                                                <span className="block mt-2 text-red-600">
                                                                                    Warning: This brand has {brand._count?.products} associated products.
                                                                                </span>
                                                                            )}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(brand.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Brand</DialogTitle>
                        <DialogDescription>
                            Update brand information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                placeholder="Brand name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                                placeholder="Brand description"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-logo" className="text-right">
                                Logo URL
                            </Label>
                            <Input
                                id="edit-logo"
                                value={formData.logo}
                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                className="col-span-3"
                                placeholder="https://example.com/logo.jpg"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-website" className="text-right">
                                Website
                            </Label>
                            <Input
                                id="edit-website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="col-span-3"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdate}>
                            Update Brand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}