const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const gamificationService = require('../services/gamificationService');

// GET /leaderboards/global
router.get('/global', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await gamificationService.getGlobalLeaderboard(parseInt(limit), parseInt(page));
  res.json(result);
}));

// GET /leaderboards/department
router.get('/department', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const leaderboard = await gamificationService.getDepartmentLeaderboard(parseInt(limit));
  res.json({ leaderboard });
}));

// GET /leaderboards/monthly
router.get('/monthly', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const leaderboard = await gamificationService.getMonthlyLeaderboard(parseInt(limit));
  res.json({ leaderboard });
}));

// GET /leaderboards/my-rank
router.get('/my-rank', authenticate, asyncHandler(async (req, res) => {
  const { User } = require('../models');
  const { sequelize } = require('../config/database');

  const user = await User.findByPk(req.user.id);
  const rank = await User.count({
    where: { xp_total: { [require('sequelize').Op.gt]: user.xp_total }, is_active: true },
  }) + 1;

  const totalUsers = await User.count({ where: { is_active: true } });
  const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

  res.json({
    rank,
    total_users: totalUsers,
    percentile,
    xp_total: user.xp_total,
    level: User.getLevelFromXP(user.xp_total),
  });
}));

module.exports = router;
