'use client';

/**
 * API Client with automatic token injection
 * Use this instead of fetch() for authenticated API calls
 */

export interface ApiResponse<T = any> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiClient {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    private getHeaders(customHeaders?: HeadersInit): HeadersInit {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...customHeaders,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async get<T = any>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...options,
            method: 'GET',
            headers: this.getHeaders(options?.headers),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...options,
            method: 'POST',
            headers: this.getHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async put<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...options,
            method: 'PUT',
            headers: this.getHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async delete<T = any>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...options,
            method: 'DELETE',
            headers: this.getHeaders(options?.headers),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async patch<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...options,
            method: 'PATCH',
            headers: this.getHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }
}

export const api = new ApiClient();

// For backward compatibility, export a fetch wrapper
export async function authenticatedFetch(url: string, options?: RequestInit): Promise<Response> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
