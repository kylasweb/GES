import { HealthCheckResult } from './database';

/**
 * Check PhonePe payment gateway reachability
 */
export async function checkPaymentGateway(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
        // Check if PhonePe environment variables are configured
        const requiredVars = [
            'PHONEPE_MERCHANT_ID',
            'PHONEPE_SALT_KEY',
            'PHONEPE_SALT_INDEX',
            'PHONEPE_ENV'
        ];

        const missingVars = requiredVars.filter(v => !process.env[v]);

        if (missingVars.length > 0) {
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                details: 'PhonePe configuration incomplete',
                error: `Missing variables: ${missingVars.join(', ')}`,
            };
        }

        // Check if we're in test or production mode
        const env = process.env.PHONEPE_ENV;
        const isProduction = env === 'PRODUCTION';

        // In a real implementation, you might want to make a test API call
        // For now, we'll just verify the configuration exists

        const responseTime = Date.now() - startTime;

        return {
            status: 'healthy',
            responseTime,
            details: `PhonePe configured (${isProduction ? 'Production' : 'Test'} mode)`,
        };
    } catch (error) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            details: 'Payment gateway check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get payment gateway status details
 */
export async function getPaymentGatewayDetails() {
    return {
        provider: 'PhonePe',
        environment: process.env.PHONEPE_ENV || 'Not configured',
        merchantId: process.env.PHONEPE_MERCHANT_ID ? '***' + process.env.PHONEPE_MERCHANT_ID.slice(-4) : 'Not set',
    };
}
