const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  badge_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  awarded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  awarded_reason: {
    type: DataTypes.STRING,
    defaultValue: 'auto',
  },
}, {
  tableName: 'user_badges',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['badge_id'] },
    { unique: true, fields: ['user_id', 'badge_id'] },
  ],
});

module.exports = UserBadge;
