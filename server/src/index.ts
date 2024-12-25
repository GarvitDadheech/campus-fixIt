import cors from 'cors';
import express, { Application } from 'express';
import path from 'path';

// Import configurations
import { configureCloudinary, connectDatabase, env } from './config';

// Import routes
import routes from './routes';

// Import middlewares
import { errorHandler, notFoundHandler } from './middlewares';

// Import logger
import { log } from './utils';

// Initialize Express app
const app: Application = express();

// ==================== MIDDLEWARE ====================

// Enable CORS
app.use(
  cors({
    origin: env.NODE_ENV === 'production' 
      ? ['http://localhost:3000', 'http://localhost:8081', 'exp://']
      : ['http://localhost:3000', 'http://localhost:8081', 'exp://'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== ROUTES ====================

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Campus FixIt API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Configure Cloudinary
    configureCloudinary();

    // Start server
    app.listen(env.PORT, () => {
      log.info('='.repeat(60));
      log.info('Campus FixIt Server');
      log.info('='.repeat(60));
      log.info(`Server running on port ${env.PORT}`);
      log.info(`Environment: ${env.NODE_ENV}`);
      log.info(`URL: http://localhost:${env.PORT}`);
      log.info('='.repeat(60));
    });
  } catch (error) {
    log.error('Failed to start server', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  log.error('Unhandled Rejection at promise', reason);
  // Don't exit in development
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  log.error('Uncaught Exception', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
