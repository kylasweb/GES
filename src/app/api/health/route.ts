import { NextResponse } from "next/server";

export async function GET() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'PHONEPE_MERCHANT_ID',
    'PHONEPE_SALT_KEY',
    'PHONEPE_SALT_INDEX',
    'PHONEPE_ENV'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return NextResponse.json({
      error: 'Missing environment variables',
      missing: missingVars,
      message: 'Please set these environment variables in Vercel dashboard'
    }, { status: 500 });
  }

  return NextResponse.json({
    message: "Good!",
    status: 'Environment variables are set',
    timestamp: new Date().toISOString()
  });
}