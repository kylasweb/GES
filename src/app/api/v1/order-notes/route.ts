import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
    orderId: z.string(),
    note: z.string().min(1),
    isInternal: z.boolean().default(false)
});

// GET - List order notes
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
        }

        const isAdmin = ['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '');

        // Verify order access
        const order = await db.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (!isAdmin && order.userId !== user.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const where: any = { orderId };

        // Customers can only see non-internal notes
        if (!isAdmin) {
            where.isInternal = false;
        }

        const notes = await db.orderNote.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        return NextResponse.json({ success: true, data: notes });
    } catch (error) {
        console.error('Get order notes error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
    }
}

// POST - Add order note
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const body = await request.json();
        const validated = noteSchema.parse(body);

        const isAdmin = ['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '');

        // Verify order access
        const order = await db.order.findUnique({
            where: { id: validated.orderId }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (!isAdmin && order.userId !== user.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        // Only admins can create internal notes
        if (validated.isInternal && !isAdmin) {
            return NextResponse.json({ success: false, error: 'Only admins can create internal notes' }, { status: 403 });
        }

        const note = await db.orderNote.create({
            data: {
                orderId: validated.orderId,
                userId: user.id,
                note: validated.note,
                isInternal: validated.isInternal
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Create note error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 });
    }
}

// DELETE - Delete order note
export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const noteId = searchParams.get('id');

        if (!noteId) {
            return NextResponse.json({ success: false, error: 'Note ID required' }, { status: 400 });
        }

        const note = await db.orderNote.findUnique({
            where: { id: noteId }
        });

        if (!note) {
            return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
        }

        const isAdmin = ['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '');

        // Users can only delete their own notes, admins can delete any
        if (!isAdmin && note.userId !== user.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await db.orderNote.delete({
            where: { id: noteId }
        });

        return NextResponse.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
    }
}
