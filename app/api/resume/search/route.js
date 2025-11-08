import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';
import { useCredit, checkUserUsageLimits, getUserCredits } from '@/utils/newSubscriptionService';
import { USER_ROLES } from '@/utils/roleSystem';

const prisma = new PrismaClient();

// GET - Search resume database
export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load full user (include parentUser when applicable)
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id }, include: { parentUser: true } });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permission
    if (!['employer_admin', 'sub_user'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const searchMode = searchParams.get('searchMode') || 'basic';
    const location = searchParams.get('location') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const skills = searchParams.get('skills') || '';
    const education = searchParams.get('education') || '';
    const availability = searchParams.get('availability') || '';
    const salaryRange = searchParams.get('salaryRange') || '';
    const jobType = searchParams.get('jobType') || '';

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Check credit requirements for search mode
    const creditCosts = { basic: 0, advanced: 1, ai: 2 };
    const creditCost = creditCosts[searchMode] || 0;

    // Determine credit owner (main account for sub-users)
    const creditUser = currentUser.role === USER_ROLES.SUB_USER && currentUser.parentUser ? currentUser.parentUser : currentUser;

    // If paid mode, try to use centralized credit service
    let creditUsage = null;
    if (creditCost > 0) {
      const creditType = searchMode === 'ai' ? 'ai_credit' : 'resume_contact';
      try {
        creditUsage = await useCredit(creditUser.id, creditType, creditCost);
      } catch (err) {
        const usage = await checkUserUsageLimits(creditUser.id, 'resume_view').catch(() => null);
        const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
        const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;
        return NextResponse.json({
          error: `Insufficient credits. ${creditCost} credit${creditCost > 1 ? 's' : ''} required for ${searchMode} search.`,
          requiresCredits: true,
          neededCredits: creditCost,
          available: {
            subscriptionRemaining: usage && usage.hasLimit ? usage.remaining : 'unlimited',
            purchasedBalance
          }
        }, { status: 402 });
      }
    }

    // Build search filters
    let whereClause = {
      role: 'job_seeker', // Only search job seekers
      isActive: true,
      hideProfile: false
    };

    // Add location filter
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Add text search across multiple fields
    if (query) {
      whereClause.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: query.split(' ') } },
        { companyName: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Add skills filter
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      whereClause.skills = {
        hasSome: skillArray
      };
    }

    // Add experience level filter (this would need to be calculated from profile data)
    if (experienceLevel) {
      // This is a simplified approach - in reality you'd calculate experience from work history
      const experienceMap = {
        'entry': { min: 0, max: 2 },
        'mid': { min: 3, max: 5 },
        'senior': { min: 6, max: 10 },
        'executive': { min: 11, max: 50 }
      };
      
      // This would need additional logic to calculate experience from profile data
    }

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case 'recent':
        orderBy = { lastLoginAt: 'desc' };
        break;
      case 'experience':
        orderBy = { createdAt: 'desc' }; // Placeholder - would need experience calculation
        break;
      case 'location':
        orderBy = { location: 'asc' };
        break;
      case 'match_score':
        // Would implement AI matching logic here
        orderBy = { updatedAt: 'desc' };
        break;
      default:
        orderBy = { updatedAt: 'desc' };
    }

    // Execute search query
    const [candidates, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          location: true,
          profilePicture: true,
          skills: true,
          resumeUrl: true,
          companyName: true,
          showSensitiveInfo: true,
          contentMasking: true,
          lastLoginAt: true,
          updatedAt: true,
          createdAt: true
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    // Check which contacts have already been revealed
    const candidateIds = candidates.map(c => c.id);
    // Check for reveals by current user and also by the main account (for sub-users)
    const revealOr = [
      { revealedBy: currentUser.id, targetUserId: { in: candidateIds }, applicationId: null }
    ];
    if (creditUser?.id && creditUser.id !== currentUser.id) {
      revealOr.push({ revealedBy: creditUser.id, targetUserId: { in: candidateIds }, applicationId: null });
    }

    const revealedContacts = candidateIds.length > 0 ? await prisma.resumeContactReveal.findMany({ where: { OR: revealOr }, select: { targetUserId: true } }) : [];
    const revealedContactIds = new Set(revealedContacts.map(r => r.targetUserId));

    // Format results with enhanced data for different search modes
    const formattedResults = candidates.map(candidate => {
      const isContactRevealed = revealedContactIds.has(candidate.id);
      
      const result = {
        id: candidate.id,
        fullName: candidate.showSensitiveInfo || isContactRevealed ? candidate.fullName : null,
        email: isContactRevealed ? candidate.email : null,
        phone: isContactRevealed ? candidate.phone : null,
        location: candidate.location,
        profilePicture: candidate.profilePicture,
        skills: candidate.skills || [],
        resumeUrl: candidate.resumeUrl,
        lastLoginAt: candidate.lastLoginAt,
        updatedAt: candidate.updatedAt,
        contactRevealed: isContactRevealed,
        showSensitiveInfo: candidate.showSensitiveInfo
      };

      // Add enhanced data for advanced/AI search modes
      if (searchMode === 'advanced' || searchMode === 'ai') {
        // Calculate experience years (simplified)
        const accountAge = new Date().getFullYear() - new Date(candidate.createdAt).getFullYear();
        result.experienceYears = Math.max(0, accountAge - 1); // Rough estimate
        
        // Add availability status
        result.availability = 'Open to opportunities';
        
        // Add education placeholder
        result.education = 'Bachelor\'s Degree'; // Would come from profile data
      }

      // Add AI-powered features for AI search mode
      if (searchMode === 'ai') {
        // Calculate match score based on query and skills
        let matchScore = 0;
        if (query && candidate.skills) {
          const queryWords = query.toLowerCase().split(' ');
          const matchingSkills = candidate.skills.filter(skill => 
            queryWords.some(word => skill.toLowerCase().includes(word))
          );
          matchScore = Math.min(100, (matchingSkills.length / Math.max(queryWords.length, 1)) * 100);
        }
        
        result.matchScore = Math.round(matchScore);
        result.profileSummary = `Experienced professional with ${result.skills.length} listed skills. ${candidate.companyName ? `Previously worked at ${candidate.companyName}.` : ''}`;
      }

      return result;
    });

    // Sort by match score for AI mode
    if (searchMode === 'ai' && sortBy === 'relevance') {
      formattedResults.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    const usageSummary = await checkUserUsageLimits(creditUser.id, 'resume_view').catch(() => null);
    const purchased = await getUserCredits(creditUser.id).catch(() => ({}));
    const purchasedBalance = (purchased && purchased.resume_contact && purchased.resume_contact.balance) || 0;

    return NextResponse.json({
      success: true,
      results: formattedResults,
      total: totalCount,
      page,
      pageSize,
      searchMode,
      creditCost,
      creditInfo: {
        isSubUser: !!currentUser.parentUserId,
        parentUserId: currentUser.parentUserId || null,
        remaining: usageSummary && usageSummary.hasLimit ? usageSummary.remaining : 'unlimited',
        purchasedBalance
      },
      creditUsage: creditUsage || null,
      query: {
        term: query,
        location,
        experienceLevel,
        skills,
        education,
        availability
      }
    });

  } catch (error) {
    console.error('Error searching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to search resumes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}