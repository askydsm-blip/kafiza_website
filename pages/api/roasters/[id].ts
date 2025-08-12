import type { NextApiRequest, NextApiResponse } from 'next';
import { roastersService } from '../../../lib/services/roasters';
import { ApiResponse } from '../../../lib/types';

/**
 * Individual Roaster API Route
 * 
 * GET /api/roasters/[id] - Get a specific roaster
 * PUT /api/roasters/[id] - Update a specific roaster
 * DELETE /api/roasters/[id] - Delete a specific roaster (soft delete)
 * 
 * This route demonstrates usage of the MongoDB service layer for
 * individual roaster operations.
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
        error: 'Roaster ID is required'
      });
    }

    switch (req.method) {
      case 'GET':
        await handleGetRoaster(id, res);
        break;
      case 'PUT':
        await handleUpdateRoaster(id, req, res);
        break;
      case 'DELETE':
        await handleDeleteRoaster(id, res);
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
 * Handle GET request - Get a specific roaster by ID
 */
async function handleGetRoaster(
  id: string,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const result = await roastersService.getRoasterById(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // If roaster not found, return 404
      if (result.error === 'Roaster not found') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Error in GET /api/roasters/[id]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roaster'
    });
  }
}

/**
 * Handle PUT request - Update a specific roaster
 */
async function handleUpdateRoaster(
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
      businessName,
      ownerName,
      location,
      contact,
      businessType,
      description,
      subscriptionTier,
      isActive
    } = req.body;

    // Build update data object with only provided fields
    const updateData: any = {};

    if (businessName !== undefined) updateData.businessName = businessName.trim();
    if (ownerName !== undefined) updateData.ownerName = ownerName.trim();
    if (location !== undefined) {
      updateData.location = {};
      if (location.city !== undefined) updateData.location.city = location.city.trim();
      if (location.region !== undefined) updateData.location.region = location.region.trim();
      if (location.address !== undefined) updateData.location.address = location.address.trim();
    }
    if (contact !== undefined) {
      updateData.contact = {};
      if (contact.email !== undefined) updateData.contact.email = contact.email.trim().toLowerCase();
      if (contact.phone !== undefined) updateData.contact.phone = contact.phone.trim();
      if (contact.website !== undefined) updateData.contact.website = contact.website?.trim();
    }
    if (businessType !== undefined) {
      if (['roastery', 'cafe', 'both'].includes(businessType)) {
        updateData.businessType = businessType;
      }
    }
    if (description !== undefined) updateData.description = description.trim();
    if (subscriptionTier !== undefined) {
      if (['basic', 'premium', 'enterprise'].includes(subscriptionTier)) {
        updateData.subscriptionTier = subscriptionTier;
      }
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields provided for update'
      });
    }

    // Update roaster using service
    const result = await roastersService.updateRoaster(id, updateData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // If roaster not found, return 404
      if (result.error === 'Roaster not found') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Error in PUT /api/roasters/[id]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update roaster'
    });
  }
}

/**
 * Handle DELETE request - Delete a specific roaster (soft delete)
 */
async function handleDeleteRoaster(
  id: string,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const result = await roastersService.deleteRoaster(id);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // If roaster not found, return 404
      if (result.error === 'Roaster not found') {
        res.status(404).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  } catch (error) {
    console.error('Error in DELETE /api/roasters/[id]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete roaster'
    });
  }
}

