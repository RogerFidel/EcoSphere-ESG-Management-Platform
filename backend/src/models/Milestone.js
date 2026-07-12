const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Milestone = sequelize.define('Milestone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('xp_threshold', 'actions_count', 'carbon_saved', 'streak_days', 'badges_count', 'challenges_completed'),
    allowNull: false,
  },
  threshold: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Value at which milestone triggers',
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  badge_id: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '🎯',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'milestones',
  indexes: [
    { fields: ['type'] },
    { fields: ['threshold'] },
  ],
});

module.exports = Milestone;
