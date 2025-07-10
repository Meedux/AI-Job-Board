// API route for companies using Prisma
import { db, handlePrismaError } from '../../../utils/db';

export async function GET(request) {
  try {
    const companies = await db.companies.findMany();

    return Response.json({
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        logo: company.logoUrl,
        website: company.websiteUrl,
        location: company.location,
        description: company.description,
        industry: company.industry
      }))
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    
    const errorResponse = handlePrismaError(error);
    
    return Response.json(
      { error: errorResponse.error || 'Failed to fetch companies', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const companyData = await request.json();

    // Validate required fields
    if (!companyData.name) {
      return Response.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const newCompany = await db.companies.create(companyData);

    return Response.json({
      company: {
        id: newCompany.id,
        name: newCompany.name,
        logo: newCompany.logoUrl,
        website: newCompany.websiteUrl,
        location: newCompany.location,
        description: newCompany.description,
        industry: newCompany.industry
      },
      message: 'Company created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating company:', error);
    
    const errorResponse = handlePrismaError(error);
    
    return Response.json(
      { error: errorResponse.error || 'Failed to create company', details: error.message },
      { status: 500 }
    );
  }
}
