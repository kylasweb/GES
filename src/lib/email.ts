import nodemailer from 'nodemailer';
import { db } from './db';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions) {
    try {
        // Get SMTP settings from database
        const settings = await db.siteSettings.findFirst();

        if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPassword) {
            console.warn('SMTP not configured, skipping email');
            return { success: false, error: 'SMTP not configured' };
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

        // Send email
        const info = await transporter.sendMail({
            from: `"${settings.smtpFromName || 'Green Energy Solutions'}" <${settings.smtpFromEmail || settings.smtpUser}>`,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function sendNewChatNotification(chatData: {
    sessionId: string;
    visitorName?: string;
    visitorEmail?: string;
    visitorPhone?: string;
    firstMessage: string;
    department?: string;
}) {
    try {
        // Get admin emails (Super Admins)
        const admins = await db.user.findMany({
            where: {
                role: 'SUPER_ADMIN',
                isActive: true,
            },
            select: { email: true, name: true },
        });

        if (admins.length === 0) {
            console.warn('No admin users found for notification');
            return;
        }

        const adminEmails = admins.map(a => a.email);

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #10b981; }
            .message-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 New Chat Request</h2>
            </div>
            <div class="content">
              <p><strong>A new visitor has started a chat conversation!</strong></p>
              
              <div class="info-row">
                <strong>Visitor:</strong> ${chatData.visitorName || 'Anonymous'}
              </div>
              
              ${chatData.visitorEmail ? `
                <div class="info-row">
                  <strong>Email:</strong> ${chatData.visitorEmail}
                </div>
              ` : ''}
              
              ${chatData.visitorPhone ? `
                <div class="info-row">
                  <strong>Phone:</strong> ${chatData.visitorPhone}
                </div>
              ` : ''}
              
              ${chatData.department ? `
                <div class="info-row">
                  <strong>Department:</strong> ${chatData.department}
                </div>
              ` : ''}
              
              <div class="message-box">
                <strong>First Message:</strong><br/>
                <p>${chatData.firstMessage}</p>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/chat" class="button">
                Open Chat Dashboard →
              </a>
            </div>
            <div class="footer">
              <p>Green Energy Solutions - Live Chat System</p>
              <p>Session ID: ${chatData.sessionId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
New Chat Request

Visitor: ${chatData.visitorName || 'Anonymous'}
${chatData.visitorEmail ? `Email: ${chatData.visitorEmail}` : ''}
${chatData.visitorPhone ? `Phone: ${chatData.visitorPhone}` : ''}
${chatData.department ? `Department: ${chatData.department}` : ''}

First Message:
${chatData.firstMessage}

Open chat dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/chat
Session ID: ${chatData.sessionId}
    `;

        return sendEmail({
            to: adminEmails,
            subject: `🔔 New Chat from ${chatData.visitorName || 'Anonymous'}`,
            html,
            text,
        });

    } catch (error) {
        console.error('Failed to send new chat notification:', error);
        return { success: false, error };
    }
}

export async function sendOfflineMessageNotification(chatData: {
    sessionId: string;
    visitorName?: string;
    visitorEmail?: string;
    messages: string[];
}) {
    try {
        const admins = await db.user.findMany({
            where: {
                role: 'SUPER_ADMIN',
                isActive: true,
            },
            select: { email: true },
        });

        if (admins.length === 0) return;

        const adminEmails = admins.map(a => a.email);

        const messagesHtml = chatData.messages.map(msg => `<p>• ${msg}</p>`).join('');

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            .message-box { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>💬 Offline Messages Received</h2>
            </div>
            <div class="content">
              <p><strong>${chatData.visitorName || 'A visitor'} sent ${chatData.messages.length} message(s) while you were offline.</strong></p>
              
              <div class="message-box">
                <strong>Messages:</strong>
                ${messagesHtml}
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/chat" class="button">
                View and Respond →
              </a>
            </div>
            <div class="footer">
              <p>Green Energy Solutions - Live Chat System</p>
              <p>Session ID: ${chatData.sessionId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return sendEmail({
            to: adminEmails,
            subject: `💬 Offline Messages from ${chatData.visitorName || 'Visitor'}`,
            html,
        });

    } catch (error) {
        console.error('Failed to send offline message notification:', error);
        return { success: false, error };
    }
}
