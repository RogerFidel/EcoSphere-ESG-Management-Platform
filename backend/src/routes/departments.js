const express = require('express');
const router = express.Router();
const { Department, User, DepartmentESGScore } = require('../models');
const { body, validationResult } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const gamificationService = require('../services/gamificationService');

// GET /departments
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const departments = await Department.findAll({
    include: [{ association: 'members', as: 'members', attributes: ['id', 'name', 'avatar_url', 'xp_total', 'esg_score'], limit: 5, order: [['xp_total', 'DESC']] }],
    order: [['esg_score', 'DESC']],
  });
  res.json(departments);
}));

// GET /departments/:id
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const dept = await Department.findByPk(req.params.id, {
    include: [
      { association: 'members', as: 'members', attributes: ['id', 'name', 'avatar_url', 'xp_total', 'esg_score', 'level_name', 'carbon_saved_kg'] },
      { association: 'esgScores', as: 'esgScores', order: [['created_at', 'DESC']], limit: 12 },
    ],
  });
  if (!dept) return res.status(404).json({ error: 'Department not found.' });
  res.json(dept);
}));

// POST /departments (admin)
router.post('/', authenticate, requireAdmin, [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  body('icon').optional().isString(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const dept = await Department.create(req.body);
  res.status(201).json(dept);
}));

// GET /departments/:id/competition
router.get('/:id/competition', authenticate, asyncHandler(async (req, res) => {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) return res.status(404).json({ error: 'Department not found.' });

  const allDepts = await Department.findAll({ order: [['esg_score', 'DESC']] });
  const rank = allDepts.findIndex((d) => d.id === dept.id) + 1;

  // Historical ESG scores
  const history = await DepartmentESGScore.findAll({
    where: { department_id: req.params.id },
    order: [['created_at', 'DESC']],
    limit: 12,
  });

  res.json({
    department: dept,
    rank,
    total_departments: allDepts.length,
    history,
    top_departments: allDepts.slice(0, 5),
  });
}));

// POST /departments (admin) — Recalculate ESG
router.post('/:id/recalculate-esg', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  await gamificationService.updateDepartmentESGScore(req.params.id);
  const dept = await Department.findByPk(req.params.id);
  res.json({ message: 'ESG score recalculated.', department: dept });
}));

module.exports = router;
