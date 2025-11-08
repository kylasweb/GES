import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Update admin presence (heartbeat)
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
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { isOnline, department, socketId } = body;

        const presence = await db.adminPresence.upsert({
            where: { userId: user.userId },
            update: {
                isOnline,
                lastSeenAt: new Date(),
                socketId,
                department,
            },
            create: {
                userId: user.userId,
                isOnline,
                socketId,
                department,
            },
        });

        return NextResponse.json({
            success: true,
            data: { presence },
        });

    } catch (error) {
        console.error('Update presence error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update presence' },
            { status: 500 }
        );
    }
}

// Get online admins
export async function GET(request: NextRequest) {
    try {
        const onlineAdmins = await db.adminPresence.findMany({
            where: { isOnline: true },
        });

        // Fetch user details separately
        const userIds = onlineAdmins.map(a => a.userId);
        const users = await db.user.findMany({
            where: {
                id: { in: userIds },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        const adminsWithDetails = onlineAdmins.map(admin => ({
            ...admin,
            user: users.find(u => u.id === admin.userId),
        }));

        return NextResponse.json({
            success: true,
            data: {
                onlineAdmins: adminsWithDetails,
                count: onlineAdmins.length,
            },
        });

    } catch (error) {
        console.error('Get online admins error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch online admins' },
            { status: 500 }
        );
    }
}
