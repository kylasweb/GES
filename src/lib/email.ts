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

/**
 * Send stock alert notification
 */
export async function sendStockAlertNotification(email: string, productName: string, productUrl: string) {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              ${getEmailStyles()}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🎉 Product Back in Stock!</h2>
              </div>
              <div class="content">
                <h3>${productName}</h3>
                <p>Great news! The product you wanted is now back in stock.</p>
                <p><strong>Don't wait too long - stock is limited!</strong></p>
                <a href="${productUrl}" class="button">View Product →</a>
              </div>
              <div class="footer">
                <p>Green Energy Solutions</p>
                <p>You received this because you signed up for stock alerts.</p>
              </div>
            </div>
          </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: `${productName} is back in stock! 🎉`,
        html,
    });
}

/**
 * Send order status update notification
 */
export async function sendOrderStatusNotification(
    email: string,
    orderNumber: string,
    status: string,
    customerName: string,
    trackingCode?: string
) {
    const statusMessages: Record<string, { title: string; message: string }> = {
        PROCESSING: {
            title: 'Order Confirmed',
            message: 'Your order has been confirmed and is being prepared for shipment.',
        },
        SHIPPED: {
            title: 'Order Shipped',
            message: 'Great news! Your order has been shipped and is on its way to you.',
        },
        DELIVERED: {
            title: 'Order Delivered',
            message: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
        },
        CANCELLED: {
            title: 'Order Cancelled',
            message: 'Your order has been cancelled as requested.',
        },
        REFUNDED: {
            title: 'Order Refunded',
            message: 'Your refund has been processed successfully.',
        },
    };

    const statusInfo = statusMessages[status] || {
        title: 'Order Update',
        message: 'Your order status has been updated.'
    };

    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              ${getEmailStyles()}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>${statusInfo.title}</h2>
                <p>Order #${orderNumber}</p>
              </div>
              <div class="content">
                <p>Hi ${customerName},</p>
                <p>${statusInfo.message}</p>
                <div class="message-box">
                  <p><strong>Order Number:</strong> ${orderNumber}</p>
                  <p><strong>Status:</strong> ${status}</p>
                  ${trackingCode ? `<p><strong>Tracking Code:</strong> ${trackingCode}</p>` : ''}
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  View Order Details →
                </a>
              </div>
              <div class="footer">
                <p>Green Energy Solutions</p>
              </div>
            </div>
          </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: `${statusInfo.title} - Order #${orderNumber}`,
        html,
    });
}

/**
 * Send warranty claim update notification
 */
export async function sendWarrantyClaimNotification(
    email: string,
    claimNumber: string,
    status: string,
    customerName: string,
    productName: string,
    resolution?: string
) {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              ${getEmailStyles()}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Warranty Claim Update</h2>
                <p>Claim #${claimNumber}</p>
              </div>
              <div class="content">
                <p>Hi ${customerName},</p>
                <p>We wanted to update you on the status of your warranty claim.</p>
                <div class="message-box">
                  <p><strong>Claim Number:</strong> ${claimNumber}</p>
                  <p><strong>Product:</strong> ${productName}</p>
                  <p><strong>Status:</strong> ${status}</p>
                  ${resolution ? `<p><strong>Resolution:</strong> ${resolution}</p>` : ''}
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/warranties" class="button">
                  View Claim Details →
                </a>
              </div>
              <div class="footer">
                <p>Green Energy Solutions</p>
              </div>
            </div>
          </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: `Warranty Claim Update - ${claimNumber}`,
        html,
    });
}

/**
 * Send quote response notification
 */
export async function sendQuoteResponseNotification(
    email: string,
    quoteNumber: string,
    customerName: string,
    quotedAmount: number,
    validUntil: string
) {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              ${getEmailStyles()}
              .amount { 
                font-size: 32px; 
                color: #3b82f6; 
                font-weight: bold; 
                text-align: center; 
                margin: 20px 0; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Your Custom Quote is Ready</h2>
                <p>Quote #${quoteNumber}</p>
              </div>
              <div class="content">
                <p>Hi ${customerName},</p>
                <p>Thank you for your quote request. We're pleased to provide you with the following quote:</p>
                <div class="amount">₹${quotedAmount.toLocaleString()}</div>
                <div class="message-box">
                  <p><strong>Quote Number:</strong> ${quoteNumber}</p>
                  <p><strong>Valid Until:</strong> ${new Date(validUntil).toLocaleDateString()}</p>
                </div>
                <p>This quote is valid until the date mentioned above.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/quote" class="button">
                  View Quote Details →
                </a>
              </div>
              <div class="footer">
                <p>Green Energy Solutions</p>
              </div>
            </div>
          </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: `Your Quote is Ready - ${quoteNumber}`,
        html,
    });
}

/**
 * Send return approved notification
 */
export async function sendReturnApprovedNotification(
    email: string,
    returnNumber: string,
    orderNumber: string,
    customerName: string,
    refundAmount: number
) {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              ${getEmailStyles()}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Return Approved</h2>
                <p>Return #${returnNumber}</p>
              </div>
              <div class="content">
                <p>Hi ${customerName},</p>
                <p>Your return request has been approved!</p>
                <div class="message-box">
                  <p><strong>Return Number:</strong> ${returnNumber}</p>
                  <p><strong>Order Number:</strong> ${orderNumber}</p>
                  <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
                </div>
                <p>Please ship the items back to us. Once we receive and inspect the items, your refund will be processed.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/returns" class="button">
                  View Return Details →
                </a>
              </div>
              <div class="footer">
                <p>Green Energy Solutions</p>
              </div>
            </div>
          </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: `Return Approved - ${returnNumber}`,
        html,
    });
}
