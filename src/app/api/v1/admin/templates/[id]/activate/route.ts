import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// POST activate template
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const templateId = params.id;

        // Check if template exists
        const template = await prisma.landingTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            );
        }

        // Use a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Deactivate all templates
            await tx.landingTemplate.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });

            // Activate the selected template
            await tx.landingTemplate.update({
                where: { id: templateId },
                data: { isActive: true }
            });

            // Update site settings to point to the new active template
            const settings = await tx.siteSettings.findFirst();
            if (settings) {
                await tx.siteSettings.update({
                    where: { id: settings.id },
                    data: { activeTemplateId: templateId }
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Template activated successfully'
        });
    } catch (error) {
        console.error('Error activating template:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
