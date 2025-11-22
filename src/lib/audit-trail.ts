import { db } from '@/lib/db';
import { headers } from 'next/headers';

interface AuditLogParams {
    userId: string;
    tableName: string;
    recordId: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
}

export async function logAuditTrail({
    userId,
    tableName,
    recordId,
    action,
    oldValues,
    newValues
}: AuditLogParams) {
    try {
        // Get IP address and user agent from headers
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';
        const userAgent = headersList.get('user-agent') || '';

        await db.auditTrail.create({
            data: {
                userId,
                tableName,
                recordId,
                action,
                oldValues: oldValues ? oldValues : undefined,
                newValues: newValues ? newValues : undefined,
                ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
                userAgent
            }
        });
    } catch (error) {
        console.error('Failed to log audit trail:', error);
        // Don't throw error as this shouldn't break the main operation
    }
}

// Helper function to get changed fields between old and new values
export function getChangedFields(oldValues: Record<string, any>, newValues: Record<string, any>) {
    const changes: Record<string, { from: any; to: any }> = {};

    // Check for updated or new fields
    Object.keys(newValues).forEach(key => {
        if (oldValues[key] !== newValues[key]) {
            changes[key] = {
                from: oldValues[key],
                to: newValues[key]
            };
        }
    });

    // Check for deleted fields
    Object.keys(oldValues).forEach(key => {
        if (!(key in newValues)) {
            changes[key] = {
                from: oldValues[key],
                to: null
            };
        }
    });

    return changes;
}