const express = require('express');
const router = express.Router();
const { Badge, UserBadge } = require('../models');
const { body, validationResult } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const gamificationService = require('../services/gamificationService');

// GET /badges
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { category, rarity } = req.query;
  const where = { is_active: true };
  if (category) where.category = category;
  if (rarity) where.rarity = rarity;

  const badges = await Badge.findAll({ where, order: [['rarity', 'ASC'], ['name', 'ASC']] });
  const userBadges = await UserBadge.findAll({ where: { user_id: req.user.id }, attributes: ['badge_id', 'awarded_at'] });
  const earnedIds = new Set(userBadges.map((ub) => ub.badge_id));

  const result = badges.map((b) => ({
    ...b.toJSON(),
    earned: earnedIds.has(b.id),
    earned_at: userBadges.find((ub) => ub.badge_id === b.id)?.awarded_at || null,
  }));

  res.json({ badges: result, earned_count: earnedIds.size, total: badges.length });
}));

// GET /badges/:id
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const badge = await Badge.findByPk(req.params.id);
  if (!badge) return res.status(404).json({ error: 'Badge not found.' });

  const userBadge = await UserBadge.findOne({ where: { user_id: req.user.id, badge_id: badge.id } });
  res.json({ ...badge.toJSON(), earned: !!userBadge, earned_at: userBadge?.awarded_at || null });
}));

// POST /badges (admin)
router.post('/', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 10 }),
  body('category').isIn(['sustainability', 'engagement', 'challenge', 'streak', 'milestone', 'esg', 'special']),
  body('rarity').isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  body('xp_reward').isInt({ min: 0 }),
  body('criteria').isObject(),
  body('icon').optional().isString(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const badge = await Badge.create(req.body);
  res.status(201).json(badge);
}));

// POST /badges/:id/award (admin — manually award)
router.post('/:id/award', authenticate, requireAdmin, [
  body('user_id').isUUID(),
  body('reason').optional().trim(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const result = await gamificationService.awardBadge(req.params.id, req.body.user_id, req.body.reason || 'admin');
  if (!result) return res.status(409).json({ error: 'User already has this badge.' });
  res.json({ message: 'Badge awarded successfully.', userBadge: result });
}));

// PATCH /badges/:id (admin)
router.patch('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const badge = await Badge.findByPk(req.params.id);
  if (!badge) return res.status(404).json({ error: 'Badge not found.' });

  const allowed = ['name', 'description', 'icon', 'xp_reward', 'criteria', 'is_active', 'image_url'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  await badge.update(updates);
  res.json(badge);
}));

module.exports = router;
