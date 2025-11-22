import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

        // Fetch fresh settings with active template
        let settings = await db.siteSettings.findFirst({
            include: {
                activeTemplate: true
            }
        });

        // Create default settings if none exist
        if (!settings) {
            settings = await db.siteSettings.create({
                data: {
                    siteName: 'Green Energy Solutions',
                    maintenanceMode: false,
                    config: {},
                },
                include: {
                    activeTemplate: true
                }
            });
        }

        // Update cache
        cachedSettings = settings;
        cacheTime = now;

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching site settings:', error);

        // Return defaults on error
        return NextResponse.json({
            siteName: 'Green Energy Solutions',
            activeTemplate: null
        });
    }
}