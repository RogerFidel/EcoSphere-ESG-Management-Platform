/**
 * Scheduler — Cron jobs for reminders, streak checks, and ESG scoring
 */
const cron = require('node-cron');
const { User, Challenge, ChallengeParticipant, Department } = require('../models');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const initScheduler = () => {
  logger.info('⏰ Initializing schedulers...');

  // ─── Daily Streak Check (midnight) ───────────────────────────────────────────
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running: Daily streak validation');
    try {
      const { Streak } = require('../models');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Find users whose last activity was 2+ days ago (streak broken)
      const brokenStreaks = await Streak.findAll({
        where: {
          last_activity_date: { [Op.lt]: yesterdayStr },
          current_streak: { [Op.gt]: 0 },
        },
        include: [{ association: 'user', as: 'user', attributes: ['id', 'name'] }],
      });

      for (const streak of brokenStreaks) {
        await streak.update({ current_streak: 0 });
        if (streak.user) {
          await notificationService.create(streak.user.id, {
            type: 'general',
            title: '💔 Streak Reset',
            message: `Your sustainability streak was reset. Log an action today to start a new one!`,
            icon: '💔',
            color: '#FF5722',
          });
        }
      }
      logger.info(`Streak check: Reset ${brokenStreaks.length} broken streaks`);
    } catch (err) {
      logger.error('Streak check job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── Challenge Reminders (9 AM daily) ────────────────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running: Challenge reminders');
    try {
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      // Challenges ending in 2 days
      const endingSoon = await Challenge.findAll({
        where: {
          status: 'active',
          ends_at: { [Op.between]: [now, twoDaysFromNow] },
        },
        include: [{
          association: 'challengeParticipants',
          as: 'challengeParticipants',
          where: { status: { [Op.ne]: 'completed' } },
          include: [{ association: 'user', as: 'user', attributes: ['id'] }],
        }],
      });

      for (const challenge of endingSoon) {
        for (const participant of challenge.challengeParticipants) {
          if (participant.user) {
            await notificationService.sendChallengeNotification(participant.user.id, challenge, 'reminder');
          }
        }
      }
      logger.info(`Challenge reminders: Sent for ${endingSoon.length} challenges`);
    } catch (err) {
      logger.error('Challenge reminder job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── Auto-Complete Expired Challenges (hourly) ────────────────────────────────
  cron.schedule('0 * * * *', async () => {
    logger.info('Running: Challenge auto-completion check');
    try {
      const now = new Date();
      const expiredChallenges = await Challenge.findAll({
        where: {
          status: 'active',
          ends_at: { [Op.lt]: now },
        },
        include: [{
          association: 'challengeParticipants',
          as: 'challengeParticipants',
          include: [{ association: 'user', as: 'user' }],
        }],
      });

      for (const challenge of expiredChallenges) {
        await challenge.update({ status: 'completed', completed_at: now });

        for (const participant of challenge.challengeParticipants) {
          if (participant.status === 'in_progress' || participant.status === 'joined') {
            const completed = participant.progress >= 100;
            await participant.update({
              status: completed ? 'completed' : 'failed',
              completed_at: completed ? now : null,
            });

            if (completed && participant.user) {
              // Award XP
              await gamificationService.awardXP(
                participant.user.id,
                challenge.xp_reward,
                'challenge',
                `Completed challenge: ${challenge.title}`,
                challenge.id,
                'challenge'
              );

              // Award badge if configured
              if (challenge.badge_id) {
                await gamificationService.awardBadge(participant.user.id, challenge.badge_id, 'challenge');
              }

              await notificationService.sendChallengeNotification(participant.user.id, challenge, 'completed');
            }
          }
        }
      }
      if (expiredChallenges.length > 0) {
        logger.info(`Auto-completed ${expiredChallenges.length} expired challenges`);
      }
    } catch (err) {
      logger.error('Challenge auto-complete job error:', err);
    }
  });

  // ─── Weekly ESG Score Recalculation (Sunday midnight) ────────────────────────
  cron.schedule('0 0 * * 0', async () => {
    logger.info('Running: Weekly ESG score recalculation');
    try {
      const users = await User.findAll({ where: { is_active: true }, attributes: ['id'] });
      for (const user of users) {
        await gamificationService.recalculateUserESGScore(user.id);
      }
      logger.info(`ESG recalculation complete for ${users.length} users`);
    } catch (err) {
      logger.error('ESG recalculation job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── Policy Reminders (Friday 3 PM) ───────────────────────────────────────────
  cron.schedule('0 15 * * 5', async () => {
    logger.info('Running: Weekly policy reminders');
    try {
      const policies = [
        {
          policy: 'Green Commute Policy',
          description: 'Remember to log your sustainable commute this week. Walk, cycle, or use public transport to earn XP!',
        },
        {
          policy: 'Waste Reduction Policy',
          description: 'Have you logged your waste reduction actions this week? Reduce, reuse, and recycle to boost your ESG score.',
        },
      ];

      for (const policy of policies) {
        await notificationService.broadcastToAll({
          type: 'policy_reminder',
          title: `📋 Weekly Reminder: ${policy.policy}`,
          message: policy.description,
          icon: '📋',
          color: '#607D8B',
        });
      }
    } catch (err) {
      logger.error('Policy reminder job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── CSR Reminders (1st of each month) ────────────────────────────────────────
  cron.schedule('0 9 1 * *', async () => {
    logger.info('Running: Monthly CSR reminders');
    try {
      await notificationService.broadcastToAll({
        type: 'csr_reminder',
        title: '🤝 Monthly CSR Activity',
        message: 'A new month has started! Check out our CSR activities and sustainability challenges. Make a positive impact!',
        icon: '🤝',
        color: '#009688',
        action_url: '/challenges',
      });
    } catch (err) {
      logger.error('CSR reminder job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── Department ESG Report (Monthly, 1st at 8 AM) ────────────────────────────
  cron.schedule('0 8 1 * *', async () => {
    logger.info('Running: Monthly department ESG report');
    try {
      const departments = await Department.findAll({ attributes: ['id'] });
      for (const dept of departments) {
        try {
          await aiService.generateRiskAlerts(dept.id);
        } catch (err) {
          logger.warn(`Risk alert generation failed for dept ${dept.id}:`, err.message);
        }
      }
    } catch (err) {
      logger.error('Department ESG report job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── Daily Login Streak Reminder (8 AM) ───────────────────────────────────────
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running: Daily login streak reminder');
    try {
      const { Streak } = require('../models');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Users with active streaks who haven't logged in today
      const activeStreaks = await Streak.findAll({
        where: {
          last_activity_date: yesterdayStr,
          current_streak: { [Op.gte]: 3 }, // Only remind users with 3+ day streaks
        },
        include: [{ association: 'user', as: 'user', attributes: ['id', 'name'] }],
      });

      for (const streak of activeStreaks) {
        if (streak.user) {
          await notificationService.create(streak.user.id, {
            type: 'general',
            title: `🔥 Keep Your ${streak.current_streak}-Day Streak!`,
            message: `Don't break your ${streak.current_streak}-day streak! Log a sustainability action today to keep it going.`,
            icon: '🔥',
            color: '#FF6B35',
            action_url: '/actions',
          });
        }
      }
    } catch (err) {
      logger.error('Streak reminder job error:', err);
    }
  }, { timezone: 'UTC' });

  // ─── Compliance Alerts Check (Every Monday 9 AM) ─────────────────────────────
  cron.schedule('0 9 * * 1', async () => {
    logger.info('Running: Weekly compliance check');
    try {
      // Check for users with very low ESG scores
      const lowESGUsers = await User.findAll({
        where: { esg_score: { [Op.lt]: 20 }, is_active: true },
        attributes: ['id', 'name', 'esg_score'],
      });

      for (const user of lowESGUsers) {
        await notificationService.sendComplianceAlert(user.id, {
          policy: 'ESG Participation Requirements',
          deadline: 'End of Month',
          severity: 'high',
        });
      }

      if (lowESGUsers.length > 0) {
        logger.info(`Compliance alerts sent to ${lowESGUsers.length} users with low ESG scores`);
      }
    } catch (err) {
      logger.error('Compliance check job error:', err);
    }
  }, { timezone: 'UTC' });

  logger.info('✅ All schedulers initialized');
};

module.exports = { initScheduler };
