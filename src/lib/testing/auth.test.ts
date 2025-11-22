/**
 * Authentication Test Suite
 * Tests login, token validation, and role-based access
 */

import { apiRequest, assert, assertEqual, assertResponse } from './runner';

export async function testAuthEndpoint() {
    const response = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'test123',
        }),
    });

    // Should return 401 for invalid credentials (test user doesn't exist)
    assert(
        response.status === 401 || response.status === 400,
        'Auth endpoint should reject invalid credentials'
    );
}

export async function testTokenValidation() {
    const invalidToken = 'invalid.token.here';

    const response = await apiRequest('/api/v1/admin/dashboard', {
        method: 'GET',
        token: invalidToken,
    });

    assertResponse(response, 401, 'Invalid token should return 401');
}

export async function testPublicEndpoint() {
    const response = await apiRequest('/api/v1/products', {
        method: 'GET',
    });

    assert(
        response.status === 200 || response.status === 404,
        'Public endpoint should be accessible'
    );
}

export async function testHealthEndpoint() {
    const response = await apiRequest('/api/health', {
        method: 'GET',
    });

    assertResponse(response, 200, 'Health endpoint should be accessible');
}

export async function testAdminProtection() {
    // Test without token
    const response = await apiRequest('/api/v1/admin/users', {
        method: 'GET',
    });

    assertResponse(response, 401, 'Admin endpoint should require authentication');
}

/**
 * Get all authentication tests
 */
export function getAuthTests() {
    return [
        { name: 'Auth endpoint responds', fn: testAuthEndpoint },
        { name: 'Token validation works', fn: testTokenValidation },
        { name: 'Public endpoints accessible', fn: testPublicEndpoint },
        { name: 'Health endpoint accessible', fn: testHealthEndpoint },
        { name: 'Admin endpoints protected', fn: testAdminProtection },
    ];
}
