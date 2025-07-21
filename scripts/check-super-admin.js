import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    console.log('🔍 Checking Super Admin user...');
    
    // Find super admin user
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'super_admin' }
    });
    
    if (superAdmin) {
      console.log('✅ Super Admin found:');
      console.log('📧 Email:', superAdmin.email);
      console.log('👤 Full Name:', superAdmin.fullName);
      console.log('🔑 Role:', superAdmin.role);
      console.log('✅ Is Active:', superAdmin.isActive);
      console.log('📊 Account Status:', superAdmin.accountStatus);
      console.log('📅 Created At:', superAdmin.createdAt);
      console.log('🔐 Has Password:', !!superAdmin.password);
      console.log('📧 Email Verified:', !!superAdmin.emailVerifiedAt);
      console.log('🔓 Access Level:', superAdmin.accessLevel);
      
      // Also check if there are other users with admin roles
      const allAdmins = await prisma.user.findMany({
        where: {
          role: {
            in: ['super_admin', 'admin', 'employer_admin']
          }
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          accountStatus: true
        }
      });
      
      console.log('\n📋 All admin users:');
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email} - ${admin.role} - ${admin.isActive ? 'Active' : 'Inactive'} - ${admin.accountStatus}`);
      });
      
    } else {
      console.log('❌ No Super Admin found');
    }
    
  } catch (error) {
    console.error('❌ Error checking Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
