import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET appearance settings
export async function GET(request: NextRequest) {
    try {
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
        console.error('Error fetching appearance settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT update appearance settings
export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { headerStyle, footerStyle, menuStyle } = body;

        // Validate style values
        const validHeaderStyles = ['default', 'minimal', 'centered', 'transparent', 'mega'];
        const validFooterStyles = ['default', 'minimal', 'newsletter', 'social'];
        const validMenuStyles = ['default', 'dropdown', 'mega', 'sidebar'];

        if (headerStyle && !validHeaderStyles.includes(headerStyle)) {
            return NextResponse.json(
                { error: 'Invalid header style' },
                { status: 400 }
            );
        }

        if (footerStyle && !validFooterStyles.includes(footerStyle)) {
            return NextResponse.json(
                { error: 'Invalid footer style' },
                { status: 400 }
            );
        }

        if (menuStyle && !validMenuStyles.includes(menuStyle)) {
            return NextResponse.json(
                { error: 'Invalid menu style' },
                { status: 400 }
            );
        }

        // Get existing settings
        let settings = await prisma.siteSettings.findFirst();

        if (!settings) {
            // Create if doesn't exist
            settings = await prisma.siteSettings.create({
                data: {
                    siteName: 'Green Energy Solutions',
                    headerStyle: headerStyle || 'default',
                    footerStyle: footerStyle || 'default',
                    menuStyle: menuStyle || 'default'
                }
            });
        } else {
            // Update existing
            const updateData: any = {};
            if (headerStyle) updateData.headerStyle = headerStyle;
            if (footerStyle) updateData.footerStyle = footerStyle;
            if (menuStyle) updateData.menuStyle = menuStyle;

            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: updateData
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating appearance settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
