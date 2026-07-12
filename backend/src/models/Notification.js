const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'badge_unlock', 'reward_approved', 'reward_delivered', 'challenge_invite',
      'challenge_reminder', 'challenge_completed', 'xp_milestone', 'level_up',
      'streak_milestone', 'compliance_alert', 'policy_reminder', 'csr_reminder',
      'ai_insight', 'department_rank_change', 'general'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '🔔',
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#4CAF50',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_email_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  action_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'notifications',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['is_read'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Notification;
