const { sequelize } = require('../config/database');
const User = require('./User');
const Department = require('./Department');
const Badge = require('./Badge');
const UserBadge = require('./UserBadge');
const Reward = require('./Reward');
const RewardRedemption = require('./RewardRedemption');
const Challenge = require('./Challenge');
const ChallengeParticipant = require('./ChallengeParticipant');
const XPTransaction = require('./XPTransaction');
const Notification = require('./Notification');
const Achievement = require('./Achievement');
const Streak = require('./Streak');
const Milestone = require('./Milestone');
const UserMilestone = require('./UserMilestone');
const ESGAction = require('./ESGAction');
const DepartmentESGScore = require('./DepartmentESGScore');
const AIInsight = require('./AIInsight');

// ─── Associations ────────────────────────────────────────────────────────────

// Department → Users
Department.hasMany(User, { foreignKey: 'department_id', as: 'members' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// User → XP Transactions
User.hasMany(XPTransaction, { foreignKey: 'user_id', as: 'xpTransactions' });
XPTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Badges (many-to-many)
User.belongsToMany(Badge, { through: UserBadge, foreignKey: 'user_id', as: 'badges' });
Badge.belongsToMany(User, { through: UserBadge, foreignKey: 'badge_id', as: 'users' });
User.hasMany(UserBadge, { foreignKey: 'user_id', as: 'userBadges' });
UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });

// User → Reward Redemptions
User.hasMany(RewardRedemption, { foreignKey: 'user_id', as: 'redemptions' });
RewardRedemption.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Reward.hasMany(RewardRedemption, { foreignKey: 'reward_id', as: 'redemptions' });
RewardRedemption.belongsTo(Reward, { foreignKey: 'reward_id', as: 'reward' });

// Challenges ↔ Users (many-to-many)
Challenge.belongsToMany(User, { through: ChallengeParticipant, foreignKey: 'challenge_id', as: 'participants' });
User.belongsToMany(Challenge, { through: ChallengeParticipant, foreignKey: 'user_id', as: 'challenges' });
Challenge.hasMany(ChallengeParticipant, { foreignKey: 'challenge_id', as: 'challengeParticipants' });
ChallengeParticipant.belongsTo(Challenge, { foreignKey: 'challenge_id', as: 'challenge' });
ChallengeParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Challenge.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Challenge.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User → Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → Achievements
User.hasMany(Achievement, { foreignKey: 'user_id', as: 'achievements' });
Achievement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → Streak
User.hasOne(Streak, { foreignKey: 'user_id', as: 'streak' });
Streak.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Milestones
User.belongsToMany(Milestone, { through: UserMilestone, foreignKey: 'user_id', as: 'milestones' });
Milestone.belongsToMany(User, { through: UserMilestone, foreignKey: 'milestone_id', as: 'users' });
User.hasMany(UserMilestone, { foreignKey: 'user_id', as: 'userMilestones' });

// User → ESG Actions
User.hasMany(ESGAction, { foreignKey: 'user_id', as: 'esgActions' });
ESGAction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ESGAction.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Department → ESG Scores
Department.hasMany(DepartmentESGScore, { foreignKey: 'department_id', as: 'esgScores' });
DepartmentESGScore.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// User → AI Insights
User.hasMany(AIInsight, { foreignKey: 'user_id', as: 'aiInsights' });
AIInsight.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Department,
  Badge,
  UserBadge,
  Reward,
  RewardRedemption,
  Challenge,
  ChallengeParticipant,
  XPTransaction,
  Notification,
  Achievement,
  Streak,
  Milestone,
  UserMilestone,
  ESGAction,
  DepartmentESGScore,
  AIInsight,
};
