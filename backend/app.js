require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import configurations
const { connectDatabase } = require('./config/database');
const { configureGoogleSheets } = require('./config/googleSheets');
const { configureCloudinary } = require('./config/cloudinary');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const serviceRequestRoutes = require('./routes/serviceRequests');
const integratorRoutes = require('./routes/integrator');
const partnerRoutes = require('./routes/partner');
const notificationRoutes = require('./routes/notifications');
const geminiRoutes = require('./routes/gemini');

// Import utilities
const { seedSampleData } = require('./utils/seedData');

const app = express();

// Environment variables validation
const requiredEnvs = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'SPREADSHEET_ID',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GEMINI_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
];

requiredEnvs.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Warning: Environment variable ${envVar} is not set.`);
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/', authRoutes); // Mount auth routes at root level for backward compatibility
app.use('/service-requests', serviceRequestRoutes);
app.use('/api/integrator', integratorRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api', notificationRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Initialize configurations and start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize Google Sheets
    configureGoogleSheets();

    // Initialize Cloudinary
    configureCloudinary();

    // Start server
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);

      // Seed sample data in development
      if (process.env.NODE_ENV !== 'production') {
        try {
          await seedSampleData();
        } catch (error) {
          console.error('❌ Error seeding sample data:', error);
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;