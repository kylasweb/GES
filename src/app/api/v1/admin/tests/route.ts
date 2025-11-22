import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { runTestSuite } from '@/lib/testing/runner';
import { getAuthTests } from '@/lib/testing/auth.test';
import { getProductsTests } from '@/lib/testing/products.test';
import { getOrdersTests } from '@/lib/testing/orders.test';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication - only super admins can run tests
        const user = await verifyAuth(request);
        if (!user || user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Super Admin access required' },
                { status: 401 }
            );
        }

        const startTime = Date.now();

        // Run all test suites in parallel
        const [authSuite, productsSuite, ordersSuite] = await Promise.all([
            runTestSuite('Authentication', getAuthTests()),
            runTestSuite('Products', getProductsTests()),
            runTestSuite('Orders', getOrdersTests()),
        ]);

        const totalDuration = Date.now() - startTime;

        // Calculate totals
        const allSuites = [authSuite, productsSuite, ordersSuite];
        const totalTests = allSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
        const totalPassed = allSuites.reduce((sum, suite) => sum + suite.passed, 0);
        const totalFailed = allSuites.reduce((sum, suite) => sum + suite.failed, 0);

        // Determine overall status
        const overallStatus = totalFailed === 0 ? 'passed' : totalFailed < totalTests * 0.2 ? 'partial' : 'failed';

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            status: overallStatus,
            summary: {
                total: totalTests,
                passed: totalPassed,
                failed: totalFailed,
                skipped: 0,
                duration: totalDuration,
                passRate: Math.round((totalPassed / totalTests) * 100),
            },
            suites: {
                authentication: authSuite,
                products: productsSuite,
                orders: ordersSuite,
            },
            details: {
                failedTests: allSuites.flatMap(suite =>
                    suite.tests
                        .filter(test => !test.passed)
                        .map(test => ({
                            suite: suite.name,
                            test: test.name,
                            error: test.error,
                        }))
                ),
            },
        });
    } catch (error) {
        console.error('Test execution error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to execute tests',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
