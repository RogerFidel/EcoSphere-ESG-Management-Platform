const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Achievement = sequelize.define('Achievement', {
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
    type: DataTypes.ENUM('badge', 'level_up', 'challenge_completed', 'milestone', 'streak', 'reward_redeemed'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '⭐',
  },
  xp_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reference_id: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  achieved_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'achievements',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['achieved_at'] },
  ],
});

module.exports = Achievement;
