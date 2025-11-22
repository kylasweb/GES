import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logAuditTrail } from '@/lib/audit-trail';
import { UserRole } from '@prisma/client';

// Define the structure of CSV records
interface CSVRecord {
    name: string;
    email: string;
    role?: string;
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
                if (!record.name || !record.email) {
                    errors.push(`Row ${successful + failed + 1}: Missing required fields (name, email)`);
                    failed++;
                    continue;
                }

                // Check if user already exists
                const existingUser = await db.user.findUnique({
                    where: { email: record.email }
                });

                if (existingUser) {
                    errors.push(`Row ${successful + failed + 1}: User with email ${record.email} already exists`);
                    failed++;
                    continue;
                }

                // Validate role
                const roleMap: Record<string, UserRole> = {
                    'CUSTOMER': UserRole.CUSTOMER,
                    'ORDER_MANAGER': UserRole.ORDER_MANAGER,
                    'FINANCE_MANAGER': UserRole.FINANCE_MANAGER,
                    'CONTENT_MANAGER': UserRole.CONTENT_MANAGER,
                    'SUPER_ADMIN': UserRole.SUPER_ADMIN
                };

                const role = record.role && roleMap[record.role] ? roleMap[record.role] : UserRole.CUSTOMER;

                // Create user
                const newUser = await db.user.create({
                    data: {
                        name: record.name,
                        email: record.email,
                        // Generate a random password for bulk import
                        password: Math.random().toString(36).slice(-8),
                        role: role,
                        isActive: record.isActive === 'true' || record.isActive === '1',
                    }
                });

                // Log audit trail
                if (user) {
                    await logAuditTrail({
                        userId: user.id,
                        tableName: 'users',
                        recordId: newUser.id,
                        action: 'INSERT',
                        newValues: newUser
                    });
                }

                successful++;
            } catch (error) {
                console.error('Error importing user:', error);
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