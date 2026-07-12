const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');

// GET /notifications
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, is_read, type } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = { user_id: req.user.id };
  if (is_read !== undefined) where.is_read = is_read === 'true';
  if (type) where.type = type;

  const { count, rows } = await Notification.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  const unread_count = await Notification.count({
    where: { user_id: req.user.id, is_read: false },
  });

  res.json({ notifications: rows, total: count, unread_count, page: parseInt(page), limit: parseInt(limit) });
}));

// PATCH /notifications/:id/read
router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });
  if (!notification) return res.status(404).json({ error: 'Notification not found.' });

  await notification.update({ is_read: true });
  res.json({ message: 'Marked as read.' });
}));

// PATCH /notifications/read-all
router.patch('/read-all', authenticate, asyncHandler(async (req, res) => {
  const updated = await Notification.update(
    { is_read: true },
    { where: { user_id: req.user.id, is_read: false } }
  );
  res.json({ message: 'All notifications marked as read.', count: updated[0] });
}));

// DELETE /notifications/:id
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await Notification.destroy({ where: { id: req.params.id, user_id: req.user.id } });
  res.json({ message: 'Notification deleted.' });
}));

// DELETE /notifications/clear-all
router.delete('/clear-all', authenticate, asyncHandler(async (req, res) => {
  const count = await Notification.destroy({ where: { user_id: req.user.id, is_read: true } });
  res.json({ message: `Cleared ${count} read notifications.` });
}));

// POST /notifications/send-compliance-alert (admin)
router.post('/send-compliance-alert', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  const { user_id, department_id, policy, deadline, severity } = req.body;

  if (department_id) {
    await notificationService.broadcastToDepartment(department_id, {
      type: 'compliance_alert',
      title: `⚠️ Compliance Alert: ${policy}`,
      message: `Action required: ${policy}. Deadline: ${deadline}.`,
      icon: '⚠️',
      color: severity === 'critical' ? '#F44336' : '#FF9800',
    });
  } else if (user_id) {
    await notificationService.sendComplianceAlert(user_id, { policy, deadline, severity });
  } else {
    await notificationService.broadcastToAll({
      type: 'compliance_alert',
      title: `⚠️ Company Compliance Alert: ${policy}`,
      message: `Action required: ${policy}. Deadline: ${deadline}.`,
      icon: '⚠️',
      color: '#F44336',
    });
  }

  res.json({ message: 'Compliance alert sent.' });
}));

// POST /notifications/send-policy-reminder (admin/manager)
router.post('/send-policy-reminder', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role === 'employee') return res.status(403).json({ error: 'Access denied.' });
  const { policy, description, department_id } = req.body;

  if (department_id) {
    await notificationService.broadcastToDepartment(department_id, {
      type: 'policy_reminder',
      title: `📋 Policy Reminder: ${policy}`,
      message: description,
      icon: '📋',
      color: '#607D8B',
    });
  } else {
    await notificationService.broadcastToAll({
      type: 'policy_reminder',
      title: `📋 Policy Reminder: ${policy}`,
      message: description,
      icon: '📋',
      color: '#607D8B',
    });
  }

  res.json({ message: 'Policy reminder sent.' });
}));

module.exports = router;
