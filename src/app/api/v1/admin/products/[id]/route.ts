import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logAuditTrail, getChangedFields } from '@/lib/audit-trail';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify admin authentication
        let user;
        try {
            user = requireAdmin(request);
        } catch (authError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const product = await db.product.findUnique({
            where: {
                id,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                inventory: {
                    select: {
                        quantity: true,
                        reserved: true,
                        lowStockThreshold: true,
                        reorderPoint: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify admin authentication
        let user;
        try {
            user = requireAdmin(request);
        } catch (authError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const body = await request.json();

        const updateSchema = z.object({
            isActive: z.boolean().optional(),
            featured: z.boolean().optional(),
        });

        const validatedData = updateSchema.parse(body);

        // Get current product for audit trail
        const currentProduct = await db.product.findUnique({
            where: { id },
        });

        const updatedProduct = await db.product.update({
            where: { id },
            data: validatedData,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                inventory: {
                    select: {
                        quantity: true,
                    },
                },
            },
        });

        // Log audit trail
        if (user && currentProduct) {
            const changes = getChangedFields(currentProduct, updatedProduct);
            if (Object.keys(changes).length > 0) {
                await logAuditTrail({
                    userId: user.id,
                    tableName: 'products',
                    recordId: id,
                    action: 'UPDATE',
                    oldValues: currentProduct,
                    newValues: updatedProduct
                });
            }
        }

        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update product error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify admin authentication
        let user;
        try {
            user = requireAdmin(request);
        } catch (authError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if product exists
        const product = await db.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete product (will cascade to inventory)
        await db.product.delete({
            where: { id },
        });

        // Log audit trail
        if (user) {
            await logAuditTrail({
                userId: user.id,
                tableName: 'products',
                recordId: id,
                action: 'DELETE',
                oldValues: product
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
