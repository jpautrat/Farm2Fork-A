/**
 * API Key-based rate limiting middleware for the Farm2Fork API
 * Provides different rate limits based on API key tiers
 */

const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { RedisStore } = require('rate-limit-redis');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

// Initialize Redis client if REDIS_URL is provided
let redisClient;
let redisStore;

if (process.env.REDIS_URL) {
  try {
    // Reuse the same Redis client from rateLimit.js if possible
    if (global.redisClient) {
      redisClient = global.redisClient;
      logger.info('Reusing existing Redis client for API key rate limiting');
    } else {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        legacyMode: false,
      });
      
      // Connect to Redis
      (async () => {
        await redisClient.connect();
        logger.info('Redis connected successfully for API key rate limiting');
      })();
      
      // Store Redis client globally for reuse
      global.redisClient = redisClient;
    }
    
    // Handle Redis errors
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });
    
    // Create Redis store for rate limiting
    redisStore = new RedisStore({
      // @ts-expect-error - Known issue: the redis client types are not compatible
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rl:api:',
    });
    
    logger.info('Using Redis store for API key rate limiting');
  } catch (error) {
    logger.error('Failed to initialize Redis for API key rate limiting:', error);
    logger.info('Falling back to memory store for API key rate limiting');
  }
}

// API key tiers and their rate limits
const API_KEY_TIERS = {
  basic: {
    limit: process.env.API_KEY_RATE_LIMIT_BASIC || 100,
    windowMs: 60 * 1000, // 1 minute
  },
  premium: {
    limit: process.env.API_KEY_RATE_LIMIT_PREMIUM || 300,
    windowMs: 60 * 1000, // 1 minute
  },
  enterprise: {
    limit: process.env.API_KEY_RATE_LIMIT_ENTERPRISE || 1000,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * API key rate limiter middleware
 * Uses the API key from the request header to determine the rate limit
 */
const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  // The limit will be determined dynamically based on the API key tier
  max: (req) => {
    const apiKey = req.headers['x-api-key'];
    
    // If no API key is provided, use the default rate limit
    if (!apiKey) {
      return process.env.RATE_LIMIT_DEFAULT || 100;
    }
    
    // Get the API key tier from the database or cache
    // This is a simplified example - in a real application, you would look up the API key in a database
    const tier = getApiKeyTier(apiKey);
    
    // Return the rate limit for the tier
    return API_KEY_TIERS[tier]?.limit || API_KEY_TIERS.basic.limit;
  },
  // Use the API key as the key for rate limiting
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  // Use Redis store if available, otherwise use memory store
  store: redisStore || undefined,
  // Skip rate limiting for whitelisted API keys
  skip: (req) => {
    const apiKey = req.headers['x-api-key'];
    const whitelist = process.env.API_KEY_WHITELIST ? 
      process.env.API_KEY_WHITELIST.split(',') : [];
    return whitelist.includes(apiKey);
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'API rate limit exceeded, please try again later or upgrade your plan.'
    }
  },
  handler: (req, res, next, options) => {
    const apiKey = req.headers['x-api-key'] || 'no-key';
    logger.warn(`API key rate limit exceeded for key: ${apiKey}, Path: ${req.path}`);
    res.status(429).json(options.message);
  }
});

/**
 * Get the tier for an API key
 * In a real application, this would query a database or cache
 * @param {string} apiKey - The API key
 * @returns {string} - The tier name (basic, premium, enterprise)
 */
function getApiKeyTier(apiKey) {
  // This is a simplified example - in a real application, you would look up the API key in a database
  // For now, we'll just return a tier based on the key length
  if (!apiKey) return 'basic';
  
  // Mock implementation - in a real app, this would query a database
  if (apiKey.startsWith('premium_')) {
    return 'premium';
  } else if (apiKey.startsWith('enterprise_')) {
    return 'enterprise';
  } else {
    return 'basic';
  }
}

module.exports = {
  apiKeyRateLimiter,
  API_KEY_TIERS
};
