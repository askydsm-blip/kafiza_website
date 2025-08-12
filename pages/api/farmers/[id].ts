import type { NextApiRequest, NextApiResponse } from 'next';
import { farmersService } from '../../../lib/services/farmers';
import { ApiResponse } from '../../../lib/types';

/**
 * Individual Farmer API Route
 * 
 * GET /api/farmers/[id] - Get a specific farmer
 * PUT /api/farmers/[id] - Update a specific farmer
 * DELETE /api/farmers/[id] - Delete a specific farmer (soft delete)
 * 
 * This route demonstrates usage of the MongoDB service layer for
 * individual farmer operations.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id } = req.query;

    // Validate ID parameter
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Farmer ID is required'
      });
    }

    switch (req.method) {
      case 'GET':
        await handleGetFarmer(id, res);
        break;
      case 'PUT':
        await handleUpdateFarmer(id, req, res);
        break;
      case 'DELETE':
        await handleDeleteFarmer(id, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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
 * Handle GET request - Get a specific farmer by ID
 */
async function handleGetFarmer(
  id: string,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const result = await farmersService.getFarmerById(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // If farmer not found, return 404
      if (result.error === 'Farmer not found') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Error in GET /api/farmers/[id]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmer'
    });
  }
}

/**
 * Handle PUT request - Update a specific farmer
 */
async function handleUpdateFarmer(
  id: string,
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
      images,
      isActive,
      rating
    } = req.body;

    // Build update data object with only provided fields
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (farmName !== undefined) updateData.farmName = farmName.trim();
    if (location !== undefined) {
      updateData.location = {
        state: location.state?.trim(),
        city: location.city?.trim(),
        coordinates: location.coordinates || undefined
      };
    }
    if (coffeeTypes !== undefined) {
      if (Array.isArray(coffeeTypes) && coffeeTypes.length > 0) {
        updateData.coffeeTypes = coffeeTypes.map((type: string) => type.trim());
      }
    }
    if (certifications !== undefined) {
      if (Array.isArray(certifications)) {
        updateData.certifications = certifications.map((cert: string) => cert.trim());
      }
    }
    if (contact !== undefined) {
      updateData.contact = {};
      if (contact.email !== undefined) updateData.contact.email = contact.email.trim().toLowerCase();
      if (contact.phone !== undefined) updateData.contact.phone = contact.phone?.trim();
      if (contact.whatsapp !== undefined) updateData.contact.whatsapp = contact.whatsapp?.trim();
    }
    if (description !== undefined) updateData.description = description.trim();
    if (images !== undefined) {
      if (Array.isArray(images)) {
        updateData.images = images;
      }
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (rating !== undefined) {
      const ratingNum = parseFloat(rating);
      if (!isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= 5) {
        updateData.rating = ratingNum;
      }
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields provided for update'
      });
    }

    // Update farmer using service
    const result = await farmersService.updateFarmer(id, updateData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // If farmer not found, return 404
      if (result.error === 'Farmer not found') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Error in PUT /api/farmers/[id]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update farmer'
    });
  }
}

/**
 * Handle DELETE request - Delete a specific farmer (soft delete)
 */
async function handleDeleteFarmer(
  id: string,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const result = await farmersService.deleteFarmer(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // If farmer not found, return 404
      if (result.error === 'Farmer not found') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Error in DELETE /api/farmers/[id]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete farmer'
    });
  }
}

