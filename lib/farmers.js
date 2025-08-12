const { getCollection } = require('./mongodb');

/**
 * Farmers Service Module
 * 
 * Handles all CRUD operations for the farmers collection in MongoDB.
 * This service layer abstracts database operations and provides
 * a clean interface for API routes to interact with farmer data.
 * 
 * Features:
 * - Create new farmers
 * - Retrieve farmers by ID or with pagination
 * - Update farmer information
 * - Soft delete farmers (mark as inactive)
 * - Search farmers by various criteria
 * - Input validation and error handling
 */

class FarmersService {
  constructor() {
    this.collectionName = 'farmers';
  }

  /**
   * Create a new farmer
   * @param {Object} farmerData - Farmer data (excluding _id, createdAt, updatedAt)
   * @returns {Promise<Object>} API response with created farmer or error
   */
  async createFarmer(farmerData) {
    try {
      const collection = await getCollection(this.collectionName);
      
      const newFarmer = {
        ...farmerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newFarmer);
      const createdFarmer = await collection.findOne({ _id: result.insertedId });

      return {
        success: true,
        data: createdFarmer,
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
   * @param {string} id - Farmer ID
   * @returns {Promise<Object>} API response with farmer data or error
   */
  async getFarmerById(id) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid farmer ID format'
        };
      }

      const collection = await getCollection(this.collectionName);
      const farmer = await collection.findOne({ _id: new ObjectId(id), isActive: true });

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
   * Get all farmers with pagination and sorting
   * @param {Object} params - Pagination and sorting parameters
   * @returns {Promise<Object>} API response with farmers array and pagination info
   */
  async getFarmers(params = {}) {
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

      const [farmers, total] = await Promise.all([
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
   * Update a farmer by ID
   * @param {string} id - Farmer ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} API response with updated farmer or error
   */
  async updateFarmer(id, updateData) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid farmer ID format'
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
          error: 'Farmer not found or could not be updated'
        };
      }

      return {
        success: true,
        data: updateResult,
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
   * Soft delete a farmer (mark as inactive)
   * @param {string} id - Farmer ID
   * @returns {Promise<Object>} API response with deletion status
   */
  async deleteFarmer(id) {
    try {
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: 'Invalid farmer ID format'
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
   * Search farmers by various criteria
   * @param {string} query - Search query
   * @param {Object} params - Pagination parameters
   * @returns {Promise<Object>} API response with matching farmers
   */
  async searchFarmers(query, params = {}) {
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
          { coffeeVarieties: { $regex: query, $options: 'i' } },
          { certifications: { $regex: query, $options: 'i' } }
        ]
      };

      const [farmers, total] = await Promise.all([
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
}

// Export singleton instance
const farmersService = new FarmersService();
module.exports = { FarmersService, farmersService };

