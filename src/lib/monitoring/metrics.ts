/**
 * Performance Metrics Collector
 * Tracks API performance, database queries, and system metrics
 */

interface PerformanceMetric {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    timestamp: Date;
    success: boolean;
}

interface DatabaseMetric {
    query: string;
    duration: number;
    timestamp: Date;
    success: boolean;
}

interface RequestRateMetric {
    endpoint: string;
    count: number;
    errors: number;
    avgResponseTime: number;
    timestamp: Date;
}

// In-memory storage (in production, use Redis or database)
const performanceMetrics: PerformanceMetric[] = [];
const databaseMetrics: DatabaseMetric[] = [];
const requestRates: Map<string, RequestRateMetric> = new Map();

// Configuration
const MAX_METRICS_SIZE = 1000; // Keep last 1000 metrics
const RATE_WINDOW = 60000; // 1 minute window for rate calculation

/**
 * Record an API request performance metric
 */
export function recordApiMetric(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number
) {
    const metric: PerformanceMetric = {
        endpoint,
        method,
        responseTime,
        statusCode,
        timestamp: new Date(),
        success: statusCode >= 200 && statusCode < 400,
    };

    performanceMetrics.push(metric);

    // Keep only the most recent metrics
    if (performanceMetrics.length > MAX_METRICS_SIZE) {
        performanceMetrics.shift();
    }

    // Update request rates
    updateRequestRates(endpoint, responseTime, metric.success);
}

/**
 * Record a database query performance metric
 */
export function recordDatabaseMetric(query: string, duration: number, success: boolean = true) {
    const metric: DatabaseMetric = {
        query: query.substring(0, 100), // Truncate long queries
        duration,
        timestamp: new Date(),
        success,
    };

    databaseMetrics.push(metric);

    // Keep only the most recent metrics
    if (databaseMetrics.length > MAX_METRICS_SIZE) {
        databaseMetrics.shift();
    }
}

/**
 * Update request rate statistics
 */
function updateRequestRates(endpoint: string, responseTime: number, success: boolean) {
    const now = new Date();
    const key = endpoint;

    let rate = requestRates.get(key);

    if (!rate || now.getTime() - rate.timestamp.getTime() > RATE_WINDOW) {
        // Create new rate metric
        rate = {
            endpoint,
            count: 0,
            errors: 0,
            avgResponseTime: 0,
            timestamp: now,
        };
        requestRates.set(key, rate);
    }

    // Update metrics
    rate.count++;
    if (!success) rate.errors++;
    rate.avgResponseTime = (rate.avgResponseTime * (rate.count - 1) + responseTime) / rate.count;
}

/**
 * Get API performance statistics
 */
export function getApiPerformanceStats(timeWindowMinutes: number = 60) {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60000);
    const recentMetrics = performanceMetrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0,
            minResponseTime: 0,
            maxResponseTime: 0,
            errorRate: 0,
        };
    }

    const successfulMetrics = recentMetrics.filter(m => m.success);
    const responseTimes = recentMetrics.map(m => m.responseTime);

    return {
        totalRequests: recentMetrics.length,
        successfulRequests: successfulMetrics.length,
        failedRequests: recentMetrics.length - successfulMetrics.length,
        avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        errorRate: ((recentMetrics.length - successfulMetrics.length) / recentMetrics.length) * 100,
    };
}

/**
 * Get database performance statistics
 */
export function getDatabasePerformanceStats(timeWindowMinutes: number = 60) {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60000);
    const recentMetrics = databaseMetrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
        return {
            totalQueries: 0,
            avgQueryTime: 0,
            minQueryTime: 0,
            maxQueryTime: 0,
            slowQueries: 0,
        };
    }

    const durations = recentMetrics.map(m => m.duration);
    const slowQueries = recentMetrics.filter(m => m.duration > 1000); // Queries > 1s

    return {
        totalQueries: recentMetrics.length,
        avgQueryTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        minQueryTime: Math.min(...durations),
        maxQueryTime: Math.max(...durations),
        slowQueries: slowQueries.length,
    };
}

/**
 * Get top endpoints by request count
 */
export function getTopEndpoints(limit: number = 10) {
    const endpointStats = new Map<string, { count: number; avgTime: number; errors: number }>();

    performanceMetrics.forEach(metric => {
        const key = `${metric.method} ${metric.endpoint}`;
        const stats = endpointStats.get(key) || { count: 0, avgTime: 0, errors: 0 };

        stats.count++;
        if (!metric.success) stats.errors++;
        stats.avgTime = (stats.avgTime * (stats.count - 1) + metric.responseTime) / stats.count;

        endpointStats.set(key, stats);
    });

    return Array.from(endpointStats.entries())
        .map(([endpoint, stats]) => ({ endpoint, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Get slowest endpoints
 */
export function getSlowestEndpoints(limit: number = 10) {
    const endpointStats = new Map<string, { count: number; avgTime: number }>();

    performanceMetrics.forEach(metric => {
        const key = `${metric.method} ${metric.endpoint}`;
        const stats = endpointStats.get(key) || { count: 0, avgTime: 0 };

        stats.count++;
        stats.avgTime = (stats.avgTime * (stats.count - 1) + metric.responseTime) / stats.count;

        endpointStats.set(key, stats);
    });

    return Array.from(endpointStats.entries())
        .map(([endpoint, stats]) => ({ endpoint, ...stats }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, limit);
}

/**
 * Clear old metrics (cleanup function)
 */
export function clearOldMetrics(olderThanHours: number = 24) {
    const cutoffTime = new Date(Date.now() - olderThanHours * 3600000);

    // Clear old API metrics
    const apiIndex = performanceMetrics.findIndex(m => m.timestamp >= cutoffTime);
    if (apiIndex > 0) {
        performanceMetrics.splice(0, apiIndex);
    }

    // Clear old database metrics
    const dbIndex = databaseMetrics.findIndex(m => m.timestamp >= cutoffTime);
    if (dbIndex > 0) {
        databaseMetrics.splice(0, dbIndex);
    }
}

/**
 * Get current request rates
 */
export function getCurrentRequestRates() {
    const now = new Date();
    const activeRates: RequestRateMetric[] = [];

    requestRates.forEach((rate, key) => {
        // Only include rates from the last window
        if (now.getTime() - rate.timestamp.getTime() <= RATE_WINDOW) {
            activeRates.push(rate);
        } else {
            requestRates.delete(key);
        }
    });

    return activeRates;
}
