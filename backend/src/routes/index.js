const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const badgeRoutes = require('./badges');
const rewardRoutes = require('./rewards');
const challengeRoutes = require('./challenges');
const leaderboardRoutes = require('./leaderboards');
const notificationRoutes = require('./notifications');
const esgActionRoutes = require('./esgActions');
const aiRoutes = require('./ai');
const departmentRoutes = require('./departments');
const achievementRoutes = require('./achievements');
const adminRoutes = require('./admin');
const sseRoutes = require('./sse');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/badges', badgeRoutes);
router.use('/rewards', rewardRoutes);
router.use('/challenges', challengeRoutes);
router.use('/leaderboards', leaderboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/esg-actions', esgActionRoutes);
router.use('/ai', aiRoutes);
router.use('/departments', departmentRoutes);
router.use('/achievements', achievementRoutes);
router.use('/admin', adminRoutes);
router.use('/sse', sseRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'GreenQuest API',
    version: '1.0.0',
    description: 'ESG Gamification Platform',
    endpoints: [
      '/auth', '/users', '/badges', '/rewards', '/challenges',
      '/leaderboards', '/notifications', '/esg-actions', '/ai',
      '/departments', '/achievements', '/admin', '/sse',
    ],
  });
});

module.exports = router;
