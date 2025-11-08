import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Get all departments
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const departments = await db.chatDepartment.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({
            success: true,
            data: { departments },
        });

    } catch (error) {
        console.error('Get departments error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch departments' },
            { status: 500 }
        );
    }
}

// Create department
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const body = await request.json();

        const schema = z.object({
            name: z.string().min(1),
            slug: z.string().min(1),
            description: z.string().optional(),
            email: z.string().email().optional(),
            isActive: z.boolean().default(true),
            sortOrder: z.number().default(0),
        });

        const data = schema.parse(body);

        const department = await db.chatDepartment.create({
            data,
        });

        return NextResponse.json({
            success: true,
            data: { department },
        });

    } catch (error) {
        console.error('Create department error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create department' },
            { status: 500 }
        );
    }
}

// Update department
export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const body = await request.json();

        const schema = z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            email: z.string().email().optional(),
            isActive: z.boolean().optional(),
            sortOrder: z.number().optional(),
        });

        const { id, ...data } = schema.parse(body);

        const department = await db.chatDepartment.update({
            where: { id },
            data,
        });

        return NextResponse.json({
            success: true,
            data: { department },
        });

    } catch (error) {
        console.error('Update department error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update department' },
            { status: 500 }
        );
    }
}

// Delete department
export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await verifyToken(token);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Department ID required' },
                { status: 400 }
            );
        }

        await db.chatDepartment.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            data: { message: 'Department deleted successfully' },
        });

    } catch (error) {
        console.error('Delete department error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete department' },
            { status: 500 }
        );
    }
}
