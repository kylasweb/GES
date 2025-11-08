import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import sharp from 'sharp';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
    const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
    return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

// Helper to get media type from mime type
function getMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) return 'DOCUMENT';
    return 'OTHER';
}

// GET - List all media
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user || !checkAdminRole(user, ['SUPER_ADMIN', 'CONTENT_MANAGER'])) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const type = searchParams.get('type');
        const folder = searchParams.get('folder');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (type) where.type = type;
        if (folder) where.folder = folder;
        if (search) {
            where.OR = [
                { filename: { contains: search, mode: 'insensitive' } },
                { originalName: { contains: search, mode: 'insensitive' } },
                { alt: { contains: search, mode: 'insensitive' } },
                { caption: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [media, total] = await Promise.all([
            db.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            db.media.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                media,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Media list error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Upload media
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user || !checkAdminRole(user, ['SUPER_ADMIN', 'CONTENT_MANAGER'])) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'general';
        const alt = formData.get('alt') as string || '';
        const caption = formData.get('caption') as string || '';
        const tags = formData.get('tags') as string || '';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const extension = file.name.split('.').pop();
        const timestamp = Date.now();
        const filename = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;

        // Create uploads directory structure
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'media', folder);
        const thumbnailsDir = join(process.cwd(), 'public', 'uploads', 'media', 'thumbnails');
        await mkdir(uploadsDir, { recursive: true });
        await mkdir(thumbnailsDir, { recursive: true });

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        const url = `/uploads/media/${folder}/${filename}`;
        let thumbnailUrl: string | undefined = undefined;
        let width: number | undefined = undefined;
        let height: number | undefined = undefined;

        // Process image: get dimensions and create thumbnail
        if (file.type.startsWith('image/')) {
            try {
                const metadata = await sharp(buffer).metadata();
                width = metadata.width;
                height = metadata.height;

                // Create thumbnail (300x300)
                const thumbnailFilename = `thumb_${filename}`;
                const thumbnailPath = join(thumbnailsDir, thumbnailFilename);

                await sharp(buffer)
                    .resize(300, 300, { fit: 'inside' })
                    .toFile(thumbnailPath);

                thumbnailUrl = `/uploads/media/thumbnails/${thumbnailFilename}`;
            } catch (error) {
                console.error('Image processing error:', error);
            }
        }

        // Save to database
        const mediaType = getMediaType(file.type);
        const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()) : [];

        const media = await db.media.create({
            data: {
                filename,
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                width,
                height,
                url,
                thumbnailUrl,
                alt,
                caption,
                type: mediaType,
                folder,
                tags: tagsArray,
                uploadedBy: user.email,
            },
        });

        return NextResponse.json({
            success: true,
            data: media,
        });
    } catch (error) {
        console.error('Media upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Bulk delete media
export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user || !checkAdminRole(user, ['SUPER_ADMIN'])) {
            return NextResponse.json(
                { success: false, error: 'Super admin access required' },
                { status: 403 }
            );
        }

        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json(
                { success: false, error: 'Invalid media IDs' },
                { status: 400 }
            );
        }

        // Get media records
        const mediaRecords = await db.media.findMany({
            where: { id: { in: ids } },
        });

        // Delete files from disk
        for (const media of mediaRecords) {
            try {
                const filePath = join(process.cwd(), 'public', media.url);
                await unlink(filePath);

                if (media.thumbnailUrl) {
                    const thumbPath = join(process.cwd(), 'public', media.thumbnailUrl);
                    await unlink(thumbPath).catch(() => { });
                }
            } catch (error) {
                console.error('File deletion error:', error);
            }
        }

        // Delete from database
        await db.media.deleteMany({
            where: { id: { in: ids } },
        });

        return NextResponse.json({
            success: true,
            data: { deleted: mediaRecords.length },
        });
    } catch (error) {
        console.error('Media delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
