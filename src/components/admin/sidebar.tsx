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
    Settings,
    Tag,
    Layers,
    Palette,
    Box,
    ChevronDown,
    ChevronRight,
    Leaf,
    Home,
    Ticket,
    Mail,
    Zap,
    Truck
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        name: 'Products',
        icon: Package,
        submenu: [
            { name: 'All Products', href: '/admin/products' },
            { name: 'Add New', href: '/admin/products/new' },
            { name: 'Brands', href: '/admin/brands' },
            { name: 'Attributes', href: '/admin/attributes' },
            { name: 'Tags', href: '/admin/tags' },
            { name: 'Variations', href: '/admin/variations' },
        ]
    },
    {
        name: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        name: 'Coupons',
        href: '/admin/coupons',
        icon: Ticket,
    },
    {
        name: 'Flash Deals',
        href: '/admin/deals',
        icon: Zap,
    },
    {
        name: 'Shipping',
        href: '/admin/shipping',
        icon: Truck,
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
        name: 'Newsletter',
        href: '/admin/newsletter',
        icon: Mail,
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
    const [expandedItems, setExpandedItems] = useState<string[]>(['Products']);

    const toggleExpanded = (name: string) => {
        setExpandedItems(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    const isItemActive = (item: typeof navigation[0]) => {
        if (item.href) return pathname === item.href;
        if (item.submenu) {
            return item.submenu.some(sub => pathname === sub.href);
        }
        return false;
    };

    return (
        <div className={cn(
            'flex flex-col w-64 border-r transition-colors duration-200',
            'bg-[#1e1e1e] dark:bg-[#1a1a1a] text-gray-300',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
                <Link href="/" className="flex items-center space-x-2 group">
                    <Leaf className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-semibold text-white">GES Admin</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const hasSubmenu = !!item.submenu;
                    const isExpanded = expandedItems.includes(item.name);
                    const isActive = isItemActive(item);

                    return (
                        <div key={item.name}>
                            {hasSubmenu ? (
                                <>
                                    <button
                                        onClick={() => toggleExpanded(item.name)}
                                        className={cn(
                                            'flex items-center w-full px-3 py-2 text-sm font-medium rounded transition-colors',
                                            isActive
                                                ? 'bg-[#2271b1] text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                        <span className="flex-1 text-left">{item.name}</span>
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                    {isExpanded && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {item.submenu.map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className={cn(
                                                        'block px-3 py-2 text-sm rounded transition-colors',
                                                        pathname === subItem.href
                                                            ? 'bg-[#2271b1] text-white'
                                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    )}
                                                >
                                                    {subItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href!}
                                    className={cn(
                                        'flex items-center px-3 py-2 text-sm font-medium rounded transition-colors',
                                        isActive
                                            ? 'bg-[#2271b1] text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 space-y-2">
                <Link
                    href="/"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
                >
                    <Home className="w-5 h-5 mr-3" />
                    Visit Site
                </Link>
                <div className="flex items-center justify-between px-3">
                    <span className="text-xs text-gray-500">Theme</span>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
}
