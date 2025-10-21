import { NextResponse } from 'next/server';
import { prisma } from '../../../../utils/db';

export async function POST(request) {
  try {
    const { resumeId, jobSeekerId } = await request.json();

    if (!resumeId || !jobSeekerId) {
      return NextResponse.json({ error: 'Resume ID and Job Seeker ID are required' }, { status: 400 });
    }

    // Get resume details
    const resume = await prisma.parsedResume.findUnique({
      where: { id: resumeId },
      include: {
        user: true
      }
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Get all employers with active resume alerts
    const employerSubscriptions = await prisma.emailSubscription.findMany({
      where: {
        type: 'resume_alerts',
        isActive: true
      },
      include: {
        user: {
          include: {
            preferences: true
          }
        }
      }
    });

    const alertsTriggered = [];

    for (const subscription of employerSubscriptions) {
      const employer = subscription.user;
      const preferences = employer.preferences;

      if (!preferences) continue;

      // Check if resume matches employer preferences
      const matches = checkResumeMatch(resume, preferences);

      if (matches) {
        // Log the alert match for the employer
        console.log(`Resume alert match for employer ${employer.id}: ${matches.join(', ')}`);

        // TODO: Create notification record when Notification model is added
        // For now, just collect the matches

        alertsTriggered.push({
          employerId: employer.id,
          employerEmail: employer.email,
          matchReasons: matches
        });
      }
    }

    return NextResponse.json({
      success: true,
      alertsTriggered: alertsTriggered.length,
      details: alertsTriggered
    });

  } catch (error) {
    console.error('Error processing resume alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function checkResumeMatch(resume, preferences) {
  const matchReasons = [];

  // Check keywords
  if (preferences.resumeKeywords && preferences.resumeKeywords.length > 0) {
    const resumeText = `${resume.skills?.join(' ') || ''} ${resume.experience || ''} ${resume.education || ''}`.toLowerCase();
    const hasKeywordMatch = preferences.resumeKeywords.some(keyword =>
      resumeText.includes(keyword.toLowerCase())
    );
    if (hasKeywordMatch) {
      matchReasons.push('Keywords match');
    } else {
      return null; // No match if keywords don't match
    }
  }

  // Check skills
  if (preferences.resumeSkills && preferences.resumeSkills.length > 0) {
    const resumeSkills = resume.skills || [];
    const hasSkillMatch = preferences.resumeSkills.some(skill =>
      resumeSkills.some(resumeSkill =>
        resumeSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    if (hasSkillMatch) {
      matchReasons.push('Skills match');
    }
  }

  // Check experience level
  if (preferences.resumeExperienceLevel) {
    const resumeExp = getExperienceLevel(resume.experienceYears || 0);
    if (resumeExp === preferences.resumeExperienceLevel) {
      matchReasons.push('Experience level match');
    }
  }

  // Check location
  if (preferences.resumeLocation) {
    if (resume.location?.toLowerCase().includes(preferences.resumeLocation.toLowerCase())) {
      matchReasons.push('Location match');
    }
  }

  // Check salary expectations
  if (preferences.resumeSalaryMin || preferences.resumeSalaryMax) {
    const resumeSalary = resume.expectedSalary;
    if (resumeSalary) {
      const minMatch = !preferences.resumeSalaryMin || resumeSalary >= preferences.resumeSalaryMin;
      const maxMatch = !preferences.resumeSalaryMax || resumeSalary <= preferences.resumeSalaryMax;
      if (minMatch && maxMatch) {
        matchReasons.push('Salary range match');
      }
    }
  }

  // Check education
  if (preferences.resumeEducation) {
    if (resume.education?.toLowerCase().includes(preferences.resumeEducation.toLowerCase())) {
      matchReasons.push('Education match');
    }
  }

  return matchReasons.length > 0 ? matchReasons : null;
}

function getExperienceLevel(years) {
  if (years < 1) return 'entry';
  if (years < 3) return 'junior';
  if (years < 5) return 'mid';
  if (years < 10) return 'senior';
  return 'executive';
}