import { NextRequest, NextResponse } from 'next/server';
import { phonePeService } from '@/lib/phonepe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = request.headers;

    console.log('PhonePe callback received:', body);

    // Process the callback
    const result = await phonePeService.processCallback(body, headers);

    if (result.success) {
      console.log(`Payment ${result.status} for transaction: ${result.transactionId}`);
      
      // Return appropriate response to PhonePe
      return NextResponse.json({
        success: true,
        code: result.status === 'COMPLETED' ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
        message: 'Callback processed successfully',
        data: {
          merchantTransactionId: result.transactionId,
          transactionId: result.transactionId,
          status: result.status
        }
      });
    } else {
      console.error('Callback processing failed:', result.error);
      
      return NextResponse.json(
        {
          success: false,
          code: 'CALLBACK_ERROR',
          message: result.error || 'Callback processing failed'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PhonePe callback error:', error);
    
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'PhonePe callback endpoint is active',
    timestamp: new Date().toISOString()
  });
}