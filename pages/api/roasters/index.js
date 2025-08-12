const { roastersService } = require('../../../lib/roasters');

/**
 * Roasters API Route
 * 
 * Handles HTTP requests for roaster operations:
 * - GET /api/roasters - List all roasters with pagination, search, and tier filtering
 * - POST /api/roasters - Create a new roaster
 * 
 * Features:
 * - CORS support for cross-origin requests
 * - Input validation and sanitization
 * - Consistent JSON response format
 * - Proper HTTP status codes
 * - Error handling and logging
 * - Search functionality with pagination
 * - Sorting and filtering options
 * - Subscription tier filtering
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
    console.error('Roasters API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}

/**
 * Handle GET request to retrieve roasters
 * Supports pagination, sorting, search, and tier filtering
 */
async function handleGetRoasters(req, res) {
  try {
    const { page, limit, sortBy, sortOrder, search, tier } = req.query;
    
    let result;
    
    // If tier filter is provided, get roasters by tier
    if (tier && ['basic', 'premium', 'enterprise'].includes(tier)) {
      result = await roastersService.getRoastersByTier(tier);
    } else if (search && typeof search === 'string') {
      // If search query is provided, use search functionality
      result = await roastersService.searchRoasters(search, {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
    } else {
      // Otherwise, get all roasters with pagination and sorting
      result = await roastersService.getRoasters({
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
    console.error('Error in handleGetRoasters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roasters',
      message: 'An error occurred while retrieving roaster data'
    });
  }
}

/**
 * Handle POST request to create a new roaster
 * Validates required fields and creates roaster record
 */
async function handleCreateRoaster(req, res) {
  try {
    const { name, location, subscriptionTier, roastingCapacity, specialties, contactInfo } = req.body;

    // Basic validation for required fields
    if (!name || !location || !contactInfo?.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, location, and email are required to create a roaster',
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

    // Validate subscription tier if provided
    if (subscriptionTier && !['basic', 'premium', 'enterprise'].includes(subscriptionTier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier',
        message: 'Subscription tier must be basic, premium, or enterprise'
      });
    }

    // Validate roasting capacity if provided
    if (roastingCapacity !== undefined && (typeof roastingCapacity !== 'number' || roastingCapacity < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid roasting capacity',
        message: 'Roasting capacity must be a positive number'
      });
    }

    // Validate specialties if provided
    if (specialties && !Array.isArray(specialties)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid specialties format',
        message: 'Specialties must be an array'
      });
    }

    // Prepare roaster data with defaults
    const roasterData = {
      name: name.trim(),
      location: location.trim(),
      subscriptionTier: subscriptionTier || 'basic',
      roastingCapacity: roastingCapacity || 0,
      specialties: Array.isArray(specialties) ? specialties : [],
      contactInfo: {
        email: contactInfo.email.trim().toLowerCase(),
        phone: contactInfo.phone ? contactInfo.phone.trim() : '',
        address: contactInfo.address ? contactInfo.address.trim() : ''
      },
      isActive: true
    };

    // Create roaster using service
    const result = await roastersService.createRoaster(roasterData);

    // Return appropriate response
    if (result.success) {
      res.status(201).json({
        ...result,
        message: 'Roaster created successfully'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in handleCreateRoaster:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create roaster',
      message: 'An error occurred while creating the roaster record'
    });
  }
}

