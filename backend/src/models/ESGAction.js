const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ESGAction = sequelize.define('ESGAction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  category: {
    type: DataTypes.ENUM('energy', 'waste', 'transport', 'water', 'food', 'carbon', 'csr', 'other'),
    allowNull: false,
  },
  action_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  carbon_impact_kg: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Positive = reduction, Negative = emission',
  },
  xp_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_by: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  evidence_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Category-specific data (e.g., kWh saved, km of public transport)',
  },
  performed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'esg_actions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['department_id'] },
    { fields: ['category'] },
    { fields: ['performed_at'] },
    { fields: ['carbon_impact_kg'] },
  ],
});

module.exports = ESGAction;
