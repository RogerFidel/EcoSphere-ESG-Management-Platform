const express = require('express');
const router = express.Router();
const { Achievement } = require('../models');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /achievements/me
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { user_id: req.user.id };
  if (type) where.type = type;

  const { count, rows } = await Achievement.findAndCountAll({
    where,
    order: [['achieved_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ achievements: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
}));

// GET /achievements/me/recent
router.get('/me/recent', authenticate, asyncHandler(async (req, res) => {
  const achievements = await Achievement.findAll({
    where: { user_id: req.user.id },
    order: [['achieved_at', 'DESC']],
    limit: 5,
  });
  res.json({ achievements });
}));

module.exports = router;
