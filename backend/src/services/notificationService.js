/**
 * NotificationService — In-app, Email, SSE push, and scheduled notifications
 */
const nodemailer = require('nodemailer');
const { Notification, User } = require('../models');
const { sseClients } = require('../config/redis');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        pool: true,
        maxConnections: 5,
      });
    }
  }

  // ─── Create In-App Notification ──────────────────────────────────────────────

  async create(userId, { type, title, message, icon = '🔔', color = '#4CAF50', action_url = null, metadata = {} } = {}) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        icon,
        color,
        action_url,
        metadata,
      });

      // Push via SSE if client is connected
      this.pushSSE(userId, notification);

      // Send email if user prefers
      const user = await User.findByPk(userId, { attributes: ['email', 'name', 'email_notifications'] });
      if (user?.email_notifications && this.transporter) {
        this.sendEmail(user.email, user.name, title, message, action_url).catch((err) => {
          logger.warn('Email send failed:', err.message);
        });
      }

      return notification;
    } catch (err) {
      logger.error('Notification create error:', err);
      return null;
    }
  }

  // ─── SSE Push ────────────────────────────────────────────────────────────────

  pushSSE(userId, data) {
    const clients = sseClients.get(userId);
    if (!clients || clients.size === 0) return;

    const payload = `data: ${JSON.stringify({ type: 'notification', payload: data })}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch (err) {
        logger.warn('SSE write error:', err.message);
      }
    });
  }

  broadcastSSE(data) {
    sseClients.forEach((clients) => {
      clients.forEach((res) => {
        try {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (err) { /* ignore */ }
      });
    });
  }

  // ─── Email ───────────────────────────────────────────────────────────────────

  async sendEmail(to, name, subject, text, actionUrl = null) {
    if (!this.transporter) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0f1e; color: #e0e0e0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0d1b2a 0%, #1a2942 100%); border-radius: 16px; padding: 40px; border: 1px solid #2a3f5f; }
    .logo { font-size: 28px; font-weight: 800; color: #4ade80; margin-bottom: 24px; }
    .logo span { color: #60a5fa; }
    h2 { color: #f0f9ff; margin: 0 0 16px; font-size: 22px; }
    p { color: #94a3b8; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4ade80, #22d3ee); color: #0a0f1e; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #2a3f5f; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Green<span>Quest</span> 🌿</div>
    <h2>${subject}</h2>
    <p>Hi ${name},</p>
    <p>${text}</p>
    ${actionUrl ? `<a href="${actionUrl}" class="btn">View Details →</a>` : ''}
    <div class="footer">
      <p>You're receiving this because you're part of the GreenQuest ESG platform.</p>
      <p>© 2024 GreenQuest. Making sustainability rewarding.</p>
    </div>
  </div>
</body>
</html>`;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'GreenQuest <noreply@greenquest.io>',
      to,
      subject: `[GreenQuest] ${subject}`,
      text,
      html,
    });

    logger.info(`Email sent to ${to}: ${subject}`);
  }

  // ─── Specialized Notifications ───────────────────────────────────────────────

  async sendBadgeUnlockNotification(userId, badge) {
    return this.create(userId, {
      type: 'badge_unlock',
      title: `🏆 Badge Unlocked: ${badge.name}`,
      message: `Congratulations! You've earned the "${badge.name}" badge! ${badge.description}`,
      icon: badge.icon || '🏆',
      color: badge.rarity === 'legendary' ? '#FFD700' : badge.rarity === 'epic' ? '#9C27B0' : '#4CAF50',
      action_url: '/achievements',
      metadata: { badge_id: badge.id, rarity: badge.rarity },
    });
  }

  async sendLevelUpNotification(userId, previousLevel, newLevel) {
    return this.create(userId, {
      type: 'level_up',
      title: `${newLevel.icon} Level Up! You're now ${newLevel.name}!`,
      message: `Amazing progress! You've leveled up from ${previousLevel.name} ${previousLevel.icon} to ${newLevel.name} ${newLevel.icon}. Keep going!`,
      icon: newLevel.icon,
      color: newLevel.color,
      action_url: '/profile',
      metadata: { previous_level: previousLevel.name, new_level: newLevel.name },
    });
  }

  async sendStreakMilestoneNotification(userId, streakDays) {
    const emojis = { 3: '🔥', 7: '🔥🔥', 14: '⚡', 30: '💫', 60: '🌟', 100: '💎', 365: '👑' };
    const emoji = emojis[streakDays] || '🔥';
    return this.create(userId, {
      type: 'streak_milestone',
      title: `${emoji} ${streakDays}-Day Streak!`,
      message: `Incredible! You've maintained a ${streakDays}-day sustainability streak! You earned a bonus XP reward!`,
      icon: emoji,
      color: '#FF6B35',
      action_url: '/profile',
      metadata: { streak_days: streakDays },
    });
  }

  async sendRewardNotification(userId, reward, redemption) {
    return this.create(userId, {
      type: redemption.status === 'approved' ? 'reward_approved' : 'reward_delivered',
      title: redemption.status === 'approved' ? `✅ Reward Approved: ${reward.name}` : `🎁 Reward Delivered: ${reward.name}`,
      message: redemption.status === 'approved'
        ? `Your redemption for "${reward.name}" has been approved!`
        : `Your reward "${reward.name}" has been delivered. ${redemption.notes || ''}`,
      icon: reward.icon || '🎁',
      color: '#2196F3',
      action_url: '/rewards',
      metadata: { reward_id: reward.id, redemption_id: redemption.id },
    });
  }

  async sendChallengeNotification(userId, challenge, notifType) {
    const configs = {
      invited: {
        title: `⚔️ New Challenge: ${challenge.title}`,
        message: `You've been invited to join the challenge "${challenge.title}". Don't miss out — ends ${new Date(challenge.ends_at).toLocaleDateString()}!`,
        color: '#FF9800',
      },
      reminder: {
        title: `⏰ Challenge Reminder: ${challenge.title}`,
        message: `Don't forget! The challenge "${challenge.title}" ends soon. Keep pushing!`,
        color: '#FF5722',
      },
      completed: {
        title: `🎉 Challenge Completed: ${challenge.title}`,
        message: `You've completed the "${challenge.title}" challenge! Check your rewards.`,
        color: '#4CAF50',
      },
    };
    const config = configs[notifType] || configs.reminder;
    return this.create(userId, {
      type: `challenge_${notifType}`,
      ...config,
      icon: '⚔️',
      action_url: `/challenges/${challenge.id}`,
      metadata: { challenge_id: challenge.id },
    });
  }

  async sendComplianceAlert(userId, { policy, deadline, severity = 'high' }) {
    return this.create(userId, {
      type: 'compliance_alert',
      title: `⚠️ Compliance Alert: ${policy}`,
      message: `Action required: ${policy}. Deadline: ${deadline}. Please review and comply.`,
      icon: '⚠️',
      color: severity === 'critical' ? '#F44336' : '#FF9800',
      action_url: '/compliance',
      metadata: { policy, deadline, severity },
    });
  }

  async sendPolicyReminder(userId, { policy, description }) {
    return this.create(userId, {
      type: 'policy_reminder',
      title: `📋 Policy Reminder: ${policy}`,
      message: description,
      icon: '📋',
      color: '#607D8B',
      action_url: '/policies',
    });
  }

  async sendCSRReminder(userId, { activity, description }) {
    return this.create(userId, {
      type: 'csr_reminder',
      title: `🤝 CSR Activity: ${activity}`,
      message: description,
      icon: '🤝',
      color: '#009688',
      action_url: '/csr',
    });
  }

  async sendAIInsightNotification(userId, insight) {
    return this.create(userId, {
      type: 'ai_insight',
      title: `🤖 AI Insight: ${insight.title}`,
      message: insight.content.substring(0, 200) + (insight.content.length > 200 ? '...' : ''),
      icon: insight.risk_level === 'high' || insight.risk_level === 'critical' ? '🚨' : '💡',
      color: insight.risk_level === 'critical' ? '#F44336' : insight.risk_level === 'high' ? '#FF9800' : '#3F51B5',
      action_url: '/ai-insights',
      metadata: { insight_id: insight.id, risk_level: insight.risk_level },
    });
  }

  // ─── Bulk/Broadcast ──────────────────────────────────────────────────────────

  async broadcastToAll(notificationData) {
    const users = await User.findAll({ where: { is_active: true }, attributes: ['id'] });
    const results = await Promise.allSettled(
      users.map((u) => this.create(u.id, notificationData))
    );
    logger.info(`Broadcast sent to ${users.length} users`);
    return results;
  }

  async broadcastToDepartment(departmentId, notificationData) {
    const users = await User.findAll({
      where: { department_id: departmentId, is_active: true },
      attributes: ['id'],
    });
    const results = await Promise.allSettled(
      users.map((u) => this.create(u.id, notificationData))
    );
    return results;
  }
}

module.exports = new NotificationService();
