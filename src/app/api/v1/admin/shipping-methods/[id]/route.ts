import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const method = await prisma.shippingMethod.findUnique({
            where: { id },
        });

        if (!method) {
            return NextResponse.json(
                { error: 'Shipping method not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(method);
    } catch (error) {
        console.error('Error fetching shipping method:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shipping method' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const method = await prisma.shippingMethod.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.type !== undefined && { type: body.type }),
                ...(body.cost !== undefined && { cost: body.cost }),
                ...(body.minOrder !== undefined && { minOrder: body.minOrder }),
                ...(body.maxOrder !== undefined && { maxOrder: body.maxOrder }),
                ...(body.cities !== undefined && { cities: body.cities }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
                ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
            },
        });

        return NextResponse.json(method);
    } catch (error) {
        console.error('Error updating shipping method:', error);
        return NextResponse.json(
            { error: 'Failed to update shipping method' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.shippingMethod.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting shipping method:', error);
        return NextResponse.json(
            { error: 'Failed to delete shipping method' },
            { status: 500 }
        );
    }
}
