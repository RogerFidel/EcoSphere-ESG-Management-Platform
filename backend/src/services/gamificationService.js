/**
 * GamificationService — Core XP, Badge, Level, Streak, Milestone engine
 */
const {
  User, Badge, UserBadge, XPTransaction, Achievement,
  Streak, Milestone, UserMilestone, Department,
} = require('../models');
const { cache } = require('../config/redis');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class GamificationService {
  // ─── XP System ──────────────────────────────────────────────────────────────

  async awardXP(userId, amount, type, description, referenceId = null, referenceType = null, transaction = null) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error(`User ${userId} not found`);

      const previousXP = user.xp_total;
      const previousLevel = User.getLevelFromXP(previousXP);
      const newXP = previousXP + amount;

      // Update user XP
      await user.update({ xp_total: newXP }, { transaction });

      // Record transaction
      await XPTransaction.create({
        user_id: userId,
        amount,
        type,
        description,
        reference_id: referenceId,
        reference_type: referenceType,
        balance_after: newXP,
      }, { transaction });

      // Check for level up
      const newLevel = User.getLevelFromXP(newXP);
      if (newLevel.name !== previousLevel.name) {
        await this.handleLevelUp(userId, previousLevel, newLevel, transaction);
      }

      // Check milestones
      await this.checkMilestones(user, newXP, transaction);

      // Invalidate cache
      await cache.delPattern(`leaderboard:*`);
      await cache.del(`user:${userId}:profile`);

      // Update department XP if applicable
      if (user.department_id && amount > 0) {
        await Department.increment('total_xp', { by: amount, where: { id: user.department_id }, transaction });
      }

      logger.info(`XP awarded: ${amount} to user ${userId} (${type})`);
      return { previousXP, newXP, leveledUp: newLevel.name !== previousLevel.name, newLevel };
    } catch (err) {
      logger.error('awardXP error:', err);
      throw err;
    }
  }

  async deductXP(userId, amount, type, description, referenceId = null, transaction = null) {
    return this.awardXP(userId, -amount, type, description, referenceId, null, transaction);
  }

  // ─── Badge Auto-Award ────────────────────────────────────────────────────────

  async checkAndAwardBadges(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ association: 'userBadges', as: 'userBadges' }],
      });
      if (!user) return [];

      const ownedBadgeIds = user.userBadges.map((ub) => ub.badge_id);
      const badges = await Badge.findAll({ where: { is_active: true } });
      const newBadges = [];

      for (const badge of badges) {
        if (ownedBadgeIds.includes(badge.id)) continue;
        const qualifies = await this.evaluateBadgeCriteria(user, badge.criteria);
        if (qualifies) {
          await this.awardBadge(userId, badge.id, 'auto');
          newBadges.push(badge);
        }
      }
      return newBadges;
    } catch (err) {
      logger.error('checkAndAwardBadges error:', err);
      return [];
    }
  }

  async evaluateBadgeCriteria(user, criteria) {
    if (!criteria || !criteria.type) return false;

    switch (criteria.type) {
      case 'xp_threshold':
        return user.xp_total >= criteria.value;

      case 'actions_count':
        return user.actions_completed >= criteria.value;

      case 'carbon_saved':
        return user.carbon_saved_kg >= criteria.value;

      case 'level_reached':
        return User.getLevelFromXP(user.xp_total).name === criteria.value;

      case 'streak_days': {
        const streak = await Streak.findOne({ where: { user_id: user.id } });
        return streak && streak.current_streak >= criteria.value;
      }

      case 'badges_count': {
        const count = await UserBadge.count({ where: { user_id: user.id } });
        return count >= criteria.value;
      }

      case 'challenges_completed': {
        const { ChallengeParticipant } = require('../models');
        const count = await ChallengeParticipant.count({
          where: { user_id: user.id, status: 'completed' },
        });
        return count >= criteria.value;
      }

      case 'esg_score':
        return user.esg_score >= criteria.value;

      default:
        return false;
    }
  }

  async awardBadge(userId, badgeId, reason = 'auto', transaction = null) {
    try {
      // Check if already owned
      const existing = await UserBadge.findOne({ where: { user_id: userId, badge_id: badgeId } });
      if (existing) return null;

      const badge = await Badge.findByPk(badgeId);
      if (!badge) throw new Error(`Badge ${badgeId} not found`);

      // Create user badge
      const userBadge = await UserBadge.create({
        user_id: userId,
        badge_id: badgeId,
        awarded_reason: reason,
      }, { transaction });

      // Award XP for badge
      if (badge.xp_reward > 0) {
        await this.awardXP(userId, badge.xp_reward, 'badge', `Earned badge: ${badge.name}`, badgeId, 'badge', transaction);
      }

      // Increment badge award count
      await badge.increment('times_awarded', { transaction });

      // Record achievement
      await Achievement.create({
        user_id: userId,
        type: 'badge',
        title: `Badge Unlocked: ${badge.name}`,
        description: badge.description,
        icon: badge.icon,
        xp_value: badge.xp_reward,
        reference_id: badgeId,
      }, { transaction });

      // Send notification
      await notificationService.sendBadgeUnlockNotification(userId, badge);

      logger.info(`Badge awarded: ${badge.name} to user ${userId}`);
      return userBadge;
    } catch (err) {
      logger.error('awardBadge error:', err);
      throw err;
    }
  }

  // ─── Level Up ────────────────────────────────────────────────────────────────

  async handleLevelUp(userId, previousLevel, newLevel, transaction = null) {
    try {
      // Update user level
      await User.update({ level_name: newLevel.name }, { where: { id: userId }, transaction });

      // Record achievement
      await Achievement.create({
        user_id: userId,
        type: 'level_up',
        title: `Level Up! Reached ${newLevel.name} ${newLevel.icon}`,
        description: `You've progressed from ${previousLevel.name} to ${newLevel.name}!`,
        icon: newLevel.icon,
        xp_value: 0,
        metadata: { previous_level: previousLevel.name, new_level: newLevel.name },
      }, { transaction });

      // Send level-up notification
      await notificationService.sendLevelUpNotification(userId, previousLevel, newLevel);

      // Check for level-related badges
      await this.checkAndAwardBadges(userId);

      logger.info(`Level up: User ${userId} → ${newLevel.name}`);
    } catch (err) {
      logger.error('handleLevelUp error:', err);
    }
  }

  // ─── Streak System ──────────────────────────────────────────────────────────

  async updateStreak(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      let streak = await Streak.findOne({ where: { user_id: userId } });

      if (!streak) {
        streak = await Streak.create({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_active_days: 1,
        });
        return { streak, isNew: true, streakBroken: false };
      }

      const lastDate = streak.last_activity_date ? streak.last_activity_date.toString() : null;
      if (lastDate === today) return { streak, isNew: false, streakBroken: false };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let streakBroken = false;
      let newCurrentStreak;

      if (lastDate === yesterdayStr) {
        // Consecutive day
        newCurrentStreak = streak.current_streak + 1;
      } else {
        // Streak broken
        streakBroken = true;
        newCurrentStreak = 1;
      }

      const newLongest = Math.max(streak.longest_streak, newCurrentStreak);
      await streak.update({
        current_streak: newCurrentStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        total_active_days: streak.total_active_days + 1,
      });

      // Milestone checks (7, 30, 100 day streaks)
      const streakMilestones = [3, 7, 14, 30, 60, 100, 365];
      if (streakMilestones.includes(newCurrentStreak)) {
        const bonusXP = Math.floor(newCurrentStreak * 2);
        await this.awardXP(userId, bonusXP, 'streak_bonus', `${newCurrentStreak}-day streak bonus!`);
        await notificationService.sendStreakMilestoneNotification(userId, newCurrentStreak);
      } else if (newCurrentStreak > 0 && !streakBroken) {
        // Daily streak bonus (small)
        const streakMultiplier = parseFloat(process.env.STREAK_BONUS_MULTIPLIER) || 1.5;
        if (newCurrentStreak >= 7) {
          const bonusXP = Math.floor(5 * Math.log10(newCurrentStreak));
          await this.awardXP(userId, bonusXP, 'streak_bonus', `Daily streak bonus (${newCurrentStreak} days)`);
        }
      }

      if (streakBroken) {
        await notificationService.create(userId, {
          type: 'general',
          title: '💔 Streak Lost',
          message: `Your ${lastDate ? streak.current_streak : 0}-day streak ended. Start a new one today!`,
          icon: '💔',
          color: '#FF5722',
        });
      }

      return { streak, isNew: false, streakBroken };
    } catch (err) {
      logger.error('updateStreak error:', err);
      return null;
    }
  }

  // ─── Milestone Checks ────────────────────────────────────────────────────────

  async checkMilestones(user, currentXP = null, transaction = null) {
    try {
      const milestones = await Milestone.findAll({ where: { is_active: true } });
      const userMilestones = await UserMilestone.findAll({ where: { user_id: user.id } });
      const achievedIds = userMilestones.map((um) => um.milestone_id);

      for (const milestone of milestones) {
        if (achievedIds.includes(milestone.id)) continue;

        let achieved = false;
        const xp = currentXP !== null ? currentXP : user.xp_total;

        switch (milestone.type) {
          case 'xp_threshold': achieved = xp >= milestone.threshold; break;
          case 'actions_count': achieved = user.actions_completed >= milestone.threshold; break;
          case 'carbon_saved': achieved = user.carbon_saved_kg >= milestone.threshold; break;
          case 'streak_days': {
            const streak = await Streak.findOne({ where: { user_id: user.id } });
            achieved = streak && streak.current_streak >= milestone.threshold;
            break;
          }
          case 'badges_count': {
            const count = await UserBadge.count({ where: { user_id: user.id } });
            achieved = count >= milestone.threshold;
            break;
          }
          case 'challenges_completed': {
            const { ChallengeParticipant } = require('../models');
            const count = await ChallengeParticipant.count({
              where: { user_id: user.id, status: 'completed' },
            });
            achieved = count >= milestone.threshold;
            break;
          }
        }

        if (achieved) {
          await UserMilestone.create({ user_id: user.id, milestone_id: milestone.id }, { transaction });

          if (milestone.xp_reward > 0) {
            await this.awardXP(user.id, milestone.xp_reward, 'milestone',
              `Milestone reached: ${milestone.name}`, milestone.id, 'milestone', transaction);
          }

          await Achievement.create({
            user_id: user.id,
            type: 'milestone',
            title: `Milestone: ${milestone.name}`,
            description: milestone.description,
            icon: milestone.icon,
            xp_value: milestone.xp_reward,
            reference_id: milestone.id,
          }, { transaction });

          await notificationService.create(user.id, {
            type: 'xp_milestone',
            title: `🎯 Milestone Reached: ${milestone.name}`,
            message: `${milestone.description} — You earned ${milestone.xp_reward} XP!`,
            icon: milestone.icon,
            color: '#9C27B0',
            metadata: { milestone_id: milestone.id, xp_reward: milestone.xp_reward },
          });
        }
      }
    } catch (err) {
      logger.error('checkMilestones error:', err);
    }
  }

  // ─── Leaderboards ────────────────────────────────────────────────────────────

  async getGlobalLeaderboard(limit = 50, page = 1) {
    const cacheKey = `leaderboard:global:${limit}:${page}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'avatar_url', 'xp_total', 'level_name', 'esg_score', 'carbon_saved_kg', 'actions_completed', 'department_id'],
      include: [{ association: 'department', as: 'department', attributes: ['name', 'color', 'icon'] }],
      order: [['xp_total', 'DESC']],
      limit,
      offset,
    });

    const leaderboard = rows.map((user, index) => ({
      rank: offset + index + 1,
      ...user.toJSON(),
    }));

    const result = { leaderboard, total: count, page, limit };
    await cache.set(cacheKey, result, 120); // 2 min cache
    return result;
  }

  async getDepartmentLeaderboard(limit = 20) {
    const cacheKey = `leaderboard:department:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const departments = await Department.findAll({
      include: [{ association: 'members', as: 'members', attributes: ['id', 'xp_total', 'esg_score'] }],
      order: [['esg_score', 'DESC']],
      limit,
    });

    const leaderboard = departments.map((dept, index) => ({
      rank: index + 1,
      id: dept.id,
      name: dept.name,
      icon: dept.icon,
      color: dept.color,
      esg_score: dept.esg_score,
      total_xp: dept.total_xp,
      total_carbon_saved_kg: dept.total_carbon_saved_kg,
      member_count: dept.member_count,
      avg_xp: dept.member_count > 0 ? Math.round(dept.total_xp / dept.member_count) : 0,
    }));

    await cache.set(cacheKey, leaderboard, 300);
    return leaderboard;
  }

  async getMonthlyLeaderboard(limit = 50) {
    const cacheKey = `leaderboard:monthly:${limit}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { sequelize } = require('../config/database');
    const results = await XPTransaction.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('SUM', sequelize.col('amount')), 'monthly_xp'],
      ],
      where: {
        created_at: { [Op.gte]: startOfMonth },
        amount: { [Op.gt]: 0 },
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'avatar_url', 'level_name', 'department_id'],
        include: [{ association: 'department', as: 'department', attributes: ['name', 'color'] }],
      }],
      group: ['user_id', 'user.id', 'user.name', 'user.avatar_url', 'user.level_name', 'user.department_id', 'user->department.id', 'user->department.name', 'user->department.color'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      limit,
    });

    const leaderboard = results.map((r, i) => ({
      rank: i + 1,
      user_id: r.user_id,
      name: r.user?.name,
      avatar_url: r.user?.avatar_url,
      level_name: r.user?.level_name,
      department: r.user?.department,
      monthly_xp: parseInt(r.get('monthly_xp')) || 0,
    }));

    await cache.set(cacheKey, leaderboard, 300);
    return leaderboard;
  }

  // ─── ESG Score Calculator ────────────────────────────────────────────────────

  async recalculateUserESGScore(userId) {
    try {
      const { ESGAction } = require('../models');
      const user = await User.findByPk(userId);
      if (!user) return;

      const actions = await ESGAction.findAll({ where: { user_id: userId } });
      const totalCarbon = actions.reduce((sum, a) => sum + (a.carbon_impact_kg || 0), 0);
      const actionsCount = actions.length;

      // ESG score formula:
      // Base: actions diversity + carbon impact + engagement
      const categorySet = new Set(actions.map((a) => a.category));
      const diversityScore = (categorySet.size / 8) * 25; // Max 25 points for category diversity
      const carbonScore = Math.min(totalCarbon / 10, 40); // Max 40 points for carbon savings
      const engagementScore = Math.min(actionsCount / 5, 25); // Max 25 points for action count
      const levelBonus = { Bronze: 0, Silver: 2, Gold: 5, Platinum: 7, Diamond: 10 }[user.level_name] || 0;

      const esgScore = Math.min(
        Math.round(diversityScore + carbonScore + engagementScore + levelBonus),
        100
      );

      await user.update({
        esg_score: esgScore,
        carbon_saved_kg: totalCarbon,
        actions_completed: actionsCount,
      });

      // Update department ESG
      if (user.department_id) {
        await this.updateDepartmentESGScore(user.department_id);
      }

      return esgScore;
    } catch (err) {
      logger.error('recalculateUserESGScore error:', err);
    }
  }

  async updateDepartmentESGScore(departmentId) {
    try {
      const members = await User.findAll({ where: { department_id: departmentId, is_active: true } });
      if (members.length === 0) return;

      const avgESG = members.reduce((sum, m) => sum + m.esg_score, 0) / members.length;
      const totalCarbon = members.reduce((sum, m) => sum + m.carbon_saved_kg, 0);
      const totalXP = members.reduce((sum, m) => sum + m.xp_total, 0);

      await Department.update({
        esg_score: Math.round(avgESG * 100) / 100,
        total_carbon_saved_kg: totalCarbon,
        total_xp: totalXP,
        member_count: members.length,
      }, { where: { id: departmentId } });
    } catch (err) {
      logger.error('updateDepartmentESGScore error:', err);
    }
  }
}

module.exports = new GamificationService();
