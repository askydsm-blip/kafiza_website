import { getCollection } from '../mongodb';
import { Farmer, ApiResponse, PaginationParams, PaginatedResponse } from '../types';
import { ObjectId } from 'mongodb';

/**
 * Farmers Service
 * Handles all CRUD operations for coffee farmers
 * 
 * This service layer abstracts database operations and can be easily
 * extended or replaced with external API calls in the future.
 */
export class FarmersService {
  private collectionName = 'farmers';

  /**
   * Create a new farmer
   */
  async createFarmer(farmerData: Omit<Farmer, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Farmer>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      const newFarmer: Farmer = {
        ...farmerData,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalOrders: 0,
        isActive: true
      };

      const result = await collection.insertOne(newFarmer);
      newFarmer._id = result.insertedId;

      return {
        success: true,
        data: newFarmer,
        message: 'Farmer created successfully'
      };
    } catch (error) {
      console.error('Error creating farmer:', error);
      return {
        success: false,
        error: 'Failed to create farmer'
      };
    }
  }

  /**
   * Get a farmer by ID
   */
  async getFarmerById(id: string): Promise<ApiResponse<Farmer>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid farmer ID'
        };
      }

      const farmer = await collection.findOne({ _id: new ObjectId(id) }) as Farmer;
      
      if (!farmer) {
        return {
          success: false,
          error: 'Farmer not found'
        };
      }

      return {
        success: true,
        data: farmer
      };
    } catch (error) {
      console.error('Error fetching farmer:', error);
      return {
        success: false,
        error: 'Failed to fetch farmer'
      };
    }
  }

  /**
   * Get all farmers with pagination and filtering
   */
  async getFarmers(params: PaginationParams = {}): Promise<PaginatedResponse<Farmer>> {
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

      // Get farmers with pagination
      const farmers = await collection
        .find({ isActive: true })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray() as Farmer [];

      return {
        success: true,
        data: farmers,
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
      console.error('Error fetching farmers:', error);
      return {
        success: false,
        error: 'Failed to fetch farmers',
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
   * Update a farmer
   */
  async updateFarmer(id: string, updateData: Partial<Farmer>): Promise<ApiResponse<Farmer>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid farmer ID'
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
      ) as Farmer;

      if (!result) {
        return {
          success: false,
          error: 'Farmer not found'
        };
      }

      return {
        success: true,
        data: result,
        message: 'Farmer updated successfully'
      };
    } catch (error) {
      console.error('Error updating farmer:', error);
      return {
        success: false,
        error: 'Failed to update farmer'
      };
    }
  }

  /**
   * Delete a farmer (soft delete by setting isActive to false)
   */
  async deleteFarmer(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid farmer ID'
        };
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Farmer not found'
        };
      }

      return {
        success: true,
        data: { deleted: true },
        message: 'Farmer deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting farmer:', error);
      return {
        success: false,
        error: 'Failed to delete farmer'
      };
    }
  }

  /**
   * Search farmers by location, coffee type, or certification
   */
  async searchFarmers(query: string, params: PaginationParams = {}): Promise<PaginatedResponse<Farmer>> {
    try {
      const collection = await getCollection(this.collectionName);
      
      const {
        page = 1,
        limit = 10,
        sortBy = 'rating',
        sortOrder = 'desc'
      } = params;

      const skip = (page - 1) * limit;
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      // Build search query
      const searchQuery = {
        isActive: true,
        $or: [
          { 'location.state': { $regex: query, $options: 'i' } },
          { 'location.city': { $regex: query, $options: 'i' } },
          { coffeeTypes: { $regex: query, $options: 'i' } },
          { certifications: { $regex: query, $options: 'i' } },
          { farmName: { $regex: query, $options: 'i' } }
        ]
      };

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortDirection;

      // Get total count for pagination
      const total = await collection.countDocuments(searchQuery);
      const totalPages = Math.ceil(total / limit);

      // Get farmers with pagination
      const farmers = await collection
        .find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        success: true,
        data: farmers,
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
      console.error('Error searching farmers:', error);
      return {
        success: false,
        error: 'Failed to search farmers',
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
}

// Export a singleton instance
export const farmersService = new FarmersService();

