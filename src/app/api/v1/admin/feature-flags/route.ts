import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET all feature flags
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
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const flags = await prisma.featureFlag.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({
            success: true,
            data: flags
        });
    } catch (error) {
        console.error('Feature flags fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch feature flags' },
            { status: 500 }
        );
    }
}

// POST create new feature flag
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
        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { key, name, description, enabled, rollout, category, config } = body;

        if (!key || !name) {
            return NextResponse.json(
                { success: false, error: 'Key and name are required' },
                { status: 400 }
            );
        }

        const flag = await prisma.featureFlag.create({
            data: {
                key,
                name,
                description,
                enabled: enabled ?? false,
                rollout: rollout ?? 100,
                category,
                config,
                createdBy: user.id
            }
        });

        return NextResponse.json({
            success: true,
            data: flag
        });
    } catch (error: any) {
        console.error('Feature flag creation error:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'Feature flag with this key already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create feature flag' },
            { status: 500 }
        );
    }
}
