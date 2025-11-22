import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { exportProducts, exportOrders, exportUsers, exportBrands } from '@/lib/export-utils';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const format = searchParams.get('format') as 'csv' | 'json' || 'csv';
        const includeHeaders = searchParams.get('includeHeaders') !== 'false';
        const delimiter = searchParams.get('delimiter') || ',';

        if (!type) {
            return NextResponse.json(
                { error: 'Export type is required' },
                { status: 400 }
            );
        }

        let exportResult;

        switch (type) {
            case 'products':
                exportResult = await exportProducts({
                    format,
                    includeHeaders,
                    delimiter,
                });
                break;
            case 'orders':
                exportResult = await exportOrders({
                    format,
                    includeHeaders,
                    delimiter,
                });
                break;
            case 'users':
                exportResult = await exportUsers({
                    format,
                    includeHeaders,
                    delimiter,
                });
                break;
            case 'brands':
                exportResult = await exportBrands({
                    format,
                    includeHeaders,
                    delimiter,
                });
                break;
            default:
                return NextResponse.json(
                    { error: 'Unsupported export type' },
                    { status: 400 }
                );
        }

        // For JSON exports, we return the data directly
        if (format === 'json') {
            return NextResponse.json({
                success: true,
                data: exportResult,
                fileName: exportResult.fileName,
            });
        }

        // For CSV exports, we return a download URL
        return NextResponse.json({
            success: true,
            downloadUrl: exportResult.url,
            fileName: exportResult.fileName,
        });
    } catch (error) {
        console.error('Export error:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}