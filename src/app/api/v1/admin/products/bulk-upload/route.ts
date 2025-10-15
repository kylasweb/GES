import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { parse } from 'csv-parse/sync';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
    const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
    return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

interface ProductCSVRecord {
    name: string;
    sku: string;
    description?: string;
    shortDesc?: string;
    price?: string;
    comparePrice?: string;
    costPrice?: string;
    trackQuantity?: string;
    quantity?: string;
    weight?: string;
    categoryName?: string;
    brandName?: string;
    isActive?: string;
    featured?: string;
    seoTitle?: string;
    seoDesc?: string;
    images?: string;
}export async function POST(request: NextRequest) {
    try {
        // Get user from token
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        // Check if user has admin privileges
        if (!checkAdminRole(user, ['SUPER_ADMIN', 'ORDER_MANAGER'])) {
            return NextResponse.json(
                { success: false, error: 'Super admin or order manager access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!file.name.endsWith('.csv')) {
            return NextResponse.json(
                { success: false, error: 'Only CSV files are allowed' },
                { status: 400 }
            );
        }

        // Read file content
        const csvContent = await file.text();

        // Parse CSV
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as ProductCSVRecord[];

        let successful = 0;
        let failed = 0;
        const errors: string[] = [];

        // Process each record
        for (let i = 0; i < records.length; i++) {
            const record: ProductCSVRecord = records[i]; try {
                // Find or create category
                let category = await db.category.findFirst({
                    where: { name: record.categoryName }
                });

                if (!category && record.categoryName) {
                    category = await db.category.create({
                        data: {
                            name: record.categoryName,
                            slug: record.categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        }
                    });
                }

                // Find or create brand
                let brand = await db.brand.findFirst({
                    where: { name: record.brandName }
                });

                if (!brand && record.brandName) {
                    brand = await db.brand.create({
                        data: {
                            name: record.brandName,
                            slug: record.brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        }
                    });
                }

                // Create product
                const productData = {
                    name: record.name,
                    slug: record.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
                    sku: record.sku,
                    description: record.description || '',
                    shortDesc: record.shortDesc || '',
                    price: record.price ? parseFloat(record.price) : 0,
                    comparePrice: record.comparePrice ? parseFloat(record.comparePrice) : null,
                    costPrice: record.costPrice ? parseFloat(record.costPrice) : null,
                    trackQuantity: record.trackQuantity === 'true',
                    quantity: record.quantity ? parseInt(record.quantity) : 0,
                    weight: record.weight ? parseFloat(record.weight) : null,
                    images: record.images ? record.images.split(',').map((url: string) => url.trim()) : [],
                    type: 'SIMPLE' as const,
                    isActive: record.isActive !== 'false',
                    featured: record.featured === 'true',
                    seoTitle: record.seoTitle || null,
                    seoDesc: record.seoDesc || null,
                    categoryId: category?.id || '',
                    brandId: brand?.id || null,
                };

                await db.product.create({
                    data: productData
                });

                successful++;
            } catch (error) {
                console.error(`Error processing record ${i + 1}:`, error);
                failed++;
                errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                successful,
                failed,
                errors: errors.slice(0, 10), // Limit errors to first 10
            },
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}