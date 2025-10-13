import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string;
}

export function verifyAuth(request: NextRequest): AuthUser | null {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// For middleware usage (with database lookup)
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database to ensure they're still active
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = verifyAuth(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

export function requireRole(request: NextRequest, requiredRoles: string[]): AuthUser {
  const user = requireAuth(request);

  if (!requiredRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
  }

  return user;
}

export function requireAdmin(request: NextRequest): AuthUser {
  return requireRole(request, ['SUPER_ADMIN', 'CONTENT_MANAGER', 'ORDER_MANAGER', 'FINANCE_MANAGER']);
}

export function requireSuperAdmin(request: NextRequest): AuthUser {
  return requireRole(request, ['SUPER_ADMIN']);
}