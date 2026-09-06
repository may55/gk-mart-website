import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/database';
import authRouter from './routes/auth';
import adminAuthRouter from './routes/admin/auth';
import adminProductsRouter from './routes/admin/products';
import adminInventoryRouter from './routes/admin/inventory';
import adminOrdersRouter from './routes/admin/orders';
import adminAccountsRouter from './routes/admin/accounts';
import adminUsersRouter from './routes/admin/users';import adminCategoriesRouter from './routes/admin/categories';
import adminNotificationsRouter from './routes/admin/notifications';
import publicRouter from './routes/public';
import cartRouter from './routes/cart';
import addressRouter from './routes/addresses';
import ordersRouter from './routes/orders';
import notificationsRouter from './routes/notifications';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// In development, always allow the local Vite dev server alongside the configured origin
const allowedOrigins = new Set([FRONTEND_URL.replace(/\/$/, '')]);
try {
  const configuredUrl = new URL(FRONTEND_URL);
  const alternateHost = configuredUrl.hostname.startsWith('www.')
    ? configuredUrl.hostname.slice(4)
    : `www.${configuredUrl.hostname}`;
  allowedOrigins.add(`${configuredUrl.protocol}//${alternateHost}`);
} catch {
  // Invalid configuration is still rejected by CORS; startup remains diagnosable.
}
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.add('http://localhost:5173');
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

// Admin routes
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/inventory', adminInventoryRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/accounts', adminAccountsRouter);
app.use('/api/admin/users', adminUsersRouter);

// Public routes (no auth)
app.use('/api', publicRouter);

// Authenticated user routes
app.use('/api/cart', cartRouter);
app.use('/api/user/addresses', addressRouter);
app.use('/api/orders', ordersRouter);

// Admin categories
app.use('/api/admin/categories', adminCategoriesRouter);

// Admin notifications
app.use('/api/admin/notifications', adminNotificationsRouter);

// User notifications
app.use('/api/notifications', notificationsRouter);

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
