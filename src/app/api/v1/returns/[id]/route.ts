import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateReturnSchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED', 'CANCELLED']).optional(),
    adminNotes: z.string().optional(),
    trackingCode: z.string().optional(),
    refundMethod: z.enum(['ORIGINAL_PAYMENT', 'STORE_CREDIT', 'BANK_TRANSFER', 'GIFT_CARD']).optional()
});

// GET - Get single return
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const where: any = { id };

        // Non-admin users can only see their own returns
        if (!['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            where.userId = user.id;
        }

        const returnRequest = await db.return.findFirst({
            where,
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        totalAmount: true,
                        items: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!returnRequest) {
            return NextResponse.json(
                { success: false, error: 'Return request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: returnRequest
        });
    } catch (error) {
        console.error('Get return error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch return request' },
            { status: 500 }
        );
    }
}

// PATCH - Update return (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateReturnSchema.parse(body);

        const returnRequest = await db.return.findUnique({
            where: { id }
        });

        if (!returnRequest) {
            return NextResponse.json(
                { success: false, error: 'Return request not found' },
                { status: 404 }
            );
        }

        const updateData: any = {};

        if (validated.status) {
            updateData.status = validated.status;

            // Set timestamps based on status
            if (validated.status === 'APPROVED') {
                updateData.approvedAt = new Date();
            } else if (validated.status === 'COMPLETED') {
                updateData.completedAt = new Date();

                // Update order status to refunded if not already
                await db.order.update({
                    where: { id: returnRequest.orderId },
                    data: { status: 'REFUNDED' }
                });
            } else if (validated.status === 'REJECTED') {
                updateData.rejectedAt = new Date();
            }
        }

        if (validated.adminNotes !== undefined) {
            updateData.adminNotes = validated.adminNotes;
        }

        if (validated.trackingCode) {
            updateData.trackingCode = validated.trackingCode;
        }

        if (validated.refundMethod) {
            updateData.refundMethod = validated.refundMethod;
        }

        const updatedReturn = await db.return.update({
            where: { id },
            data: updateData,
            include: {
                order: {
                    select: {
                        orderNumber: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedReturn
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }
        console.error('Update return error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update return request' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel return request (customer only, if pending)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const returnRequest = await db.return.findFirst({
            where: {
                id,
                userId: user.id
            }
        });

        if (!returnRequest) {
            return NextResponse.json(
                { success: false, error: 'Return request not found' },
                { status: 404 }
            );
        }

        // Can only cancel if still pending
        if (returnRequest.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, error: 'Can only cancel pending return requests' },
                { status: 400 }
            );
        }

        await db.return.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        return NextResponse.json({
            success: true,
            message: 'Return request cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel return error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to cancel return request' },
            { status: 500 }
        );
    }
}
