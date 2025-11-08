import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        let settings = await prisma.siteSettings.findFirst();

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: 'Green Energy Solutions',
                    headerStyle: 'default',
                    footerStyle: 'default',
                    menuStyle: 'default'
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Get existing settings or create
        let settings = await prisma.siteSettings.findFirst();

        if (settings) {
            // Update existing settings
            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: body
            });
        } else {
            // Create new settings
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: body.siteName || 'Green Energy Solutions',
                    headerStyle: body.headerStyle || 'default',
                    footerStyle: body.footerStyle || 'default',
                    menuStyle: body.menuStyle || 'default',
                    ...body
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
