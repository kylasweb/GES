import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all versions
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const versions = await prisma.gitVersion.findMany({
            orderBy: { deployedAt: 'desc' }
        });

        return NextResponse.json(versions);
    } catch (error) {
        console.error('Error fetching versions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST create new version (Super Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            version,
            commitHash,
            commitMessage,
            branch,
            author,
            changelog,
            environment,
            rollbackable,
            metadata
        } = body;

        if (!version || !commitHash) {
            return NextResponse.json(
                { error: 'Version and commit hash are required' },
                { status: 400 }
            );
        }

        // Deactivate all versions if this is being set as active
        if (environment === 'production') {
            await prisma.gitVersion.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        const gitVersion = await prisma.gitVersion.create({
            data: {
                version,
                commitHash,
                commitMessage: commitMessage || '',
                branch: branch || 'main',
                author: author || user.email,
                deployedBy: user.email,
                changelog: changelog || [],
                environment: environment || 'production',
                isActive: environment === 'production',
                rollbackable: rollbackable !== undefined ? rollbackable : true,
                metadata: metadata || {},
            },
        });

        return NextResponse.json(gitVersion, { status: 201 });
    } catch (error: any) {
        console.error('Error creating version:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Version or commit hash already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
