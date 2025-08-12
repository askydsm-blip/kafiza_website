const { MongoClient } = require('mongodb');

/**
 * MongoDB Connection Utility
 * 
 * Provides a centralized way to connect to MongoDB with connection caching
 * for development efficiency. Uses environment variables for configuration
 * and implements connection pooling and error handling.
 * 
 * Features:
 * - Environment variable configuration (MONGODB_URI)
 * - Connection caching for development reuse
 * - Automatic connection management
 * - Error handling and logging
 * - Connection pooling
 * - Graceful shutdown support
 */

// Connection cache for development
let cachedClient = null;
let cachedDb = null;

// Validate required environment variable
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
  bufferMaxEntries: 0, // Disable MongoDB driver buffering
  useNewUrlParser: true, // Use new URL parser
  useUnifiedTopology: true // Use new server discovery and monitoring engine
};

// Global cache for development (prevents multiple connections)
let globalWithMongo = global;
if (!globalWithMongo._mongoClientPromise) {
  globalWithMongo._mongoClientPromise = null;
}
if (!globalWithMongo._mongoDbPromise) {
  globalWithMongo._mongoDbPromise = null;
}

/**
 * Connect to MongoDB and return the client
 * @returns {Promise<MongoClient>} MongoDB client instance
 */
async function connectToClient() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = MongoClient.connect(uri, options);
  }
  
  try {
    cachedClient = await globalWithMongo._mongoClientPromise;
    
    // Set up connection event handlers
    cachedClient.on('connected', () => {
      console.log('MongoDB client connected');
    });

    cachedClient.on('error', (error) => {
      console.error('MongoDB client error:', error);
      cachedClient = null;
      cachedDb = null;
    });

    cachedClient.on('close', () => {
      console.log('MongoDB client connection closed');
      cachedClient = null;
      cachedDb = null;
    });

    return cachedClient;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    globalWithMongo._mongoClientPromise = null;
    throw error;
  }
}

/**
 * Connect to MongoDB and return the database instance
 * @returns {Promise<Db>} MongoDB database instance
 */
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!globalWithMongo._mongoDbPromise) {
    const client = await connectToClient();
    const dbName = process.env.MONGODB_DB_NAME || 'kafiza';
    globalWithMongo._mongoDbPromise = client.db(dbName);
  }
  
  try {
    cachedDb = await globalWithMongo._mongoDbPromise;
    
    // Test the connection
    await cachedDb.admin().ping();
    
    return cachedDb;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    globalWithMongo._mongoDbPromise = null;
    cachedDb = null;
    throw error;
  }
}

/**
 * Get a specific collection from the database
 * @param {string} collectionName - Name of the collection to retrieve
 * @returns {Promise<Collection>} MongoDB collection instance
 */
async function getCollection(collectionName) {
  try {
    const db = await connectToDatabase();
    return db.collection(collectionName);
  } catch (error) {
    console.error(`Failed to get collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Close the MongoDB connection
 * Useful for graceful shutdown
 * @returns {Promise<void>}
 */
async function closeConnection() {
  try {
    if (cachedClient) {
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      globalWithMongo._mongoClientPromise = null;
      globalWithMongo._mongoDbPromise = null;
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
async function getDatabaseStats() {
  try {
    const db = await connectToDatabase();
    const stats = await db.stats();
    return {
      success: true,
      data: {
        database: db.databaseName,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      }
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      success: false,
      error: 'Failed to get database statistics'
    };
  }
}

/**
 * Check if the database connection is healthy
 * @returns {Promise<boolean>} Connection health status
 */
async function isConnected() {
  try {
    const db = await connectToDatabase();
    await db.admin().ping();
    return true;
  } catch (error) {
    return false;
  }
}

// Export functions and utilities
module.exports = {
  connectToClient,
  connectToDatabase,
  getCollection,
  closeConnection,
  getDatabaseStats,
  isConnected
};

