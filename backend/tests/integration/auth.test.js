/**
 * Integration Tests — Auth & User API
 */
require('dotenv').config({ path: '.env.example' });
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-integration';
process.env.DB_NAME = 'greenquest_test';

const request = require('supertest');
const app = require('../../src/server');

// Mock everything external
jest.mock('../../src/models', () => {
  const mockUser = (overrides = {}) => ({
    id: 'user-test-123',
    email: 'test@greenquest.io',
    name: 'Test User',
    role: 'employee',
    department_id: null,
    xp_total: 50,
    level_name: 'Bronze',
    esg_score: 0,
    is_active: true,
    email_notifications: true,
    last_login: null,
    password_hash: '$2b$12$test',
    validatePassword: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn().mockReturnValue({
      id: 'user-test-123',
      email: 'test@greenquest.io',
      name: 'Test User',
      role: 'employee',
      xp_total: 50,
      level: { name: 'Bronze', icon: '🥉', color: '#CD7F32', minXP: 0, maxXP: 499 },
      xp_to_next_level: 450,
      level_progress_percent: 10,
    }),
    ...overrides,
  });

  return {
    User: {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where?.email === 'test@greenquest.io') return Promise.resolve(mockUser());
        return Promise.resolve(null);
      }),
      findByPk: jest.fn().mockResolvedValue(mockUser()),
      create: jest.fn().mockResolvedValue(mockUser()),
      count: jest.fn().mockResolvedValue(1),
      LEVELS: [],
      getLevelFromXP: jest.fn().mockReturnValue({ name: 'Bronze', minXP: 0, maxXP: 499 }),
      getXPToNextLevel: jest.fn().mockReturnValue(450),
    },
    Department: { findByPk: jest.fn().mockResolvedValue({ id: 'dept-123', name: 'Engineering' }) },
    Streak: { create: jest.fn().mockResolvedValue({ id: 'streak-123' }) },
    XPTransaction: { create: jest.fn().mockResolvedValue({ id: 'tx-123' }) },
    Achievement: { create: jest.fn().mockResolvedValue({}) },
    Milestone: { findAll: jest.fn().mockResolvedValue([]) },
    UserMilestone: { findAll: jest.fn().mockResolvedValue([]) },
    Badge: { findAll: jest.fn().mockResolvedValue([]) },
    UserBadge: { findOne: jest.fn().mockResolvedValue(null), count: jest.fn().mockResolvedValue(0) },
    sequelize: { authenticate: jest.fn().mockResolvedValue(true), sync: jest.fn().mockResolvedValue(true) },
  };
});

jest.mock('../../src/config/redis', () => ({
  initRedis: jest.fn().mockResolvedValue(true),
  cache: { get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn(), delPattern: jest.fn() },
  sseClients: new Map(),
}));

jest.mock('../../src/services/gamificationService', () => ({
  awardXP: jest.fn().mockResolvedValue({ newXP: 100, previousXP: 50, leveledUp: false }),
  checkAndAwardBadges: jest.fn().mockResolvedValue([]),
  updateStreak: jest.fn().mockResolvedValue({ streak: {}, isNew: false, streakBroken: false }),
  recalculateUserESGScore: jest.fn().mockResolvedValue(30),
}));

jest.mock('../../src/services/notificationService', () => ({
  create: jest.fn().mockResolvedValue({ id: 'notif-123' }),
  sendBadgeUnlockNotification: jest.fn(),
  sendLevelUpNotification: jest.fn(),
}));

jest.mock('../../src/jobs/scheduler', () => ({ initScheduler: jest.fn() }));

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const { User } = require('../../src/models');
      User.findOne.mockResolvedValueOnce(null); // No existing user

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new@greenquest.io', password: 'password123', name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'password123', name: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new@greenquest.io', password: 'short', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
      const { User } = require('../../src/models');
      User.findOne.mockResolvedValueOnce({ id: 'existing-user' }); // Existing user

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@greenquest.io', password: 'password123', name: 'Test' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@greenquest.io', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should reject invalid email', async () => {
      const { User } = require('../../src/models');
      User.findOne.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@greenquest.io', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('should reject wrong password', async () => {
      const { User } = require('../../src/models');
      const mockUser = {
        validatePassword: jest.fn().mockResolvedValue(false),
        is_active: true,
        update: jest.fn(),
      };
      User.findOne.mockResolvedValueOnce(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@greenquest.io', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return user data with valid token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 'user-test-123', email: 'test@greenquest.io', role: 'employee' }, 'test-secret-integration');

      const { User } = require('../../src/models');
      User.findByPk.mockResolvedValueOnce({
        id: 'user-test-123',
        is_active: true,
        toJSON: jest.fn().mockReturnValue({ id: 'user-test-123', name: 'Test User' }),
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
    });
  });
});

describe('Health Check', () => {
  it('GET /health should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route');
    expect(res.status).toBe(404);
  });
});
