const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'greenquest',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'greenquest123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      statement_timeout: 10000,
      idle_in_transaction_session_timeout: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
    },
  }
);

module.exports = { sequelize, Sequelize };
