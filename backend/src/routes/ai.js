const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');
const { AIInsight } = require('../models');
const { body, validationResult } = require('express-validator');

// GET /ai/insights/me — personal AI insights history
router.get('/insights/me', authenticate, asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { user_id: req.user.id };
  if (type) where.type = type;

  const { count, rows } = await AIInsight.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({ insights: rows, total: count });
}));

// GET /ai/carbon-reduction — Carbon reduction suggestions
router.get('/carbon-reduction', authenticate, asyncHandler(async (req, res) => {
  const result = await aiService.getCarbonReductionSuggestions(req.user.id);
  res.json(result);
}));

// GET /ai/esg-insights — Smart ESG insights
router.get('/esg-insights', authenticate, asyncHandler(async (req, res) => {
  const result = await aiService.getSmartESGInsights(req.user.id);
  res.json(result);
}));

// GET /ai/personal-score — Personal ESG score analysis
router.get('/personal-score', authenticate, asyncHandler(async (req, res) => {
  const result = await aiService.getPersonalESGScore(req.user.id);
  res.json(result);
}));

// GET /ai/recommendations — Personalized recommendations
router.get('/recommendations', authenticate, asyncHandler(async (req, res) => {
  const result = await aiService.getPersonalizedRecommendations(req.user.id);
  res.json(result);
}));

// GET /ai/goal-prediction/:challengeId — Goal completion prediction
router.get('/goal-prediction/:challengeId', authenticate, asyncHandler(async (req, res) => {
  const result = await aiService.getGoalCompletionPrediction(req.user.id, req.params.challengeId);
  res.json(result);
}));

// GET /ai/department-prediction/:departmentId — Department performance prediction
router.get('/department-prediction/:departmentId', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role === 'employee' && req.user.department_id !== req.params.departmentId) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const result = await aiService.getDepartmentPrediction(req.params.departmentId);
  res.json(result);
}));

// GET /ai/department-comparison — Department ESG comparison
router.get('/department-comparison', authenticate, asyncHandler(async (req, res) => {
  const result = await aiService.getDepartmentComparison();
  res.json(result);
}));

// GET /ai/risk-alerts/:departmentId — Risk alerts
router.get('/risk-alerts/:departmentId', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role === 'employee') return res.status(403).json({ error: 'Access denied.' });
  const result = await aiService.generateRiskAlerts(req.params.departmentId);
  res.json(result);
}));

// PATCH /ai/insights/:id/feedback — User feedback on insight
router.patch('/insights/:id/feedback', authenticate, [
  body('feedback').isIn(['helpful', 'not_helpful']),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const insight = await AIInsight.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });
  if (!insight) return res.status(404).json({ error: 'Insight not found.' });

  await insight.update({ feedback: req.body.feedback, is_read: true });
  res.json({ message: 'Feedback recorded.', insight });
}));

// PATCH /ai/insights/:id/read
router.patch('/insights/:id/read', authenticate, asyncHandler(async (req, res) => {
  await AIInsight.update(
    { is_read: true },
    { where: { id: req.params.id, user_id: req.user.id } }
  );
  res.json({ message: 'Marked as read.' });
}));

module.exports = router;
