'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Users,
    Search,
    Edit,
    UserCheck,
    UserX,
    Shield,
    Crown,
    Package,
    BarChart3,
    Download,
    Plus,
    Trash2
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { ExportButton } from '@/components/admin/export-button';
import { BulkImport } from '@/components/admin/bulk-import';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        orders: number;
    };
}

const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'ORDER_MANAGER', label: 'Order Manager' },
    { value: 'FINANCE_MANAGER', label: 'Finance Manager' },
    { value: 'CONTENT_MANAGER', label: 'Content Manager' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' }
];

const roleIcons = {
    CUSTOMER: UserCheck,
    ORDER_MANAGER: Package,
    FINANCE_MANAGER: BarChart3,
    CONTENT_MANAGER: Edit,
    SUPER_ADMIN: Crown
};

const roleColors = {
    CUSTOMER: 'bg-blue-100 text-blue-800',
    ORDER_MANAGER: 'bg-green-100 text-green-800',
    FINANCE_MANAGER: 'bg-purple-100 text-purple-800',
    CONTENT_MANAGER: 'bg-orange-100 text-orange-800',
    SUPER_ADMIN: 'bg-red-100 text-red-800'
};

export default function UsersManagementPage() {
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/v1/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.error || 'Failed to load users');
            }
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/v1/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                ));
            } else {
                setError(data.error || 'Failed to update user role');
            }
        } catch (err) {
            setError('Failed to update user role');
        }
    };

    const handleStatusToggle = async (userId: string, isActive: boolean) => {
        try {
            const response = await fetch(`/api/v1/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive })
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, isActive } : user
                ));
            } else {
                setError(data.error || 'Failed to update user status');
            }
        } catch (err) {
            setError('Failed to update user status');
        }
    };

    // Bulk operations
    const handleSelectUser = (userId: string, checked: boolean) => {
        const newSelected = new Set(selectedUsers);
        if (checked) {
            newSelected.add(userId);
        } else {
            newSelected.delete(userId);
        }
        setSelectedUsers(newSelected);
        setIsBulkMode(newSelected.size > 0);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(filteredUsers.map(u => u.id));
            setSelectedUsers(allIds);
            setIsBulkMode(true);
        } else {
            setSelectedUsers(new Set());
            setIsBulkMode(false);
        }
    };

    const handleBulkStatusUpdate = async (isActive: boolean) => {
        if (selectedUsers.size === 0) return;

        try {
            const updatePromises = Array.from(selectedUsers).map(userId =>
                fetch(`/api/v1/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isActive })
                })
            );

            const responses = await Promise.all(updatePromises);
            const results = await Promise.all(responses.map(r => r.json()));

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                // Update local state
                setUsers(users.map(u =>
                    selectedUsers.has(u.id) ? { ...u, isActive } : u
                ));
                setSelectedUsers(new Set());
                setIsBulkMode(false);
                if (failCount > 0) {
                    setError(`${successCount} users updated, ${failCount} failed`);
                }
            } else {
                setError('Failed to update users');
            }
        } catch (err) {
            setError('Failed to update users');
        }
    };

    const handleBulkRoleUpdate = async (newRole: string) => {
        if (selectedUsers.size === 0) return;

        try {
            const updatePromises = Array.from(selectedUsers).map(userId =>
                fetch(`/api/v1/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role: newRole })
                })
            );

            const responses = await Promise.all(updatePromises);
            const results = await Promise.all(responses.map(r => r.json()));

            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                // Update local state
                setUsers(users.map(u =>
                    selectedUsers.has(u.id) ? { ...u, role: newRole } : u
                ));
                setSelectedUsers(new Set());
                setIsBulkMode(false);
                if (failCount > 0) {
                    setError(`${successCount} users updated, ${failCount} failed`);
                }
            } else {
                setError('Failed to update users');
            }
        } catch (err) {
            setError('Failed to update users');
        }
    };

    const handleBulkExport = () => {
        if (selectedUsers.size === 0) return;

        const selectedUserData = users.filter(u => selectedUsers.has(u.id));
        const csvContent = [
            ['Name', 'Email', 'Role', 'Status', 'Orders', 'Joined Date'],
            ...selectedUserData.map(user => [
                user.name,
                user.email,
                user.role,
                user.isActive ? 'Active' : 'Inactive',
                (user._count?.orders || 0).toString(),
                new Date(user.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleCreateUser = async (userData: { name: string; email: string; role: string; isActive: boolean }) => {
        try {
            const response = await fetch('/api/v1/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setUsers([...users, data.data]);
                setSuccess('User created successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Failed to create user');
            }
        } catch (err) {
            setError('Failed to create user');
        }
    };

    const handleEditUser = async (userId: string, userData: Partial<User>) => {
        try {
            const response = await fetch(`/api/v1/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, ...userData } : user
                ));
                setSuccess('User updated successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Failed to update user');
            }
        } catch (err) {
            setError('Failed to update user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setUsers(users.filter(user => user.id !== userId));
                setSuccess('User deleted successfully!');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(data.error || 'Failed to delete user');
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading users...</p>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
                                <p className="text-gray-600 mt-2">
                                    Manage user accounts, roles, and permissions.
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ExportButton type="users" />
                                <Button onClick={() => {
                                    const name = prompt('Enter user name:');
                                    const email = prompt('Enter user email:');
                                    if (name && email) {
                                        handleCreateUser({
                                            name,
                                            email,
                                            role: 'CUSTOMER',
                                            isActive: true
                                        });
                                    }
                                }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create User
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bulk Actions Toolbar */}
                    {isBulkMode && (
                        <Card className="mb-6 bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-blue-900">
                                            {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStatusUpdate(true)}
                                            className="text-green-700 border-green-300 hover:bg-green-50"
                                        >
                                            Activate
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleBulkStatusUpdate(false)}
                                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                                        >
                                            Deactivate
                                        </Button>
                                        <Select onValueChange={handleBulkRoleUpdate}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Update Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                <SelectItem value="ORDER_MANAGER">Order Manager</SelectItem>
                                                <SelectItem value="FINANCE_MANAGER">Finance Manager</SelectItem>
                                                <SelectItem value="CONTENT_MANAGER">Content Manager</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkExport}
                                            className="text-green-700 border-green-300 hover:bg-green-50"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export CSV
                                        </Button>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedUsers(new Set());
                                            setIsBulkMode(false);
                                        }}
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Users ({filteredUsers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || Shield;
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedUsers.has(user.id)}
                                                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-gray-600">{user.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                                                            <RoleIcon className="w-3 h-3 mr-1" />
                                                            {user.role.replace('_', ' ')}
                                                        </Badge>
                                                        <Select
                                                            value={user.role}
                                                            onValueChange={(value) => handleRoleUpdate(user.id, value)}
                                                        >
                                                            <SelectTrigger className="w-40 h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                                <SelectItem value="ORDER_MANAGER">Order Manager</SelectItem>
                                                                <SelectItem value="FINANCE_MANAGER">Finance Manager</SelectItem>
                                                                <SelectItem value="CONTENT_MANAGER">Content Manager</SelectItem>
                                                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user._count?.orders || 0}</TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newName = prompt('Enter new name:', user.name);
                                                                if (newName && newName !== user.name) {
                                                                    handleEditUser(user.id, { name: newName });
                                                                }
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleStatusToggle(user.id, !user.isActive)}
                                                            className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                                        >
                                                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm || roleFilter !== 'all'
                                            ? 'Try adjusting your search or filter criteria.'
                                            : 'Users will appear here once they register on your platform.'
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="mt-8">
                        <BulkImport 
                            type="users" 
                            onImportComplete={fetchUsers}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}