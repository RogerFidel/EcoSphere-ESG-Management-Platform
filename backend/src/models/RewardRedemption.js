const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RewardRedemption = sequelize.define('RewardRedemption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reward_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  xp_spent: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'delivered', 'rejected', 'expired'),
    defaultValue: 'pending',
  },
  redemption_code: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  approved_by: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  approved_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  delivered_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
}, {
  tableName: 'reward_redemptions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['reward_id'] },
    { fields: ['status'] },
  ],
});

module.exports = RewardRedemption;
