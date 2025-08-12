const { farmersService } = require('../../../lib/farmers');

/**
 * Farmers API Route
 * 
 * Handles HTTP requests for farmer operations:
 * - GET /api/farmers - List all farmers with pagination and search
 * - POST /api/farmers - Create a new farmer
 * 
 * Features:
 * - CORS support for cross-origin requests
 * - Input validation and sanitization
 * - Consistent JSON response format
 * - Proper HTTP status codes
 * - Error handling and logging
 * - Search functionality with pagination
 * - Sorting and filtering options
 */

export default async function handler(req, res) {
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
    console.error('Farmers API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}

/**
 * Handle GET request to retrieve farmers
 * Supports pagination, sorting, and search functionality
 */
async function handleGetFarmers(req, res) {
  try {
    const { page, limit, sortBy, sortOrder, search } = req.query;
    
    let result;
    
    // If search query is provided, use search functionality
    if (search && typeof search === 'string') {
      result = await farmersService.searchFarmers(search, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
    } else {
      // Otherwise, get all farmers with pagination and sorting
      result = await farmersService.getFarmers({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
    }

    // Return appropriate response based on result
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleGetFarmers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmers',
      message: 'An error occurred while retrieving farmer data'
    });
  }
}

/**
 * Handle POST request to create a new farmer
 * Validates required fields and creates farmer record
 */
async function handleCreateFarmer(req, res) {
  try {
    const { name, location, farmSize, coffeeVarieties, certifications, contactInfo, rating } = req.body;

    // Basic validation for required fields
    if (!name || !location || !contactInfo?.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, location, and email are required to create a farmer',
        required: ['name', 'location', 'contactInfo.email']
      });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validate farm size if provided
    if (farmSize !== undefined && (typeof farmSize !== 'number' || farmSize < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid farm size',
        message: 'Farm size must be a positive number'
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be a number between 0 and 5'
      });
    }

    // Prepare farmer data with defaults
    const farmerData = {
      name: name.trim(),
      location: location.trim(),
      farmSize: farmSize || 0,
      coffeeVarieties: Array.isArray(coffeeVarieties) ? coffeeVarieties : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      contactInfo: {
        email: contactInfo.email.trim().toLowerCase(),
        phone: contactInfo.phone ? contactInfo.phone.trim() : '',
        address: contactInfo.address ? contactInfo.address.trim() : ''
      },
      rating: rating || 0,
      isActive: true
    };

    // Create farmer using service
    const result = await farmersService.createFarmer(farmerData);

    // Return appropriate response
    if (result.success) {
      res.status(201).json({
        ...result,
        message: 'Farmer created successfully'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleCreateFarmer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create farmer',
      message: 'An error occurred while creating the farmer record'
    });
  }
}

