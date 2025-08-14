import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only employers can reveal contact information
    if (user.role !== 'employer') {
      return Response.json({ error: 'Only employers can reveal contact information' }, { status: 403 });
    }

    const { applicationId, jobSeekerId } = await request.json();

    if (!applicationId && !jobSeekerId) {
      return Response.json({ error: 'Application ID or Job Seeker ID required' }, { status: 400 });
    }

    // Get application if applicationId provided
    let application = null;
    if (applicationId) {
      application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true
        }
      });

      if (!application) {
        return Response.json({ error: 'Application not found' }, { status: 404 });
      }

      // Check if employer owns this application
      const userCompany = await prisma.company.findFirst({
        where: { userId: user.id }
      });

      if (!userCompany || userCompany.id !== application.job.companyId) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get job seeker information
    const jobSeeker = application ? application.user : await prisma.user.findUnique({
      where: { id: jobSeekerId },
      include: {
        jobSeeker: true
      }
    });

    if (!jobSeeker) {
      return Response.json({ error: 'Job seeker not found' }, { status: 404 });
    }

    // Check if contact is already revealed for this application
    if (application && application.contactVisible) {
      return Response.json({
        success: true,
        message: 'Contact information already revealed',
        contactInfo: {
          email: jobSeeker.email,
          phone: jobSeeker.jobSeeker?.phone || jobSeeker.phone,
          address: jobSeeker.jobSeeker?.address || jobSeeker.fullAddress,
          fullName: jobSeeker.fullName
        },
        alreadyRevealed: true
      });
    }

    // Check employer's credits
    const employer = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        credits: {
          where: {
            type: 'resume_view',
            expiresAt: {
              gte: new Date()
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    const availableCredits = employer.credits.reduce((total, credit) => total + credit.amount, 0);

    if (availableCredits < 1) {
      return Response.json({ 
        error: 'Insufficient credits', 
        message: 'You need at least 1 credit to reveal contact information',
        availableCredits 
      }, { status: 402 });
    }

    // Use a credit
    const creditToUse = employer.credits.find(credit => credit.amount > 0);
    if (creditToUse) {
      await prisma.userCredit.update({
        where: { id: creditToUse.id },
        data: { 
          amount: creditToUse.amount - 1,
          usedAmount: creditToUse.usedAmount + 1
        }
      });
    }

    // Mark contact as visible for this application
    if (application) {
      await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { 
          contactVisible: true,
          updatedAt: new Date()
        }
      });
    }

    // Log the contact reveal activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        type: 'contact_revealed',
        description: `Revealed contact information for ${jobSeeker.fullName || jobSeeker.email}`,
        metadata: {
          applicationId: applicationId,
          jobSeekerId: jobSeeker.id,
          creditUsed: 1
        }
      }
    });

    // Prepare contact information based on job seeker's privacy settings
    const jobSeekerProfile = jobSeeker.jobSeeker || {};
    
    const contactInfo = {
      email: jobSeekerProfile.hideEmail ? null : jobSeeker.email,
      phone: jobSeekerProfile.hidePhone ? null : (jobSeekerProfile.phone || jobSeeker.phone),
      address: jobSeekerProfile.hideAddress ? null : (jobSeekerProfile.address || jobSeeker.fullAddress),
      fullName: jobSeeker.fullName,
      city: jobSeekerProfile.city,
      country: jobSeekerProfile.country || 'Philippines'
    };

    // If job seeker has hidden some info, provide partial information
    if (jobSeekerProfile.hideEmail && jobSeeker.email) {
      const emailParts = jobSeeker.email.split('@');
      contactInfo.emailHint = emailParts.length === 2 ? 
        `${emailParts[0].charAt(0)}***@${emailParts[1]}` : 
        '***@***.com';
    }

    if (jobSeekerProfile.hidePhone && (jobSeekerProfile.phone || jobSeeker.phone)) {
      const phone = jobSeekerProfile.phone || jobSeeker.phone;
      contactInfo.phoneHint = phone.replace(/\d(?=\d{4})/g, '*');
    }

    return Response.json({
      success: true,
      message: 'Contact information revealed successfully',
      contactInfo,
      creditsRemaining: availableCredits - 1,
      privacySettings: {
        emailHidden: jobSeekerProfile.hideEmail || false,
        phoneHidden: jobSeekerProfile.hidePhone || false,
        addressHidden: jobSeekerProfile.hideAddress || false
      }
    });

  } catch (error) {
    console.error('Error revealing contact information:', error);
    return Response.json(
      { error: 'Failed to reveal contact information' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return Response.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Get application with contact visibility status
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true
          }
        },
        user: {
          include: {
            jobSeeker: true
          }
        }
      }
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'job_seeker' && application.user.id !== user.id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    if (user.role === 'employer') {
      const userCompany = await prisma.company.findFirst({
        where: { userId: user.id }
      });

      if (!userCompany || userCompany.id !== application.job.companyId) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Get employer's available credits
    let availableCredits = 0;
    if (user.role === 'employer') {
      const employer = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          credits: {
            where: {
              type: 'resume_view',
              expiresAt: {
                gte: new Date()
              }
            }
          }
        }
      });

      availableCredits = employer.credits.reduce((total, credit) => total + credit.amount, 0);
    }

    return Response.json({
      applicationId: application.id,
      contactVisible: application.contactVisible,
      availableCredits,
      jobSeeker: {
        id: application.user.id,
        fullName: application.user.fullName,
        email: application.contactVisible ? application.user.email : null,
        phone: application.contactVisible ? (application.user.jobSeeker?.phone || application.user.phone) : null,
        address: application.contactVisible ? (application.user.jobSeeker?.address || application.user.fullAddress) : null,
        privacySettings: {
          hideEmail: application.user.jobSeeker?.hideEmail || false,
          hidePhone: application.user.jobSeeker?.hidePhone || false,
          hideAddress: application.user.jobSeeker?.hideAddress || false
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact reveal status:', error);
    return Response.json(
      { error: 'Failed to fetch contact reveal status' },
      { status: 500 }
    );
  }
}
