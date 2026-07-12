const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

const initRedis = async () => {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redis.on('connect', () => logger.info('Redis: connecting...'));
  redis.on('ready', () => logger.info('Redis: ready'));
  redis.on('error', (err) => logger.error('Redis error:', err.message));
  redis.on('close', () => logger.warn('Redis: connection closed'));

  await redis.ping();
  return redis;
};

const getRedis = () => {
  if (!redis) throw new Error('Redis not initialized. Call initRedis() first.');
  return redis;
};

// Cache helpers
const cache = {
  async get(key) {
    try {
      const data = await getRedis().get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error('Cache get error:', err.message);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.error('Cache set error:', err.message);
    }
  },

  async del(key) {
    try {
      await getRedis().del(key);
    } catch (err) {
      logger.error('Cache del error:', err.message);
    }
  },

  async delPattern(pattern) {
    try {
      const keys = await getRedis().keys(pattern);
      if (keys.length > 0) await getRedis().del(...keys);
    } catch (err) {
      logger.error('Cache delPattern error:', err.message);
    }
  },

  async incr(key) {
    try {
      return await getRedis().incr(key);
    } catch (err) {
      logger.error('Cache incr error:', err.message);
      return null;
    }
  },
};

// SSE clients store
const sseClients = new Map();

module.exports = { initRedis, getRedis, cache, sseClients };
