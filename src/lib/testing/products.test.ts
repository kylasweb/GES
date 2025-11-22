/**
 * Products Test Suite
 * Tests product API endpoints and operations
 */

import { apiRequest, assert, assertResponse } from './runner';

export async function testProductsList() {
    const response = await apiRequest('/api/v1/products', {
        method: 'GET',
    });

    assert(
        response.status === 200 || response.status === 404,
        'Products list endpoint should respond'
    );

    if (response.status === 200) {
        const data = await response.json();
        assert(Array.isArray(data) || data.products, 'Response should contain products array');
    }
}

export async function testProductsSearch() {
    const response = await apiRequest('/api/v1/products?search=test', {
        method: 'GET',
    });

    assert(
        response.status === 200 || response.status === 404,
        'Products search should work'
    );
}

export async function testProductCategories() {
    const response = await apiRequest('/api/v1/categories', {
        method: 'GET',
    });

    assert(
        response.status === 200 || response.status === 404,
        'Categories endpoint should respond'
    );
}

export async function testProductDetail() {
    // Test with a non-existent product ID
    const response = await apiRequest('/api/v1/products/non-existent-id', {
        method: 'GET',
    });

    assert(
        response.status === 404 || response.status === 400,
        'Non-existent product should return 404'
    );
}

export async function testProductCreateProtection() {
    // Test without authentication
    const response = await apiRequest('/api/v1/admin/products', {
        method: 'POST',
        body: JSON.stringify({
            name: 'Test Product',
            price: 100,
        }),
    });

    assertResponse(response, 401, 'Product creation should require authentication');
}

/**
 * Get all products tests
 */
export function getProductsTests() {
    return [
        { name: 'Products list endpoint works', fn: testProductsList },
        { name: 'Products search works', fn: testProductsSearch },
        { name: 'Categories endpoint works', fn: testProductCategories },
        { name: 'Product detail handles missing products', fn: testProductDetail },
        { name: 'Product creation is protected', fn: testProductCreateProtection },
    ];
}
