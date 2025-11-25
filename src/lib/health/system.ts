/**
 * Get Node.js process metrics
 */
export function getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Convert bytes to MB
    const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024);

    return {
        uptime: Math.floor(uptime), // seconds
        memory: {
            rss: toMB(memoryUsage.rss), // Resident Set Size
            heapTotal: toMB(memoryUsage.heapTotal),
            heapUsed: toMB(memoryUsage.heapUsed),
            external: toMB(memoryUsage.external),
            percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        },
        nodejs: {
            version: process.version,
            platform: process.platform,
            arch: process.arch,
        },
        environment: process.env.NODE_ENV || 'development',
    };
}

/**
 * Get formatted uptime string
 */
export function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

/**
 * Check if system resources are healthy
 */
export function checkSystemHealth() {
    const metrics = getSystemMetrics();

    // Consider unhealthy if memory usage > 90%
    const memoryStatus = metrics.memory.percentage > 90 ? 'critical' :
        metrics.memory.percentage > 75 ? 'warning' : 'healthy';

    // Log warnings in production
    if (process.env.NODE_ENV === 'production' && memoryStatus !== 'healthy') {
        console.warn(`System memory usage high: ${metrics.memory.percentage}%`, {
            memoryMetrics: metrics.memory,
            timestamp: new Date().toISOString()
        });
    }

    return {
        status: memoryStatus,
        metrics,
        warnings: memoryStatus !== 'healthy' ? [`Memory usage at ${metrics.memory.percentage}%`] : [],
    };
}