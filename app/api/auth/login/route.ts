import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface AuthResponse {
  token: string;
  user_id: number;
  email: string;
  firts_name: string; // API typo - should be "first_name"
  last_name: string;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Call the external API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${API_URL}/api-token-auth2/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const authData: AuthResponse = await response.json();

    if (!authData.token) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Set httpOnly cookie with the token
    const cookieStore = await cookies();
    cookieStore.set('auth_token', authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user data without the token
    return NextResponse.json({
      user_id: authData.user_id,
      email: authData.email,
      firts_name: authData.firts_name,
      last_name: authData.last_name,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}