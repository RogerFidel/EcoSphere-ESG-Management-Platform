const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Streak = sequelize.define('Streak', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  current_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  longest_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_activity_date: {
    type: DataTypes.DATEONLY,
    defaultValue: null,
  },
  streak_type: {
    type: DataTypes.ENUM('daily_login', 'daily_action'),
    defaultValue: 'daily_action',
  },
  total_active_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  freeze_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of streak freezes used (grace period)',
  },
}, {
  tableName: 'streaks',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['current_streak'] },
  ],
});

module.exports = Streak;
