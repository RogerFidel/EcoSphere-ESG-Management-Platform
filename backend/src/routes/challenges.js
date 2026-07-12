const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Challenge, ChallengeParticipant, User, Badge } = require('../models');
const { authenticate, requireManager } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');
const { Op } = require('sequelize');

// GET /challenges
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { status, type, category, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (status) where.status = status;
  if (type) where.type = type;
  if (category) where.category = category;

  // Filter by department for department challenges
  if (req.user.role === 'employee') {
    where[Op.or] = [
      { department_id: null },
      { department_id: req.user.department_id },
    ];
  }

  const { count, rows } = await Challenge.findAndCountAll({
    where,
    include: [
      { association: 'department', as: 'department', attributes: ['name', 'color'] },
      { association: 'creator', as: 'creator', attributes: ['name', 'avatar_url'] },
      {
        association: 'challengeParticipants',
        as: 'challengeParticipants',
        where: { user_id: req.user.id },
        required: false,
        attributes: ['status', 'progress', 'xp_earned'],
      },
    ],
    order: [['starts_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ challenges: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
}));

// GET /challenges/:id
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const challenge = await Challenge.findByPk(req.params.id, {
    include: [
      { association: 'department', as: 'department', attributes: ['name', 'color', 'icon'] },
      { association: 'creator', as: 'creator', attributes: ['id', 'name', 'avatar_url'] },
      {
        association: 'challengeParticipants',
        as: 'challengeParticipants',
        include: [{ association: 'user', as: 'user', attributes: ['id', 'name', 'avatar_url', 'level_name'] }],
        order: [['contribution_value', 'DESC']],
        limit: 50,
      },
    ],
  });

  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  res.json(challenge);
}));

// POST /challenges (manager/admin)
router.post('/', authenticate, requireManager, [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('type').isIn(['individual', 'team', 'department', 'company']),
  body('category').isIn(['sustainability', 'energy', 'waste', 'transport', 'water', 'csr', 'other']),
  body('xp_reward').isInt({ min: 1, max: 10000 }),
  body('starts_at').isISO8601(),
  body('ends_at').isISO8601(),
  body('target_value').optional().isFloat({ min: 0 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const challenge = await Challenge.create({
    ...req.body,
    created_by: req.user.id,
    status: 'active',
  });

  // Notify department or all employees
  if (challenge.department_id) {
    await notificationService.broadcastToDepartment(challenge.department_id, {
      type: 'challenge_invite',
      title: `⚔️ New Challenge: ${challenge.title}`,
      message: `A new challenge has been created for your department! Join "${challenge.title}" to earn ${challenge.xp_reward} XP!`,
      icon: '⚔️',
      color: '#FF9800',
      action_url: `/challenges/${challenge.id}`,
    });
  } else {
    await notificationService.broadcastToAll({
      type: 'challenge_invite',
      title: `⚔️ Company Challenge: ${challenge.title}`,
      message: `A new company-wide challenge is live! Join "${challenge.title}" and earn ${challenge.xp_reward} XP!`,
      icon: '⚔️',
      color: '#FF9800',
      action_url: `/challenges/${challenge.id}`,
    });
  }

  res.status(201).json(challenge);
}));

// POST /challenges/:id/join
router.post('/:id/join', authenticate, asyncHandler(async (req, res) => {
  const challenge = await Challenge.findByPk(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  if (challenge.status !== 'active') return res.status(400).json({ error: 'Challenge is not active.' });

  const existing = await ChallengeParticipant.findOne({
    where: { challenge_id: challenge.id, user_id: req.user.id },
  });
  if (existing) return res.status(409).json({ error: 'Already joined this challenge.' });

  if (challenge.max_participants > 0) {
    const count = await ChallengeParticipant.count({ where: { challenge_id: challenge.id } });
    if (count >= challenge.max_participants) {
      return res.status(400).json({ error: 'Challenge is full.' });
    }
  }

  const participant = await ChallengeParticipant.create({
    challenge_id: challenge.id,
    user_id: req.user.id,
    status: 'in_progress',
  });

  await Challenge.increment('participants_count', { where: { id: challenge.id } });

  res.status(201).json({ participant, message: 'Successfully joined challenge!' });
}));

// POST /challenges/:id/leave
router.post('/:id/leave', authenticate, asyncHandler(async (req, res) => {
  const participant = await ChallengeParticipant.findOne({
    where: { challenge_id: req.params.id, user_id: req.user.id },
  });
  if (!participant) return res.status(404).json({ error: 'Not a participant.' });

  await participant.destroy();
  await Challenge.decrement('participants_count', { where: { id: req.params.id } });

  res.json({ message: 'Left challenge.' });
}));

// PATCH /challenges/:id/progress
router.patch('/:id/progress', authenticate, [
  body('progress').isFloat({ min: 0, max: 100 }),
  body('contribution_value').optional().isFloat({ min: 0 }),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { progress, contribution_value } = req.body;
  const participant = await ChallengeParticipant.findOne({
    where: { challenge_id: req.params.id, user_id: req.user.id },
  });
  if (!participant) return res.status(404).json({ error: 'Not a participant in this challenge.' });

  const updates = { progress };
  if (contribution_value !== undefined) updates.contribution_value = contribution_value;
  if (progress >= 100) {
    updates.status = 'completed';
    updates.completed_at = new Date();
  }

  await participant.update(updates);

  // Update challenge overall progress
  if (contribution_value !== undefined) {
    await Challenge.increment('current_value', { by: contribution_value, where: { id: req.params.id } });
  }

  res.json({ participant, message: 'Progress updated.' });
}));

// PATCH /challenges/:id (manager/admin)
router.patch('/:id', authenticate, requireManager, asyncHandler(async (req, res) => {
  const challenge = await Challenge.findByPk(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

  const allowed = ['title', 'description', 'status', 'ends_at', 'xp_reward', 'image_url'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  await challenge.update(updates);
  res.json(challenge);
}));

// DELETE /challenges/:id (admin)
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied.' });
  const challenge = await Challenge.findByPk(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

  await challenge.update({ status: 'cancelled' });
  res.json({ message: 'Challenge cancelled.' });
}));

module.exports = router;
