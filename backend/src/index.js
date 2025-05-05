require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { staticAssets } = require('./middleware/cache');
const { defaultLimiter } = require('./middleware/rateLimit');
const { apiKeyRateLimiter } = require('./middleware/apiKeyRateLimit');
const routes = require('./routes');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Configure trusted proxies for proper IP detection
// This is important for rate limiting to work correctly when behind a proxy or load balancer
if (process.env.TRUSTED_PROXIES) {
  const trustedProxies = process.env.TRUSTED_PROXIES.split(',');
  app.set('trust proxy', trustedProxies);
  logger.info(`Trusted proxies configured: ${trustedProxies.join(', ')}`);
} else if (process.env.NODE_ENV === 'production') {
  // In production, trust the proxy by default
  app.set('trust proxy', 1);
  logger.info('Trusted proxy configured for production');
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // HTTP request logging

// Static assets caching
app.use('/uploads', staticAssets, express.static('uploads'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Farm2Fork API Documentation',
}));

// API Routes - Apply rate limiting
// Check for API key first, then fall back to IP-based rate limiting
app.use('/api', (req, res, next) => {
  if (req.headers['x-api-key']) {
    apiKeyRateLimiter(req, res, next);
  } else {
    defaultLimiter(req, res, next);
  }
}, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join a room based on user ID for private notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to other modules
app.set('io', io);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; // For testing
