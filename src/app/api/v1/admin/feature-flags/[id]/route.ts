import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET single feature flag
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const flag = await prisma.featureFlag.findUnique({
            where: { id: params.id }
        });

        if (!flag) {
            return NextResponse.json(
                { success: false, error: 'Feature flag not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: flag
        });
    } catch (error) {
        console.error('Feature flag fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch feature flag' },
            { status: 500 }
        );
    }
}

// PUT update feature flag
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { enabled, rollout, name, description, config } = body;

        const updateData: any = {};
        if (typeof enabled === 'boolean') updateData.enabled = enabled;
        if (typeof rollout === 'number') updateData.rollout = Math.max(0, Math.min(100, rollout));
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (config !== undefined) updateData.config = config;

        const flag = await prisma.featureFlag.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            data: flag
        });
    } catch (error) {
        console.error('Feature flag update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update feature flag' },
            { status: 500 }
        );
    }
}

// DELETE feature flag
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await verifyAuth(request);
        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Super Admin only' },
                { status: 401 }
            );
        }

        await prisma.featureFlag.delete({
            where: { id: params.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Feature flag deleted successfully'
        });
    } catch (error) {
        console.error('Feature flag deletion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete feature flag' },
            { status: 500 }
        );
    }
}
