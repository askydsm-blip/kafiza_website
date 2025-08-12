import type { NextApiRequest, NextApiResponse } from 'next';
import { roastersService } from '../../../lib/services/roasters';
import { ApiResponse } from '../../../lib/types';

/**
 * Roasters API Route
 * 
 * GET /api/roasters - List all roasters with pagination
 * POST /api/roasters - Create a new roaster
 * 
 * This route demonstrates usage of the MongoDB service layer.
 * The service layer abstracts database operations and can be easily
 * extended or replaced with external API calls in the future.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetRoasters(req, res);
        break;
      case 'POST':
        await handleCreateRoaster(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          success: false,
          error: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Handle GET request - List roasters with pagination
 */
async function handleGetRoasters(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Extract query parameters
    const { 
      page = '1', 
      limit = '10', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search = '',
      tier = ''
    } = req.query;

    // Validate and parse parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit (must be between 1 and 100)'
      });
    }

    // If tier filter is provided, use tier-specific endpoint
    if (tier && typeof tier === 'string' && ['basic', 'premium', 'enterprise'].includes(tier)) {
      const tierResult = await roastersService.getRoastersByTier(tier as 'basic' | 'premium' | 'enterprise');
      return res.status(200).json(tierResult);
    }

    // If search query is provided, use search endpoint
    if (search && typeof search === 'string') {
      const searchResult = await roastersService.searchRoasters(search, {
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      return res.status(200).json(searchResult);
    }

    // Get roasters with pagination
    const result = await roastersService.getRoasters({
      page: pageNum,
      limit: limitNum,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /api/roasters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roasters'
    });
  }
}

/**
 * Handle POST request - Create a new roaster
 */
async function handleCreateRoaster(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    const {
      businessName,
      ownerName,
      location,
      contact,
      businessType,
      description,
      subscriptionTier
    } = req.body;

    // Basic validation
    if (!businessName || !ownerName || !location || !contact || !businessType || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, ownerName, location, contact, businessType, description'
      });
    }

    // Validate location structure
    if (!location.city || !location.region || !location.address) {
      return res.status(400).json({
        success: false,
        error: 'Location must include city, region, and address'
      });
    }

    // Validate contact structure
    if (!contact.email || !contact.phone) {
      return res.status(400).json({
        success: false,
        error: 'Contact must include email and phone'
      });
    }

    // Validate business type
    if (!['roastery', 'cafe', 'both'].includes(businessType)) {
      return res.status(400).json({
        success: false,
        error: 'Business type must be one of: roastery, cafe, both'
      });
    }

    // Validate subscription tier
    if (!['basic', 'premium', 'enterprise'].includes(subscriptionTier)) {
      return res.status(400).json({
        success: false,
        error: 'Subscription tier must be one of: basic, premium, enterprise'
      });
    }

    // Create roaster data object
    const roasterData = {
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      location: {
        city: location.city.trim(),
        region: location.region.trim(),
        address: location.address.trim()
      },
      contact: {
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone.trim(),
        website: contact.website?.trim() || undefined
      },
      businessType: businessType as 'roastery' | 'cafe' | 'both',
      description: description.trim(),
      subscriptionTier: subscriptionTier as 'basic' | 'premium' | 'enterprise'
    };

    // Create roaster using service
    const result = await roastersService.createRoaster(roasterData);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in POST /api/roasters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create roaster'
    });
  }
}

