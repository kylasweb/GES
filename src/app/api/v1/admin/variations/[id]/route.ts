import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const variation = await db.productVariation.findUnique({
            where: { id: params.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    },
                },
                attributeValues: {
                    include: {
                        attribute: true,
                    },
                },
            },
        });

        if (!variation) {
            return NextResponse.json(
                { error: 'Variation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ variation });
    } catch (error) {
        console.error('Get variation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin authentication
        requireAdmin(request);

        const body = await request.json();

        const variationSchema = z.object({
            sku: z.string().optional(),
            price: z.number().positive().optional(),
            comparePrice: z.number().positive().optional(),
            costPrice: z.number().positive().optional(),
            quantity: z.number().int().min(0).optional(),
            weight: z.number().positive().optional(),
            dimensions: z.object({
                length: z.number().positive().optional(),
                width: z.number().positive().optional(),
                height: z.number().positive().optional(),
            }).optional(),
            image: z.string().url().optional(),
            isActive: z.boolean().optional(),
            sortOrder: z.number().int().min(0).optional(),
            attributeValues: z.array(z.string()).min(1, 'At least one attribute value is required').optional(),
        });

        const validatedData = variationSchema.parse(body);

        // Check if variation exists
        const existingVariation = await db.productVariation.findUnique({
            where: { id: params.id },
        });

        if (!existingVariation) {
            return NextResponse.json(
                { error: 'Variation not found' },
                { status: 404 }
            );
        }

        // Check if SKU is unique (if provided and changed)
        if (validatedData.sku && validatedData.sku !== existingVariation.sku) {
            const existingSku = await db.productVariation.findUnique({
                where: { sku: validatedData.sku },
            });

            if (existingSku) {
                return NextResponse.json(
                    { error: 'Variation with this SKU already exists' },
                    { status: 400 }
                );
            }
        }

        // Check if attribute values exist (if provided)
        let attributeValues;
        if (validatedData.attributeValues) {
            attributeValues = await db.productAttributeValue.findMany({
                where: {
                    id: { in: validatedData.attributeValues },
                },
                include: {
                    attribute: true,
                },
            });

            if (attributeValues.length !== validatedData.attributeValues.length) {
                return NextResponse.json(
                    { error: 'One or more attribute values not found' },
                    { status: 400 }
                );
            }
        }

        // Update variation
        const updateData: any = {
            sku: validatedData.sku,
            price: validatedData.price,
            comparePrice: validatedData.comparePrice,
            costPrice: validatedData.costPrice,
            quantity: validatedData.quantity,
            weight: validatedData.weight,
            dimensions: validatedData.dimensions,
            image: validatedData.image,
            isActive: validatedData.isActive,
            sortOrder: validatedData.sortOrder,
        };

        if (validatedData.attributeValues) {
            updateData.attributeValues = {
                set: validatedData.attributeValues.map(id => ({ id })),
            };
        }

        const variation = await db.productVariation.update({
            where: { id: params.id },
            data: updateData,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    },
                },
                attributeValues: {
                    include: {
                        attribute: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Variation updated successfully',
            variation,
        });
    } catch (error) {
        console.error('Update variation error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin authentication
        requireAdmin(request);

        // Check if variation exists
        const variation = await db.productVariation.findUnique({
            where: { id: params.id },
        });

        if (!variation) {
            return NextResponse.json(
                { error: 'Variation not found' },
                { status: 404 }
            );
        }

        // Delete variation
        await db.productVariation.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            message: 'Variation deleted successfully',
        });
    } catch (error) {
        console.error('Delete variation error:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message.includes('Access denied')) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}