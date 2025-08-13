import { getCollection } from '../mongodb';
import { Roaster, ApiResponse, PaginationParams, PaginatedResponse } from '../types';
import { ObjectId } from 'mongodb';

/**
 * Roasters Service
 * Handles all CRUD operations for coffee roasters
 * 
 * This service layer abstracts database operations and can be easily
 * extended or replaced with external API calls in the future.
 */
export class RoastersService {
  private collectionName = 'roasters';

  /**
   * Create a new roaster
   */
  async createRoaster(roasterData: Omit<Roaster, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Roaster>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      const newRoaster: Roaster = {
        ...roasterData,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalOrders: 0,
        isActive: true
      };

      const result = await collection.insertOne(newRoaster);
      newRoaster._id = result.insertedId;

      return {
        success: true,
        data: newRoaster,
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
   */
  async getRoasterById(id: string): Promise<ApiResponse<Roaster>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID'
        };
      }

      const roaster = await collection.findOne({ _id: new ObjectId(id) }) as Roaster;
      
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
   * Get all roasters with pagination and filtering
   */
  async getRoasters(params: PaginationParams = {}): Promise<PaginatedResponse<Roaster>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortDirection;

      // Get total count for pagination
      const total = await collection.countDocuments({ isActive: true });
      const totalPages = Math.ceil(total / limit);

      // Get roasters with pagination
      const roasters = await collection
        .find({ isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray() as Roaster [];

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
   * Update a roaster
   */
  async updateRoaster(id: string, updateData: Partial<Roaster>): Promise<ApiResponse<Roaster>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID'
        };
      }

      const updateDoc = {
        ...updateData,
        updatedAt: new Date()
      };

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Roaster not found'
        };
      }

      return {
        success: true,
        data: result,
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
   * Delete a roaster (soft delete by setting isActive to false)
   */
  async deleteRoaster(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID'
        };
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date() } }
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
   * Search roasters by location, business type, or subscription tier
   */
  async searchRoasters(query: string, params: PaginationParams = {}): Promise<PaginatedResponse<Roaster>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      const {
        page = 1,
        limit = 10,
        sortBy = 'totalOrders',
        sortOrder = 'desc'
      } = params;

      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      // Build search query
      const searchQuery = {
        isActive: true,
        $or: [
          { 'location.city': { $regex: query, $options: 'i' } },
          { 'location.region': { $regex: query, $options: 'i' } },
          { businessType: { $regex: query, $options: 'i' } },
          { subscriptionTier: { $regex: query, $options: 'i' } },
          { businessName: { $regex: query, $options: 'i' } }
        ]
      };

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortDirection;

      // Get total count for pagination
      const total = await collection.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / limit);

      // Get roasters with pagination
      const roasters = await collection
        .find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray() as Roaster [];

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
   */
  async getRoastersByTier(tier: 'basic' | 'premium' | 'enterprise'): Promise<ApiResponse<Roaster[]>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      const roasters = await collection
        .find({ 
          subscriptionTier: tier, 
          isActive: true 
        })
        .sort({ createdAt: -1 })
        .toArray();

      return {
        success: true,
        data: roasters
      };
    } catch (error) {
      console.error('Error fetching roasters by tier:', error);
      return {
        success: false,
        error: 'Failed to fetch roasters by tier'
      };
    }
  }

  /**
   * Update roaster subscription tier
   */
  async updateSubscriptionTier(id: string, tier: 'basic' | 'premium' | 'enterprise'): Promise<ApiResponse<Roaster>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid roaster ID'
        };
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            subscriptionTier: tier, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return {
          success: false,
          error: 'Roaster not found'
        };
      }

      return {
        success: true,
        data: result,
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

// Export a singleton instance
export const roastersService = new RoastersService();

