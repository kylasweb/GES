/**
 * Orders Test Suite
 * Tests order-related API endpoints
 */

import { apiRequest, assert, assertResponse } from './runner';

export async function testOrdersListProtection() {
    // Test without authentication
    const response = await apiRequest('/api/v1/admin/orders', {
        method: 'GET',
    });

    assertResponse(response, 401, 'Orders list should require authentication');
}

export async function testOrderDetailProtection() {
    const response = await apiRequest('/api/v1/admin/orders/test-id', {
        method: 'GET',
    });

    assertResponse(response, 401, 'Order detail should require authentication');
}

export async function testOrderCreationValidation() {
    // Test with invalid/missing data
    const response = await apiRequest('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({}),
    });

    assert(
        response.status === 400 || response.status === 401,
        'Order creation should validate input'
    );
}

export async function testCartEndpoint() {
    const response = await apiRequest('/api/v1/cart', {
        method: 'GET',
    });

    // Cart endpoint behavior depends on implementation
    assert(
        response.status >= 200 && response.status < 500,
        'Cart endpoint should respond'
    );
}

export async function testCheckoutValidation() {
    const response = await apiRequest('/api/v1/checkout', {
        method: 'POST',
        body: JSON.stringify({}),
    });

    assert(
        response.status === 400 || response.status === 401,
        'Checkout should validate data'
    );
}

/**
 * Get all orders tests
 */
export function getOrdersTests() {
    return [
        { name: 'Orders list is protected', fn: testOrdersListProtection },
        { name: 'Order detail is protected', fn: testOrderDetailProtection },
        { name: 'Order creation validates input', fn: testOrderCreationValidation },
        { name: 'Cart endpoint responds', fn: testCartEndpoint },
        { name: 'Checkout validates data', fn: testCheckoutValidation },
    ];
}
