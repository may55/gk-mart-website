import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB for testing
 */
export const connectTestDB = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

/**
 * Disconnect from in-memory MongoDB
 */
export const disconnectTestDB = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongoServer?.stop();
};

/**
 * Clear all collections
 */
export const clearTestDB = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export default {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
};
