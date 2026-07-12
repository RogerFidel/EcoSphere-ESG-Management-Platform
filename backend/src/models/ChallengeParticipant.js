const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChallengeParticipant = sequelize.define('ChallengeParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  challenge_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('joined', 'in_progress', 'completed', 'failed'),
    defaultValue: 'joined',
  },
  progress: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Progress towards target (0-100%)',
  },
  contribution_value: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  xp_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completed_at: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'challenge_participants',
  indexes: [
    { fields: ['challenge_id'] },
    { fields: ['user_id'] },
    { unique: true, fields: ['challenge_id', 'user_id'] },
    { fields: ['status'] },
  ],
});

module.exports = ChallengeParticipant;
