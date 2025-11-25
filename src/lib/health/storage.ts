import fs from 'fs/promises';
import path from 'path';
import { HealthCheckResult } from './database';

/**
 * Check storage (file system) read/write capabilities
 */
export async function checkStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
        // Define test file path in public directory
        const publicDir = path.join(process.cwd(), 'public');
        const testFilePath = path.join(publicDir, '.health-check-test.txt');
        const testContent = `Health check test - ${new Date().toISOString()}`;

        // Test write
        await fs.writeFile(testFilePath, testContent, 'utf-8');

        // Test read
        const readContent = await fs.readFile(testFilePath, 'utf-8');

        // Verify content matches
        if (readContent !== testContent) {
            throw new Error('Read content does not match written content');
        }

        // Clean up test file
        await fs.unlink(testFilePath);

        // Get disk space info (simplified)
        const stats = await fs.stat(publicDir);

        const responseTime = Date.now() - startTime;

        return {
            status: 'healthy',
            responseTime,
            details: 'Read/write test passed',
        };
    } catch (error) {
        // Log error in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Storage health check failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }

        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            details: 'Storage check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get storage details and usage
 */
export async function getStorageDetails() {
    try {
        const publicDir = path.join(process.cwd(), 'public');

        // Count files in public directory (simplified check)
        const files = await fs.readdir(publicDir);

        return {
            accessible: true,
            publicFiles: files.length,
            path: publicDir,
        };
    } catch (error) {
        // Log error in production
        if (process.env.NODE_ENV === 'production') {
            console.error('Failed to access storage in production:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }

        return {
            accessible: false,
            error: 'Failed to access storage',
        };
    }
}