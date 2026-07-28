import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/database';
import authRouter from './routes/auth';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n✓ SIGTERM signal received: closing HTTP server');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n✓ SIGINT signal received: closing HTTP server');
  await disconnectDB();
  process.exit(0);
});

startServer();

export default app;
