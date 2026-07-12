// ============================================================
// ESG Analytics Platform - Calculations Engine
// Implements all ESG score formulas, rankings, and analytics
// ============================================================
window.ESG_CALC = {

  // ── Core Score Calculator ────────────────────────────────────
  // S_E = 0.4*carbon + 0.3*energy + 0.2*waste + 0.1*water
  // S_S = 0.3*participation + 0.3*volunteerHours + 0.2*training + 0.2*wellness
  // S_G = 0.4*conduct + 0.3*audit + 0.2*security + 0.1*policy
  // S_ESG = 0.4*E + 0.3*S + 0.3*G
  calculateScores: function(filters) {
    const data = window.ESG_DATA;
    filters = filters || {};

    let employees = data.employees;
    if (filters.deptId)  employees = employees.filter(e => e.deptId === filters.deptId);
    if (filters.empId)   employees = employees.filter(e => e.id === filters.empId);
    if (employees.length === 0) return { environmental:0, social:0, governance:0, overall:0, subMetrics:{} };

    const activeDepts = filters.deptId
      ? data.departments.filter(d => d.id === filters.deptId)
      : data.departments;

    // Per-dept environmental baselines
    const deptEBase = {
      eng:   { energy:55, waste:75, water:80, targetC:220 },
      sales: { energy:40, waste:60, water:70, targetC:200 },
      hr:    { energy:45, waste:85, water:85, targetC:80  },
      fin:   { energy:35, waste:90, water:75, targetC:90  },
      ops:   { energy:30, waste:50, water:65, targetC:360 },
      it:    { energy:60, waste:72, water:82, targetC:140 }
    };
    const deptAuditBase = { eng:95, sales:90, hr:95, fin:98, ops:88, it:96 };

    // ── Environmental ─────────────────────────────────────────
    let carbonTarget=0, carbonActual=0, totalEnergy=0, totalWaste=0, totalWater=0;
    activeDepts.forEach(d => {
      const base = deptEBase[d.id] || { energy:40, waste:65, water:70, targetC:150 };
      totalEnergy  += base.energy;
      totalWaste   += base.waste;
      totalWater   += base.water;
      carbonTarget += base.targetC;
      const cd = data.carbonFootprint.datasets[d.id];
      if (cd) {
        const monthIdx = this._getMonthIndices(filters);
        const s1 = monthIdx.reduce((s,i) => s + cd.scope1[i], 0) / monthIdx.length;
        const s2 = monthIdx.reduce((s,i) => s + cd.scope2[i], 0) / monthIdx.length;
        const s3 = monthIdx.reduce((s,i) => s + cd.scope3[i], 0) / monthIdx.length;
        carbonActual += s1 + s2 + s3;
      }
    });

    const energyScore = totalEnergy / activeDepts.length;
    const wasteScore  = totalWaste  / activeDepts.length;
    const waterScore  = totalWater  / activeDepts.length;

    // Carbon score: 100 minus % over target (capped 0–100)
    const avgCarbonTarget = carbonTarget / activeDepts.length;
    const avgCarbonActual = carbonActual / activeDepts.length;
    let carbonScore = Math.max(0, Math.min(100, 100 - ((avgCarbonActual - avgCarbonTarget) / avgCarbonTarget) * 100));

    const eScore = Math.round(0.4 * carbonScore + 0.3 * energyScore + 0.2 * wasteScore + 0.1 * waterScore);

    // ── Social ────────────────────────────────────────────────
    const totalEmp = employees.length;
    const participated = employees.filter(e => e.challengesCompleted > 0).length;
    const participationRate = (participated / totalEmp) * 100;

    const avgHours = employees.reduce((s, e) => s + e.volunteerHours, 0) / totalEmp;
    const volunteerScore = Math.min(100, (avgHours / 20) * 100);

    const deiDone = employees.filter(e => e.complianceStatus.dei).length;
    const trainingScore = (deiDone / totalEmp) * 100;

    const avgChallenges = employees.reduce((s, e) => s + e.challengesCompleted, 0) / totalEmp;
    const wellnessScore = Math.min(100, (avgChallenges / 5) * 100);

    const sScore = Math.round(0.3 * participationRate + 0.3 * volunteerScore + 0.2 * trainingScore + 0.2 * wellnessScore);

    // ── Governance ────────────────────────────────────────────
    const conductDone   = employees.filter(e => e.complianceStatus.conduct).length;
    const complianceScore = (conductDone / totalEmp) * 100;

    let totalAudit = 0;
    activeDepts.forEach(d => { totalAudit += (deptAuditBase[d.id] || 88); });
    const auditScore = totalAudit / activeDepts.length;

    const securityDone = employees.filter(e => e.complianceStatus.security).length;
    const securityScore = (securityDone / totalEmp) * 100;

    const briberyDone = employees.filter(e => e.complianceStatus.bribery).length;
    const policyScore = (briberyDone / totalEmp) * 100;

    const gScore = Math.round(0.4 * complianceScore + 0.3 * auditScore + 0.2 * securityScore + 0.1 * policyScore);

    // ── Overall ESG ───────────────────────────────────────────
    const overallScore = Math.round(0.4 * eScore + 0.3 * sScore + 0.3 * gScore);

    return {
      environmental: eScore,
      social:        sScore,
      governance:    gScore,
      overall:       overallScore,
      subMetrics: {
        carbon:       Math.round(carbonScore),
        energy:       Math.round(energyScore),
        waste:        Math.round(wasteScore),
        water:        Math.round(waterScore),
        participation: Math.round(participationRate),
        volunteerHours: Math.round(avgHours),
        deiTraining:  Math.round(trainingScore),
        wellness:     Math.round(wellnessScore),
        conduct:      Math.round(complianceScore),
        audit:        Math.round(auditScore),
        security:     Math.round(securityScore),
        policy:       Math.round(policyScore)
      }
    };
  },

  // ── Month Index Helper ────────────────────────────────────────
  // Returns array of month indices (0=Jul2025…11=Jun2026) for a filter
  _getMonthIndices: function(filters) {
    if (!filters || !filters.period) return [0,1,2,3,4,5,6,7,8,9,10,11]; // all 12
    const p = filters.period;
    if (p === "Q1") return [6,7,8];   // Jan–Mar 2026 (indices 6,7,8)
    if (p === "Q2") return [9,10,11]; // Apr–Jun 2026 (indices 9,10,11)
    if (p === "Q3") return [0,1,2];   // Jul–Sep 2025 (indices 0,1,2) – historical proxy
    if (p === "2026") return [6,7,8,9,10,11]; // Jan–Jun 2026 available
    if (p === "2025") return [0,1,2,3,4,5];   // Jul–Dec 2025
    // Monthly: map "2026-01" → index 6, "2026-02"→7 … "2026-07"→last
    const monthMap = {"2026-01":6,"2026-02":7,"2026-03":8,"2026-04":9,"2026-05":10,"2026-06":11,"2025-07":0,"2025-08":1,"2025-09":2,"2025-10":3,"2025-11":4,"2025-12":5};
    return monthMap[p] !== undefined ? [monthMap[p]] : [0,1,2,3,4,5,6,7,8,9,10,11];
  },

  // ── Carbon Trends ─────────────────────────────────────────────
  calculateCarbonTrends: function(filters) {
    const data = window.ESG_DATA;
    const months = data.carbonFootprint.months;
    const scope1 = new Array(12).fill(0);
    const scope2 = new Array(12).fill(0);
    const scope3 = new Array(12).fill(0);

    data.departments.forEach(d => {
      if (filters && filters.deptId && filters.deptId !== d.id) return;
      const cd = data.carbonFootprint.datasets[d.id];
      if (!cd) return;
      for (let i = 0; i < 12; i++) {
        scope1[i] += cd.scope1[i];
        scope2[i] += cd.scope2[i];
        scope3[i] += cd.scope3[i];
      }
    });

    const total = [];
    for (let i = 0; i < 12; i++) {
      total.push(+(scope1[i] + scope2[i] + scope3[i]).toFixed(1));
      scope1[i] = +scope1[i].toFixed(1);
      scope2[i] = +scope2[i].toFixed(1);
      scope3[i] = +scope3[i].toFixed(1);
    }
    return { months, scope1, scope2, scope3, total };
  },

  // ── Department Rankings ───────────────────────────────────────
  getDepartmentRankings: function(filters) {
    return window.ESG_DATA.departments.map(d => {
      const scores = this.calculateScores({ ...(filters||{}), deptId: d.id });
      return { id:d.id, name:d.name, head:d.head, headcount:d.headcount,
               e:scores.environmental, s:scores.social, g:scores.governance, overall:scores.overall };
    }).sort((a, b) => b.overall - a.overall);
  },

  // ── Challenge Analytics ───────────────────────────────────────
  getChallengeStats: function(filters) {
    let challenges = window.ESG_DATA.challenges;
    if (filters) {
      if (filters.category)    challenges = challenges.filter(c => c.category === filters.category);
      if (filters.challengeId) challenges = challenges.filter(c => c.id === filters.challengeId);
      if (filters.pillar)      challenges = challenges.filter(c => c.pillar === filters.pillar);
      if (filters.period) {
        if (filters.period.startsWith("Q"))   challenges = challenges.filter(c => c.quarter === filters.period);
        else if (filters.period.match(/^\d{4}-\d{2}$/)) challenges = challenges.filter(c => c.month === filters.period);
        else if (filters.period.match(/^\d{4}$/))       challenges = challenges.filter(c => c.month.startsWith(filters.period));
      }
    }
    return challenges.map(c => ({
      ...c,
      completionRate: Math.min(100, Math.round((c.current / c.target) * 100)),
      enrollmentRate: Math.round((c.participants / c.totalEligible) * 100)
    }));
  },

  // ── Compliance Analytics (per-module) ────────────────────────
  getComplianceAnalytics: function(filters) {
    let employees = window.ESG_DATA.employees;
    if (filters && filters.deptId) employees = employees.filter(e => e.deptId === filters.deptId);
    const total = employees.length || 1;

    const modules = [
      { key:"conduct",  name:"Code of Conduct",       pillar:"G" },
      { key:"security", name:"Cybersecurity Training", pillar:"G" },
      { key:"bribery",  name:"Anti-Bribery Policy",   pillar:"G" },
      { key:"dei",      name:"DEI Foundations",        pillar:"S" }
    ];

    return modules.map(m => {
      const done = employees.filter(e => e.complianceStatus[m.key]).length;
      return { ...m, completed:done, total, rate:Math.round((done/total)*100) };
    });
  },

  // ── Reward Analytics ──────────────────────────────────────────
  getRewardAnalytics: function(filters) {
    let redemptions = window.ESG_DATA.redemptions;
    if (filters) {
      if (filters.period) {
        if (filters.period.startsWith("Q"))   redemptions = redemptions.filter(r => r.quarter === filters.period);
        else if (filters.period.match(/^\d{4}-\d{2}$/)) redemptions = redemptions.filter(r => r.month === filters.period);
      }
      if (filters.empId) redemptions = redemptions.filter(r => r.empId === filters.empId);
    }

    const totalPointsRedeemed = redemptions.reduce((s, r) => s + r.points, 0);
    const totalTransactions = redemptions.length;

    // Points by category
    const byCat = {};
    redemptions.forEach(r => {
      const reward = window.ESG_DATA.rewardsCatalog.find(rw => rw.id === r.rewardId);
      if (reward) { byCat[reward.category] = (byCat[reward.category] || 0) + r.points; }
    });

    // Points by month
    const monthlyPoints = {};
    redemptions.forEach(r => {
      monthlyPoints[r.month] = (monthlyPoints[r.month] || 0) + r.points;
    });

    return { redemptions, totalPointsRedeemed, totalTransactions, byCategory:byCat, byMonth:monthlyPoints };
  },

  // ── Badge Analytics ───────────────────────────────────────────
  getBadgeAnalytics: function(filters) {
    let employees = window.ESG_DATA.employees;
    if (filters && filters.deptId) employees = employees.filter(e => e.deptId === filters.deptId);

    // Badge count distribution
    const counts = {};
    employees.forEach(e => {
      e.badges.forEach(b => { counts[b] = (counts[b] || 0) + 1; });
    });

    // Per department badge counts
    const byDept = {};
    window.ESG_DATA.departments.forEach(d => {
      const deptEmps = employees.filter(e => e.deptId === d.id);
      let total = 0;
      deptEmps.forEach(e => { total += e.badges.length; });
      byDept[d.name] = total;
    });

    const totalBadges = Object.values(counts).reduce((a, b) => a + b, 0);
    const topEarners = [...employees].sort((a,b) => b.badges.length - a.badges.length).slice(0, 5);

    return { counts, byDept, totalBadges, topEarners };
  },

  // ── Top Performers ────────────────────────────────────────────
  getTopPerformers: function(n) {
    n = n || 5;
    return [...window.ESG_DATA.employees]
      .sort((a,b) => b.rewardPoints - a.rewardPoints)
      .slice(0, n)
      .map(e => {
        const dept = window.ESG_DATA.departments.find(d => d.id === e.deptId);
        return { ...e, deptName: dept ? dept.name : "—" };
      });
  },

  // ── ESG Score History (for trend line) ───────────────────────
  getScoreHistory: function() {
    return window.ESG_DATA.monthlyScoreHistory;
  }
};
