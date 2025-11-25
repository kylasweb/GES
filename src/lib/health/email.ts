import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { HealthCheckResult } from './database';

/**
 * Check email service (SMTP) connectivity
 */
export async function checkEmailService(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
        // Get SMTP settings from database
        const settings = await db.siteSettings.findFirst();

        if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPassword) {
            // Log warning in production
            if (process.env.NODE_ENV === 'production') {
                console.warn('SMTP not configured in production settings:', {
                    hasHost: !!settings?.smtpHost,
                    hasUser: !!settings?.smtpUser,
                    hasPassword: !!settings?.smtpPassword,
                    timestamp: new Date().toISOString()
                });
            }

            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                details: 'SMTP not configured in settings',
            };
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpSecure || false,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPassword,
            },
        });

        // Verify connection
        await transporter.verify();

        const responseTime = Date.now() - startTime;

        // Consider degraded if verification takes > 3 seconds
        const status = responseTime > 3000 ? 'degraded' : 'healthy';

        return {
            status,
            responseTime,
            details: `SMTP connected to ${settings.smtpHost}:${settings.smtpPort}`,
        };
    } catch (error) {
        // Log error in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Email service health check failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }

        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            details: 'SMTP connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get email service configuration details (without sensitive info)
 */
export async function getEmailServiceDetails() {
    try {
        const settings = await db.siteSettings.findFirst();

        if (!settings?.smtpHost) {
            return {
                configured: false,
                host: 'Not configured',
                port: null,
                secure: false,
            };
        }

        return {
            configured: true,
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpSecure || false,
            from: settings.smtpFromEmail || settings.smtpUser,
        };
    } catch (error) {
        // Log error in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Failed to fetch email service details in production:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }

        return {
            configured: false,
            error: 'Failed to fetch settings',
        };
    }
}