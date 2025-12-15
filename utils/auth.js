// Authentication utilities
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (user) => {
  if (!user) {
    console.error('❌ generateToken: user parameter is null or undefined');
    throw new Error('User object is required for token generation');
  }
  
  const payload = { 
    uid: user.uid,
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    nickname: user.nickname,
    role: user.role
  };
  
  // Validate payload is not null
  if (!payload || Object.keys(payload).length === 0) {
    console.error('❌ generateToken: payload is empty or invalid');
    throw new Error('Invalid payload for token generation');
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    if (!token) {
      console.error('❌ verifyToken: token is null or undefined');
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      console.error('❌ verifyToken: decoded payload is null');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('❌ verifyToken error:', error.message);
    return null;
  }
};

// Check account lock status
export const isAccountLocked = async (userId) => {
  if (!userId) return false;
  const lock = await prisma.accountLock.findUnique({ where: { userId } }).catch(() => null);
  if (!lock) return false;
  if (lock.unlockedAt) return false;
  if (lock.expiresAt && new Date(lock.expiresAt) < new Date()) return false;
  return true;
};

// Get user from request cookies (for session-based auth)
export const getUserFromRequest = async (request) => {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const locked = await isAccountLocked(decoded.id);
    if (locked) return null;

    // Ensure the user still exists in the database; if not, treat as unauthenticated
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        nickname: true,
        role: true,
        userType: true,
        accountStatus: true,
        isActive: true
      }
    });

    if (!dbUser) {
      return null;
    }

    return { ...decoded, ...dbUser };
  } catch (error) {
    return null;
  }
};

// Generate unique user ID
export const generateUID = () => {
  return uuidv4();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};
