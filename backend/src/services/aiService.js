/**
 * AIService — OpenAI-powered ESG insights, predictions, and recommendations
 */
const OpenAI = require('openai');
const { AIInsight, User, Department, ESGAction, DepartmentESGScore, ChallengeParticipant } = require('../models');
const { cache } = require('../config/redis');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AIService {
  constructor() {
    this.client = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
  }

  async chat(systemPrompt, userPrompt, maxTokens = 1500) {
    if (!this.client) {
      // Return mock response if no API key
      return this.getMockResponse(userPrompt);
    }
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (err) {
      logger.error('OpenAI API error:', err.message);
      return this.getMockResponse(userPrompt);
    }
  }

  getMockResponse(prompt) {
    // Intelligent mock responses for demo/offline mode
    return {
      title: 'AI-Generated ESG Insight',
      content: 'Based on your sustainability data, you\'re making great progress. Consider focusing on energy reduction and waste management to maximize your ESG score.',
      recommendations: [
        { action: 'Switch to LED lighting', impact: 'High', carbon_reduction_kg: 150, difficulty: 'Low' },
        { action: 'Implement carpooling program', impact: 'High', carbon_reduction_kg: 300, difficulty: 'Medium' },
        { action: 'Start composting program', impact: 'Medium', carbon_reduction_kg: 80, difficulty: 'Low' },
        { action: 'Install solar panels', impact: 'Very High', carbon_reduction_kg: 2000, difficulty: 'High' },
      ],
      risk_level: 'low',
      confidence_score: 0.82,
      predicted_esg_score: 75,
      trend: 'improving',
    };
  }

  // ─── Carbon Reduction Suggestions ─────────────────────────────────────────────

  async getCarbonReductionSuggestions(userId) {
    const cacheKey = `ai:carbon:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findByPk(userId, {
      include: [{ association: 'esgActions', as: 'esgActions', limit: 50, order: [['performed_at', 'DESC']] }],
    });
    if (!user) throw new Error('User not found');

    const categoryCounts = {};
    user.esgActions.forEach((a) => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    const systemPrompt = `You are an expert ESG sustainability advisor. Analyze the user's sustainability data and provide actionable carbon reduction recommendations. Always respond with valid JSON.`;

    const userPrompt = `
Analyze this employee's sustainability profile and provide carbon reduction suggestions:
- Name: ${user.name}
- ESG Score: ${user.esg_score}/100
- Carbon Saved: ${user.carbon_saved_kg} kg
- Total Actions: ${user.actions_completed}
- Level: ${user.level_name}
- Action Categories: ${JSON.stringify(categoryCounts)}

Respond with JSON in this exact format:
{
  "title": "Carbon Reduction Plan for [Name]",
  "content": "2-3 sentence summary",
  "recommendations": [
    {
      "action": "action name",
      "impact": "High/Medium/Low",
      "carbon_reduction_kg": number,
      "difficulty": "Easy/Medium/Hard",
      "timeframe": "days to implement",
      "category": "category name",
      "reasoning": "why this is recommended"
    }
  ],
  "risk_level": "low/medium/high/critical",
  "confidence_score": 0.0-1.0,
  "priority_areas": ["area1", "area2"],
  "estimated_annual_reduction_kg": number
}`;

    const response = await this.chat(systemPrompt, userPrompt);

    const insight = await AIInsight.create({
      user_id: userId,
      type: 'carbon_reduction',
      title: response.title || 'Carbon Reduction Suggestions',
      content: response.content || '',
      recommendations: response.recommendations || [],
      risk_level: response.risk_level || 'low',
      confidence_score: response.confidence_score || 0.8,
      data_snapshot: { categoryCounts, esg_score: user.esg_score },
      model_used: this.model,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await notificationService.sendAIInsightNotification(userId, insight);
    await cache.set(cacheKey, { insight, response }, 3600); // 1h cache
    return { insight, response };
  }

  // ─── Smart ESG Insights ────────────────────────────────────────────────────────

  async getSmartESGInsights(userId) {
    const cacheKey = `ai:esg-insights:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findByPk(userId, {
      include: [
        { association: 'esgActions', as: 'esgActions', limit: 100 },
        { association: 'department', as: 'department' },
        { association: 'streak', as: 'streak' },
      ],
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActions = user.esgActions.filter((a) => new Date(a.performed_at) >= thirtyDaysAgo);

    const systemPrompt = `You are an AI ESG analyst providing insights for corporate sustainability programs. Be specific, data-driven, and encouraging. Respond with valid JSON only.`;

    const userPrompt = `
Generate smart ESG insights for this employee:
- ESG Score: ${user.esg_score}/100
- Level: ${user.level_name}
- Carbon Saved Total: ${user.carbon_saved_kg} kg
- Total Actions: ${user.actions_completed}
- Actions Last 30 Days: ${recentActions.length}
- Department: ${user.department?.name || 'N/A'}
- Current Streak: ${user.streak?.current_streak || 0} days

Respond with JSON:
{
  "title": "ESG Performance Insights",
  "content": "3-4 sentence comprehensive analysis",
  "key_strengths": ["strength1", "strength2"],
  "improvement_areas": ["area1", "area2"],
  "esg_score_breakdown": {
    "environmental": number,
    "social": number,
    "governance": number
  },
  "comparison": {
    "above_average_in": ["category"],
    "below_average_in": ["category"]
  },
  "next_milestone": "description of next achievement to aim for",
  "risk_level": "low/medium/high",
  "confidence_score": 0.0-1.0,
  "recommendations": [{"action": "...", "impact": "...", "category": "..."}]
}`;

    const response = await this.chat(systemPrompt, userPrompt);

    const insight = await AIInsight.create({
      user_id: userId,
      type: 'esg_insight',
      title: response.title || 'Smart ESG Insights',
      content: response.content || '',
      recommendations: response.recommendations || [],
      risk_level: response.risk_level || 'low',
      confidence_score: response.confidence_score || 0.8,
      data_snapshot: { esg_score: user.esg_score, actions: user.actions_completed },
      model_used: this.model,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    await cache.set(cacheKey, { insight, response }, 3600);
    return { insight, response };
  }

  // ─── Department Performance Prediction ────────────────────────────────────────

  async getDepartmentPrediction(departmentId) {
    const cacheKey = `ai:dept-prediction:${departmentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const department = await Department.findByPk(departmentId, {
      include: [{ association: 'members', as: 'members', attributes: ['xp_total', 'esg_score', 'carbon_saved_kg', 'actions_completed'] }],
    });
    if (!department) throw new Error('Department not found');

    const scores = await DepartmentESGScore.findAll({
      where: { department_id: departmentId },
      order: [['created_at', 'DESC']],
      limit: 6,
    });

    const systemPrompt = `You are an AI performance analyst for ESG sustainability programs. Provide data-driven predictions and recommendations. Respond with valid JSON only.`;

    const userPrompt = `
Analyze and predict department performance:
Department: ${department.name}
Members: ${department.member_count}
Current ESG Score: ${department.esg_score}
Total Carbon Saved: ${department.total_carbon_saved_kg} kg
Historical Scores: ${JSON.stringify(scores.map((s) => ({ period: s.period, score: s.esg_score })))}

Respond with JSON:
{
  "title": "Performance Prediction: ${department.name}",
  "content": "Analysis and prediction summary",
  "predicted_next_quarter_score": number,
  "trend": "improving/stable/declining",
  "risk_factors": ["risk1", "risk2"],
  "growth_opportunities": ["opp1", "opp2"],
  "benchmarks": {
    "vs_company_average": "above/below/at",
    "percentile": number
  },
  "recommendations": [{"action": "...", "expected_impact": "...", "priority": "high/medium/low"}],
  "risk_level": "low/medium/high/critical",
  "confidence_score": 0.0-1.0
}`;

    const response = await this.chat(systemPrompt, userPrompt, 1200);

    const insight = await AIInsight.create({
      department_id: departmentId,
      type: 'performance_prediction',
      title: response.title || `Prediction: ${department.name}`,
      content: response.content || '',
      recommendations: response.recommendations || [],
      risk_level: response.risk_level || 'low',
      confidence_score: response.confidence_score || 0.8,
      data_snapshot: { department_id: departmentId, esg_score: department.esg_score },
      model_used: this.model,
    });

    await cache.set(cacheKey, { insight, response }, 7200);
    return { insight, response };
  }

  // ─── Goal Completion Prediction ────────────────────────────────────────────────

  async getGoalCompletionPrediction(userId, challengeId) {
    const { Challenge } = require('../models');
    const challenge = await Challenge.findByPk(challengeId);
    const participant = await ChallengeParticipant.findOne({
      where: { user_id: userId, challenge_id: challengeId },
    });

    if (!challenge || !participant) throw new Error('Challenge or participant not found');

    const user = await User.findByPk(userId);
    const daysLeft = Math.max(0, Math.ceil((new Date(challenge.ends_at) - new Date()) / (1000 * 60 * 60 * 24)));

    const systemPrompt = `You are an AI goal completion analyst. Predict likelihood of challenge completion and provide motivation. Respond with JSON only.`;

    const userPrompt = `
Predict challenge completion:
Challenge: "${challenge.title}" (${challenge.category})
Current Progress: ${participant.progress}%
Days Remaining: ${daysLeft}
User Level: ${user.level_name}
User ESG Score: ${user.esg_score}
User Actions: ${user.actions_completed}

Respond with JSON:
{
  "completion_probability": 0.0-1.0,
  "predicted_completion_date": "date or null",
  "status": "on_track/behind/ahead/at_risk",
  "motivational_message": "encouraging message",
  "action_items": ["specific action 1", "specific action 2"],
  "risk_level": "low/medium/high",
  "confidence_score": 0.0-1.0
}`;

    const response = await this.chat(systemPrompt, userPrompt, 800);

    const insight = await AIInsight.create({
      user_id: userId,
      type: 'goal_prediction',
      title: `Goal Prediction: ${challenge.title}`,
      content: response.motivational_message || '',
      recommendations: response.action_items?.map((a) => ({ action: a })) || [],
      risk_level: response.risk_level || 'low',
      confidence_score: response.confidence_score || 0.8,
      data_snapshot: { challenge_id: challengeId, progress: participant.progress, days_left: daysLeft },
      model_used: this.model,
    });

    return { insight, response };
  }

  // ─── Risk Alerts ───────────────────────────────────────────────────────────────

  async generateRiskAlerts(departmentId) {
    const department = await Department.findByPk(departmentId, {
      include: [{ association: 'members', as: 'members', attributes: ['id', 'esg_score', 'actions_completed', 'last_login'] }],
    });
    if (!department) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const inactiveMembers = department.members.filter(
      (m) => !m.last_login || new Date(m.last_login) < thirtyDaysAgo
    );

    const avgESG = department.members.length > 0
      ? department.members.reduce((s, m) => s + m.esg_score, 0) / department.members.length
      : 0;

    const systemPrompt = `You are a risk analyst for corporate ESG programs. Identify and prioritize sustainability risks. Respond with JSON only.`;

    const userPrompt = `
Identify ESG risks for department:
Department: ${department.name}
Avg ESG Score: ${avgESG.toFixed(1)}/100
Inactive Members (30+ days): ${inactiveMembers.length}/${department.member_count}
Total Carbon Saved: ${department.total_carbon_saved_kg} kg
Total XP: ${department.total_xp}

Respond with JSON:
{
  "title": "Risk Assessment: ${department.name}",
  "content": "Summary of identified risks",
  "risks": [{"risk": "description", "severity": "critical/high/medium/low", "mitigation": "action"}],
  "overall_risk_level": "low/medium/high/critical",
  "urgency_score": 0-100,
  "recommended_actions": ["action1", "action2"],
  "confidence_score": 0.0-1.0
}`;

    const response = await this.chat(systemPrompt, userPrompt, 1000);

    const insight = await AIInsight.create({
      department_id: departmentId,
      type: 'risk_alert',
      title: response.title || `Risk Alert: ${department.name}`,
      content: response.content || '',
      recommendations: response.recommended_actions?.map((a) => ({ action: a })) || [],
      risk_level: response.overall_risk_level || 'medium',
      confidence_score: response.confidence_score || 0.8,
      data_snapshot: { avg_esg: avgESG, inactive_count: inactiveMembers.length },
      model_used: this.model,
    });

    // Broadcast to department if critical
    if (response.overall_risk_level === 'critical' || response.overall_risk_level === 'high') {
      await notificationService.sendAIInsightNotification(null, insight);
    }

    return { insight, response };
  }

  // ─── Personal ESG Score Analysis ──────────────────────────────────────────────

  async getPersonalESGScore(userId) {
    const cacheKey = `ai:personal-esg:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findByPk(userId, {
      include: [
        { association: 'esgActions', as: 'esgActions', limit: 100 },
        { association: 'userBadges', as: 'userBadges' },
        { association: 'streak', as: 'streak' },
        { association: 'department', as: 'department' },
      ],
    });

    const systemPrompt = `You are an ESG scoring expert. Provide a detailed personal ESG score breakdown and interpretation. Respond with JSON only.`;

    const userPrompt = `
Calculate and explain personal ESG score:
Current Score: ${user.esg_score}/100
Actions: ${user.actions_completed}
Carbon Saved: ${user.carbon_saved_kg} kg
Badges: ${user.userBadges.length}
Current Streak: ${user.streak?.current_streak || 0}
Level: ${user.level_name}

Respond with JSON:
{
  "title": "Personal ESG Score Analysis",
  "overall_score": ${user.esg_score},
  "breakdown": {
    "environmental": number,
    "social": number,
    "governance": number
  },
  "score_interpretation": "what the score means",
  "percentile": number,
  "rating": "Excellent/Good/Average/Below Average/Poor",
  "key_factors": ["factor1", "factor2"],
  "improvement_tips": [{"tip": "...", "potential_score_gain": number}],
  "benchmark_comparison": "How this compares to average employees",
  "confidence_score": 0.0-1.0
}`;

    const response = await this.chat(systemPrompt, userPrompt, 1200);

    const insight = await AIInsight.create({
      user_id: userId,
      type: 'personal_score',
      title: 'Personal ESG Score Analysis',
      content: response.score_interpretation || '',
      recommendations: response.improvement_tips?.map((t) => ({ action: t.tip, impact: `+${t.potential_score_gain} score` })) || [],
      risk_level: response.overall_score < 30 ? 'high' : response.overall_score < 60 ? 'medium' : 'low',
      confidence_score: response.confidence_score || 0.85,
      data_snapshot: { esg_score: user.esg_score, actions: user.actions_completed },
      model_used: this.model,
    });

    await cache.set(cacheKey, { insight, response }, 3600);
    return { insight, response };
  }

  // ─── Department ESG Comparison ────────────────────────────────────────────────

  async getDepartmentComparison() {
    const cacheKey = 'ai:dept-comparison';
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const departments = await Department.findAll({
      include: [{ association: 'members', as: 'members', attributes: ['esg_score', 'carbon_saved_kg'] }],
      order: [['esg_score', 'DESC']],
    });

    const comparisonData = departments.map((d) => ({
      name: d.name,
      esg_score: d.esg_score,
      carbon_saved: d.total_carbon_saved_kg,
      members: d.member_count,
      avg_xp: d.member_count > 0 ? Math.round(d.total_xp / d.member_count) : 0,
    }));

    const systemPrompt = `You are an organizational ESG analyst. Compare department performance and provide strategic insights. Respond with JSON only.`;

    const userPrompt = `
Compare ESG performance across departments:
${JSON.stringify(comparisonData, null, 2)}

Respond with JSON:
{
  "title": "Department ESG Comparison",
  "content": "Summary of comparison findings",
  "rankings": [{"department": "name", "rank": number, "strengths": ["s1"], "weaknesses": ["w1"]}],
  "best_practices": ["practice from top dept 1", "practice 2"],
  "gaps": [{"from_dept": "name", "to_dept": "name", "gap": number, "recommendations": ["rec"]}],
  "company_average_esg": number,
  "trend": "improving/stable/declining",
  "recommendations": [{"action": "...", "target_department": "...", "impact": "..."}]
}`;

    const response = await this.chat(systemPrompt, userPrompt, 1500);

    const insight = await AIInsight.create({
      type: 'department_comparison',
      title: 'Department ESG Comparison',
      content: response.content || '',
      recommendations: response.recommendations || [],
      risk_level: 'low',
      confidence_score: 0.85,
      data_snapshot: { departments: comparisonData },
      model_used: this.model,
    });

    await cache.set(cacheKey, { insight, response }, 7200);
    return { insight, response };
  }

  // ─── Recommendation Engine ────────────────────────────────────────────────────

  async getPersonalizedRecommendations(userId) {
    const cacheKey = `ai:recommendations:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findByPk(userId, {
      include: [
        { association: 'esgActions', as: 'esgActions', limit: 30, order: [['performed_at', 'DESC']] },
        { association: 'userBadges', as: 'userBadges', include: [{ association: 'badge', as: 'badge' }] },
        { association: 'department', as: 'department' },
      ],
    });

    const recentCategories = [...new Set(user.esgActions.slice(0, 10).map((a) => a.category))];
    const badgeCategories = [...new Set(user.userBadges.map((ub) => ub.badge?.category).filter(Boolean))];

    const systemPrompt = `You are a personalized sustainability coach AI. Generate highly specific, actionable recommendations based on user behavior. Respond with JSON only.`;

    const userPrompt = `
Generate personalized sustainability recommendations:
User: ${user.name}
Level: ${user.level_name}
ESG Score: ${user.esg_score}
Recent Action Categories: ${recentCategories.join(', ')}
Earned Badge Categories: ${badgeCategories.join(', ')}
Actions Count: ${user.actions_completed}

Respond with JSON:
{
  "title": "Your Personalized Recommendations",
  "content": "Personalized message for the user",
  "quick_wins": [
    {"action": "...", "xp_potential": number, "time_minutes": number, "category": "..."}
  ],
  "medium_term": [
    {"action": "...", "impact": "...", "weeks_to_complete": number, "category": "..."}
  ],
  "long_term": [
    {"action": "...", "impact": "...", "carbon_reduction_kg": number, "category": "..."}
  ],
  "next_badge_suggestion": {"badge_name": "...", "how_to_earn": "...", "steps_remaining": number},
  "daily_habit": {"habit": "...", "reminder_time": "07:00", "impact": "..."},
  "confidence_score": 0.0-1.0
}`;

    const response = await this.chat(systemPrompt, userPrompt, 1500);

    const insight = await AIInsight.create({
      user_id: userId,
      type: 'recommendation',
      title: response.title || 'Personalized Recommendations',
      content: response.content || '',
      recommendations: [
        ...(response.quick_wins || []).map((r) => ({ ...r, priority: 'high' })),
        ...(response.medium_term || []).map((r) => ({ ...r, priority: 'medium' })),
        ...(response.long_term || []).map((r) => ({ ...r, priority: 'low' })),
      ],
      risk_level: 'low',
      confidence_score: response.confidence_score || 0.85,
      data_snapshot: { esg_score: user.esg_score, recent_categories: recentCategories },
      model_used: this.model,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    await cache.set(cacheKey, { insight, response }, 7200);
    return { insight, response };
  }
}

module.exports = new AIService();
