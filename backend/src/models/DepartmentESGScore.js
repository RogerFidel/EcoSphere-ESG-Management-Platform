const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DepartmentESGScore = sequelize.define('DepartmentESGScore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. 2024-Q1, 2024-07',
  },
  period_type: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly',
  },
  esg_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  environmental_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  social_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  governance_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  carbon_saved_kg: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total_actions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  active_members: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'department_esg_scores',
  indexes: [
    { fields: ['department_id'] },
    { fields: ['period'] },
    { fields: ['esg_score'] },
    { unique: true, fields: ['department_id', 'period', 'period_type'] },
  ],
});

module.exports = DepartmentESGScore;
