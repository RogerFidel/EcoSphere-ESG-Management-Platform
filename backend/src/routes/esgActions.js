const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { ESGAction, User } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const gamificationService = require('../services/gamificationService');
const { Op } = require('sequelize');

const XP_BY_CATEGORY = {
  energy: 15,
  waste: 12,
  transport: 20,
  water: 10,
  food: 8,
  carbon: 18,
  csr: 15,
  other: 10,
};

// GET /esg-actions
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, user_id, department_id, start_date, end_date } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (category) where.category = category;
  if (user_id) where.user_id = user_id;
  if (department_id) where.department_id = department_id;
  if (start_date || end_date) {
    where.performed_at = {};
    if (start_date) where.performed_at[Op.gte] = new Date(start_date);
    if (end_date) where.performed_at[Op.lte] = new Date(end_date);
  }

  // Employees can only see their own actions
  if (req.user.role === 'employee') where.user_id = req.user.id;

  const { count, rows } = await ESGAction.findAndCountAll({
    where,
    include: [{ association: 'user', as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
    order: [['performed_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ actions: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
}));

// POST /esg-actions
router.post('/', authenticate, [
  body('category').isIn(['energy', 'waste', 'transport', 'water', 'food', 'carbon', 'csr', 'other']),
  body('action_name').trim().isLength({ min: 3, max: 200 }),
  body('carbon_impact_kg').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('evidence_url').optional().isURL(),
  body('metadata').optional().isObject(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { category, action_name, description, carbon_impact_kg = 0, evidence_url, metadata = {} } = req.body;
  const xpEarned = XP_BY_CATEGORY[category] || 10;

  const action = await ESGAction.create({
    user_id: req.user.id,
    department_id: req.user.department_id,
    category,
    action_name,
    description,
    carbon_impact_kg: parseFloat(carbon_impact_kg),
    xp_earned: xpEarned,
    evidence_url,
    metadata,
    is_verified: false,
  });

  // Award XP
  await gamificationService.awardXP(
    req.user.id, xpEarned, 'action',
    `ESG Action: ${action_name}`, action.id, 'esg_action'
  );

  // Recalculate ESG score
  await gamificationService.recalculateUserESGScore(req.user.id);

  // Update streak
  await gamificationService.updateStreak(req.user.id);

  // Check badges
  await gamificationService.checkAndAwardBadges(req.user.id);

  res.status(201).json({ action, xp_earned: xpEarned, message: `+${xpEarned} XP earned!` });
}));

// GET /esg-actions/summary
router.get('/summary', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { sequelize } = require('../config/database');

  const summary = await ESGAction.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('carbon_impact_kg')), 'total_carbon'],
      [sequelize.fn('SUM', sequelize.col('xp_earned')), 'total_xp'],
    ],
    where: { user_id: userId },
    group: ['category'],
  });

  res.json({ summary });
}));

// PATCH /esg-actions/:id/verify (admin/manager)
router.patch('/:id/verify', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role === 'employee') return res.status(403).json({ error: 'Access denied.' });

  const action = await ESGAction.findByPk(req.params.id);
  if (!action) return res.status(404).json({ error: 'Action not found.' });

  await action.update({ is_verified: true, verified_by: req.user.id });

  // Bonus XP for verified action
  await gamificationService.awardXP(action.user_id, 5, 'action', 'Verification bonus: ' + action.action_name, action.id);

  res.json({ action, message: 'Action verified and bonus XP awarded.' });
}));

// DELETE /esg-actions/:id
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const action = await ESGAction.findByPk(req.params.id);
  if (!action) return res.status(404).json({ error: 'Action not found.' });
  if (action.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  await action.destroy();
  await gamificationService.recalculateUserESGScore(action.user_id);
  res.json({ message: 'Action deleted.' });
}));

module.exports = router;
