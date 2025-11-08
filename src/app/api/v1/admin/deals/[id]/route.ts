import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deal = await prisma.deal.findUnique({
            where: { id },
        });

        if (!deal) {
            return NextResponse.json(
                { error: 'Deal not found' },
                { status: 404 }
            );
        }

        // Fetch product details separately
        const product = await prisma.product.findUnique({
            where: { id: deal.productId },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
            },
        }); return NextResponse.json({ ...deal, product });
    } catch (error) {
        console.error('Error fetching deal:', error);
        return NextResponse.json(
            { error: 'Failed to fetch deal' },
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
        const { title, description, discount, startDate, endDate, isActive } = body;

        // Validate discount if provided
        if (discount !== undefined && (discount < 1 || discount > 99)) {
            return NextResponse.json(
                { error: 'Discount must be between 1 and 99' },
                { status: 400 }
            );
        }

        // Validate dates if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                return NextResponse.json(
                    { error: 'End date must be after start date' },
                    { status: 400 }
                );
            }
        }

        const deal = await prisma.deal.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(discount !== undefined && { discount }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        // Fetch product details
        const product = await prisma.product.findUnique({
            where: { id: deal.productId },
            select: {
                id: true,
                name: true,
                price: true,
                images: true,
            },
        });

        return NextResponse.json({ ...deal, product });
    } catch (error) {
        console.error('Error updating deal:', error);
        return NextResponse.json(
            { error: 'Failed to update deal' },
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
        await prisma.deal.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting deal:', error);
        return NextResponse.json(
            { error: 'Failed to delete deal' },
            { status: 500 }
        );
    }
}
