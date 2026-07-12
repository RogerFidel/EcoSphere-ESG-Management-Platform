/**
 * GreenQuest — Database Seed Script
 * Creates comprehensive demo data for all features
 */
require('dotenv').config();
const {
  sequelize, User, Department, Badge, Reward, Challenge,
  ChallengeParticipant, ESGAction, Streak, Milestone, XPTransaction,
} = require('../src/models');
const gamificationService = require('../src/services/gamificationService');
const logger = require('../src/utils/logger');

const seed = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected. Starting seed...');
    await sequelize.sync({ force: true });
    logger.info('Tables synced (force reset)');

    // ─── Departments ────────────────────────────────────────────────────────────
    const departments = await Department.bulkCreate([
      { name: 'Engineering', description: 'Software & Hardware Engineering', color: '#4ade80', icon: '⚙️' },
      { name: 'Product', description: 'Product Management & Design', color: '#60a5fa', icon: '🎯' },
      { name: 'Sales', description: 'Sales & Business Development', color: '#f59e0b', icon: '💼' },
      { name: 'Marketing', description: 'Marketing & Communications', color: '#a78bfa', icon: '📣' },
      { name: 'Operations', description: 'Operations & Facilities', color: '#34d399', icon: '🏗️' },
      { name: 'HR', description: 'Human Resources', color: '#f87171', icon: '👥' },
    ]);
    logger.info(`✅ Created ${departments.length} departments`);

    // ─── Badges ─────────────────────────────────────────────────────────────────
    const badges = await Badge.bulkCreate([
      // Sustainability Badges
      { name: 'Green Starter', description: 'Logged your first sustainability action', icon: '🌱', category: 'sustainability', rarity: 'common', xp_reward: 25, criteria: { type: 'actions_count', value: 1 } },
      { name: 'Eco Warrior', description: 'Completed 10 sustainability actions', icon: '♻️', category: 'sustainability', rarity: 'uncommon', xp_reward: 50, criteria: { type: 'actions_count', value: 10 } },
      { name: 'Carbon Crusher', description: 'Saved over 50 kg of carbon emissions', icon: '🌍', category: 'sustainability', rarity: 'rare', xp_reward: 100, criteria: { type: 'carbon_saved', value: 50 } },
      { name: 'Planet Protector', description: 'Saved over 200 kg of carbon emissions', icon: '🌏', category: 'sustainability', rarity: 'epic', xp_reward: 250, criteria: { type: 'carbon_saved', value: 200 } },
      { name: 'Earth Champion', description: 'Saved over 1000 kg of carbon emissions', icon: '🏆', category: 'sustainability', rarity: 'legendary', xp_reward: 1000, criteria: { type: 'carbon_saved', value: 1000 } },

      // Engagement Badges
      { name: 'First Steps', description: 'Joined GreenQuest', icon: '👋', category: 'engagement', rarity: 'common', xp_reward: 10, criteria: { type: 'actions_count', value: 0 } },
      { name: 'XP Hunter', description: 'Earned 500 XP total', icon: '⚡', category: 'engagement', rarity: 'uncommon', xp_reward: 50, criteria: { type: 'xp_threshold', value: 500 } },
      { name: 'Power Player', description: 'Earned 2000 XP total', icon: '💥', category: 'engagement', rarity: 'rare', xp_reward: 150, criteria: { type: 'xp_threshold', value: 2000 } },
      { name: 'Legend', description: 'Reached Diamond level', icon: '💎', category: 'engagement', rarity: 'legendary', xp_reward: 500, criteria: { type: 'level_reached', value: 'Diamond' } },

      // Streak Badges
      { name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥', category: 'streak', rarity: 'uncommon', xp_reward: 75, criteria: { type: 'streak_days', value: 7 } },
      { name: 'Month Master', description: 'Maintained a 30-day streak', icon: '🌟', category: 'streak', rarity: 'epic', xp_reward: 300, criteria: { type: 'streak_days', value: 30 } },
      { name: 'Year Round', description: 'Maintained a 365-day streak', icon: '👑', category: 'streak', rarity: 'legendary', xp_reward: 2000, criteria: { type: 'streak_days', value: 365 } },

      // Challenge Badges
      { name: 'Challenge Accepted', description: 'Completed your first challenge', icon: '⚔️', category: 'challenge', rarity: 'common', xp_reward: 50, criteria: { type: 'challenges_completed', value: 1 } },
      { name: 'Challenge Master', description: 'Completed 5 challenges', icon: '🏅', category: 'challenge', rarity: 'rare', xp_reward: 200, criteria: { type: 'challenges_completed', value: 5 } },

      // ESG Badges
      { name: 'ESG Rising', description: 'Reached ESG score of 50', icon: '📊', category: 'esg', rarity: 'uncommon', xp_reward: 100, criteria: { type: 'esg_score', value: 50 } },
      { name: 'ESG Elite', description: 'Reached ESG score of 80', icon: '💫', category: 'esg', rarity: 'epic', xp_reward: 300, criteria: { type: 'esg_score', value: 80 } },

      // Milestone Badge
      { name: 'Collector', description: 'Earned 5 badges', icon: '🎖️', category: 'milestone', rarity: 'uncommon', xp_reward: 100, criteria: { type: 'badges_count', value: 5 } },
    ]);
    logger.info(`✅ Created ${badges.length} badges`);

    // ─── Milestones ──────────────────────────────────────────────────────────────
    await Milestone.bulkCreate([
      { name: 'XP Milestone: 100', description: 'Earned your first 100 XP!', type: 'xp_threshold', threshold: 100, xp_reward: 25, icon: '⭐' },
      { name: 'XP Milestone: 500', description: 'Reached 500 XP — Silver territory!', type: 'xp_threshold', threshold: 500, xp_reward: 50, icon: '⭐⭐' },
      { name: 'XP Milestone: 1000', description: 'Hit 1,000 XP — incredible dedication!', type: 'xp_threshold', threshold: 1000, xp_reward: 100, icon: '🌟' },
      { name: 'XP Milestone: 5000', description: 'Accumulated 5,000 XP — you\'re a legend!', type: 'xp_threshold', threshold: 5000, xp_reward: 500, icon: '💎' },
      { name: 'Action Hero: 5', description: 'Completed 5 sustainability actions', type: 'actions_count', threshold: 5, xp_reward: 30, icon: '🎯' },
      { name: 'Action Hero: 50', description: 'Completed 50 sustainability actions', type: 'actions_count', threshold: 50, xp_reward: 150, icon: '🏆' },
      { name: 'Carbon Saver: 10kg', description: 'Saved 10 kg of carbon emissions', type: 'carbon_saved', threshold: 10, xp_reward: 50, icon: '🌍' },
      { name: 'Carbon Saver: 100kg', description: 'Saved 100 kg of carbon emissions', type: 'carbon_saved', threshold: 100, xp_reward: 200, icon: '🌏' },
      { name: 'Streak: 3 Days', description: 'Maintained a 3-day streak', type: 'streak_days', threshold: 3, xp_reward: 20, icon: '🔥' },
      { name: 'Streak: 14 Days', description: 'Maintained a 14-day streak', type: 'streak_days', threshold: 14, xp_reward: 100, icon: '🔥🔥' },
      { name: 'Badge Collector: 3', description: 'Earned 3 badges', type: 'badges_count', threshold: 3, xp_reward: 75, icon: '🎖️' },
      { name: 'Challenge Veteran: 3', description: 'Completed 3 challenges', type: 'challenges_completed', threshold: 3, xp_reward: 100, icon: '⚔️' },
    ]);
    logger.info('✅ Created milestones');

    // ─── Rewards ─────────────────────────────────────────────────────────────────
    const rewards = await Reward.bulkCreate([
      { name: 'Amazon Gift Card $25', description: 'Redeem for a $25 Amazon gift card', category: 'gift_card', xp_cost: 500, quantity_available: 50, icon: '🎁', image_url: null },
      { name: 'Starbucks Gift Card $10', description: 'Start your sustainable morning with a Starbucks treat', category: 'gift_card', xp_cost: 200, quantity_available: 100, icon: '☕' },
      { name: 'Extra Day Off', description: 'Earn an additional paid day off', category: 'extra_leave', xp_cost: 1500, quantity_available: 20, icon: '🏖️' },
      { name: 'Half Day Off', description: 'Take a half day at your convenience', category: 'extra_leave', xp_cost: 750, quantity_available: 40, icon: '⛱️' },
      { name: 'Eco-Friendly Water Bottle', description: 'Premium reusable water bottle with company branding', category: 'merchandise', xp_cost: 300, quantity_available: -1, icon: '🍶' },
      { name: 'Bamboo Notebook', description: 'Sustainable bamboo notebook for eco-conscious notes', category: 'merchandise', xp_cost: 150, quantity_available: -1, icon: '📓' },
      { name: 'Plant a Tree', description: 'We plant a tree in your name via our NGO partner', category: 'donation', xp_cost: 100, quantity_available: -1, icon: '🌳' },
      { name: 'Beach Cleanup Voucher', description: 'Join our next beach cleanup event', category: 'experience', xp_cost: 250, quantity_available: 30, icon: '🏖️' },
      { name: 'Solar Charger', description: 'Portable solar-powered phone charger', category: 'merchandise', xp_cost: 600, quantity_available: 25, icon: '☀️' },
      { name: 'Online Course Voucher', description: 'Sustainability & ESG professional certification course', category: 'experience', xp_cost: 800, quantity_available: -1, icon: '📚' },
    ]);
    logger.info(`✅ Created ${rewards.length} rewards`);

    // ─── Users ───────────────────────────────────────────────────────────────────
    const userSeed = [
      { email: 'admin@greenquest.io', name: 'Alex Admin', role: 'admin', department_id: departments[4].id },
      { email: 'sarah.chen@greenquest.io', name: 'Sarah Chen', role: 'manager', department_id: departments[0].id },
      { email: 'james.park@greenquest.io', name: 'James Park', role: 'employee', department_id: departments[0].id },
      { email: 'priya.sharma@greenquest.io', name: 'Priya Sharma', role: 'employee', department_id: departments[1].id },
      { email: 'tom.wilson@greenquest.io', name: 'Tom Wilson', role: 'employee', department_id: departments[2].id },
      { email: 'emma.jones@greenquest.io', name: 'Emma Jones', role: 'manager', department_id: departments[3].id },
      { email: 'liam.taylor@greenquest.io', name: 'Liam Taylor', role: 'employee', department_id: departments[0].id },
      { email: 'aisha.ali@greenquest.io', name: 'Aisha Ali', role: 'employee', department_id: departments[5].id },
      { email: 'carlos.gomez@greenquest.io', name: 'Carlos Gomez', role: 'employee', department_id: departments[2].id },
      { email: 'nina.petrov@greenquest.io', name: 'Nina Petrov', role: 'employee', department_id: departments[1].id },
      { email: 'demo@greenquest.io', name: 'Demo User', role: 'employee', department_id: departments[0].id },
    ];

    const users = await User.bulkCreate(
      userSeed.map((u) => ({ ...u, password_hash: 'password123' })),
      { individualHooks: true } // Runs bcrypt hook
    );
    logger.info(`✅ Created ${users.length} users`);

    // ─── Initialize Streaks ───────────────────────────────────────────────────────
    await Streak.bulkCreate(users.map((u) => ({
      user_id: u.id,
      current_streak: Math.floor(Math.random() * 15),
      longest_streak: Math.floor(Math.random() * 30) + 15,
      last_activity_date: new Date().toISOString().split('T')[0],
      total_active_days: Math.floor(Math.random() * 60) + 5,
    })));
    logger.info('✅ Created streaks');

    // ─── ESG Actions (rich sample data) ──────────────────────────────────────────
    const actionTemplates = [
      { category: 'transport', action_name: 'Cycled to work', carbon_impact_kg: 2.5, xp_earned: 20 },
      { category: 'transport', action_name: 'Used public transport', carbon_impact_kg: 1.8, xp_earned: 20 },
      { category: 'energy', action_name: 'Switched off lights when leaving', carbon_impact_kg: 0.5, xp_earned: 15 },
      { category: 'energy', action_name: 'Enabled power saving mode', carbon_impact_kg: 0.3, xp_earned: 15 },
      { category: 'waste', action_name: 'Sorted recycling correctly', carbon_impact_kg: 1.2, xp_earned: 12 },
      { category: 'waste', action_name: 'Brought reusable lunch container', carbon_impact_kg: 0.8, xp_earned: 12 },
      { category: 'water', action_name: 'Reported leaky faucet', carbon_impact_kg: 0.4, xp_earned: 10 },
      { category: 'food', action_name: 'Chose plant-based lunch', carbon_impact_kg: 3.0, xp_earned: 8 },
      { category: 'carbon', action_name: 'Attended virtual meeting instead of travel', carbon_impact_kg: 45.0, xp_earned: 18 },
      { category: 'csr', action_name: 'Participated in community cleanup', carbon_impact_kg: 5.0, xp_earned: 15 },
    ];

    const actions = [];
    for (const user of users) {
      const numActions = Math.floor(Math.random() * 20) + 5;
      for (let i = 0; i < numActions; i++) {
        const template = actionTemplates[Math.floor(Math.random() * actionTemplates.length)];
        const daysAgo = Math.floor(Math.random() * 90);
        const performedAt = new Date();
        performedAt.setDate(performedAt.getDate() - daysAgo);
        actions.push({
          user_id: user.id,
          department_id: user.department_id,
          ...template,
          is_verified: Math.random() > 0.5,
          performed_at: performedAt,
        });
      }
    }
    await ESGAction.bulkCreate(actions);
    logger.info(`✅ Created ${actions.length} ESG actions`);

    // ─── Award XP and Recalculate ─────────────────────────────────────────────────
    for (const user of users) {
      const userActions = actions.filter((a) => a.user_id === user.id);
      const totalXP = userActions.reduce((sum, a) => sum + a.xp_earned, 0) + 50; // Welcome bonus

      await XPTransaction.create({
        user_id: user.id,
        amount: 50,
        type: 'manual',
        description: 'Welcome to GreenQuest!',
        balance_after: 50,
      });

      let balance = 50;
      for (const action of userActions) {
        balance += action.xp_earned;
        await XPTransaction.create({
          user_id: user.id,
          amount: action.xp_earned,
          type: 'action',
          description: `ESG Action: ${action.action_name}`,
          balance_after: balance,
        });
      }

      const level = User.getLevelFromXP(totalXP);
      await user.update({
        xp_total: totalXP,
        level_name: level.name,
        actions_completed: userActions.length,
        carbon_saved_kg: userActions.reduce((sum, a) => sum + a.carbon_impact_kg, 0),
        last_login: new Date(),
      });

      await gamificationService.recalculateUserESGScore(user.id);
    }
    logger.info('✅ Calculated XP and ESG scores for all users');

    // ─── Challenges ──────────────────────────────────────────────────────────────
    const now = new Date();
    const challenges = await Challenge.bulkCreate([
      {
        title: 'Zero Waste July',
        description: 'Log 30 waste-reduction actions throughout July to earn the Eco Warrior badge!',
        type: 'company',
        category: 'waste',
        status: 'active',
        xp_reward: 500,
        badge_id: badges.find((b) => b.name === 'Eco Warrior')?.id,
        created_by: users[0].id,
        target_value: 30,
        target_unit: 'actions',
        starts_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        ends_at: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        participants_count: 8,
      },
      {
        title: 'Green Commute Challenge',
        description: 'Use sustainable transport (cycling, walking, public transit) for 20 days in a row.',
        type: 'individual',
        category: 'transport',
        status: 'active',
        xp_reward: 300,
        created_by: users[1].id,
        target_value: 20,
        target_unit: 'days',
        starts_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        ends_at: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        participants_count: 15,
      },
      {
        title: 'Engineering Energy Blitz',
        description: 'Engineering team challenge: reduce energy consumption by 100 kWh collectively.',
        type: 'department',
        category: 'energy',
        status: 'active',
        xp_reward: 400,
        department_id: departments[0].id,
        created_by: users[1].id,
        target_value: 100,
        target_unit: 'kWh',
        starts_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        ends_at: new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000),
        participants_count: 6,
      },
      {
        title: 'Plant-Based Week',
        description: 'Choose plant-based meals every day for a week to reduce your food carbon footprint!',
        type: 'individual',
        category: 'other',
        status: 'active',
        xp_reward: 150,
        created_by: users[0].id,
        target_value: 7,
        target_unit: 'days',
        starts_at: now,
        ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        participants_count: 22,
      },
      {
        title: 'Carbon Reduction Sprint',
        description: 'Company-wide mission: collectively save 500 kg of carbon this month!',
        type: 'company',
        category: 'carbon',
        status: 'completed',
        xp_reward: 1000,
        created_by: users[0].id,
        target_value: 500,
        target_unit: 'kg_carbon',
        current_value: 523.4,
        starts_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        ends_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        completed_at: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        participants_count: 45,
      },
    ]);
    logger.info(`✅ Created ${challenges.length} challenges`);

    // ─── Challenge Participants ───────────────────────────────────────────────────
    const participants = [];
    for (const challenge of challenges.filter((c) => c.status === 'active')) {
      const eligibleUsers = users.filter((u) =>
        !challenge.department_id || u.department_id === challenge.department_id
      );
      const joinCount = Math.min(eligibleUsers.length, Math.floor(Math.random() * 4) + 2);
      for (let i = 0; i < joinCount; i++) {
        const progress = Math.floor(Math.random() * 80);
        participants.push({
          challenge_id: challenge.id,
          user_id: eligibleUsers[i].id,
          status: progress >= 100 ? 'completed' : 'in_progress',
          progress,
          contribution_value: progress * 0.3,
          xp_earned: 0,
        });
      }
    }
    await ChallengeParticipant.bulkCreate(participants, { ignoreDuplicates: true });
    logger.info(`✅ Created ${participants.length} challenge participants`);

    // ─── Department ESG Recalculation ──────────────────────────────────────────────
    for (const dept of departments) {
      await gamificationService.updateDepartmentESGScore(dept.id);
    }
    logger.info('✅ Department ESG scores updated');

    // ─── Check and Auto-Award Badges ──────────────────────────────────────────────
    for (const user of users) {
      await gamificationService.checkAndAwardBadges(user.id);
    }
    logger.info('✅ Badge auto-award check complete');

    logger.info('\n🎉 SEED COMPLETE! Login credentials:');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('Admin:   admin@greenquest.io / password123');
    logger.info('Manager: sarah.chen@greenquest.io / password123');
    logger.info('Demo:    demo@greenquest.io / password123');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    logger.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
