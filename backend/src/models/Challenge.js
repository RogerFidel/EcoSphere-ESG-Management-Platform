const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('individual', 'team', 'department', 'company'),
    defaultValue: 'individual',
  },
  category: {
    type: DataTypes.ENUM('sustainability', 'energy', 'waste', 'transport', 'water', 'csr', 'other'),
    defaultValue: 'sustainability',
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed', 'cancelled'),
    defaultValue: 'draft',
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  badge_id: {
    type: DataTypes.UUID,
    defaultValue: null,
    comment: 'Optional badge awarded on completion',
  },
  department_id: {
    type: DataTypes.UUID,
    defaultValue: null,
    comment: 'Null = all departments',
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  target_value: {
    type: DataTypes.FLOAT,
    defaultValue: null,
    comment: 'e.g. 100 kg of carbon saved',
  },
  target_unit: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  current_value: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  max_participants: {
    type: DataTypes.INTEGER,
    defaultValue: -1, // -1 = unlimited
  },
  starts_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ends_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completed_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  rules: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  image_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  participants_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'challenges',
  indexes: [
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['department_id'] },
    { fields: ['starts_at', 'ends_at'] },
  ],
});

module.exports = Challenge;
