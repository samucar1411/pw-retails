import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try to get user info from the API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sys.adminpy.com:18001';
    
    try {
      const response = await fetch(`${API_URL}/api-token-auth2/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return NextResponse.json(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // If API call fails, return basic auth status
    return NextResponse.json({ authenticated: true });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}