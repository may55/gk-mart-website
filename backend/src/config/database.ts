import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gkmart';
    await mongoose.connect(mongoUri);
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✓ Database disconnected successfully');
  } catch (error) {
    console.error('✗ Database disconnection failed:', error);
    throw error;
  }
};

export { connectDB, disconnectDB };
