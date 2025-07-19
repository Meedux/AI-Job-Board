// API route for job categories using Prisma
import { db, handlePrismaError } from '../../../utils/db';

export async function GET(request) {
  try {
    const categories = await db.categories.findMany();

    return Response.json({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    const errorResponse = handlePrismaError(error);
    return Response.json(errorResponse, { status: 500 });
  }
}
