import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const schema = z.object({
            sessionId: z.string(),
            rating: z.number().min(1).max(5),
            comment: z.string().optional(),
        });

        const data = schema.parse(body);

        // Find chat
        const chat = await db.chat.findUnique({
            where: { sessionId: data.sessionId },
        });

        if (!chat) {
            return NextResponse.json(
                { success: false, error: 'Chat not found' },
                { status: 404 }
            );
        }

        // Update chat with rating
        const updatedChat = await db.chat.update({
            where: { sessionId: data.sessionId },
            data: {
                rating: data.rating,
                ratingComment: data.comment,
            },
        });

        return NextResponse.json({
            success: true,
            data: { chat: updatedChat },
            message: 'Thank you for your feedback!',
        });

    } catch (error) {
        console.error('Chat rating error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to submit rating' },
            { status: 500 }
        );
    }
}
