import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkDatabase, checkDatabasePerformance } from '@/lib/health/database';
import { checkPaymentGateway, getPaymentGatewayDetails } from '@/lib/health/payment';
import { checkEmailService, getEmailServiceDetails } from '@/lib/health/email';
import { checkStorage, getStorageDetails } from '@/lib/health/storage';
import { getSystemMetrics, formatUptime, checkSystemHealth } from '@/lib/health/system';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication - only admins can access
        const user = await verifyAuth(request);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Run all health checks in parallel
        const [
            databaseHealth,
            paymentHealth,
            emailHealth,
            storageHealth,
            systemHealth,
        ] = await Promise.all([
            checkDatabase(),
            checkPaymentGateway(),
            checkEmailService(),
            checkStorage(),
            Promise.resolve(checkSystemHealth()),
        ]);

        // Get additional details
        const [paymentDetails, emailDetails, storageDetails] = await Promise.all([
            getPaymentGatewayDetails(),
            getEmailServiceDetails(),
            getStorageDetails(),
        ]);

        // Determine overall health status
        const allStatuses = [
            databaseHealth.status,
            paymentHealth.status,
            emailHealth.status,
            storageHealth.status,
        ];

        const overallStatus = allStatuses.includes('down') ? 'unhealthy' :
            allStatuses.includes('degraded') ? 'degraded' : 'healthy';

        // Log health check results in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Health Check Results:', {
                timestamp: new Date().toISOString(),
                overallStatus,
                services: {
                    database: databaseHealth.status,
                    payment: paymentHealth.status,
                    email: emailHealth.status,
                    storage: storageHealth.status,
                }
            });
        }

        // Response
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            status: overallStatus,
            services: {
                database: {
                    ...databaseHealth,
                    provider: 'PostgreSQL',
                },
                paymentGateway: {
                    ...paymentHealth,
                    ...paymentDetails,
                },
                emailService: {
                    ...emailHealth,
                    configured: emailDetails.configured,
                    provider: 'SMTP',
                },
                storage: {
                    ...storageHealth,
                    accessible: storageDetails.accessible,
                },
            },
            system: {
                uptime: systemHealth.metrics.uptime,
                uptimeFormatted: formatUptime(systemHealth.metrics.uptime),
                memory: systemHealth.metrics.memory,
                nodejs: systemHealth.metrics.nodejs,
                environment: systemHealth.metrics.environment,
                status: systemHealth.status,
                warnings: systemHealth.warnings,
            },
        });
    } catch (error) {
        console.error('Health check error:', error);

        // Log error details in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Health check failed in production:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Health check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}