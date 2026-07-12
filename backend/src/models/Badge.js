const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '🏆',
  },
  category: {
    type: DataTypes.ENUM('sustainability', 'engagement', 'challenge', 'streak', 'milestone', 'esg', 'special'),
    defaultValue: 'sustainability',
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    defaultValue: 'common',
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 25,
  },
  // Auto-award trigger criteria (JSON)
  criteria: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'e.g. { type: "xp_threshold", value: 1000 } or { type: "actions_count", value: 10 }',
  },
  image_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  times_awarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'badges',
  indexes: [
    { fields: ['category'] },
    { fields: ['rarity'] },
  ],
});

module.exports = Badge;
