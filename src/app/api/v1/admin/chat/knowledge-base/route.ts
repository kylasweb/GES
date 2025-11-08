import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Get all knowledge base articles
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const where: any = {};
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { keywords: { has: search } },
            ];
        }

        const articles = await db.chatKnowledgeBase.findMany({
            where,
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({
            success: true,
            data: { articles },
        });

    } catch (error) {
        console.error('Get knowledge base error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch knowledge base' },
            { status: 500 }
        );
    }
}

// Create knowledge base article
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        const body = await request.json();

        const schema = z.object({
            title: z.string().min(1),
            content: z.string().min(1),
            keywords: z.array(z.string()),
            category: z.string().optional(),
            isActive: z.boolean().default(true),
            sortOrder: z.number().default(0),
        });

        const data = schema.parse(body);

        const article = await db.chatKnowledgeBase.create({
            data: {
                ...data,
                createdBy: user?.userId,
            },
        });

        return NextResponse.json({
            success: true,
            data: { article },
        });

    } catch (error) {
        console.error('Create knowledge base error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create knowledge base article' },
            { status: 500 }
        );
    }
}

// Update knowledge base article
export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const body = await request.json();

        const schema = z.object({
            id: z.string(),
            title: z.string().min(1).optional(),
            content: z.string().min(1).optional(),
            keywords: z.array(z.string()).optional(),
            category: z.string().optional(),
            isActive: z.boolean().optional(),
            sortOrder: z.number().optional(),
        });

        const { id, ...data } = schema.parse(body);

        const article = await db.chatKnowledgeBase.update({
            where: { id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: { article },
        });

    } catch (error) {
        console.error('Update knowledge base error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update knowledge base article' },
            { status: 500 }
        );
    }
}

// Delete knowledge base article
export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Article ID required' },
                { status: 400 }
            );
        }

        await db.chatKnowledgeBase.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            data: { message: 'Article deleted successfully' },
        });

    } catch (error) {
        console.error('Delete knowledge base error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete knowledge base article' },
            { status: 500 }
        );
    }
}
