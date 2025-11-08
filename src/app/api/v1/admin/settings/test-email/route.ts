import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
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
        const { testEmail } = body;

        if (!testEmail) {
            return NextResponse.json(
                { error: 'Test email address is required' },
                { status: 400 }
            );
        }

        // Get SMTP settings
        const settings = await prisma.siteSettings.findFirst();

        if (!settings || !settings.smtpHost || !settings.smtpFromEmail) {
            return NextResponse.json(
                { error: 'SMTP settings not configured. Please configure SMTP settings first.' },
                { status: 400 }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpSecure || false,
            auth: settings.smtpUser && settings.smtpPassword ? {
                user: settings.smtpUser,
                pass: settings.smtpPassword,
            } : undefined,
        });

        // Verify connection
        try {
            await transporter.verify();
        } catch (verifyError: any) {
            console.error('SMTP verification error:', verifyError);
            return NextResponse.json(
                { error: `SMTP connection failed: ${verifyError.message}` },
                { status: 400 }
            );
        }

        // Send test email
        const info = await transporter.sendMail({
            from: `${settings.smtpFromName || settings.siteName} <${settings.smtpFromEmail}>`,
            to: testEmail,
            subject: 'SMTP Test Email - Green Energy Solutions',
            text: 'This is a test email from your Green Energy Solutions website. If you received this, your SMTP configuration is working correctly!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #16a34a;">SMTP Configuration Test</h2>
                    <p>This is a test email from your <strong>Green Energy Solutions</strong> website.</p>
                    <p>If you received this message, your SMTP configuration is working correctly! ✅</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #6b7280; font-size: 14px;">
                        This is an automated test email. Please do not reply.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully!',
            messageId: info.messageId,
        });
    } catch (error: any) {
        console.error('Error sending test email:', error);
        return NextResponse.json(
            { error: `Failed to send test email: ${error.message}` },
            { status: 500 }
        );
    }
}
