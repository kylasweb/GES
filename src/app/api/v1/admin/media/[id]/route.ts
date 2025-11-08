import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Admin role check middleware
function checkAdminRole(user: any, requiredRoles: string[] = ['SUPER_ADMIN']) {
    const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];
    return adminRoles.includes(user?.role || '') && requiredRoles.includes(user?.role || '');
}

// GET - Get single media
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const media = await db.media.findUnique({
            where: { id: params.id },
        });

        if (!media) {
            return NextResponse.json(
                { success: false, error: 'Media not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: media,
        });
    } catch (error) {
        console.error('Media get error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update media metadata
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const body = await request.json();
        const { alt, caption, folder, tags } = body;

        const updateData: any = {};
        if (alt !== undefined) updateData.alt = alt;
        if (caption !== undefined) updateData.caption = caption;
        if (folder !== undefined) updateData.folder = folder;
        if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());

        const media = await db.media.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: media,
        });
    } catch (error) {
        console.error('Media update error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete single media
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const media = await db.media.findUnique({
            where: { id: params.id },
        });

        if (!media) {
            return NextResponse.json(
                { success: false, error: 'Media not found' },
                { status: 404 }
            );
        }

        // Delete files from Vercel Blob
        try {
            await del(media.url);

            if (media.thumbnailUrl) {
                await del(media.thumbnailUrl).catch(() => { });
            }
        } catch (error) {
            console.error('Blob deletion error:', error);
        }

        // Delete from database
        await db.media.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            data: { id: params.id },
        });
    } catch (error) {
        console.error('Media delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
