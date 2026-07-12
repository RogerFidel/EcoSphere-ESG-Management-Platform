const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const LEVELS = [
  { name: 'Bronze', minXP: 0, maxXP: 499, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', minXP: 500, maxXP: 1499, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', minXP: 1500, maxXP: 3999, color: '#FFD700', icon: '🥇' },
  { name: 'Platinum', minXP: 4000, maxXP: 9999, color: '#E5E4E2', icon: '💎' },
  { name: 'Diamond', minXP: 10000, maxXP: Infinity, color: '#B9F2FF', icon: '💠' },
];

const getLevelFromXP = (xp) => {
  for (const level of LEVELS) {
    if (xp >= level.minXP && xp <= level.maxXP) return level;
  }
  return LEVELS[0];
};

const getXPToNextLevel = (xp) => {
  const currentLevel = getLevelFromXP(xp);
  if (currentLevel.maxXP === Infinity) return 0;
  return currentLevel.maxXP + 1 - xp;
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  role: {
    type: DataTypes.ENUM('employee', 'manager', 'admin'),
    defaultValue: 'employee',
  },
  department_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  xp_total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 },
  },
  level_name: {
    type: DataTypes.STRING,
    defaultValue: 'Bronze',
  },
  esg_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    validate: { min: 0, max: 100 },
  },
  carbon_saved_kg: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  actions_completed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  email_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['department_id'] },
    { fields: ['xp_total'] },
    { fields: ['esg_score'] },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
  },
});

// Instance methods
User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  const level = getLevelFromXP(values.xp_total);
  values.level = level;
  values.xp_to_next_level = getXPToNextLevel(values.xp_total);
  values.level_progress_percent = level.maxXP === Infinity
    ? 100
    : Math.round(((values.xp_total - level.minXP) / (level.maxXP - level.minXP + 1)) * 100);
  return values;
};

// Static methods
User.LEVELS = LEVELS;
User.getLevelFromXP = getLevelFromXP;
User.getXPToNextLevel = getXPToNextLevel;

module.exports = User;
