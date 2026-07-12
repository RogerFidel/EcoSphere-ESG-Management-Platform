const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserMilestone = sequelize.define('UserMilestone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  milestone_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  achieved_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_milestones',
  indexes: [
    { fields: ['user_id'] },
    { unique: true, fields: ['user_id', 'milestone_id'] },
  ],
});

module.exports = UserMilestone;
