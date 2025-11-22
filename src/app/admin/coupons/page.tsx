'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useAuthStore } from '@/lib/store/auth';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, Tag, Calendar, Percent, DollarSign, RefreshCw } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usageCount: number;
    perUserLimit?: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    createdAt: string;
}

export default function CouponsPage() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        perUserLimit: '',
        validFrom: '',
        validUntil: '',
        isActive: true,
    });

    useEffect(() => {
        if (!token) {
            window.location.href = '/auth';
            return;
        }

        if (!['SUPER_ADMIN', 'FINANCE_MANAGER'].includes(user?.role || '')) {
            window.location.href = '/admin';
            return;
        }

        fetchCoupons();
    }, [token, user]);

    const fetchCoupons = async () => {
        try {
            const response = await fetch('/api/v1/admin/coupons', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setCoupons(data.data.coupons);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load coupons',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            code: formData.code.toUpperCase(),
            description: formData.description || undefined,
            type: formData.type,
            value: parseFloat(formData.value),
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
            perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : undefined,
            validFrom: formData.validFrom,
            validUntil: formData.validUntil,
            isActive: formData.isActive,
        };

        try {
            const url = editingCoupon
                ? `/api/v1/admin/coupons/${editingCoupon.id}`
                : '/api/v1/admin/coupons';

            const response = await fetch(url, {
                method: editingCoupon ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully`,
                });
                setIsDialogOpen(false);
                resetForm();
                fetchCoupons();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to save coupon',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save coupon',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            type: coupon.type,
            value: coupon.value.toString(),
            minOrderValue: coupon.minOrderValue?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            usageLimit: coupon.usageLimit?.toString() || '',
            perUserLimit: coupon.perUserLimit?.toString() || '',
            validFrom: coupon.validFrom.split('T')[0],
            validUntil: coupon.validUntil.split('T')[0],
            isActive: coupon.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const response = await fetch(`/api/v1/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Coupon deleted successfully',
                });
                fetchCoupons();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete coupon',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            type: 'PERCENTAGE',
            value: '',
            minOrderValue: '',
            maxDiscount: '',
            usageLimit: '',
            perUserLimit: '',
            validFrom: '',
            validUntil: '',
            isActive: true,
        });
        setEditingCoupon(null);
    };

    const isExpired = (validUntil: string) => new Date(validUntil) < new Date();

    if (isLoading) {
        return (
            <div className="flex min-h-screen">
                <AdminSidebar />
                <div className="flex-1 p-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar />

            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupons</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage discount coupons and promotional codes
                            </p>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Coupon
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Coupon Code *</Label>
                                            <Input
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                placeholder="SUMMER2025"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label>Type *</Label>
                                            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Summer sale - 20% off"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>
                                                {formData.type === 'PERCENTAGE' ? 'Percentage' : 'Amount'} *
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.value}
                                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                placeholder={formData.type === 'PERCENTAGE' ? '20' : '500'}
                                                required
                                            />
                                        </div>

                                        {formData.type === 'PERCENTAGE' && (
                                            <div>
                                                <Label>Max Discount (₹)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.maxDiscount}
                                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                                    placeholder="1000"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Min Order Value (₹)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.minOrderValue}
                                                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                                placeholder="2000"
                                            />
                                        </div>

                                        <div>
                                            <Label>Usage Limit</Label>
                                            <Input
                                                type="number"
                                                value={formData.usageLimit}
                                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                                placeholder="100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Per User Limit</Label>
                                            <Input
                                                type="number"
                                                value={formData.perUserLimit}
                                                onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Valid From *</Label>
                                            <Input
                                                type="date"
                                                value={formData.validFrom}
                                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label>Valid Until *</Label>
                                            <Input
                                                type="date"
                                                value={formData.validUntil}
                                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="rounded"
                                        />
                                        <Label htmlFor="isActive">Active</Label>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600" disabled={isSubmitting}>
                                            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                            {editingCoupon ? 'Update' : 'Create'} Coupon
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Coupons Grid */}
                    <div className="grid gap-4">
                        {coupons.map((coupon) => (
                            <Card key={coupon.id} className={isExpired(coupon.validUntil) ? 'opacity-60' : ''}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-5 w-5 text-green-600" />
                                                    <h3 className="text-xl font-bold font-mono">{coupon.code}</h3>
                                                </div>

                                                {coupon.isActive && !isExpired(coupon.validUntil) ? (
                                                    <Badge className="bg-green-500">Active</Badge>
                                                ) : isExpired(coupon.validUntil) ? (
                                                    <Badge variant="destructive">Expired</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}

                                                <Badge variant="outline">
                                                    {coupon.type === 'PERCENTAGE' ? (
                                                        <><Percent className="h-3 w-3 mr-1" />{coupon.value}% OFF</>
                                                    ) : (
                                                        <><DollarSign className="h-3 w-3 mr-1" />₹{coupon.value} OFF</>
                                                    )}
                                                </Badge>
                                            </div>

                                            {coupon.description && (
                                                <p className="text-gray-600 dark:text-gray-400 mb-3">{coupon.description}</p>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Valid Period:</span>
                                                    <p className="font-medium flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {coupon.minOrderValue && (
                                                    <div>
                                                        <span className="text-gray-500">Min Order:</span>
                                                        <p className="font-medium">₹{coupon.minOrderValue}</p>
                                                    </div>
                                                )}

                                                {coupon.maxDiscount && (
                                                    <div>
                                                        <span className="text-gray-500">Max Discount:</span>
                                                        <p className="font-medium">₹{coupon.maxDiscount}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <span className="text-gray-500">Usage:</span>
                                                    <p className="font-medium">
                                                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {coupons.length === 0 && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No coupons yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Create your first discount coupon to start offering promotions
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
