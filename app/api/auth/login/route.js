import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '../../../../utils/googleApi';
import { generateToken, isValidEmail } from '../../../../utils/auth';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export async function POST(request) {
  console.log('🔑 Login API called');
  
  try {
    const body = await request.json();
    console.log('📋 Login request for email:', body.email);
    
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up user in Google Sheets...');
    // Get user from sheet
    const user = await getUserByEmail(SPREADSHEET_ID, email);
    if (!user) {
      console.log('❌ User not found in sheets');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('👤 User found:', { ...user, password: '[HIDDEN]' });
    
    // Verify password against hashed password from column H
    console.log('🔐 Verifying password against hash from column H...');
    if (!user.password) {
      console.log('❌ No password hash found in sheet');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ Password verification failed');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');    // Generate JWT token
    console.log('🎫 Creating JWT token...');
    const token = generateToken(user);

    // Create response
    console.log('📤 Sending successful login response');
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        user: {
          uid: user.uid,
          fullName: user.fullName,
          nickname: user.nickname,
          email: user.email,
          age: user.age,
          dateOfBirth: user.dateOfBirth,
          fullAddress: user.fullAddress
        }
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
