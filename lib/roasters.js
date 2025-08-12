const { getCollection } = require('./mongodb');

/**
 * Roasters Service Module
 * 
 * Handles all CRUD operations for the roasters collection in MongoDB.
 * This service layer abstracts database operations and provides
 * a clean interface for API routes to interact with roaster data.
 * 
 * Features:
 * - Create new roasters
 * - Retrieve roasters by ID or with pagination
 * - Update roaster information
 * - Soft delete roasters (mark as inactive)
 * - Search roasters by various criteria
 * - Filter roasters by subscription tier
 * - Update subscription tiers
 * - Input validation and error handling
 */

class RoastersService {
  constructor() {
    this.collectionName = 'roasters';
  }

  /**
   * Create a new roaster
   * @param {Object} roasterData - Roaster data (excluding _id, createdAt, updatedAt)
   * @returns {Promise<Object>} API response with created roaster or error
   */
  async createRoaster(roasterData) {
    try {
      const collection = await getCollection(this.collectionName);
      
      const newRoaster = {
        ...roasterData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newRoaster);
      const createdRoaster = await collection.findOne({ _id: result.insertedId });

      return {
        success: true,
        data: createdRoaster,
        message: 'Roaster created successfully'
      };
    } catch (error) {
      console.error('Error creating roaster:', error);
      return {
        success: false,
        error: 'Failed to create roaster'
      };
    }
  }

  /**
   * Get a roaster by ID
   * @param {string} id - Roaster ID
   * @returns {Promise<Object>} API response with roaster data or error
   */
  async getRoasterById(id) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID format'
        };
      }

      const collection = await getCollection(this.collectionName);
      const roaster = await collection.findOne({ _id: new ObjectId(id), isActive: true });

      if (!roaster) {
        return {
          success: false,
          error: 'Roaster not found'
        };
      }

      return {
        success: true,
        data: roaster
      };
    } catch (error) {
      console.error('Error fetching roaster:', error);
      return {
        success: false,
        error: 'Failed to fetch roaster'
      };
    }
  }

  /**
   * Get all roasters with pagination and sorting
   * @param {Object} params - Pagination and sorting parameters
   * @returns {Promise<Object>} API response with roasters array and pagination info
   */
  async getRoasters(params = {}) {
    try {
      const collection = await getCollection(this.collectionName);
      
      const page = params.page || 1;
      const limit = Math.min(params.limit || 10, 100);
      const skip = (page - 1) * limit;

      // Build sort object
      const sort = {};
      if (params.sortBy) {
        sort[params.sortBy] = params.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1; // Default sort by creation date
      }

      const [roasters, total] = await Promise.all([
        collection.find({ isActive: true })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments({ isActive: true })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: roasters,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching roasters:', error);
      return {
        success: false,
        error: 'Failed to fetch roasters',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  /**
   * Update a roaster by ID
   * @param {string} id - Roaster ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} API response with updated roaster or error
   */
  async updateRoaster(id, updateData) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID format'
        };
      }

      const collection = await getCollection(this.collectionName);
      
      const updateResult = await collection.findOneAndUpdate(
        { _id: new ObjectId(id), isActive: true },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!updateResult) {
        return {
          success: false,
          error: 'Roaster not found or could not be updated'
        };
      }

      return {
        success: true,
        data: updateResult,
        message: 'Roaster updated successfully'
      };
    } catch (error) {
      console.error('Error updating roaster:', error);
      return {
        success: false,
        error: 'Failed to update roaster'
      };
    }
  }

  /**
   * Soft delete a roaster (mark as inactive)
   * @param {string} id - Roaster ID
   * @returns {Promise<Object>} API response with deletion status
   */
  async deleteRoaster(id) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID format'
        };
      }

      const collection = await getCollection(this.collectionName);
      
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            isActive: false, 
            updatedAt: new Date() 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Roaster not found'
        };
      }

      return {
        success: true,
        data: { deleted: true },
        message: 'Roaster deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting roaster:', error);
      return {
        success: false,
        error: 'Failed to delete roaster'
      };
    }
  }

  /**
   * Search roasters by various criteria
   * @param {string} query - Search query
   * @param {Object} params - Pagination parameters
   * @returns {Promise<Object>} API response with matching roasters
   */
  async searchRoasters(query, params = {}) {
    try {
      const collection = await getCollection(this.collectionName);
      
      const page = params.page || 1;
      const limit = Math.min(params.limit || 10, 100);
      const skip = (page - 1) * limit;

      // Build search filter
      const searchFilter = {
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { specialties: { $regex: query, $options: 'i' } }
        ]
      };

      const [roasters, total] = await Promise.all([
        collection.find(searchFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(searchFilter)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: roasters,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error searching roasters:', error);
      return {
        success: false,
        error: 'Failed to search roasters',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }

  /**
   * Get roasters by subscription tier
   * @param {string} tier - Subscription tier (basic, premium, enterprise)
   * @returns {Promise<Object>} API response with roasters of specified tier
   */
  async getRoastersByTier(tier) {
    try {
      if (!['basic', 'premium', 'enterprise'].includes(tier)) {
        return {
          success: false,
          error: 'Invalid subscription tier. Must be basic, premium, or enterprise'
        };
      }

      const collection = await getCollection(this.collectionName);
      
      const roasters = await collection.find({ 
        subscriptionTier: tier, 
        isActive: true 
      }).toArray();

      return {
        success: true,
        data: roasters
      };
    } catch (error) {
      console.error('Error fetching roasters by tier:', error);
      return {
        success: false,
        error: 'Failed to fetch roasters by tier',
        data: []
      };
    }
  }

  /**
   * Update subscription tier for a roaster
   * @param {string} id - Roaster ID
   * @param {string} tier - New subscription tier
   * @returns {Promise<Object>} API response with updated roaster
   */
  async updateSubscriptionTier(id, tier) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID format'
        };
      }

      if (!['basic', 'premium', 'enterprise'].includes(tier)) {
        return {
          success: false,
          error: 'Invalid subscription tier. Must be basic, premium, or enterprise'
        };
      }

      const collection = await getCollection(this.collectionName);
      
      const updateResult = await collection.findOneAndUpdate(
        { _id: new ObjectId(id), isActive: true },
        { 
          $set: { 
            subscriptionTier: tier, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!updateResult) {
        return {
          success: false,
          error: 'Roaster not found or could not be updated'
        };
      }

      return {
        success: true,
        data: updateResult,
        message: 'Subscription tier updated successfully'
      };
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      return {
        success: false,
        error: 'Failed to update subscription tier'
      };
    }
  }
}

// Export singleton instance
const roastersService = new RoastersService();
module.exports = { RoastersService, roastersService };

