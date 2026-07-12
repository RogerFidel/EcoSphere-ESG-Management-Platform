const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIInsight = sequelize.define('AIInsight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    defaultValue: null,
    comment: 'Null = department/company level insight',
  },
  department_id: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  type: {
    type: DataTypes.ENUM(
      'carbon_reduction', 'esg_insight', 'performance_prediction',
      'goal_prediction', 'risk_alert', 'personal_score', 'recommendation',
      'department_comparison', 'general'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recommendations: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  risk_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low',
  },
  confidence_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.8,
    validate: { min: 0, max: 1 },
  },
  data_snapshot: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Input data used to generate the insight',
  },
  model_used: {
    type: DataTypes.STRING,
    defaultValue: 'gpt-4o',
  },
  expires_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  feedback: {
    type: DataTypes.ENUM('helpful', 'not_helpful', null),
    defaultValue: null,
  },
}, {
  tableName: 'ai_insights',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['department_id'] },
    { fields: ['type'] },
    { fields: ['risk_level'] },
    { fields: ['created_at'] },
  ],
});

module.exports = AIInsight;
