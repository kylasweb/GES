import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyAuth, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const variations = await db.productVariation.findMany({
            where: { productId },
            include: {
                attributeValues: {
                    include: {
                        attribute: true,
                    },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ variations });
    } catch (error) {
        console.error('Get variations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        requireAdmin(request);

        const body = await request.json();

        const variationSchema = z.object({
            productId: z.string().min(1, 'Product ID is required'),
            sku: z.string().optional(),
            price: z.number().positive().optional(),
            comparePrice: z.number().positive().optional(),
            costPrice: z.number().positive().optional(),
            quantity: z.number().int().min(0).default(0),
            weight: z.number().positive().optional(),
            dimensions: z.object({
                length: z.number().positive().optional(),
                width: z.number().positive().optional(),
                height: z.number().positive().optional(),
            }).optional(),
            image: z.string().url().optional(),
            isActive: z.boolean().default(true),
            sortOrder: z.number().int().min(0).default(0),
            attributeValues: z.array(z.string()).min(1, 'At least one attribute value is required'),
        });

        const validatedData = variationSchema.parse(body);

        // Check if product exists
        const product = await db.product.findUnique({
            where: { id: validatedData.productId },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Check if attribute values exist
        const attributeValues = await db.productAttributeValue.findMany({
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

        // Check if SKU is unique (if provided)
        if (validatedData.sku) {
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

        // Create variation
        const variation = await db.productVariation.create({
            data: {
                productId: validatedData.productId,
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
                attributeValues: {
                    connect: validatedData.attributeValues.map(id => ({ id })),
                },
            },
            include: {
                attributeValues: {
                    include: {
                        attribute: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Variation created successfully',
            variation,
        }, { status: 201 });
    } catch (error) {
        console.error('Create variation error:', error);

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