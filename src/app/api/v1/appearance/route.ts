import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache the settings for 5 minutes to reduce database queries
let cachedSettings: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    try {
        const now = Date.now();

        // Return cached settings if still valid
        if (cachedSettings && (now - cacheTime) < CACHE_DURATION) {
            return NextResponse.json(cachedSettings);
        }

        // Fetch fresh settings
        let settings = await prisma.siteSettings.findFirst({
            select: {
                headerStyle: true,
                footerStyle: true,
                menuStyle: true,
            },
        });

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    headerStyle: 'default',
                    footerStyle: 'default',
                    menuStyle: 'default',
                    maintenanceMode: false,
                    config: {
                        siteName: 'Green Energy Solutions',
                    },
                },
                select: {
                    headerStyle: true,
                    footerStyle: true,
                    menuStyle: true,
                },
            });
        }

        // Update cache
        cachedSettings = settings;
        cacheTime = now;

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching appearance settings:', error);

        // Return defaults on error
        return NextResponse.json({
            headerStyle: 'default',
            footerStyle: 'default',
            menuStyle: 'default',
        });
    }
}
