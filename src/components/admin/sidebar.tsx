'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    AlertTriangle,
    FileText,
    BarChart3,
    Settings
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        name: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        name: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        name: 'Inventory',
        href: '/admin/inventory',
        icon: AlertTriangle,
    },
    {
        name: 'Content',
        href: '/admin/content',
        icon: FileText,
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

interface AdminSidebarProps {
    className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn('flex flex-col w-64 bg-white border-r border-gray-200', className)}>
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                isActive
                                    ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}