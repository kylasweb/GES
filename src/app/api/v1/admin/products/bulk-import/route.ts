import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logAuditTrail } from '@/lib/audit-trail';

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const user = requireAdmin(request);

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Check file type
        if (!file.name.endsWith('.csv')) {
            return NextResponse.json(
                { success: false, error: 'Only CSV files are supported' },
                { status: 400 }
            );
        }

        // Parse CSV
        const fileBuffer = await file.arrayBuffer();
        const csvString = Buffer.from(fileBuffer).toString('utf-8');

        const records = parse(csvString, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        let successful = 0;
        let failed = 0;
        const errors: string[] = [];

        // Process each record
        for (const record of records) {
            try {
                // Validate required fields
                if (!record.name || !record.sku || !record.price) {
                    errors.push(`Row ${successful + failed + 1}: Missing required fields (name, sku, price)`);
                    failed++;
                    continue;
                }

                // Find category by name
                let category = null;
                if (record.categoryName) {
                    category = await db.category.findFirst({
                        where: { name: record.categoryName }
                    });
                }

                // Find brand by name
                let brand = null;
                if (record.brandName) {
                    brand = await db.brand.findFirst({
                        where: { name: record.brandName }
                    });
                }

                // Parse images
                let images: string[] = [];
                if (record.images) {
                    images = record.images.split(',').map(img => img.trim()).filter(Boolean);
                }

                // Parse tags
                let tags: string[] = [];
                if (record.tags) {
                    tags = record.tags.split(',').map(tag => tag.trim()).filter(Boolean);
                }

                // Create product
                const product = await db.product.create({
                    data: {
                        name: record.name,
                        slug: record.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        description: record.description || '',
                        shortDesc: record.shortDesc || '',
                        sku: record.sku,
                        price: parseFloat(record.price) || 0,
                        comparePrice: record.comparePrice ? parseFloat(record.comparePrice) : null,
                        costPrice: record.costPrice ? parseFloat(record.costPrice) : null,
                        trackQuantity: record.trackQuantity === 'true' || record.trackQuantity === '1',
                        quantity: parseInt(record.quantity) || 0,
                        weight: record.weight ? parseFloat(record.weight) : null,
                        images: images,
                        tags: tags.length > 0 ? tags : undefined,
                        isActive: record.isActive === 'true' || record.isActive === '1',
                        featured: record.featured === 'true' || record.featured === '1',
                        seoTitle: record.seoTitle || undefined,
                        seoDesc: record.seoDesc || undefined,
                        categoryId: category?.id,
                        brandId: brand?.id,
                        inventory: {
                            create: {
                                quantity: parseInt(record.quantity) || 0,
                                lowStockThreshold: 10,
                                reorderPoint: 5,
                            }
                        }
                    }
                });

                // Log audit trail
                if (user) {
                    await logAuditTrail({
                        userId: user.id,
                        tableName: 'products',
                        recordId: product.id,
                        action: 'INSERT',
                        newValues: product
                    });
                }

                successful++;
            } catch (error) {
                console.error('Error importing product:', error);
                errors.push(`Row ${successful + failed + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                failed++;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                successful,
                failed,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        console.error('Bulk import error:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}