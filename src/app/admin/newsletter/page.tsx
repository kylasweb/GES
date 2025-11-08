'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useAuthStore } from '@/lib/store/auth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Download, Trash2, Users, UserCheck, UserX, Search } from 'lucide-react';

interface Subscriber {
    id: string;
    email: string;
    name?: string;
    status: 'ACTIVE' | 'UNSUBSCRIBED';
    source?: string;
    createdAt: string;
}

export default function NewsletterPage() {
    const { user, token } = useAuthStore();
    const { toast } = useToast();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!token) {
            window.location.href = '/auth';
            return;
        }

        if (!['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(user?.role || '')) {
            window.location.href = '/admin';
            return;
        }

        fetchSubscribers();
    }, [token, user, statusFilter]);

    const fetchSubscribers = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await fetch(`/api/v1/admin/newsletter?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setSubscribers(data.data.subscribers);
                setStats(data.data.stats);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load subscribers',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;

        if (!confirm(`Delete ${selectedIds.length} subscriber(s)?`)) return;

        try {
            const response = await fetch('/api/v1/admin/newsletter', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: data.message,
                });
                setSelectedIds([]);
                fetchSubscribers();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete subscribers',
                variant: 'destructive',
            });
        }
    };

    const handleExport = () => {
        const csv = [
            ['Email', 'Name', 'Status', 'Source', 'Subscribed Date'],
            ...filteredSubscribers.map(s => [
                s.email,
                s.name || '',
                s.status,
                s.source || '',
                new Date(s.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredSubscribers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSubscribers.map(s => s.id));
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Newsletter Subscribers</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your email subscriber list
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Subscribers</CardTitle>
                                <Users className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{(stats.ACTIVE || 0) + (stats.UNSUBSCRIBED || 0)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.ACTIVE || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Unsubscribed</CardTitle>
                                <UserX className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.UNSUBSCRIBED || 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Actions */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex gap-4 flex-1">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by email or name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleExport}
                                        disabled={filteredSubscribers.length === 0}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>

                                    {selectedIds.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete ({selectedIds.length})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscribers Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <Checkbox
                                                    checked={selectedIds.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Source
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subscribed
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredSubscribers.map((subscriber) => (
                                            <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Checkbox
                                                        checked={selectedIds.includes(subscriber.id)}
                                                        onCheckedChange={() => toggleSelect(subscriber.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                                        <span className="text-sm">{subscriber.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {subscriber.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {subscriber.status === 'ACTIVE' ? (
                                                        <Badge className="bg-green-500">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Unsubscribed</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {subscriber.source || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(subscriber.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredSubscribers.length === 0 && (
                                    <div className="text-center py-12">
                                        <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No subscribers found</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {searchQuery ? 'Try adjusting your search' : 'Subscribers will appear here'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
