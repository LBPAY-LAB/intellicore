import { NextRequest, NextResponse } from 'next/server';
import { getLogtoContext } from '@logto/next';
import { logtoConfig } from '@/lib/logto';

export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, accessToken } = await getLogtoContext(
      logtoConfig,
      request
    );

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
