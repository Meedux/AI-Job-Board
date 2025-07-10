// Database health check API route
import { healthCheck, db } from '../../../utils/db.js';

export async function GET(request) {
  try {
    // Perform health check
    const health = await healthCheck();
    
    if (health.status === 'healthy') {
      // Get additional stats if database is healthy
      const stats = await dbUtils.getStats();
      
      return Response.json({
        status: 'healthy',
        database: {
          connected: true,
          version: health.version,
          timestamp: health.timestamp,
        },
        stats: {
          total_jobs: stats.total_jobs,
          active_jobs: stats.active_jobs,
          total_companies: stats.total_companies,
          total_applications: stats.total_applications,
          total_users: stats.total_users,
        },
        migration_status: 'completed'
      });
    } else {
      return Response.json({
        status: 'unhealthy',
        database: {
          connected: false,
          error: health.error,
        },
        migration_status: 'pending'
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Database health check failed:', error);
    
    return Response.json({
      status: 'error',
      database: {
        connected: false,
        error: error.message,
      },
      migration_status: 'failed'
    }, { status: 500 });
  }
}
