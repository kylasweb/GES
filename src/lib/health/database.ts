import { db } from '@/lib/db';

export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'down';
    responseTime?: number;
    details: string;
    error?: string;
}

/**
 * Check database connectivity and performance
 */
export async function checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
        // Simple query to test connection
        await db.$queryRaw`SELECT 1`;

        // Test a more complex query
        const userCount = await db.user.count();

        const responseTime = Date.now() - startTime;

        // Consider degraded if response time > 1000ms
        const status = responseTime > 1000 ? 'degraded' : 'healthy';

        return {
            status,
            responseTime,
            details: `Connected to PostgreSQL. ${userCount} users in database.`,
        };
    } catch (error) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            details: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Check database query performance with different operations
 */
export async function checkDatabasePerformance(): Promise<{
    simple: number;
    complex: number;
    write: number;
}> {
    try {
        // Simple query
        const simpleStart = Date.now();
        await db.$queryRaw`SELECT 1`;
        const simple = Date.now() - simpleStart;

        // Complex query (with joins)
        const complexStart = Date.now();
        await db.product.findMany({
            take: 10,
            include: {
                category: true,
                brand: true,
            },
        });
        const complex = Date.now() - complexStart;

        // Write test (create and delete a test record)
        const writeStart = Date.now();
        const testSetting = await db.setting.upsert({
            where: { key: '__health_check_test__' },
            create: {
                key: '__health_check_test__',
                value: { timestamp: new Date().toISOString() },
            },
            update: {
                value: { timestamp: new Date().toISOString() },
            },
        });
        const write = Date.now() - writeStart;

        return { simple, complex, write };
    } catch (error) {
        console.error('Database performance check failed:', error);
        return { simple: -1, complex: -1, write: -1 };
    }
}
