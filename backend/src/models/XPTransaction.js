const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const XPTransaction = sequelize.define('XPTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positive = earned, Negative = spent',
  },
  type: {
    type: DataTypes.ENUM(
      'action', 'badge', 'challenge', 'streak_bonus', 'milestone',
      'reward_redemption', 'manual', 'daily_login', 'referral'
    ),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference_id: {
    type: DataTypes.UUID,
    defaultValue: null,
    comment: 'ID of the related entity (badge, challenge, etc.)',
  },
  reference_type: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  balance_after: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'xp_transactions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['created_at'] },
  ],
});

module.exports = XPTransaction;
