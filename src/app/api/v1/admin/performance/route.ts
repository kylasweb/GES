import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
    getApiPerformanceStats,
    getDatabasePerformanceStats,
    getTopEndpoints,
    getSlowestEndpoints,
    getCurrentRequestRates,
    clearOldMetrics,
} from '@/lib/monitoring/metrics';
import { checkDatabasePerformance } from '@/lib/health/database';

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

        // Get time window from query params (default 60 minutes)
        const { searchParams } = new URL(request.url);
        const timeWindow = parseInt(searchParams.get('window') || '60');

        // Get performance statistics
        const apiStats = getApiPerformanceStats(timeWindow);
        const dbStats = getDatabasePerformanceStats(timeWindow);
        const topEndpoints = getTopEndpoints(10);
        const slowestEndpoints = getSlowestEndpoints(10);
        const requestRates = getCurrentRequestRates();

        // Get current database performance
        const dbPerformance = await checkDatabasePerformance();

        // Clean up old metrics
        clearOldMetrics(24);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            timeWindow: `${timeWindow} minutes`,
            api: {
                ...apiStats,
                topEndpoints,
                slowestEndpoints,
                currentRates: requestRates.slice(0, 5), // Top 5 active endpoints
            },
            database: {
                ...dbStats,
                currentPerformance: dbPerformance,
            },
            summary: {
                health: apiStats.errorRate < 5 ? 'healthy' : apiStats.errorRate < 15 ? 'degraded' : 'critical',
                avgApiResponseTime: apiStats.avgResponseTime,
                avgDbQueryTime: dbStats.avgQueryTime,
                totalApiRequests: apiStats.totalRequests,
                totalDbQueries: dbStats.totalQueries,
            },
        });
    } catch (error) {
        console.error('Performance metrics error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve performance metrics',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
