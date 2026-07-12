const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Department, Streak } = require('../models');
const gamificationService = require('../services/gamificationService');
const notificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET || 'default-secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// POST /auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('department_id').optional().isUUID(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name, department_id, role } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered.' });

  if (department_id) {
    const dept = await Department.findByPk(department_id);
    if (!dept) return res.status(400).json({ error: 'Department not found.' });
  }

  const user = await User.create({
    email,
    password_hash: password,
    name,
    department_id: department_id || null,
    role: role === 'admin' ? 'employee' : (role || 'employee'), // Prevent admin self-signup
  });

  // Initialize streak
  await Streak.create({ user_id: user.id });

  // Welcome XP
  await gamificationService.awardXP(user.id, 50, 'manual', 'Welcome to GreenQuest! 🌿');

  // Welcome notification
  await notificationService.create(user.id, {
    type: 'general',
    title: '🌿 Welcome to GreenQuest!',
    message: `Welcome ${name}! You've earned 50 XP just for joining. Start logging sustainability actions to climb the leaderboard!`,
    icon: '🌿',
    color: '#4ade80',
    action_url: '/dashboard',
  });

  // Check badges
  await gamificationService.checkAndAwardBadges(user.id);

  const token = generateToken(user);
  const freshUser = await User.findByPk(user.id);

  logger.info(`New user registered: ${email}`);
  res.status(201).json({ token, user: freshUser.toJSON() });
}));

// POST /auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid credentials.' });

  const valid = await user.validatePassword(password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

  // Update last login & award daily login XP
  const lastLogin = user.last_login;
  await user.update({ last_login: new Date() });

  const today = new Date().toDateString();
  if (!lastLogin || new Date(lastLogin).toDateString() !== today) {
    await gamificationService.awardXP(user.id, 5, 'daily_login', 'Daily login bonus');
    await gamificationService.updateStreak(user.id);
    await gamificationService.checkAndAwardBadges(user.id);
  }

  const token = generateToken(user);
  const freshUser = await User.findByPk(user.id, {
    include: [{ association: 'department', as: 'department' }],
  });

  res.json({ token, user: freshUser.toJSON() });
}));

// GET /auth/me
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { association: 'department', as: 'department' },
      { association: 'streak', as: 'streak' },
    ],
    attributes: { exclude: ['password_hash'] },
  });
  res.json(user.toJSON());
}));

// POST /auth/logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// POST /auth/change-password
router.post('/change-password', authenticate, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { current_password, new_password } = req.body;
  const user = await User.findByPk(req.user.id);

  const valid = await user.validatePassword(current_password);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

  await user.update({ password_hash: new_password });
  res.json({ message: 'Password changed successfully.' });
}));

module.exports = router;
