const express = require('express');
const router = express.Router();
const { Reward, RewardRedemption, User } = require('../models');
const { body, validationResult } = require('express-validator');
const { authenticate, requireAdmin, requireManager } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const gamificationService = require('../services/gamificationService');
const notificationService = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// GET /rewards
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { is_active: true };
  if (category) where.category = category;

  // Filter out expired rewards
  where[Op.or] = [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }];

  // Filter out out-of-stock (quantity_available > quantity_redeemed or unlimited)
  const { count, rows } = await Reward.findAndCountAll({
    where,
    order: [['xp_cost', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  const rewards = rows.map((r) => ({
    ...r.toJSON(),
    in_stock: r.quantity_available === -1 || r.quantity_available > r.quantity_redeemed,
    stock_remaining: r.quantity_available === -1 ? null : r.quantity_available - r.quantity_redeemed,
    can_afford: req.user.xp_total >= r.xp_cost,
  }));

  res.json({ rewards, total: count });
}));

// GET /rewards/:id
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const reward = await Reward.findByPk(req.params.id);
  if (!reward) return res.status(404).json({ error: 'Reward not found.' });
  res.json(reward);
}));

// POST /rewards (admin)
router.post('/', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 10 }),
  body('category').isIn(['gift_card', 'extra_leave', 'merchandise', 'donation', 'experience', 'discount']),
  body('xp_cost').isInt({ min: 1 }),
  body('quantity_available').optional().isInt({ min: -1 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const reward = await Reward.create(req.body);
  res.status(201).json(reward);
}));

// POST /rewards/:id/redeem
router.post('/:id/redeem', authenticate, asyncHandler(async (req, res) => {
  const reward = await Reward.findByPk(req.params.id);
  if (!reward || !reward.is_active) return res.status(404).json({ error: 'Reward not found or inactive.' });

  // Check expiry
  if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Reward has expired.' });
  }

  // Check stock
  if (reward.quantity_available !== -1 && reward.quantity_redeemed >= reward.quantity_available) {
    return res.status(400).json({ error: 'Reward is out of stock.' });
  }

  // Check XP balance
  const user = await User.findByPk(req.user.id);
  if (user.xp_total < reward.xp_cost) {
    return res.status(400).json({
      error: `Insufficient XP. You need ${reward.xp_cost} XP but have ${user.xp_total} XP.`,
      required: reward.xp_cost,
      current: user.xp_total,
    });
  }

  // Deduct XP
  await gamificationService.deductXP(
    req.user.id, reward.xp_cost, 'reward_redemption',
    `Redeemed: ${reward.name}`, reward.id
  );

  // Create redemption
  const redemption = await RewardRedemption.create({
    user_id: req.user.id,
    reward_id: reward.id,
    xp_spent: reward.xp_cost,
    status: 'pending',
    redemption_code: `GQ-${uuidv4().substring(0, 8).toUpperCase()}`,
  });

  // Update inventory
  await reward.increment('quantity_redeemed');

  // Notify user
  await notificationService.create(req.user.id, {
    type: 'reward_approved',
    title: `🎁 Reward Redeemed: ${reward.name}`,
    message: `Your redemption for "${reward.name}" has been submitted. Code: ${redemption.redemption_code}. We'll process it soon!`,
    icon: reward.icon || '🎁',
    color: '#2196F3',
    action_url: '/rewards/my-redemptions',
    metadata: { redemption_id: redemption.id, code: redemption.redemption_code },
  });

  res.status(201).json({
    redemption,
    message: `Successfully redeemed "${reward.name}"!`,
    code: redemption.redemption_code,
    xp_spent: reward.xp_cost,
  });
}));

// GET /rewards/my-redemptions
router.get('/my/redemptions', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { user_id: req.user.id };
  if (status) where.status = status;

  const { count, rows } = await RewardRedemption.findAndCountAll({
    where,
    include: [{ association: 'reward', as: 'reward' }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ redemptions: rows, total: count });
}));

// PATCH /rewards/redemptions/:id (admin/manager — approve/deliver)
router.patch('/redemptions/:id', authenticate, requireManager, [
  body('status').isIn(['approved', 'delivered', 'rejected']),
  body('notes').optional().trim(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const redemption = await RewardRedemption.findByPk(req.params.id, {
    include: [{ association: 'reward', as: 'reward' }],
  });
  if (!redemption) return res.status(404).json({ error: 'Redemption not found.' });

  const updates = {
    status: req.body.status,
    notes: req.body.notes,
    approved_by: req.user.id,
  };
  if (req.body.status === 'approved') updates.approved_at = new Date();
  if (req.body.status === 'delivered') updates.delivered_at = new Date();
  if (req.body.status === 'rejected') {
    // Refund XP
    await gamificationService.awardXP(
      redemption.user_id, redemption.xp_spent, 'manual',
      `Refund for rejected reward: ${redemption.reward?.name}`, redemption.id
    );
  }

  await redemption.update(updates);
  await notificationService.sendRewardNotification(redemption.user_id, redemption.reward, redemption);

  res.json(redemption);
}));

// PATCH /rewards/:id (admin)
router.patch('/:id', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const reward = await Reward.findByPk(req.params.id);
  if (!reward) return res.status(404).json({ error: 'Reward not found.' });

  const allowed = ['name', 'description', 'xp_cost', 'quantity_available', 'is_active', 'icon', 'image_url', 'expires_at'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  await reward.update(updates);
  res.json(reward);
}));

module.exports = router;
