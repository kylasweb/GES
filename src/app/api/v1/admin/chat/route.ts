import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Get all chats for admin
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
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where = status ? { status: status as any } : {};

        const [chats, total] = await Promise.all([
            db.chat.findMany({
                where,
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                    _count: {
                        select: { messages: true },
                    },
                },
                orderBy: { lastMessageAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db.chat.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                chats,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });

    } catch (error) {
        console.error('Get chats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}

// Send admin message
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
            chatId: z.string(),
            message: z.string().min(1),
            messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'KNOWLEDGE_BASE', 'SYSTEM']).default('TEXT'),
            metadata: z.any().optional(),
        });

        const data = schema.parse(body);

        // Verify chat exists
        const chat = await db.chat.findUnique({
            where: { id: data.chatId },
        });

        if (!chat) {
            return NextResponse.json(
                { success: false, error: 'Chat not found' },
                { status: 404 }
            );
        }

        // Create message
        const message = await db.chatMessage.create({
            data: {
                chatId: data.chatId,
                senderId: user.userId,
                senderType: 'ADMIN',
                message: data.message,
                messageType: data.messageType,
                metadata: data.metadata,
            },
        });

        // Update chat
        await db.chat.update({
            where: { id: data.chatId },
            data: {
                lastMessageAt: new Date(),
                assignedTo: user.userId,
                status: 'ASSIGNED',
            },
        });

        return NextResponse.json({
            success: true,
            data: { message },
        });

    } catch (error) {
        console.error('Send message error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

// Update chat status
export async function PATCH(request: NextRequest) {
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
            chatId: z.string(),
            status: z.enum(['ACTIVE', 'WAITING', 'ASSIGNED', 'RESOLVED', 'CLOSED']),
            assignedTo: z.string().optional(),
        });

        const data = schema.parse(body);

        const chat = await db.chat.update({
            where: { id: data.chatId },
            data: {
                status: data.status,
                assignedTo: data.assignedTo,
                endedAt: data.status === 'CLOSED' ? new Date() : undefined,
            },
        });

        return NextResponse.json({
            success: true,
            data: { chat },
        });

    } catch (error) {
        console.error('Update chat error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update chat' },
            { status: 500 }
        );
    }
}
