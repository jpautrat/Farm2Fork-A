/**
 * Cache implementation with support for both in-memory and Redis storage
 * Automatically falls back to in-memory cache if Redis is not available
 */
const { createClient } = require('redis');
const logger = require('./logger');

// Cache store types
const STORE_TYPES = {
  MEMORY: 'memory',
  REDIS: 'redis'
};

/**
 * In-memory cache store implementation
 */
class MemoryStore {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - The stored value
   */
  async set(key, value, ttl) {
    const now = Date.now();
    const item = {
      value,
      expiry: now + (ttl * 1000),
    };
    this.cache.set(key, item);
    return value;
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if not found or expired
   */
  async get(key) {
    const item = this.cache.get(key);

    // Return null if item doesn't exist
    if (!item) return null;

    // Return null if item is expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all values from the cache
   * @returns {Promise<void>}
   */
  async clear() {
    this.cache.clear();
  }
}

/**
 * Redis cache store implementation
 */
class RedisStore {
  /**
   * Create a new Redis store
   * @param {Object} client - Redis client
   * @param {string} prefix - Key prefix for Redis
   */
  constructor(client, prefix = 'cache:') {
    this.client = client;
    this.prefix = prefix;
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} - The stored value
   */
  async set(key, value, ttl) {
    const prefixedKey = this.prefix + key;
    const serializedValue = JSON.stringify(value);

    try {
      await this.client.set(prefixedKey, serializedValue, {
        EX: ttl
      });
      return value;
    } catch (error) {
      logger.error(`Redis cache set error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if not found
   */
  async get(key) {
    const prefixedKey = this.prefix + key;

    try {
      const value = await this.client.get(prefixedKey);
      if (!value) return null;

      return JSON.parse(value);
    } catch (error) {
      logger.error(`Redis cache get error: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    const prefixedKey = this.prefix + key;

    try {
      await this.client.del(prefixedKey);
    } catch (error) {
      logger.error(`Redis cache delete error: ${error.message}`);
    }
  }

  /**
   * Clear all values from the cache with the current prefix
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      // Get all keys with the current prefix
      const keys = await this.client.keys(`${this.prefix}*`);

      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error(`Redis cache clear error: ${error.message}`);
    }
  }
}

/**
 * Main cache class that uses either memory or Redis store
 */
class Cache {
  /**
   * Create a new cache instance
   * @param {number} ttl - Default TTL in seconds
   */
  constructor(ttl = 300) {
    this.defaultTTL = ttl;
    this.storeType = STORE_TYPES.MEMORY;
    this.store = new MemoryStore();

    // Initialize Redis if URL is provided
    this.initRedis();
  }

  /**
   * Initialize Redis store if Redis URL is provided
   */
  async initRedis() {
    if (process.env.REDIS_URL && process.env.CACHE_STORE === 'redis') {
      try {
        // Reuse the global Redis client if available
        if (global.redisClient) {
          logger.info('Reusing existing Redis client for caching');
          this.redisClient = global.redisClient;
        } else {
          logger.info('Initializing new Redis client for caching');
          this.redisClient = createClient({
            url: process.env.REDIS_URL,
            legacyMode: false,
          });

          // Connect to Redis
          await this.redisClient.connect();

          // Store Redis client globally for reuse
          global.redisClient = this.redisClient;
        }

        // Handle Redis errors
        this.redisClient.on('error', (err) => {
          logger.error('Redis cache error:', err);
          logger.info('Falling back to memory store for caching');
          this.storeType = STORE_TYPES.MEMORY;
          this.store = new MemoryStore();
        });

        // Create Redis store
        this.store = new RedisStore(this.redisClient, 'cache:');
        this.storeType = STORE_TYPES.REDIS;

        logger.info('Using Redis store for caching');
      } catch (error) {
        logger.error('Failed to initialize Redis for caching:', error);
        logger.info('Falling back to memory store for caching');
        this.storeType = STORE_TYPES.MEMORY;
        this.store = new MemoryStore();
      }
    } else {
      logger.info('Using memory store for caching');
    }
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<any>} - The stored value
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      return await this.store.set(key, value, ttl);
    } catch (error) {
      logger.error(`Cache set error: ${error.message}`);

      // If Redis fails, fall back to memory store
      if (this.storeType === STORE_TYPES.REDIS) {
        logger.info('Falling back to memory store for this operation');
        const memoryStore = new MemoryStore();
        return memoryStore.set(key, value, ttl);
      }

      return value; // Return the value even if caching fails
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if not found or expired
   */
  async get(key) {
    try {
      return await this.store.get(key);
    } catch (error) {
      logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      await this.store.delete(key);
    } catch (error) {
      logger.error(`Cache delete error: ${error.message}`);
    }
  }

  /**
   * Clear all values from the cache
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await this.store.clear();
    } catch (error) {
      logger.error(`Cache clear error: ${error.message}`);
    }
  }

  /**
   * Get a value from the cache or compute it if not found
   * @param {string} key - Cache key
   * @param {Function} fn - Function to compute the value if not in cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<any>} - Cached or computed value
   */
  async getOrSet(key, fn, ttl = this.defaultTTL) {
    try {
      const cachedValue = await this.get(key);
      if (cachedValue !== null) {
        return cachedValue;
      }

      const value = await fn();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error(`Cache getOrSet error: ${error.message}`);

      // If cache fails, just compute the value
      return await fn();
    }
  }

  /**
   * Get the current store type (memory or redis)
   * @returns {string} - Store type
   */
  getStoreType() {
    return this.storeType;
  }

  /**
   * Check if the cache is using Redis
   * @returns {boolean} - True if using Redis, false if using memory
   */
  isRedis() {
    return this.storeType === STORE_TYPES.REDIS;
  }
}

// Create a singleton instance
const cache = new Cache();

module.exports = cache;
