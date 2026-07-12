const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reward = sequelize.define('Reward', {
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
  category: {
    type: DataTypes.ENUM('gift_card', 'extra_leave', 'merchandise', 'donation', 'experience', 'discount'),
    defaultValue: 'gift_card',
  },
  xp_cost: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  quantity_available: {
    type: DataTypes.INTEGER,
    defaultValue: -1, // -1 = unlimited
  },
  quantity_redeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  image_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '🎁',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'rewards',
  indexes: [
    { fields: ['category'] },
    { fields: ['xp_cost'] },
    { fields: ['is_active'] },
  ],
});

module.exports = Reward;
