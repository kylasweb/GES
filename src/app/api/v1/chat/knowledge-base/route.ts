import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Search knowledge base (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const category = searchParams.get('category');

        if (!query || query.length < 2) {
            return NextResponse.json({
                success: true,
                data: { articles: [] },
            });
        }

        const where: any = {
            isActive: true,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                { keywords: { hasSome: query.toLowerCase().split(' ') } },
            ],
        };

        if (category) {
            where.category = category;
        }

        const articles = await db.chatKnowledgeBase.findMany({
            where,
            select: {
                id: true,
                title: true,
                content: true,
                category: true,
            },
            orderBy: [
                { views: 'desc' },
                { helpful: 'desc' },
            ],
            take: 5,
        });

        return NextResponse.json({
            success: true,
            data: { articles },
        });

    } catch (error) {
        console.error('Search knowledge base error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search knowledge base' },
            { status: 500 }
        );
    }
}
