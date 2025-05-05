/**
 * Tests for the cache utility
 */
const { jest } = require('@jest/globals');

// Mock Redis client
jest.mock('redis', () => {
  const mockRedisClient = {
    connect: jest.fn().mockResolvedValue(),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
    sendCommand: jest.fn(),
  };
  
  return {
    createClient: jest.fn().mockReturnValue(mockRedisClient),
  };
});

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Set environment variables for testing
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CACHE_STORE = 'redis';

// Import cache after mocking dependencies
const redis = require('redis');
const logger = require('../../src/utils/logger');

describe('Cache Utility', () => {
  let cache;
  let mockRedisClient;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset module registry to ensure a fresh cache instance
    jest.resetModules();
    
    // Get the mock Redis client
    mockRedisClient = redis.createClient();
    
    // Import cache after resetting modules
    cache = require('../../src/utils/cache');
  });
  
  describe('Memory Store', () => {
    beforeEach(() => {
      // Force cache to use memory store
      process.env.CACHE_STORE = 'memory';
      jest.resetModules();
      cache = require('../../src/utils/cache');
    });
    
    afterEach(() => {
      // Reset to Redis for other tests
      process.env.CACHE_STORE = 'redis';
    });
    
    test('should store and retrieve values', async () => {
      const key = 'test-key';
      const value = { name: 'test-value' };
      
      await cache.set(key, value);
      const result = await cache.get(key);
      
      expect(result).toEqual(value);
    });
    
    test('should return null for non-existent keys', async () => {
      const result = await cache.get('non-existent-key');
      
      expect(result).toBeNull();
    });
    
    test('should delete values', async () => {
      const key = 'test-key';
      const value = { name: 'test-value' };
      
      await cache.set(key, value);
      await cache.delete(key);
      const result = await cache.get(key);
      
      expect(result).toBeNull();
    });
    
    test('should clear all values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      
      await cache.clear();
      
      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
    
    test('should handle getOrSet correctly', async () => {
      const key = 'test-key';
      const value = { name: 'test-value' };
      const fn = jest.fn().mockResolvedValue(value);
      
      // First call should compute the value
      const result1 = await cache.getOrSet(key, fn);
      expect(result1).toEqual(value);
      expect(fn).toHaveBeenCalledTimes(1);
      
      // Second call should return from cache
      const result2 = await cache.getOrSet(key, fn);
      expect(result2).toEqual(value);
      expect(fn).toHaveBeenCalledTimes(1); // Still only called once
    });
    
    test('should respect TTL', async () => {
      const key = 'test-key';
      const value = { name: 'test-value' };
      
      // Set with a very short TTL (1ms)
      await cache.set(key, value, 0.001);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await cache.get(key);
      expect(result).toBeNull();
    });
  });
  
  describe('Redis Store', () => {
    beforeEach(() => {
      // Ensure Redis store is used
      process.env.CACHE_STORE = 'redis';
      jest.resetModules();
      cache = require('../../src/utils/cache');
    });
    
    test('should initialize Redis client', () => {
      expect(redis.createClient).toHaveBeenCalledWith({
        url: 'redis://localhost:6379',
        legacyMode: false,
      });
      expect(mockRedisClient.connect).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Using Redis store for caching');
    });
    
    test('should store values in Redis', async () => {
      const key = 'test-key';
      const value = { name: 'test-value' };
      
      await cache.set(key, value);
      
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'cache:test-key',
        JSON.stringify(value),
        { EX: 300 }
      );
    });
    
    test('should retrieve values from Redis', async () => {
      const key = 'test-key';
      const value = { name: 'test-value' };
      
      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));
      
      const result = await cache.get(key);
      
      expect(mockRedisClient.get).toHaveBeenCalledWith('cache:test-key');
      expect(result).toEqual(value);
    });
    
    test('should delete values from Redis', async () => {
      const key = 'test-key';
      
      await cache.delete(key);
      
      expect(mockRedisClient.del).toHaveBeenCalledWith('cache:test-key');
    });
    
    test('should clear all values from Redis', async () => {
      mockRedisClient.keys.mockResolvedValue(['cache:key1', 'cache:key2']);
      
      await cache.clear();
      
      expect(mockRedisClient.keys).toHaveBeenCalledWith('cache:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(['cache:key1', 'cache:key2']);
    });
    
    test('should handle Redis errors gracefully', async () => {
      const key = 'test-key';
      const error = new Error('Redis error');
      
      mockRedisClient.get.mockRejectedValue(error);
      
      const result = await cache.get(key);
      
      expect(logger.error).toHaveBeenCalledWith(`Redis cache get error: ${error.message}`);
      expect(result).toBeNull();
    });
  });
});
