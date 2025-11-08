import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const newsletterSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    source: z.string().optional(),
});

// POST /api/v1/newsletter/subscribe
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, source } = newsletterSchema.parse(body);

        // Check if already subscribed
        const existing = await db.newsletter.findUnique({
            where: { email },
        });

        if (existing) {
            if (existing.status === 'ACTIVE') {
                return NextResponse.json(
                    { success: false, error: 'This email is already subscribed' },
                    { status: 400 }
                );
            }

            // Reactivate if previously unsubscribed
            const updated = await db.newsletter.update({
                where: { email },
                data: { status: 'ACTIVE', name, source },
            });

            return NextResponse.json({
                success: true,
                message: 'Successfully resubscribed to newsletter',
                data: updated,
            });
        }

        const subscriber = await db.newsletter.create({
            data: {
                email,
                name,
                source: source || 'website',
                status: 'ACTIVE',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: subscriber,
        });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid email address' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}

// DELETE /api/v1/newsletter/subscribe (unsubscribe)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const subscriber = await db.newsletter.update({
            where: { email },
            data: { status: 'UNSUBSCRIBED' },
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from newsletter',
        });
    } catch (error) {
        console.error('Error unsubscribing from newsletter:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}
