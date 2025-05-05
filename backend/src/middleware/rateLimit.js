/**
 * Rate limiting middleware for the Farm2Fork API
 * Implements different rate limits for different types of endpoints
 * Supports Redis-based storage for distributed deployments
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
    redisClient = createClient({
      url: process.env.REDIS_URL,
      legacyMode: false,
    });

    // Connect to Redis
    (async () => {
      await redisClient.connect();
      logger.info('Redis connected successfully for rate limiting');
    })();

    // Handle Redis errors
    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    // Create Redis store for rate limiting
    redisStore = new RedisStore({
      // @ts-expect-error - Known issue: the redis client types are not compatible
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rl:',
    });

    logger.info('Using Redis store for rate limiting');
  } catch (error) {
    logger.error('Failed to initialize Redis for rate limiting:', error);
    logger.info('Falling back to memory store for rate limiting');
  }
}

/**
 * Default rate limiter - Default: 100 requests per minute
 * Applied to most API endpoints
 */
const defaultLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_DEFAULT || 100, // Default: 100 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use Redis store if available, otherwise use memory store
  store: redisStore || undefined,
  // Skip rate limiting for whitelisted IPs
  skip: (req) => {
    const whitelist = process.env.RATE_LIMIT_WHITELIST ?
      process.env.RATE_LIMIT_WHITELIST.split(',') : [];
    return whitelist.includes(req.ip);
  },
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json(options.message);
  }
});

/**
 * Strict rate limiter - Default: 20 requests per minute
 * Applied to sensitive endpoints like authentication
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_STRICT || 20, // Default: 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store if available, otherwise use memory store
  store: redisStore || undefined,
  // Skip rate limiting for whitelisted IPs
  skip: (req) => {
    const whitelist = process.env.RATE_LIMIT_WHITELIST ?
      process.env.RATE_LIMIT_WHITELIST.split(',') : [];
    return whitelist.includes(req.ip);
  },
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json(options.message);
  }
});

/**
 * Relaxed rate limiter - Default: 300 requests per minute
 * Applied to public endpoints like product listings
 */
const relaxedLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_RELAXED || 300, // Default: 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store if available, otherwise use memory store
  store: redisStore || undefined,
  // Skip rate limiting for whitelisted IPs
  skip: (req) => {
    const whitelist = process.env.RATE_LIMIT_WHITELIST ?
      process.env.RATE_LIMIT_WHITELIST.split(',') : [];
    return whitelist.includes(req.ip);
  },
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.'
    }
  },
  handler: (req, res, next, options) => {
    logger.warn(`Relaxed rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json(options.message);
  }
});

module.exports = {
  defaultLimiter,
  strictLimiter,
  relaxedLimiter
};
