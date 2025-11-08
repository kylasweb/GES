import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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
        const days = parseInt(searchParams.get('days') || '7');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all chats within period
        const chats = await db.chat.findMany({
            where: {
                startedAt: {
                    gte: startDate,
                },
            },
            include: {
                analytics: true,
                messages: {
                    select: {
                        createdAt: true,
                        senderType: true,
                    },
                },
            },
        });

        // Calculate metrics
        const totalChats = chats.length;
        const resolvedChats = chats.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
        const activeChats = chats.filter(c => c.status === 'ACTIVE' || c.status === 'ASSIGNED').length;
        const avgRating = chats.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / chats.filter(c => c.rating).length || 0;

        // Calculate average response time
        const responseTimes = chats
            .filter(c => c.firstResponseAt)
            .map(c => {
                const start = new Date(c.startedAt).getTime();
                const response = new Date(c.firstResponseAt!).getTime();
                return (response - start) / 1000; // in seconds
            });

        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        // Calculate average resolution time
        const resolutionTimes = chats
            .filter(c => c.resolvedAt)
            .map(c => {
                const start = new Date(c.startedAt).getTime();
                const resolved = new Date(c.resolvedAt!).getTime();
                return (resolved - start) / 1000; // in seconds
            });

        const avgResolutionTime = resolutionTimes.length > 0
            ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
            : 0;

        // Messages per chat
        const totalMessages = chats.reduce((sum, c) => sum + c.messages.length, 0);
        const avgMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;

        // Department breakdown
        const departmentStats = chats.reduce((acc, chat) => {
            const dept = chat.department || 'general';
            if (!acc[dept]) {
                acc[dept] = { count: 0, resolved: 0 };
            }
            acc[dept].count++;
            if (chat.status === 'RESOLVED' || chat.status === 'CLOSED') {
                acc[dept].resolved++;
            }
            return acc;
        }, {} as Record<string, { count: number; resolved: number }>);

        // Daily chat volume
        const dailyVolume = chats.reduce((acc, chat) => {
            const date = new Date(chat.startedAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Rating distribution
        const ratingDistribution = chats
            .filter(c => c.rating)
            .reduce((acc, chat) => {
                const rating = chat.rating!;
                acc[rating] = (acc[rating] || 0) + 1;
                return acc;
            }, {} as Record<number, number>);

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalChats,
                    activeChats,
                    resolvedChats,
                    resolutionRate: totalChats > 0 ? (resolvedChats / totalChats) * 100 : 0,
                    avgRating: Math.round(avgRating * 10) / 10,
                    avgResponseTime: Math.round(avgResponseTime),
                    avgResolutionTime: Math.round(avgResolutionTime),
                    avgMessagesPerChat: Math.round(avgMessagesPerChat * 10) / 10,
                },
                departmentStats,
                dailyVolume,
                ratingDistribution,
                topRatedChats: chats
                    .filter(c => c.rating && c.rating >= 4)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 10)
                    .map(c => ({
                        sessionId: c.sessionId,
                        visitorName: c.visitorName,
                        rating: c.rating,
                        comment: c.ratingComment,
                    })),
            },
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
