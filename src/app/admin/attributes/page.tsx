'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    Layers,
    Tag
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { toast } from 'sonner';

interface AttributeValue {
    id: string;
    name: string;
    slug: string;
    color?: string;
    createdAt: string;
}

interface Attribute {
    id: string;
    name: string;
    slug: string;
    type: 'text' | 'color' | 'select';
    description?: string;
    isActive: boolean;
    values: AttributeValue[];
    createdAt: string;
    updatedAt: string;
}

export default function AdminAttributesPage() {
    const { user, token } = useAuthStore();
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'text' as 'text' | 'color' | 'select',
        description: '',
        isActive: true,
    });

    const fetchAttributes = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/v1/admin/attributes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch attributes');
            }

            const data = await response.json();
            setAttributes(data.attributes);
        } catch (error) {
            console.error('Error fetching attributes:', error);
            toast.error('Failed to load attributes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, [token]);

    const handleCreate = async () => {
        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            const response = await fetch('/api/v1/admin/attributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, slug }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create attribute');
            }

            toast.success('Attribute created successfully');
            setIsCreateDialogOpen(false);
            setFormData({ name: '', type: 'text', description: '', isActive: true });
            fetchAttributes();
        } catch (error) {
            console.error('Error creating attribute:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create attribute');
        }
    };

    const handleUpdate = async () => {
        if (!selectedAttribute) return;

        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');

            const response = await fetch(`/api/v1/admin/attributes/${selectedAttribute.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, slug }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update attribute');
            }

            toast.success('Attribute updated successfully');
            setIsEditDialogOpen(false);
            setSelectedAttribute(null);
            setFormData({ name: '', type: 'text', description: '', isActive: true });
            fetchAttributes();
        } catch (error) {
            console.error('Error updating attribute:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update attribute');
        }
    };

    const handleDelete = async (attributeId: string) => {
        try {
            const response = await fetch(`/api/v1/admin/attributes/${attributeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete attribute');
            }

            toast.success('Attribute deleted successfully');
            fetchAttributes();
        } catch (error) {
            console.error('Error deleting attribute:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete attribute');
        }
    };

    const openEditDialog = (attribute: Attribute) => {
        setSelectedAttribute(attribute);
        setFormData({
            name: attribute.name,
            type: attribute.type,
            description: attribute.description || '',
            isActive: attribute.isActive,
        });
        setIsEditDialogOpen(true);
    };

    const filteredAttributes = attributes.filter(attribute =>
        attribute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attribute.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'color': return 'default';
            case 'select': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Attributes</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage product attributes and their values
                                </p>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Attribute
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Attribute</DialogTitle>
                                        <DialogDescription>
                                            Add a new attribute for product variations.
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
                                                placeholder="Attribute name (e.g., Color, Size)"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="type" className="text-right">
                                                Type
                                            </Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value: 'text' | 'color' | 'select') =>
                                                    setFormData({ ...formData, type: value })
                                                }
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select attribute type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="color">Color</SelectItem>
                                                    <SelectItem value="select">Select</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                placeholder="Attribute description"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleCreate}>
                                            Create Attribute
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
                                    <CardTitle>All Attributes ({attributes.length})</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search attributes..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={fetchAttributes}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading attributes...</span>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Values</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAttributes.map((attribute) => (
                                                <TableRow key={attribute.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center">
                                                            <Layers className="w-4 h-4 mr-2 text-gray-400" />
                                                            {attribute.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getTypeBadgeVariant(attribute.type)}>
                                                            {attribute.type.charAt(0).toUpperCase() + attribute.type.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {attribute.values.slice(0, 3).map((value) => (
                                                                <Badge key={value.id} variant="outline" className="text-xs">
                                                                    {value.name}
                                                                </Badge>
                                                            ))}
                                                            {attribute.values.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{attribute.values.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={attribute.isActive ? 'default' : 'secondary'}>
                                                            {attribute.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500">
                                                        {new Date(attribute.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openEditDialog(attribute)}
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
                                                                        <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{attribute.name}"? This action cannot be undone.
                                                                            {attribute.values.length > 0 && (
                                                                                <span className="block mt-2 text-red-600">
                                                                                    Warning: This attribute has {attribute.values.length} associated values.
                                                                                </span>
                                                                            )}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(attribute.id)}
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
                        <DialogTitle>Edit Attribute</DialogTitle>
                        <DialogDescription>
                            Update attribute information.
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
                                placeholder="Attribute name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'text' | 'color' | 'select') =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select attribute type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="color">Color</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                </SelectContent>
                            </Select>
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
                                placeholder="Attribute description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdate}>
                            Update Attribute
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}