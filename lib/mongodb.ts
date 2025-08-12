import { MongoClient, Db } from 'mongodb';

// Global variable to cache the MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoDbPromise?: Promise<Db>;
};

/**
 * Connects to MongoDB and returns the client
 * Caches the connection for reuse in development
 */
export async function connectToClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  if (globalWithMongo._mongoClientPromise) {
    cachedClient = await globalWithMongo._mongoClientPromise;
    return cachedClient;
  }

  const client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
  cachedClient = await globalWithMongo._mongoClientPromise;
  return cachedClient;
}

/**
 * Connects to MongoDB and returns the database instance
 * Caches the connection for reuse in development
 */
export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (globalWithMongo._mongoDbPromise) {
    cachedDb = await globalWithMongo._mongoDbPromise;
    return cachedDb;
  }

  const client = await connectToClient();
  const db = client.db(process.env.MONGODB_DB_NAME || 'kafiza');
  globalWithMongo._mongoDbPromise = Promise.resolve(db);
  cachedDb = db;
  return cachedDb;
}

/**
 * Closes the MongoDB connection
 * Useful for cleanup in testing or when shutting down the app
 */
export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

/**
 * Get a specific collection from the database
 */
export async function getCollection(collectionName: string) {
  const db = await connectToDatabase();
  return db.collection(collectionName);
}

