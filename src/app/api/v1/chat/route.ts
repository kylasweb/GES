import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sendNewChatNotification, sendOfflineMessageNotification } from '@/lib/email';

// Check if any admin is online
async function isAnyAdminOnline(): Promise<boolean> {
    const onlineAdmins = await db.adminPresence.count({
        where: { isOnline: true },
    });
    return onlineAdmins > 0;
}

// Get chat session or create new one
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const schema = z.object({
            sessionId: z.string().optional(),
            visitorName: z.string().optional(),
            visitorEmail: z.string().email().optional(),
            visitorPhone: z.string().optional(),
            message: z.string().min(1),
            messageType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
            fileUrl: z.string().optional(),
            fileName: z.string().optional(),
            fileSize: z.number().optional(),
            department: z.string().optional(),
            metadata: z.any().optional(),
        });

        const data = schema.parse(body);

        let chat;
        const adminOnline = await isAnyAdminOnline();

        if (data.sessionId) {
            // Find existing chat
            chat = await db.chat.findUnique({
                where: { sessionId: data.sessionId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        take: 50,
                    },
                },
            });

            if (!chat) {
                return NextResponse.json(
                    { success: false, error: 'Chat session not found' },
                    { status: 404 }
                );
            }

            // Add message to existing chat
            const message = await db.chatMessage.create({
                data: {
                    chatId: chat.id,
                    senderType: 'VISITOR',
                    message: data.message,
                    messageType: data.messageType,
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                    fileSize: data.fileSize,
                },
            });

            // Update chat last message time
            await db.chat.update({
                where: { id: chat.id },
                data: {
                    lastMessageAt: new Date(),
                    isOfflineMessage: !adminOnline,
                },
            });

            // Send offline notification if no admin is online
            if (!adminOnline && !chat.offlineNotificationSent) {
                await sendOfflineMessageNotification({
                    sessionId: chat.sessionId,
                    visitorName: chat.visitorName,
                    visitorEmail: chat.visitorEmail,
                    messages: [data.message],
                });

                await db.chat.update({
                    where: { id: chat.id },
                    data: { offlineNotificationSent: true },
                });
            }

            return NextResponse.json({
                success: true,
                data: {
                    message,
                    chat,
                    adminOnline,
                },
            });
        }

        // Create new chat session
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        chat = await db.chat.create({
            data: {
                sessionId,
                visitorName: data.visitorName,
                visitorEmail: data.visitorEmail,
                visitorPhone: data.visitorPhone,
                department: data.department || 'general',
                status: adminOnline ? 'ACTIVE' : 'WAITING',
                isOfflineMessage: !adminOnline,
                metadata: data.metadata,
                messages: {
                    create: {
                        senderType: 'VISITOR',
                        message: data.message,
                        messageType: data.messageType,
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                        fileSize: data.fileSize,
                    },
                },
                analytics: {
                    create: {
                        totalMessages: 1,
                        visitorMessages: 1,
                        adminMessages: 0,
                    },
                },
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        // Send email notification to admins
        if (!chat.emailNotificationSent) {
            await sendNewChatNotification({
                sessionId: chat.sessionId,
                visitorName: data.visitorName,
                visitorEmail: data.visitorEmail,
                visitorPhone: data.visitorPhone,
                firstMessage: data.message,
                department: data.department,
            });

            await db.chat.update({
                where: { id: chat.id },
                data: { emailNotificationSent: true },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                sessionId: chat.sessionId,
                chat,
                adminOnline,
            },
        });

    } catch (error) {
        console.error('Chat API error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}

// Get chat messages
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID required' },
                { status: 400 }
            );
        }

        const chat = await db.chat.findUnique({
            where: { sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!chat) {
            return NextResponse.json(
                { success: false, error: 'Chat session not found' },
                { status: 404 }
            );
        }

        // Mark admin messages as read by visitor
        await db.chatMessage.updateMany({
            where: {
                chatId: chat.id,
                senderType: 'ADMIN',
                isRead: false,
            },
            data: { isRead: true },
        });

        return NextResponse.json({
            success: true,
            data: { chat },
        });

    } catch (error) {
        console.error('Get chat error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch chat' },
            { status: 500 }
        );
    }
}
