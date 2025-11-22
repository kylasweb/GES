import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logAuditTrail } from '@/lib/audit-trail';

// Define the structure of CSV records
interface CSVRecord {
    name: string;
    description?: string;
    website?: string;
    sortOrder?: string;
    isActive?: string;
}

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

        const parsedRecords = parse(csvString, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as CSVRecord[];

        let successful = 0;
        let failed = 0;
        const errors: string[] = [];

        // Process each record
        for (const record of parsedRecords) {
            try {
                // Validate required fields
                if (!record.name) {
                    errors.push(`Row ${successful + failed + 1}: Missing required field (name)`);
                    failed++;
                    continue;
                }

                // Check if brand already exists
                const existingBrand = await db.brand.findUnique({
                    where: { name: record.name }
                });

                if (existingBrand) {
                    errors.push(`Row ${successful + failed + 1}: Brand with name ${record.name} already exists`);
                    failed++;
                    continue;
                }

                // Create brand
                const newBrand = await db.brand.create({
                    data: {
                        name: record.name,
                        slug: record.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        description: record.description || '',
                        website: record.website || undefined,
                        sortOrder: record.sortOrder ? parseInt(record.sortOrder, 10) : 0,
                        isActive: record.isActive === 'true' || record.isActive === '1',
                    }
                });

                // Log audit trail
                if (user) {
                    await logAuditTrail({
                        userId: user.id,
                        tableName: 'brands',
                        recordId: newBrand.id,
                        action: 'INSERT',
                        newValues: newBrand
                    });
                }

                successful++;
            } catch (error) {
                console.error('Error importing brand:', error);
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