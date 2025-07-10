import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        authenticated: true,
        user: {
          id: user.id,
          uid: user.uid,
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          nickname: user.nickname,
          email: user.email,
          role: user.role,
          age: user.age,
          dateOfBirth: user.dateOfBirth,
          fullAddress: user.fullAddress
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
