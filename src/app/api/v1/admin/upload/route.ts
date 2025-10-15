import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
    const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
    return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

export async function POST(request: NextRequest) {
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
        if (!checkAdminRole(user, ['SUPER_ADMIN'])) {
            return NextResponse.json(
                { success: false, error: 'Super admin access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        if (!type || !['logo', 'favicon'].includes(type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid upload type' },
                { status: 400 }
            );
        }

        // Validate file size
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 1 * 1024 * 1024; // 2MB for logo, 1MB for favicon
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: `File size must be less than ${type === 'logo' ? '2MB' : '1MB'}` },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = type === 'logo'
            ? ['image/jpeg', 'image/png', 'image/svg+xml']
            : ['image/x-icon', 'image/png'];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: `Invalid file type for ${type}` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const extension = file.name.split('.').pop();
        const filename = `${type}_${Date.now()}.${extension}`;

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        // Return file URL
        const url = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            data: {
                url,
                filename,
                size: file.size,
                type: file.type
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}