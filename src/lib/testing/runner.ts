/**
 * Test Runner Utility
 * Executes automated feature tests and aggregates results
 */

export interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: string;
}

export interface TestSuite {
    name: string;
    tests: TestResult[];
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
}

export type TestFunction = () => Promise<TestResult>;

/**
 * Run a single test with timeout and error handling
 */
export async function runTest(
    name: string,
    testFn: () => Promise<void>,
    timeout: number = 10000
): Promise<TestResult> {
    const startTime = Date.now();

    try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Test timeout')), timeout);
        });

        // Race between test and timeout
        await Promise.race([testFn(), timeoutPromise]);

        return {
            name,
            passed: true,
            duration: Date.now() - startTime,
            details: 'Test passed successfully',
        };
    } catch (error) {
        return {
            name,
            passed: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : undefined,
        };
    }
}

/**
 * Run a test suite
 */
export async function runTestSuite(
    suiteName: string,
    tests: Array<{ name: string; fn: () => Promise<void> }>
): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    for (const test of tests) {
        const result = await runTest(test.name, test.fn);
        results.push(result);
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    return {
        name: suiteName,
        tests: results,
        passed,
        failed,
        skipped: 0,
        duration: Date.now() - startTime,
    };
}

/**
 * Helper to assert condition
 */
export function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Helper to assert equality
 */
export function assertEqual<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
        const msg = message || `Expected ${expected}, got ${actual}`;
        throw new Error(`Assertion failed: ${msg}`);
    }
}

/**
 * Helper to assert API response
 */
export function assertResponse(
    response: Response,
    expectedStatus: number,
    message?: string
) {
    if (response.status !== expectedStatus) {
        const msg = message || `Expected status ${expectedStatus}, got ${response.status}`;
        throw new Error(`Assertion failed: ${msg}`);
    }
}

/**
 * Helper to make authenticated API request
 */
export async function apiRequest(
    endpoint: string,
    options: RequestInit & { token?: string } = {}
) {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    return response;
}
