import { db } from '@/lib/db';

export interface ExportOptions {
    format: 'csv' | 'json' | 'xlsx';
    includeHeaders?: boolean;
    delimiter?: string;
}

export async function exportProducts(options: ExportOptions) {
    try {
        const products = await db.product.findMany({
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
                brand: {
                    select: {
                        name: true,
                    },
                },
                inventory: {
                    select: {
                        quantity: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const data = products.map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            comparePrice: product.comparePrice,
            category: product.category?.name || '',
            brand: product.brand?.name || '',
            quantity: product.inventory?.quantity || 0,
            isActive: product.isActive,
            featured: product.featured,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        }));

        return exportData(data, 'products', options);
    } catch (error) {
        console.error('Export products error:', error);
        throw new Error('Failed to export products');
    }
}

export async function exportOrders(options: ExportOptions) {
    try {
        const orders = await db.order.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const data = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customer: order.user?.name || (order.userId ? 'Unknown' : 'Guest'),
            email: order.user?.email || '',
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            currency: order.currency,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
        }));

        return exportData(data, 'orders', options);
    } catch (error) {
        console.error('Export orders error:', error);
        throw new Error('Failed to export orders');
    }
}

export async function exportUsers(options: ExportOptions) {
    try {
        const users = await db.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        const data = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }));

        return exportData(data, 'users', options);
    } catch (error) {
        console.error('Export users error:', error);
        throw new Error('Failed to export users');
    }
}

export async function exportBrands(options: ExportOptions) {
    try {
        const brands = await db.brand.findMany({
            orderBy: {
                sortOrder: 'asc',
            },
        });

        const data = brands.map(brand => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            description: brand.description || '',
            website: brand.website || '',
            sortOrder: brand.sortOrder,
            isActive: brand.isActive,
            createdAt: brand.createdAt.toISOString(),
            updatedAt: brand.updatedAt.toISOString(),
        }));

        return exportData(data, 'brands', options);
    } catch (error) {
        console.error('Export brands error:', error);
        throw new Error('Failed to export brands');
    }
}

function exportData(data: any[], fileName: string, options: ExportOptions) {
    if (options.format === 'json') {
        return exportAsJSON(data, fileName);
    } else if (options.format === 'csv') {
        return exportAsCSV(data, fileName, options);
    } else {
        throw new Error('Unsupported export format');
    }
}

function exportAsJSON(data: any[], fileName: string) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    return {
        url,
        fileName: `${fileName}.json`,
        mimeType: 'application/json',
    };
}

function exportAsCSV(data: any[], fileName: string, options: ExportOptions) {
    if (data.length === 0) {
        throw new Error('No data to export');
    }

    const delimiter = options.delimiter || ',';
    const includeHeaders = options.includeHeaders !== false;

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    let csvContent = '';

    // Add headers
    if (includeHeaders) {
        csvContent += headers.join(delimiter) + '\n';
    }

    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escape values that contain delimiter, quotes, or newlines
            if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += values.join(delimiter) + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    return {
        url,
        fileName: `${fileName}.csv`,
        mimeType: 'text/csv',
    };
}