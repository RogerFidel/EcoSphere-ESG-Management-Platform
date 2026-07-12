const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { User, XPTransaction, Achievement, UserBadge, Badge, Streak, UserMilestone, Milestone } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');
const gamificationService = require('../services/gamificationService');
const { Op } = require('sequelize');

// GET /users (admin)
router.get('/', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, department_id, role } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = {};
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (department_id) where.department_id = department_id;
  if (role) where.role = role;

  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ association: 'department', as: 'department', attributes: ['name', 'color', 'icon'] }],
    attributes: { exclude: ['password_hash'] },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ users: rows.map((u) => u.toJSON()), total: count, page: parseInt(page), limit: parseInt(limit) });
}));

// GET /users/:id
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id && req.user.role === 'employee') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const cacheKey = `user:${id}:profile`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  const user = await User.findByPk(id, {
    include: [
      { association: 'department', as: 'department' },
      { association: 'streak', as: 'streak' },
      { association: 'userBadges', as: 'userBadges', include: [{ association: 'badge', as: 'badge' }] },
    ],
    attributes: { exclude: ['password_hash'] },
  });

  if (!user) return res.status(404).json({ error: 'User not found.' });

  const result = user.toJSON();
  await cache.set(cacheKey, result, 300);
  res.json(result);
}));

// PATCH /users/:id (self or admin)
router.patch('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email_notifications').optional().isBoolean(),
  body('avatar_url').optional().isURL(),
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const allowed = ['name', 'email_notifications', 'avatar_url'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  await User.update(updates, { where: { id } });
  await cache.del(`user:${id}:profile`);

  const updated = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  res.json(updated.toJSON());
}));

// GET /users/:id/xp-history
router.get('/:id/xp-history', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id && req.user.role === 'employee') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { page = 1, limit = 20, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { user_id: id };
  if (type) where.type = type;

  const { count, rows } = await XPTransaction.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ transactions: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
}));

// GET /users/:id/badges
router.get('/:id/badges', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userBadges = await UserBadge.findAll({
    where: { user_id: id },
    include: [{ association: 'badge', as: 'badge' }],
    order: [['awarded_at', 'DESC']],
  });

  const allBadges = await Badge.findAll({ where: { is_active: true } });
  const earnedIds = userBadges.map((ub) => ub.badge_id);
  const locked = allBadges.filter((b) => !earnedIds.includes(b.id));

  res.json({ earned: userBadges, locked, total_earned: userBadges.length, total_available: allBadges.length });
}));

// GET /users/:id/achievements
router.get('/:id/achievements', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { user_id: id };
  if (type) where.type = type;

  const { count, rows } = await Achievement.findAndCountAll({
    where,
    order: [['achieved_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ achievements: rows, total: count });
}));

// GET /users/:id/milestones
router.get('/:id/milestones', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const allMilestones = await Milestone.findAll({ where: { is_active: true }, order: [['threshold', 'ASC']] });
  const userMilestones = await UserMilestone.findAll({ where: { user_id: id } });
  const achievedIds = userMilestones.map((um) => um.milestone_id);

  const milestones = allMilestones.map((m) => ({
    ...m.toJSON(),
    achieved: achievedIds.includes(m.id),
    achieved_at: userMilestones.find((um) => um.milestone_id === m.id)?.achieved_at || null,
  }));

  res.json({ milestones, achieved_count: achievedIds.length, total: allMilestones.length });
}));

// POST /users/:id/award-xp (admin only)
router.post('/:id/award-xp', authenticate, requireAdmin, [
  body('amount').isInt({ min: 1, max: 10000 }),
  body('reason').trim().isLength({ min: 5 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { amount, reason } = req.body;
  const result = await gamificationService.awardXP(req.params.id, amount, 'manual', reason);
  res.json({ message: `Awarded ${amount} XP`, result });
}));

module.exports = router;
