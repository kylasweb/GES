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
    Tag,
    Package
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { toast } from 'sonner';

interface ProductTag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    isActive: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function AdminTagsPage() {
    const { user, token } = useAuthStore();
    const [tags, setTags] = useState<ProductTag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ProductTag | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3b82f6',
        isActive: true,
    });

    const fetchTags = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v1/admin/tags', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tags');
            }

            const data = await response.json();
            setTags(data.tags);
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Failed to load tags');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [token]);

    const handleCreate = async () => {
        try {
            const response = await fetch('/api/v1/admin/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create tag');
            }

            toast.success('Tag created successfully');
            setIsCreateDialogOpen(false);
            setFormData({ name: '', description: '', color: '#3b82f6', isActive: true });
            fetchTags();
        } catch (error) {
            console.error('Error creating tag:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        }
    };

    const handleUpdate = async () => {
        if (!selectedTag) return;

        try {
            const response = await fetch(`/api/v1/admin/tags/${selectedTag.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update tag');
            }

            toast.success('Tag updated successfully');
            setIsEditDialogOpen(false);
            setSelectedTag(null);
            setFormData({ name: '', description: '', color: '#3b82f6', isActive: true });
            fetchTags();
        } catch (error) {
            console.error('Error updating tag:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update tag');
        }
    };

    const handleDelete = async (tagId: string) => {
        try {
            const response = await fetch(`/api/v1/admin/tags/${tagId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete tag');
            }

            toast.success('Tag deleted successfully');
            fetchTags();
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete tag');
        }
    };

    const openEditDialog = (tag: ProductTag) => {
        setSelectedTag(tag);
        setFormData({
            name: tag.name,
            description: tag.description || '',
            color: tag.color || '#3b82f6',
            isActive: tag.isActive,
        });
        setIsEditDialogOpen(true);
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage product tags and categories
                                </p>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Tag
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Tag</DialogTitle>
                                        <DialogDescription>
                                            Add a new tag to categorize products.
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
                                                placeholder="Tag name"
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
                                                placeholder="Tag description"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="color" className="text-right">
                                                Color
                                            </Label>
                                            <div className="col-span-3 flex items-center space-x-2">
                                                <Input
                                                    id="color"
                                                    type="color"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    className="w-12 h-10 p-1 border rounded"
                                                />
                                                <Input
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    placeholder="#3b82f6"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleCreate}>
                                            Create Tag
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
                                    <CardTitle>All Tags ({tags.length})</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search tags..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={fetchTags}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading tags...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Products</TableHead>
                                                <TableHead>Color</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTags.map((tag) => (
                                                <TableRow key={tag.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center">
                                                            <Tag className="w-4 h-4 mr-2 text-gray-400" />
                                                            {tag.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">{tag.slug}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            <Package className="w-3 h-3 mr-1" />
                                                            {tag.productCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className="w-4 h-4 rounded-full border"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            <span className="text-sm text-gray-600">{tag.color}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={tag.isActive ? 'default' : 'secondary'}>
                                                            {tag.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">
                                                        {new Date(tag.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(tag)}
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
                                                                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{tag.name}"? This action cannot be undone.
                                                                            {tag.productCount > 0 && (
                                                                                <span className="block mt-2 text-red-600">
                                                                                    Warning: This tag has {tag.productCount} associated products.
                                                                                </span>
                                                                            )}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(tag.id)}
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
                        <DialogTitle>Edit Tag</DialogTitle>
                        <DialogDescription>
                            Update tag information.
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
                                placeholder="Tag name"
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
                                placeholder="Tag description"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-color" className="text-right">
                                Color
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Input
                                    id="edit-color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-12 h-10 p-1 border rounded"
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#3b82f6"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdate}>
                            Update Tag
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}