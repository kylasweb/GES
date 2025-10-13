import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const contentBlocks = await db.contentBlock.findMany({
      where: {
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: contentBlocks
    });
  } catch (error) {
    console.error('Get landing content error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}