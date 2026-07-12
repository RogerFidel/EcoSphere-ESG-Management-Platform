const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { User, Department, Badge, Challenge, Reward, ESGAction, AIInsight, Notification } = require('../models');
const { sequelize } = require('../config/database');
const gamificationService = require('../services/gamificationService');
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');

// All admin routes require admin role
router.use(authenticate, requireAdmin);

// GET /admin/dashboard — System overview
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [userCount, activeUsers, departmentCount, badgeCount, challengeCount, rewardCount, actionCount] = await Promise.all([
    User.count(),
    User.count({ where: { last_login: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    Department.count(),
    Badge.count({ where: { is_active: true } }),
    Challenge.count({ where: { status: 'active' } }),
    Reward.count({ where: { is_active: true } }),
    ESGAction.count(),
  ]);

  const totalCarbonSaved = await ESGAction.sum('carbon_impact_kg') || 0;
  const avgESGScore = await User.findOne({
    attributes: [[sequelize.fn('AVG', sequelize.col('esg_score')), 'avg']],
  });

  // Top 5 users
  const topUsers = await User.findAll({
    attributes: { exclude: ['password_hash'] },
    order: [['xp_total', 'DESC']],
    limit: 5,
    include: [{ association: 'department', as: 'department', attributes: ['name'] }],
  });

  res.json({
    overview: {
      total_users: userCount,
      active_users_7d: activeUsers,
      total_departments: departmentCount,
      active_badges: badgeCount,
      active_challenges: challengeCount,
      active_rewards: rewardCount,
      total_actions: actionCount,
      total_carbon_saved_kg: Math.round(totalCarbonSaved * 100) / 100,
      avg_esg_score: Math.round(parseFloat(avgESGScore?.get('avg') || 0) * 10) / 10,
    },
    top_users: topUsers.map((u) => u.toJSON()),
  });
}));

// GET /admin/analytics/esg-trends
router.get('/analytics/esg-trends', asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const actionsByDay = await ESGAction.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('performed_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('carbon_impact_kg')), 'carbon_saved'],
      [sequelize.fn('SUM', sequelize.col('xp_earned')), 'xp_awarded'],
    ],
    where: { performed_at: { [Op.gte]: since } },
    group: [sequelize.fn('DATE', sequelize.col('performed_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('performed_at')), 'ASC']],
  });

  const actionsByCategory = await ESGAction.findAll({
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('carbon_impact_kg')), 'carbon_saved'],
    ],
    where: { performed_at: { [Op.gte]: since } },
    group: ['category'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
  });

  res.json({ actionsByDay, actionsByCategory, period });
}));

// POST /admin/broadcast — Send broadcast notification
router.post('/broadcast', asyncHandler(async (req, res) => {
  const { title, message, type = 'general', department_id, icon = '📢', color = '#4CAF50' } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message required.' });

  if (department_id) {
    await notificationService.broadcastToDepartment(department_id, { type, title, message, icon, color });
    res.json({ message: `Broadcast sent to department.` });
  } else {
    await notificationService.broadcastToAll({ type, title, message, icon, color });
    res.json({ message: 'Broadcast sent to all users.' });
  }
}));

// PATCH /admin/users/:id — Admin user management
router.patch('/users/:id', asyncHandler(async (req, res) => {
  const { role, is_active, department_id } = req.body;
  const updates = {};
  if (role) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;
  if (department_id !== undefined) updates.department_id = department_id;

  await User.update(updates, { where: { id: req.params.id } });
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
  res.json(user.toJSON());
}));

// GET /admin/ai-insights — All AI insights
router.get('/ai-insights', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, risk_level, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = {};
  if (risk_level) where.risk_level = risk_level;
  if (type) where.type = type;

  const { count, rows } = await AIInsight.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ insights: rows, total: count });
}));

// POST /admin/milestones — Create milestone
router.post('/milestones', asyncHandler(async (req, res) => {
  const { Milestone } = require('../models');
  const milestone = await Milestone.create(req.body);
  res.status(201).json(milestone);
}));

module.exports = router;
