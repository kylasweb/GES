import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const claimSchema = z.object({
    warrantyId: z.string(),
    issue: z.string().min(1),
    description: z.string().min(10),
    images: z.array(z.string()).optional()
});

const updateClaimSchema = z.object({
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_REPAIR', 'COMPLETED']).optional(),
    resolution: z.string().optional(),
    adminNotes: z.string().optional()
});

// POST - Submit warranty claim
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
        const validated = claimSchema.parse(body);

        // Verify warranty belongs to user and is active
        const warranty = await db.warranty.findFirst({
            where: {
                id: validated.warrantyId,
                userId: user.id,
                status: 'ACTIVE'
            }
        });

        if (!warranty) {
            return NextResponse.json({ success: false, error: 'Active warranty not found' }, { status: 404 });
        }

        // Check if warranty is expired
        if (new Date() > new Date(warranty.expiryDate)) {
            return NextResponse.json({ success: false, error: 'Warranty has expired' }, { status: 400 });
        }

        const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const claim = await db.warrantyClaim.create({
            data: {
                claimNumber,
                warrantyId: validated.warrantyId,
                issue: validated.issue,
                description: validated.description,
                images: validated.images || [],
                status: 'SUBMITTED'
            },
            include: {
                warranty: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        });

        // Update warranty status
        await db.warranty.update({
            where: { id: validated.warrantyId },
            data: { status: 'CLAIMED' }
        });

        return NextResponse.json({ success: true, data: claim }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Create claim error:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit claim' }, { status: 500 });
    }
}

// PATCH - Update warranty claim (admin only)
export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || !['SUPER_ADMIN', 'ORDER_MANAGER'].includes(user.role || '')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const claimId = searchParams.get('id');

        if (!claimId) {
            return NextResponse.json({ success: false, error: 'Claim ID required' }, { status: 400 });
        }

        const body = await request.json();
        const validated = updateClaimSchema.parse(body);

        const updateData: any = {};

        if (validated.status) {
            updateData.status = validated.status;
            if (validated.status === 'COMPLETED') {
                updateData.resolvedAt = new Date();
            }
        }

        if (validated.resolution) updateData.resolution = validated.resolution;
        if (validated.adminNotes !== undefined) updateData.adminNotes = validated.adminNotes;

        const claim = await db.warrantyClaim.update({
            where: { id: claimId },
            data: updateData,
            include: {
                warranty: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: claim });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        console.error('Update claim error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update claim' }, { status: 500 });
    }
}
