import { NextRequest, NextResponse } from 'next/server';
import { getLogtoContext } from '@logto/next';
import { logtoConfig } from '@/lib/logto';

export async function GET(request: NextRequest) {
  try {
    const { claims, isAuthenticated } = await getLogtoContext(logtoConfig, request);

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: claims?.sub,
      username: claims?.username,
      primaryEmail: claims?.email,
      name: claims?.name,
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
