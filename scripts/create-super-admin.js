import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin user...');
    
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin' }
    });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists:', existingSuperAdmin.email);
      console.log('🔄 Do you want to update the existing super admin? (y/n)');
      process.exit(0);
    }
    
    // Super admin credentials
    const email = 'admin@getgethired.com';
    const password = 'SuperAdmin123!'; // Change this to your desired password
    const fullName = 'Super Administrator';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: email,
        password: hashedPassword,
        fullName: fullName,
        firstName: 'Super',
        lastName: 'Administrator',
        role: 'super_admin',
        isActive: true,
        accountStatus: 'active',
        emailVerifiedAt: new Date(),
        activatedAt: new Date(),
        accessLevel: 10,
        permissions: {
          canManageUsers: true,
          canManagePricing: true,
          canManageCredits: true,
          canManageCompanies: true,
          canViewAnalytics: true,
          canManageSystem: true
        }
      }
    });
    
    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('🆔 User ID:', superAdmin.id);
    
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
