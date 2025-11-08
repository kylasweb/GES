'use client';

import { useEffect } from 'react';

/**
 * AuthProvider - Sets up global fetch interceptor for authentication
 * This ensures all API calls automatically include the auth token
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Store original fetch
        const originalFetch = window.fetch;

        // Override fetch to add auth token
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const token = localStorage.getItem('token');

            // Only add token to same-origin requests or API routes
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            const isApiRoute = url.startsWith('/api/') || url.startsWith(window.location.origin + '/api/');

            if (token && isApiRoute) {
                const headers = new Headers(init?.headers);
                if (!headers.has('Authorization')) {
                    headers.set('Authorization', `Bearer ${token}`);
                }

                init = {
                    ...init,
                    headers,
                };
            }

            return originalFetch(input, init);
        };

        // Cleanup: restore original fetch when component unmounts
        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    return <>{children}</>;
}
