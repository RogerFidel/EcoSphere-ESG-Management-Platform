// ============================================================
// ESG Analytics Portal – Application Router & Controller
// Manages navigation, filters, period switching, and rendering
// ============================================================
(function() {
  'use strict';

  // ── Application State ────────────────────────────────────────
  const state = {
    activeView: 'overall-dashboard',
    filters: {
      period:     '',
      deptId:     '',
      empId:      '',
      challengeId:'',
      category:   '',
      module:     ''
    },
    frequency: 'yearly'  // yearly | quarterly | monthly
  };

  // ── View Metadata ────────────────────────────────────────────
  const VIEWS = {
    'overall-dashboard':     { title:'Overall ESG Dashboard',         desc:'Consolidated ESG Pillar Performance and Target Progress',            render: () => ESG_DASHBOARDS.renderOverall(state.filters) },
    'env-dashboard':         { title:'Environmental Dashboard',        desc:'Carbon, Energy, Waste and Water Environmental Indicators',           render: () => ESG_DASHBOARDS.renderEnvironmental(state.filters) },
    'soc-dashboard':         { title:'Social Dashboard',               desc:'Volunteer, Training, Participation and Wellness Indicators',         render: () => ESG_DASHBOARDS.renderSocial(state.filters) },
    'gov-dashboard':         { title:'Governance Dashboard',           desc:'Audit, Compliance, Ethics and Incident Management',                  render: () => ESG_DASHBOARDS.renderGovernance(state.filters) },
    'dept-dashboard':        { title:'Department Dashboard',           desc:'Department Rankings and Comparative ESG Analysis',                   render: () => ESG_DASHBOARDS.renderDepartment(state.filters) },
    'emp-dashboard':         { title:'Employee Dashboard',             desc:'Individual Employee ESG Activity, Compliance, and Badges',           render: () => ESG_DASHBOARDS.renderEmployee(state.filters) },
    'leader-dashboard':      { title:'Leaderboard Dashboard',          desc:'Top Department and Employee ESG Rankings',                           render: () => ESG_DASHBOARDS.renderLeaderboard(state.filters) },
    'analytics-dashboard':   { title:'Analytics Dashboard',            desc:'Multi-Dimensional ESG Data Matrix – Cross-Filter Explorer',          render: () => ESG_DASHBOARDS.renderAnalytics(state.filters) },
    // Analytics sub-panels
    'challenge-analytics':   { title:'Challenge Analytics',            desc:'CSR Challenge Completion, Enrollment, and Participation Metrics',    render: () => ESG_DASHBOARDS.renderChallengeAnalytics(state.filters) },
    'compliance-analytics':  { title:'Compliance Analytics',           desc:'Training Module Completion by Employee, Department, and Quarter',    render: () => ESG_DASHBOARDS.renderComplianceAnalytics(state.filters) },
    'reward-analytics':      { title:'Reward Analytics',               desc:'CSR Reward Redemptions, Points Breakdown, and Trends',               render: () => ESG_DASHBOARDS.renderRewardAnalytics(state.filters) },
    'badge-analytics':       { title:'Badge Analytics',                desc:'Earned Badge Distribution, Top Earners, and Badge Catalogue',        render: () => ESG_DASHBOARDS.renderBadgeAnalytics(state.filters) },
    // Reports
    'summary-report':        { title:'ESG Summary Report',             desc:'Consolidated FY 2026 ESG Performance Report',                        render: () => ESG_REPORTS.renderSummary(state.filters) },
    'env-report':            { title:'Environmental Report',           desc:'Detailed Environmental Sustainability Report with Emission Data',     render: () => ESG_REPORTS.renderEnvironmental(state.filters) },
    'soc-report':            { title:'Social Responsibility Report',   desc:'Detailed Social Pillar Report – Volunteering, CSR, DEI',             render: () => ESG_REPORTS.renderSocial(state.filters) },
    'gov-report':            { title:'Governance & Ethics Report',     desc:'Compliance, Audit, Incident and Policy Governance Report',            render: () => ESG_REPORTS.renderGovernance(state.filters) },
    'custom-report':         { title:'Custom Report Builder',          desc:'Build a custom ESG report by selecting sections, filters, and format',render: () => ESG_REPORTS.renderCustomBuilder(state.filters) }
  };

  // ── Render Active View ────────────────────────────────────────
  function renderView() {
    const view = VIEWS[state.activeView];
    if (!view) return;

    // Update page header
    document.getElementById('active-page-title').textContent = view.title;
    document.getElementById('active-page-desc').textContent  = view.desc;

    // Animate container
    const content = document.getElementById('dashboard-content');
    content.style.opacity = '0';
    setTimeout(() => {
      try { view.render(); } catch(e) { console.error('Render error:', e); content.innerHTML = `<div class="card"><p style="color:#ef4444;">Error rendering view: ${e.message}</p></div>`; }
      content.style.opacity = '1';
      content.style.transition = 'opacity 0.25s ease';
    }, 80);

    // Sync active nav link
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.view === state.activeView);
    });
  }

  // ── Navigation ────────────────────────────────────────────────
  function navigateTo(viewId) {
    if (!VIEWS[viewId]) return;
    state.activeView = viewId;
    renderView();
  }

  // ── Period Options by Frequency ───────────────────────────────
  function buildPeriodOptions(freq) {
    const el = document.getElementById('filter-period');
    if (!el) return;
    el.innerHTML = '<option value="">All Periods</option>';
    const periods = window.ESG_DATA.periods[freq] || [];
    periods.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.value;
      opt.textContent = p.label;
      el.appendChild(opt);
    });
    // Restore previously selected period if still available
    const available = periods.map(p => p.value);
    if (state.filters.period && !available.includes(state.filters.period)) {
      state.filters.period = '';
      el.value = '';
    } else {
      el.value = state.filters.period || '';
    }
  }

  // ── Populate Filter Dropdowns ─────────────────────────────────
  function populateFilters() {
    const deptEl  = document.getElementById('filter-dept');
    const empEl   = document.getElementById('filter-employee');
    const chalEl  = document.getElementById('filter-challenge');
    const catEl   = document.getElementById('filter-category');
    const modEl   = document.getElementById('filter-module');

    // Departments
    window.ESG_DATA.departments.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id; opt.textContent = d.name;
      deptEl.appendChild(opt);
    });

    // Employees
    window.ESG_DATA.employees.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id; opt.textContent = e.name;
      empEl.appendChild(opt);
    });

    // Challenges
    window.ESG_DATA.challenges.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.name;
      chalEl.appendChild(opt);
    });

    // Categories
    ['Environmental','Social','Governance'].forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      catEl.appendChild(opt);
    });

    // Governance Modules
    ['Code of Conduct','Cybersecurity Training','Anti-Bribery Policy','DEI Foundations'].forEach(m => {
      const opt = document.createElement('option');
      opt.value = m; opt.textContent = m;
      modEl.appendChild(opt);
    });
  }

  // ── Bind Filter Events ────────────────────────────────────────
  function bindFilterEvents() {
    const filterMap = {
      'filter-period':    'period',
      'filter-dept':      'deptId',
      'filter-employee':  'empId',
      'filter-challenge': 'challengeId',
      'filter-category':  'category',
      'filter-module':    'module'
    };

    Object.entries(filterMap).forEach(([id, stateKey]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        state.filters[stateKey] = el.value;
        renderView();
      });
    });
  }

  // ── Bind Period Switcher ──────────────────────────────────────
  function bindPeriodSwitcher() {
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.frequency = btn.dataset.freq;
        state.filters.period = '';

        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        buildPeriodOptions(state.frequency);
        renderView();
      });
    });
  }

  // ── Bind Sidebar Navigation ───────────────────────────────────
  function bindNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const view = link.dataset.view;
        if (view) navigateTo(view);
      });
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────
  function init() {
    populateFilters();
    buildPeriodOptions(state.frequency);
    bindNav();
    bindFilterEvents();
    bindPeriodSwitcher();

    // Initial render
    renderView();

    console.log('[ESG Portal] Initialized successfully. Available views:', Object.keys(VIEWS).join(', '));
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Expose API for inline event handlers ─────────────────────
  window.ESG_APP = { navigateTo, state };

})();
