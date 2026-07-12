/**
 * Unit Tests — Gamification Service
 */
require('dotenv').config({ path: '.env.example' });
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Mock database models
jest.mock('../src/models', () => {
  const { v4: uuidv4 } = require('uuid');
  const mockUser = {
    id: 'user-123',
    xp_total: 450,
    level_name: 'Bronze',
    esg_score: 30,
    actions_completed: 10,
    carbon_saved_kg: 25,
    department_id: 'dept-123',
    is_active: true,
    update: jest.fn().mockResolvedValue(true),
    increment: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockReturnValue({}),
    toJSON: jest.fn().mockReturnValue({}),
  };

  return {
    User: {
      findByPk: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue([1]),
      findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
      LEVELS: [
        { name: 'Bronze', minXP: 0, maxXP: 499, color: '#CD7F32', icon: '🥉' },
        { name: 'Silver', minXP: 500, maxXP: 1499, color: '#C0C0C0', icon: '🥈' },
        { name: 'Gold', minXP: 1500, maxXP: 3999, color: '#FFD700', icon: '🥇' },
        { name: 'Platinum', minXP: 4000, maxXP: 9999, color: '#E5E4E2', icon: '💎' },
        { name: 'Diamond', minXP: 10000, maxXP: Infinity, color: '#B9F2FF', icon: '💠' },
      ],
      getLevelFromXP: jest.fn((xp) => {
        if (xp >= 10000) return { name: 'Diamond', minXP: 10000, maxXP: Infinity, color: '#B9F2FF', icon: '💠' };
        if (xp >= 4000) return { name: 'Platinum', minXP: 4000, maxXP: 9999, color: '#E5E4E2', icon: '💎' };
        if (xp >= 1500) return { name: 'Gold', minXP: 1500, maxXP: 3999, color: '#FFD700', icon: '🥇' };
        if (xp >= 500) return { name: 'Silver', minXP: 500, maxXP: 1499, color: '#C0C0C0', icon: '🥈' };
        return { name: 'Bronze', minXP: 0, maxXP: 499, color: '#CD7F32', icon: '🥉' };
      }),
      getXPToNextLevel: jest.fn((xp) => xp < 500 ? 500 - xp : 0),
    },
    Badge: { findAll: jest.fn().mockResolvedValue([]), findByPk: jest.fn().mockResolvedValue(null) },
    UserBadge: {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'ub-123' }),
      count: jest.fn().mockResolvedValue(0),
    },
    XPTransaction: { create: jest.fn().mockResolvedValue({ id: 'xp-123' }) },
    Achievement: { create: jest.fn().mockResolvedValue({ id: 'ach-123' }) },
    Streak: {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ current_streak: 1, longest_streak: 1, update: jest.fn() }),
    },
    Milestone: { findAll: jest.fn().mockResolvedValue([]) },
    UserMilestone: { findAll: jest.fn().mockResolvedValue([]), create: jest.fn() },
    Department: {
      findByPk: jest.fn().mockResolvedValue({ id: 'dept-123', esg_score: 45, member_count: 5 }),
      findAll: jest.fn().mockResolvedValue([]),
      increment: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue([1]),
    },
    ChallengeParticipant: { count: jest.fn().mockResolvedValue(0) },
    ESGAction: { findAll: jest.fn().mockResolvedValue([]) },
  };
});

jest.mock('../src/config/redis', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    delPattern: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../src/services/notificationService', () => ({
  create: jest.fn().mockResolvedValue({ id: 'notif-123' }),
  sendBadgeUnlockNotification: jest.fn().mockResolvedValue(true),
  sendLevelUpNotification: jest.fn().mockResolvedValue(true),
  sendStreakMilestoneNotification: jest.fn().mockResolvedValue(true),
}));

const gamificationService = require('../src/services/gamificationService');
const { User, XPTransaction, Achievement } = require('../src/models');

describe('GamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('awardXP', () => {
    it('should award XP to a user', async () => {
      const mockUser = {
        id: 'user-123',
        xp_total: 450,
        level_name: 'Bronze',
        department_id: 'dept-123',
        update: jest.fn().mockResolvedValue(true),
      };
      User.findByPk.mockResolvedValue(mockUser);
      XPTransaction.create.mockResolvedValue({ id: 'tx-123' });

      const result = await gamificationService.awardXP('user-123', 50, 'action', 'Test action');

      expect(User.findByPk).toHaveBeenCalledWith('user-123');
      expect(mockUser.update).toHaveBeenCalledWith({ xp_total: 500 }, expect.anything());
      expect(XPTransaction.create).toHaveBeenCalled();
      expect(result.newXP).toBe(500);
      expect(result.previousXP).toBe(450);
    });

    it('should detect level up when crossing XP threshold', async () => {
      const mockUser = {
        id: 'user-123',
        xp_total: 490,
        level_name: 'Bronze',
        department_id: null,
        update: jest.fn().mockResolvedValue(true),
      };
      User.findByPk.mockResolvedValue(mockUser);
      XPTransaction.create.mockResolvedValue({});
      Achievement.create.mockResolvedValue({});

      const result = await gamificationService.awardXP('user-123', 50, 'action', 'Level up test');

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel.name).toBe('Silver');
    });

    it('should not award XP to non-existent user', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(
        gamificationService.awardXP('nonexistent', 50, 'action', 'test')
      ).rejects.toThrow('User nonexistent not found');
    });
  });

  describe('getLevelFromXP', () => {
    it('should return Bronze for 0 XP', () => {
      const level = User.getLevelFromXP(0);
      expect(level.name).toBe('Bronze');
    });

    it('should return Silver for 500 XP', () => {
      const level = User.getLevelFromXP(500);
      expect(level.name).toBe('Silver');
    });

    it('should return Gold for 1500 XP', () => {
      const level = User.getLevelFromXP(1500);
      expect(level.name).toBe('Gold');
    });

    it('should return Diamond for 10000+ XP', () => {
      const level = User.getLevelFromXP(10000);
      expect(level.name).toBe('Diamond');
    });
  });

  describe('updateStreak', () => {
    it('should create a new streak for new user', async () => {
      const { Streak } = require('../src/models');
      Streak.findOne.mockResolvedValue(null);
      const today = new Date().toISOString().split('T')[0];
      Streak.create.mockResolvedValue({
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        update: jest.fn(),
      });

      const result = await gamificationService.updateStreak('user-123');
      expect(result.isNew).toBe(true);
      expect(result.streak.current_streak).toBe(1);
    });

    it('should not update streak if already updated today', async () => {
      const { Streak } = require('../src/models');
      const today = new Date().toISOString().split('T')[0];
      Streak.findOne.mockResolvedValue({
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: today,
        update: jest.fn(),
      });

      const result = await gamificationService.updateStreak('user-123');
      expect(result.isNew).toBe(false);
      expect(result.streakBroken).toBe(false);
    });
  });

  describe('getDepartmentLeaderboard', () => {
    it('should return a leaderboard with departments', async () => {
      const { Department } = require('../src/models');
      Department.findAll.mockResolvedValue([
        { id: 'dept-1', name: 'Engineering', icon: '⚙️', color: '#4ade80', esg_score: 75, total_xp: 10000, total_carbon_saved_kg: 500, member_count: 10 },
        { id: 'dept-2', name: 'Product', icon: '🎯', color: '#60a5fa', esg_score: 60, total_xp: 8000, total_carbon_saved_kg: 350, member_count: 8 },
      ]);

      const result = await gamificationService.getDepartmentLeaderboard(20);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
    });
  });
});
