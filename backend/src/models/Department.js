const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
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
    defaultValue: null,
  },
  head_id: {
    type: DataTypes.UUID,
    defaultValue: null,
    comment: 'Department head user ID',
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#4CAF50',
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '🏢',
  },
  esg_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  total_carbon_saved_kg: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  total_xp: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  member_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'departments',
  indexes: [
    { fields: ['esg_score'] },
    { fields: ['total_xp'] },
  ],
});

module.exports = Department;
