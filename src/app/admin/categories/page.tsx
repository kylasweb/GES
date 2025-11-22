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
    FolderTree,
    Image as ImageIcon
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
    _count?: {
        products: number;
    };
    createdAt: string;
    updatedAt: string;
}

export default function AdminCategoriesPage() {
    const { token } = useAuthStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        sortOrder: 0,
        isActive: true,
    });

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v1/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [token]);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: generateSlug(name)
        }));
    };

    const handleCreate = async () => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/v1/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create category');
            }

            toast.success('Category created successfully');
            setIsCreateDialogOpen(false);
            setFormData({ name: '', slug: '', description: '', image: '', sortOrder: 0, isActive: true });
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedCategory) return;

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/v1/admin/categories', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, id: selectedCategory.id }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update category');
            }

            toast.success('Category updated successfully');
            setIsEditDialogOpen(false);
            setSelectedCategory(null);
            setFormData({ name: '', slug: '', description: '', image: '', sortOrder: 0, isActive: true });
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/v1/admin/categories/${categoryToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete category');
            }

            toast.success('Category deleted successfully');
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete category');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditDialog = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || '',
            sortOrder: category.sortOrder,
            isActive: category.isActive,
        });
        setIsEditDialogOpen(true);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage product categories
                                </p>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Category
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Category</DialogTitle>
                                        <DialogDescription>
                                            Add a new category to organize products.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => handleNameChange(e.target.value)}
                                                    className="col-span-3"
                                                    placeholder="Category name"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="slug" className="text-right">
                                                    Slug
                                                </Label>
                                                <Input
                                                    id="slug"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    className="col-span-3"
                                                    placeholder="category-slug"
                                                    required
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
                                                    placeholder="Category description"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="image" className="text-right">
                                                    Image URL
                                                </Label>
                                                <Input
                                                    id="image"
                                                    value={formData.image}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    className="col-span-3"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="sortOrder" className="text-right">
                                                    Sort Order
                                                </Label>
                                                <Input
                                                    id="sortOrder"
                                                    type="number"
                                                    value={formData.sortOrder}
                                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="isActive" className="text-right">
                                                    Status
                                                </Label>
                                                <div className="col-span-3 flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isActive"
                                                        checked={formData.isActive}
                                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                                    />
                                                    <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Create Category
                                            </Button>
                                        </DialogFooter>
                                    </form>
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
                                    <CardTitle>All Categories ({categories.length})</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search categories..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={fetchCategories}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading categories...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Products</TableHead>
                                                <TableHead>Sort Order</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCategories.map((category) => (
                                                <TableRow key={category.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center">
                                                            <FolderTree className="w-4 h-4 mr-2 text-gray-400" />
                                                            {category.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">{category.slug}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {category._count?.products || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{category.sortOrder}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                                            {category.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(category)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCategoryToDelete(category)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
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
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update category information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Category name"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-slug" className="text-right">
                                    Slug
                                </Label>
                                <Input
                                    id="edit-slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="col-span-3"
                                    placeholder="category-slug"
                                    required
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
                                    placeholder="Category description"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-image" className="text-right">
                                    Image URL
                                </Label>
                                <Input
                                    id="edit-image"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="col-span-3"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-sortOrder" className="text-right">
                                    Sort Order
                                </Label>
                                <Input
                                    id="edit-sortOrder"
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-isActive" className="text-right">
                                    Status
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                                    />
                                    <label htmlFor="edit-isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Active
                                    </label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Category
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action cannot be undone.
                            {categoryToDelete?._count?.products ? (
                                <span className="block mt-2 text-red-600">
                                    Warning: This category has {categoryToDelete._count.products} associated products.
                                </span>
                            ) : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
