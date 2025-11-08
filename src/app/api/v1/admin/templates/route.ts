import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET all templates
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const templates = await prisma.landingTemplate.findMany({
            orderBy: [
                { isActive: 'desc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST create new template (Super Admin only)
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
        const { name, slug, description, thumbnail, features, colorScheme, tags, config } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        const template = await prisma.landingTemplate.create({
            data: {
                name,
                slug,
                description,
                thumbnail,
                features: features || [],
                colorScheme: colorScheme || 'light',
                tags: tags || [],
                config: config || {},
                isActive: false,
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error: any) {
        console.error('Error creating template:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Template with this slug already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
