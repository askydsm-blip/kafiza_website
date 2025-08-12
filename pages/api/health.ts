import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

/**
 * Health Check API Route
 * 
 * GET /api/health - Check application and database health
 * 
 * This route provides a simple way to verify that the application
 * is running and can connect to the database. Useful for monitoring
 * and load balancer health checks.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    const startTime = Date.now();
    
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      await connectToDatabase();
      dbResponseTime = Date.now() - dbStartTime;
      dbStatus = 'connected';
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      dbStatus = 'error';
    }

    const totalResponseTime = Date.now() - startTime;

    // Build health response
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          message: dbStatus === 'connected' ? 'Database connection successful' : 'Database connection failed'
        }
      },
      responseTime: totalResponseTime,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };

    // Determine overall health status
    const isHealthy = dbStatus === 'connected';
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: isHealthy,
      data: healthData,
      message: isHealthy ? 'All systems operational' : 'Some systems are experiencing issues'
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: 'Unable to complete health check'
    });
  }
}

