import type { NextApiRequest, NextApiResponse } from 'next';
import { farmersService } from '../../../lib/services/farmers';
import { ApiResponse } from '../../../lib/types';

/**
 * Farmers API Route
 * 
 * GET /api/farmers - List all farmers with pagination
 * POST /api/farmers - Create a new farmer
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
        await handleGetFarmers(req, res);
        break;
      case 'POST':
        await handleCreateFarmer(req, res);
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
 * Handle GET request - List farmers with pagination
 */
async function handleGetFarmers(
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
      search = ''
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

    // If search query is provided, use search endpoint
    if (search && typeof search === 'string') {
      const searchResult = await farmersService.searchFarmers(search, {
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      return res.status(200).json(searchResult);
    }

    // Get farmers with pagination
    const result = await farmersService.getFarmers({
      page: pageNum,
      limit: limitNum,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in GET /api/farmers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmers'
    });
  }
}

/**
 * Handle POST request - Create a new farmer
 */
async function handleCreateFarmer(
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
      name,
      farmName,
      location,
      coffeeTypes,
      certifications,
      contact,
      description,
      images
    } = req.body;

    // Basic validation
    if (!name || !farmName || !location || !coffeeTypes || !contact || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, farmName, location, coffeeTypes, contact, description'
      });
    }

    // Validate location structure
    if (!location.state || !location.city) {
      return res.status(400).json({
        success: false,
        error: 'Location must include state and city'
      });
    }

    // Validate contact structure
    if (!contact.email) {
      return res.status(400).json({
        success: false,
        error: 'Contact must include email'
      });
    }

    // Validate coffee types
    if (!Array.isArray(coffeeTypes) || coffeeTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Coffee types must be a non-empty array'
      });
    }

    // Create farmer data object
    const farmerData = {
      name: name.trim(),
      farmName: farmName.trim(),
      location: {
        state: location.state.trim(),
        city: location.city.trim(),
        coordinates: location.coordinates || undefined
      },
      coffeeTypes: coffeeTypes.map((type: string) => type.trim()),
      certifications: Array.isArray(certifications) 
        ? certifications.map((cert: string) => cert.trim())
        : [],
      contact: {
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone?.trim() || undefined,
        whatsapp: contact.whatsapp?.trim() || undefined
      },
        description: req.body.description,
        images: validImages,
        isActive: true,
        totalOrders: 0, 
    };

    // Create farmer using service
    const result = await farmersService.createFarmer(farmerData);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in POST /api/farmers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create farmer'
    });
  }
}

