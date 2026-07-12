// ============================================================
// ESG Analytics Portal – Reports Engine
// 5 Report Types + Custom Builder + PDF / Excel / CSV Export
// ============================================================
window.ESG_REPORTS = {

  // ── Current report state ─────────────────────────────────────
  _currentHTML: '',
  _currentData: [],
  _currentTitle: 'ESG Report',

  // ────────────────────────────────────────────────────────────
  // REPORT RENDERERS
  // ────────────────────────────────────────────────────────────

  // 1. ESG SUMMARY REPORT
  renderSummary: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const dr = window.ESG_CALC.getDepartmentRankings(filters);
    const tp = window.ESG_CALC.getTopPerformers(5);
    const period = this._periodLabel(filters);
    const now = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});

    const html = `
      <div class="report-document">
        <h1>ESG Summary Report</h1>
        <div class="report-meta">
          <span><strong>Organization:</strong> GreenVista Corp</span>
          <span><strong>Report Period:</strong> ${period}</span>
          <span><strong>Generated:</strong> ${now}</span>
          <span><strong>Framework:</strong> GRI Standards / ISO 26000</span>
        </div>
        <h2>Executive Summary</h2>
        <p>This report presents the Environmental, Social, and Governance performance of GreenVista Corp for the period ${period}. The overall ESG score of <strong>${sc.overall}/100</strong> reflects continued progress across all three pillars, with Governance demonstrating particularly strong performance due to an industry-leading audit rating and 100% whistleblower case resolution.</p>
        <div class="report-kpi-row">
          <div class="report-kpi"><div class="report-kpi-val" style="color:#0ea5e9;">${sc.overall}</div><div class="report-kpi-label">Overall ESG Score</div></div>
          <div class="report-kpi"><div class="report-kpi-val" style="color:#10b981;">${sc.environmental}</div><div class="report-kpi-label">Environmental (E)</div></div>
          <div class="report-kpi"><div class="report-kpi-val" style="color:#8b5cf6;">${sc.social}</div><div class="report-kpi-label">Social (S)</div></div>
          <div class="report-kpi" style="grid-column:1;"><div class="report-kpi-val" style="color:#f59e0b;">${sc.governance}</div><div class="report-kpi-label">Governance (G)</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.carbon}</div><div class="report-kpi-label">Carbon Index</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.participation}%</div><div class="report-kpi-label">CSR Participation</div></div>
        </div>

        <hr class="section-divider">
        <h2>Pillar Performance</h2>
        <table>
          <thead><tr><th>Pillar</th><th>Score</th><th>Weight</th><th>vs Target</th><th>Trend</th></tr></thead>
          <tbody>
            <tr><td>Environmental (E)</td><td>${sc.environmental}/100</td><td>40%</td><td>${sc.environmental>=80?'✅ On Track':'⚠ Below Target'}</td><td>↑ +2.1%</td></tr>
            <tr><td>Social (S)</td><td>${sc.social}/100</td><td>30%</td><td>${sc.social>=80?'✅ On Track':'⚠ Below Target'}</td><td>↑ +1.8%</td></tr>
            <tr><td>Governance (G)</td><td>${sc.governance}/100</td><td>30%</td><td>${sc.governance>=90?'✅ On Track':'⚠ Below Target'}</td><td>↑ +3.2%</td></tr>
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Department Rankings</h2>
        <table>
          <thead><tr><th>Rank</th><th>Department</th><th>Head</th><th>Environmental</th><th>Social</th><th>Governance</th><th>Overall ESG</th></tr></thead>
          <tbody>
            ${dr.map((r,i)=>`<tr><td>${i+1}</td><td>${r.name}</td><td>${r.head}</td><td>${r.e}/100</td><td>${r.s}/100</td><td>${r.g}/100</td><td><strong>${r.overall}/100</strong></td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Top ESG Performers</h2>
        <table>
          <thead><tr><th>Rank</th><th>Employee</th><th>Department</th><th>CSR Points</th><th>Volunteer Hours</th><th>Badges</th></tr></thead>
          <tbody>
            ${tp.map((e,i)=>`<tr><td>${i+1}</td><td>${e.name}</td><td>${e.deptName}</td><td>${e.rewardPoints}</td><td>${e.volunteerHours}</td><td>${e.badges.length}</td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Key Insights & Recommendations</h2>
        <ul>
          <li>Carbon footprint reduced by 7.7% vs 2024 baseline, primarily driven by Engineering's infrastructure optimization.</li>
          <li>Volunteer engagement exceeded target: 345 total hours against a 300-hour annual goal.</li>
          <li>Governance module completion rate of ${sc.subMetrics.conduct}% leads to lower compliance risk exposure.</li>
          <li>Recommend prioritizing DEI completion gap (currently ${100-sc.subMetrics.deiTraining}% outstanding) before Q4.</li>
          <li>Operations fleet transition to EVs in Q4 2026 projected to reduce Scope 1 emissions by ~22%.</li>
        </ul>
      </div>`;

    this._currentHTML  = html;
    this._currentTitle = `ESG_Summary_Report_${period.replace(/\s/g,'_')}`;
    this._currentData  = this._flattenSummaryData(sc, dr, tp);

    document.getElementById('dashboard-content').innerHTML = `
      <div class="fade-in">
        ${this._toolbar()}
        <div class="report-preview-panel">${html}</div>
      </div>`;
  },

  // 2. ENVIRONMENTAL REPORT
  renderEnvironmental: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const tr = window.ESG_CALC.calculateCarbonTrends(filters);
    const period = this._periodLabel(filters);
    const now = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
    const em = window.ESG_DATA.environmentalMetrics;

    const html = `
      <div class="report-document">
        <h1>Environmental Sustainability Report</h1>
        <div class="report-meta">
          <span><strong>Organization:</strong> GreenVista Corp</span>
          <span><strong>Period:</strong> ${period}</span>
          <span><strong>Generated:</strong> ${now}</span>
          <span><strong>Standard:</strong> GRI 302 / GRI 305 / ISO 14064</span>
        </div>
        <h2>Environmental Score: ${sc.environmental}/100</h2>
        <p>The Environmental pillar score of <strong>${sc.environmental}/100</strong> reflects GreenVista Corp's commitment to reducing carbon emissions, increasing renewable energy usage, improving waste management, and conserving water resources.</p>

        <div class="report-kpi-row">
          <div class="report-kpi"><div class="report-kpi-val" style="color:#10b981;">${sc.subMetrics.carbon}</div><div class="report-kpi-label">Carbon Index</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.energy}%</div><div class="report-kpi-label">Renewable Energy</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.waste}%</div><div class="report-kpi-label">Waste Diverted</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.water}/100</div><div class="report-kpi-label">Water Index</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${em.treesPlaneted}</div><div class="report-kpi-label">Trees Planted</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${em.solarPanelsInstalled}</div><div class="report-kpi-label">Solar Panels</div></div>
        </div>

        <hr class="section-divider">
        <h2>Carbon Emissions – Scope 1, 2 & 3</h2>
        <p>Total Scope 1 (direct), 2 (indirect grid), and 3 (value chain) GHG emissions are tracked monthly. Total actual emissions for the fiscal year are <strong>${window.ESG_DATA.environmentalMetrics.actualCarbon} tCO2e</strong> against a baseline of <strong>${window.ESG_DATA.environmentalMetrics.baselineCarbon} tCO2e</strong> – a reduction of <strong>${window.ESG_DATA.environmentalMetrics.baselineCarbon - window.ESG_DATA.environmentalMetrics.actualCarbon} tCO2e (${(((window.ESG_DATA.environmentalMetrics.baselineCarbon - window.ESG_DATA.environmentalMetrics.actualCarbon)/window.ESG_DATA.environmentalMetrics.baselineCarbon)*100).toFixed(1)}%)</strong>.</p>
        <table>
          <thead><tr><th>Month</th><th>Scope 1 (tCO2e)</th><th>Scope 2 (tCO2e)</th><th>Scope 3 (tCO2e)</th><th>Total (tCO2e)</th></tr></thead>
          <tbody>
            ${tr.months.slice(6).map((m,i)=>`<tr><td>${m}</td><td>${tr.scope1[i+6]}</td><td>${tr.scope2[i+6]}</td><td>${tr.scope3[i+6]}</td><td><strong>${tr.total[i+6]}</strong></td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Energy Consumption</h2>
        <ul>
          <li><strong>Renewable Energy Share:</strong> ${sc.subMetrics.energy}% of total consumption (Target: 50%).</li>
          <li>${em.solarPanelsInstalled} rooftop solar panels operational, generating an estimated 142 MWh annually.</li>
          <li>${em.electricVehiclesFleet} electric vehicles in company fleet (out of 22 total). Full EV transition targeted by Q4 2026.</li>
        </ul>

        <hr class="section-divider">
        <h2>Waste Management</h2>
        <ul>
          <li><strong>Waste Diversion Rate:</strong> ${sc.subMetrics.waste}% of total waste diverted from landfill.</li>
          <li>Recycling bins installed across all office floors; composting program launched in corporate cafeteria.</li>
          <li>Operations department reduced single-use plastic by 63% year-over-year following Zero Waste Week campaign.</li>
        </ul>

        <hr class="section-divider">
        <h2>Water Conservation</h2>
        <p>Water Conservation Index: ${sc.subMetrics.water}/100. Sensor-based leak detection installed across all facilities in Q1 2026 contributed to 12% reduction in water consumption vs prior year.</p>

        <hr class="section-divider">
        <h2>Forward Outlook</h2>
        <ul>
          <li>On-track to achieve 15% carbon reduction target by end of FY 2026.</li>
          <li>Renewable energy procurement agreement under negotiation to reach 50% target in Q4.</li>
          <li>${em.treesPlaneted} trees planted this year through employee reward redemptions and corporate CSR partnerships.</li>
        </ul>
      </div>`;

    this._currentHTML  = html;
    this._currentTitle = `Environmental_Report_${period.replace(/\s/g,'_')}`;
    this._currentData  = tr.months.slice(6).map((m,i)=>({ Month:m, Scope1:tr.scope1[i+6], Scope2:tr.scope2[i+6], Scope3:tr.scope3[i+6], Total:tr.total[i+6] }));

    document.getElementById('dashboard-content').innerHTML = `
      <div class="fade-in">
        ${this._toolbar()}
        <div class="report-preview-panel">${html}</div>
      </div>`;
  },

  // 3. SOCIAL REPORT
  renderSocial: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const challenges = window.ESG_CALC.getChallengeStats(filters);
    const comp = window.ESG_CALC.getComplianceAnalytics(filters);
    const period = this._periodLabel(filters);
    const now = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
    const employees = window.ESG_DATA.employees;
    const depts = window.ESG_DATA.departments;
    const deptVolHours = depts.map(d=>({ name:d.name, hours:employees.filter(e=>e.deptId===d.id).reduce((s,e)=>s+e.volunteerHours,0) }));
    const totalHours = employees.reduce((s,e)=>s+e.volunteerHours,0);

    const html = `
      <div class="report-document">
        <h1>Social Responsibility Report</h1>
        <div class="report-meta">
          <span><strong>Organization:</strong> GreenVista Corp</span>
          <span><strong>Period:</strong> ${period}</span>
          <span><strong>Generated:</strong> ${now}</span>
          <span><strong>Standard:</strong> GRI 401 / GRI 404 / ISO 26000</span>
        </div>
        <h2>Social Score: ${sc.social}/100</h2>
        <p>GreenVista Corp's Social pillar score of <strong>${sc.social}/100</strong> reflects strong community engagement, inclusive training programs, and a robust CSR challenge framework that fosters employee-led sustainability impact.</p>

        <div class="report-kpi-row">
          <div class="report-kpi"><div class="report-kpi-val" style="color:#8b5cf6;">${sc.social}</div><div class="report-kpi-label">Social Score</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${totalHours}</div><div class="report-kpi-label">Total Volunteer Hours</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.participation}%</div><div class="report-kpi-label">CSR Participation</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.deiTraining}%</div><div class="report-kpi-label">DEI Training</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${challenges.length}</div><div class="report-kpi-label">CSR Challenges Run</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${window.ESG_DATA.redemptions.length}</div><div class="report-kpi-label">Rewards Redeemed</div></div>
        </div>

        <hr class="section-divider">
        <h2>Volunteer Program</h2>
        <table>
          <thead><tr><th>Department</th><th>Total Hours</th><th>Avg per Employee</th></tr></thead>
          <tbody>
            ${deptVolHours.map(d=>{ const dept=depts.find(x=>x.name===d.name); const n=dept?dept.headcount:1; return `<tr><td>${d.name}</td><td>${d.hours}</td><td>${(d.hours/n).toFixed(1)}</td></tr>`; }).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>CSR Challenge Summary</h2>
        <table>
          <thead><tr><th>Challenge</th><th>Pillar</th><th>Quarter</th><th>Participants</th><th>Enrollment %</th><th>Completion %</th><th>Points</th><th>Status</th></tr></thead>
          <tbody>
            ${challenges.map(c=>`<tr><td>${c.name}</td><td>${c.pillar}</td><td>${c.quarter}</td><td>${c.participants}</td><td>${c.enrollmentRate}%</td><td>${c.completionRate}%</td><td>${c.pointsReward}</td><td>${c.status}</td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>DEI & Training</h2>
        <table>
          <thead><tr><th>Module</th><th>Pillar</th><th>Completion Rate</th><th>Outstanding</th></tr></thead>
          <tbody>
            ${comp.map(m=>`<tr><td>${m.name}</td><td>${m.pillar}</td><td>${m.rate}%</td><td>${m.total-m.completed}</td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Reward & Recognition Program</h2>
        <p>The CSR Reward Store saw <strong>${window.ESG_DATA.redemptions.length} redemptions</strong> totaling <strong>${window.ESG_DATA.redemptions.reduce((s,r)=>s+r.points,0).toLocaleString()} points</strong> this fiscal year. Popular rewards include volunteer day passes, eco product bundles, and charity matching gifts.</p>
      </div>`;

    this._currentHTML  = html;
    this._currentTitle = `Social_Report_${period.replace(/\s/g,'_')}`;
    this._currentData  = challenges.map(c=>({ Name:c.name, Pillar:c.pillar, Quarter:c.quarter, Participants:c.participants, EnrollmentPct:c.enrollmentRate, CompletionPct:c.completionRate, Points:c.pointsReward, Status:c.status }));

    document.getElementById('dashboard-content').innerHTML = `
      <div class="fade-in">
        ${this._toolbar()}
        <div class="report-preview-panel">${html}</div>
      </div>`;
  },

  // 4. GOVERNANCE REPORT
  renderGovernance: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const comp = window.ESG_CALC.getComplianceAnalytics(filters);
    const gov = window.ESG_DATA.governanceCompliance;
    const period = this._periodLabel(filters);
    const now = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});

    const html = `
      <div class="report-document">
        <h1>Governance & Ethics Report</h1>
        <div class="report-meta">
          <span><strong>Organization:</strong> GreenVista Corp</span>
          <span><strong>Period:</strong> ${period}</span>
          <span><strong>Generated:</strong> ${now}</span>
          <span><strong>Standard:</strong> GRI 205 / GRI 206 / GRI 418 / ISO 37001</span>
        </div>
        <h2>Governance Score: ${sc.governance}/100</h2>
        <p>Governance at GreenVista Corp is anchored by zero-tolerance anti-corruption policies, robust internal audit frameworks, proactive cybersecurity training, and an accessible whistleblower channel. The Governance pillar score of <strong>${sc.governance}/100</strong> reflects industry-leading compliance standards.</p>

        <div class="report-kpi-row">
          <div class="report-kpi"><div class="report-kpi-val" style="color:#f59e0b;">${sc.governance}</div><div class="report-kpi-label">Governance Score</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.audit}%</div><div class="report-kpi-label">Audit Rating</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.conduct}%</div><div class="report-kpi-label">Code of Conduct</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${sc.subMetrics.security}%</div><div class="report-kpi-label">Cybersecurity</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${gov.whistleblowerIncidents.resolved}</div><div class="report-kpi-label">Incidents Resolved</div></div>
          <div class="report-kpi"><div class="report-kpi-val">${gov.whistleblowerResolutionTime} days</div><div class="report-kpi-label">Avg Resolution Time</div></div>
        </div>

        <hr class="section-divider">
        <h2>Compliance Training Completion</h2>
        <table>
          <thead><tr><th>Module</th><th>Pillar</th><th>Completed</th><th>Pending</th><th>Rate</th></tr></thead>
          <tbody>
            ${comp.map(m=>`<tr><td>${m.name}</td><td>${m.pillar}</td><td>${m.completed}</td><td>${m.total-m.completed}</td><td>${m.rate}%</td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Internal Audit Results</h2>
        <table>
          <thead><tr><th>Quarter</th><th>Audit Score</th><th>Issues Found</th><th>Issues Resolved</th><th>Rating</th></tr></thead>
          <tbody>
            ${Object.entries(gov.quarterlyAudit).map(([q,a])=>`<tr><td>${q} 2026</td><td>${a.score}%</td><td>${a.issues}</td><td>${a.resolved}</td><td>${a.score>=95?'Excellent':a.score>=90?'Very Good':'Good'}</td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Incident Register</h2>
        <table>
          <thead><tr><th>ID</th><th>Category</th><th>Severity</th><th>Department</th><th>Date</th><th>Status</th><th>Summary</th></tr></thead>
          <tbody>
            ${gov.incidentLog.map(i=>`<tr><td>${i.id}</td><td>${i.category}</td><td>${i.severity}</td><td>${i.dept.toUpperCase()}</td><td>${i.date}</td><td>${i.status}</td><td>${i.details}</td></tr>`).join('')}
          </tbody>
        </table>

        <hr class="section-divider">
        <h2>Board & Policy Statement</h2>
        <p>All incidents reported through the anonymous whistleblower channel have been investigated and resolved within an average of ${gov.whistleblowerResolutionTime} business days, exceeding our 5-day resolution SLA. Zero incidents escalated to regulatory reporting thresholds.</p>
      </div>`;

    this._currentHTML  = html;
    this._currentTitle = `Governance_Report_${period.replace(/\s/g,'_')}`;
    this._currentData  = comp.map(m=>({ Module:m.name, Pillar:m.pillar, Completed:m.completed, Total:m.total, Rate:m.rate }));

    document.getElementById('dashboard-content').innerHTML = `
      <div class="fade-in">
        ${this._toolbar()}
        <div class="report-preview-panel">${html}</div>
      </div>`;
  },

  // 5. CUSTOM REPORT BUILDER
  renderCustomBuilder: function(filters) {
    document.getElementById('dashboard-content').innerHTML = `
      <div class="fade-in">
        <div class="builder-layout">

          <!-- Builder Configuration Panel -->
          <div class="builder-sidebar">
            <div class="builder-group">
              <h4>Report Title</h4>
              <input id="custom-title" class="filter-control" type="text" value="Custom ESG Report" style="max-width:100%;">
            </div>

            <div class="builder-divider"></div>

            <div class="builder-group">
              <h4>Pillar Sections</h4>
              <label class="checkbox-label"><input type="checkbox" id="cb-env" checked> Environmental Section</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-soc" checked> Social Section</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-gov" checked> Governance Section</label>
            </div>

            <div class="builder-divider"></div>

            <div class="builder-group">
              <h4>Sub-Sections</h4>
              <label class="checkbox-label"><input type="checkbox" id="cb-kpi" checked> KPI Summary Table</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-carbon" checked> Carbon Emission Data</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-challenges" checked> Challenge Analytics</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-compliance" checked> Compliance Status</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-rewards" checked> Reward Redemptions</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-dept-table" checked> Department Rankings</label>
              <label class="checkbox-label"><input type="checkbox" id="cb-insights"> AI Insights Summary</label>
            </div>

            <div class="builder-divider"></div>

            <div class="builder-group">
              <h4>Report Format</h4>
              <label class="checkbox-label"><input type="radio" name="format" value="detailed" checked> Detailed (Full data)</label>
              <label class="checkbox-label"><input type="radio" name="format" value="executive"> Executive Summary</label>
            </div>

            <div class="builder-divider"></div>

            <button class="btn btn-primary" onclick="window.ESG_REPORTS.buildCustom();" style="width:100%;justify-content:center;">
              ⚙️ Generate Report
            </button>
          </div>

          <!-- Preview Area -->
          <div>
            <div class="report-toolbar" id="custom-toolbar" style="display:none;">
              <button class="btn" onclick="window.ESG_REPORTS.exportPDF()">📄 Export PDF</button>
              <button class="btn" onclick="window.ESG_REPORTS.exportExcel()">📊 Export Excel</button>
              <button class="btn" onclick="window.ESG_REPORTS.exportCSV()">📋 Export CSV</button>
            </div>
            <div class="report-preview-panel" id="custom-preview">
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--color-text-muted);gap:16px;">
                <div style="font-size:64px;">⚙️</div>
                <div style="font-size:16px;font-weight:600;">Configure your report and click Generate</div>
                <div style="font-size:13px;text-align:center;max-width:400px;">Select the sections and filters you want included, then export to PDF, Excel, or CSV.</div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    this._customFilters = filters;
  },

  buildCustom: function() {
    const filters = this._customFilters || {};
    const sc   = window.ESG_CALC.calculateScores(filters);
    const tr   = window.ESG_CALC.calculateCarbonTrends(filters);
    const comp = window.ESG_CALC.getComplianceAnalytics(filters);
    const chal = window.ESG_CALC.getChallengeStats(filters);
    const rew  = window.ESG_CALC.getRewardAnalytics(filters);
    const dr   = window.ESG_CALC.getDepartmentRankings(filters);
    const period = this._periodLabel(filters);
    const now = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});

    const title   = document.getElementById('custom-title').value || 'Custom ESG Report';
    const cbEnv   = document.getElementById('cb-env').checked;
    const cbSoc   = document.getElementById('cb-soc').checked;
    const cbGov   = document.getElementById('cb-gov').checked;
    const cbKpi   = document.getElementById('cb-kpi').checked;
    const cbCarbon= document.getElementById('cb-carbon').checked;
    const cbChal  = document.getElementById('cb-challenges').checked;
    const cbComp  = document.getElementById('cb-compliance').checked;
    const cbRew   = document.getElementById('cb-rewards').checked;
    const cbDept  = document.getElementById('cb-dept-table').checked;
    const cbInsights = document.getElementById('cb-insights').checked;

    let html = `<div class="report-document"><h1>${title}</h1>
      <div class="report-meta">
        <span><strong>Organization:</strong> GreenVista Corp</span>
        <span><strong>Period:</strong> ${period}</span>
        <span><strong>Generated:</strong> ${now}</span>
        <span><strong>Type:</strong> Custom Report</span>
      </div>`;

    if (cbKpi) { html += `<h2>ESG Score Summary</h2>
      <div class="report-kpi-row">
        <div class="report-kpi"><div class="report-kpi-val" style="color:#0ea5e9;">${sc.overall}</div><div class="report-kpi-label">Overall ESG</div></div>
        <div class="report-kpi"><div class="report-kpi-val" style="color:#10b981;">${sc.environmental}</div><div class="report-kpi-label">Environmental</div></div>
        <div class="report-kpi"><div class="report-kpi-val" style="color:#8b5cf6;">${sc.social}</div><div class="report-kpi-label">Social</div></div>
      </div><hr class="section-divider">`; }

    if (cbEnv) { html += `<h2>Environmental Performance</h2>
      <table><thead><tr><th>Metric</th><th>Value</th><th>Target</th></tr></thead><tbody>
        <tr><td>Carbon Index</td><td>${sc.subMetrics.carbon}/100</td><td>100/100</td></tr>
        <tr><td>Renewable Energy</td><td>${sc.subMetrics.energy}%</td><td>50%</td></tr>
        <tr><td>Waste Diversion</td><td>${sc.subMetrics.waste}%</td><td>70%</td></tr>
        <tr><td>Water Conservation</td><td>${sc.subMetrics.water}/100</td><td>80/100</td></tr>
      </tbody></table><hr class="section-divider">`; }

    if (cbCarbon) { html += `<h2>Carbon Emissions (Jan–Jun 2026)</h2>
      <table><thead><tr><th>Month</th><th>Scope 1</th><th>Scope 2</th><th>Scope 3</th><th>Total tCO2e</th></tr></thead><tbody>
        ${tr.months.slice(6).map((m,i)=>`<tr><td>${m}</td><td>${tr.scope1[i+6]}</td><td>${tr.scope2[i+6]}</td><td>${tr.scope3[i+6]}</td><td><strong>${tr.total[i+6]}</strong></td></tr>`).join('')}
      </tbody></table><hr class="section-divider">`; }

    if (cbSoc) { html += `<h2>Social Performance</h2>
      <table><thead><tr><th>Metric</th><th>Value</th><th>Target</th></tr></thead><tbody>
        <tr><td>CSR Participation</td><td>${sc.subMetrics.participation}%</td><td>80%</td></tr>
        <tr><td>Avg Volunteer Hours</td><td>${sc.subMetrics.volunteerHours} hrs</td><td>20 hrs</td></tr>
        <tr><td>DEI Training</td><td>${sc.subMetrics.deiTraining}%</td><td>100%</td></tr>
        <tr><td>Wellness Score</td><td>${sc.subMetrics.wellness}/100</td><td>80/100</td></tr>
      </tbody></table><hr class="section-divider">`; }

    if (cbChal) { html += `<h2>CSR Challenge Analytics</h2>
      <table><thead><tr><th>Challenge</th><th>Pillar</th><th>Enrollment</th><th>Completion</th><th>Status</th></tr></thead><tbody>
        ${chal.map(c=>`<tr><td>${c.name}</td><td>${c.pillar}</td><td>${c.enrollmentRate}%</td><td>${c.completionRate}%</td><td>${c.status}</td></tr>`).join('')}
      </tbody></table><hr class="section-divider">`; }

    if (cbComp) { html += `<h2>Compliance Training Status</h2>
      <table><thead><tr><th>Module</th><th>Completion Rate</th><th>Outstanding</th></tr></thead><tbody>
        ${comp.map(m=>`<tr><td>${m.name}</td><td>${m.rate}%</td><td>${m.total-m.completed}</td></tr>`).join('')}
      </tbody></table><hr class="section-divider">`; }

    if (cbGov) { html += `<h2>Governance Performance</h2>
      <table><thead><tr><th>Metric</th><th>Value</th><th>Target</th></tr></thead><tbody>
        <tr><td>Governance Score</td><td>${sc.governance}/100</td><td>90/100</td></tr>
        <tr><td>Code of Conduct</td><td>${sc.subMetrics.conduct}%</td><td>100%</td></tr>
        <tr><td>Cybersecurity</td><td>${sc.subMetrics.security}%</td><td>100%</td></tr>
        <tr><td>Audit Rating</td><td>${sc.subMetrics.audit}%</td><td>90%</td></tr>
      </tbody></table><hr class="section-divider">`; }

    if (cbRew) { html += `<h2>Reward Program</h2>
      <p>Total redemptions: <strong>${rew.totalTransactions}</strong> | Total points redeemed: <strong>${rew.totalPointsRedeemed}</strong></p>
      <hr class="section-divider">`; }

    if (cbDept) { html += `<h2>Department Rankings</h2>
      <table><thead><tr><th>Rank</th><th>Department</th><th>E</th><th>S</th><th>G</th><th>Overall</th></tr></thead><tbody>
        ${dr.map((r,i)=>`<tr><td>${i+1}</td><td>${r.name}</td><td>${r.e}</td><td>${r.s}</td><td>${r.g}</td><td><strong>${r.overall}</strong></td></tr>`).join('')}
      </tbody></table><hr class="section-divider">`; }

    if (cbInsights) { html += `<h2>AI Insights Summary</h2>
      <ul>
        <li>Overall ESG score of ${sc.overall}/100 places GreenVista in the top 25% of industry peers.</li>
        <li>Largest improvement opportunity: DEI training gap of ${100-sc.subMetrics.deiTraining}% requires prioritization.</li>
        <li>Carbon Scope 3 (value chain) accounts for the largest share; supplier engagement can drive 18% additional reduction.</li>
        <li>Reward program engagement correlates with +12% higher CSR challenge completion rates.</li>
      </ul>`; }

    html += '</div>';
    this._currentHTML  = html;
    this._currentTitle = title.replace(/\s/g,'_');

    document.getElementById('custom-preview').innerHTML = html;
    document.getElementById('custom-toolbar').style.display = 'flex';
  },

  // ────────────────────────────────────────────────────────────
  // EXPORT FUNCTIONS
  // ────────────────────────────────────────────────────────────

  exportPDF: function() {
    const printWin = window.open('', '_blank', 'width=900,height=700');
    printWin.document.write(`<!DOCTYPE html><html><head>
      <title>${this._currentTitle}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family:'Plus Jakarta Sans',sans-serif; color:#1e293b; max-width:900px; margin:0 auto; padding:32px 24px; }
        h1 { font-family:'Outfit',sans-serif; font-size:26px; color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-bottom:20px; }
        h2 { font-family:'Outfit',sans-serif; font-size:18px; color:#1e293b; margin:24px 0 10px; }
        p,li { font-size:14px; line-height:1.65; color:#334155; }
        table { width:100%; border-collapse:collapse; margin:12px 0 20px; }
        th { background:#f8fafc; font-size:11px; text-transform:uppercase; letter-spacing:0.6px; padding:9px 12px; border:1px solid #e2e8f0; }
        td { border:1px solid #e2e8f0; padding:9px 12px; font-size:13px; }
        .report-kpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        .report-kpi { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; text-align:center; }
        .report-kpi-val { font-family:'Outfit',sans-serif; font-size:28px; font-weight:800; }
        .report-kpi-label { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.8px; }
        .report-meta { background:#f1f5f9; padding:10px 14px; border-left:3px solid #94a3b8; border-radius:4px; font-size:12px; color:#475569; margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px; }
        hr { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
        ul { padding-left:20px; margin-bottom:14px; }
        @media print { body { padding:0; } }
      </style>
    </head><body>${this._currentHTML}</body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.focus(); printWin.print(); }, 400);
  },

  exportExcel: function() {
    const sc  = window.ESG_CALC.calculateScores();
    const dr  = window.ESG_CALC.getDepartmentRankings();
    const tr  = window.ESG_CALC.calculateCarbonTrends();
    const comp= window.ESG_CALC.getComplianceAnalytics();
    const chal= window.ESG_CALC.getChallengeStats();

    let xls = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8"><style>th{background:#c6efce;font-weight:bold;} td,th{border:1px solid #bfbfbf;padding:5px 10px;}</style></head><body>
    <h2>ESG Summary</h2>
    <table>
      <tr><th>Overall ESG</th><th>Environmental</th><th>Social</th><th>Governance</th></tr>
      <tr><td>${sc.overall}</td><td>${sc.environmental}</td><td>${sc.social}</td><td>${sc.governance}</td></tr>
    </table>
    <br><h2>Department Rankings</h2>
    <table>
      <tr><th>Department</th><th>Head</th><th>Environmental</th><th>Social</th><th>Governance</th><th>Overall</th></tr>
      ${dr.map(r=>`<tr><td>${r.name}</td><td>${r.head}</td><td>${r.e}</td><td>${r.s}</td><td>${r.g}</td><td>${r.overall}</td></tr>`).join('')}
    </table>
    <br><h2>Carbon Emissions (Jan–Jun 2026)</h2>
    <table>
      <tr><th>Month</th><th>Scope 1</th><th>Scope 2</th><th>Scope 3</th><th>Total tCO2e</th></tr>
      ${tr.months.slice(6).map((m,i)=>`<tr><td>${m}</td><td>${tr.scope1[i+6]}</td><td>${tr.scope2[i+6]}</td><td>${tr.scope3[i+6]}</td><td>${tr.total[i+6]}</td></tr>`).join('')}
    </table>
    <br><h2>Compliance Training</h2>
    <table>
      <tr><th>Module</th><th>Completed</th><th>Total</th><th>Rate %</th></tr>
      ${comp.map(m=>`<tr><td>${m.name}</td><td>${m.completed}</td><td>${m.total}</td><td>${m.rate}</td></tr>`).join('')}
    </table>
    <br><h2>CSR Challenges</h2>
    <table>
      <tr><th>Challenge</th><th>Pillar</th><th>Quarter</th><th>Participants</th><th>Enrollment%</th><th>Completion%</th><th>Status</th></tr>
      ${chal.map(c=>`<tr><td>${c.name}</td><td>${c.pillar}</td><td>${c.quarter}</td><td>${c.participants}</td><td>${c.enrollmentRate}</td><td>${c.completionRate}</td><td>${c.status}</td></tr>`).join('')}
    </table>
    </body></html>`;

    const blob = new Blob([xls], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (this._currentTitle || 'ESG_Report') + '.xls';
    link.click();
    URL.revokeObjectURL(link.href);
  },

  exportCSV: function() {
    const sc  = window.ESG_CALC.calculateScores();
    const dr  = window.ESG_CALC.getDepartmentRankings();
    const chal= window.ESG_CALC.getChallengeStats();
    const comp= window.ESG_CALC.getComplianceAnalytics();

    const escape = (v) => `"${String(v||'').replace(/"/g,'""')}"`;

    let csv = 'SECTION,Metric,Value\n';
    csv += `ESG Summary,Overall ESG Score,${sc.overall}\n`;
    csv += `ESG Summary,Environmental Score,${sc.environmental}\n`;
    csv += `ESG Summary,Social Score,${sc.social}\n`;
    csv += `ESG Summary,Governance Score,${sc.governance}\n`;
    csv += `ESG Summary,Carbon Index,${sc.subMetrics.carbon}\n`;
    csv += `ESG Summary,Renewable Energy %,${sc.subMetrics.energy}\n\n`;

    csv += 'DEPT RANKINGS,Department,Head,E,S,G,Overall\n';
    dr.forEach(r => { csv += `DEPT,${escape(r.name)},${escape(r.head)},${r.e},${r.s},${r.g},${r.overall}\n`; });

    csv += '\nCSR CHALLENGES,Name,Pillar,Quarter,Participants,Enrollment%,Completion%,Status\n';
    chal.forEach(c => { csv += `CHALLENGE,${escape(c.name)},${c.pillar},${c.quarter},${c.participants},${c.enrollmentRate},${c.completionRate},${c.status}\n`; });

    csv += '\nCOMPLIANCE,Module,Rate%,Completed,Total\n';
    comp.forEach(m => { csv += `COMPLIANCE,${escape(m.name)},${m.rate},${m.completed},${m.total}\n`; });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (this._currentTitle || 'ESG_Report') + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  },

  // ────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────
  _toolbar: function() {
    return `<div class="report-toolbar">
      <button class="btn btn-primary" onclick="window.ESG_REPORTS.exportPDF()">📄 Export PDF</button>
      <button class="btn" onclick="window.ESG_REPORTS.exportExcel()">📊 Export Excel</button>
      <button class="btn" onclick="window.ESG_REPORTS.exportCSV()">📋 Export CSV</button>
    </div>`;
  },

  _periodLabel: function(filters) {
    if (!filters || !filters.period) return 'FY 2026 (Full Year)';
    const periods = {
      'Q1':'Q1 2026 (Jan–Mar)', 'Q2':'Q2 2026 (Apr–Jun)', 'Q3':'Q3 2026 (Jul–Sep)',
      '2026':'FY 2026','2025':'FY 2025',
      '2026-01':'January 2026','2026-02':'February 2026','2026-03':'March 2026',
      '2026-04':'April 2026','2026-05':'May 2026','2026-06':'June 2026','2026-07':'July 2026'
    };
    return periods[filters.period] || filters.period;
  },

  _flattenSummaryData: function(sc, dr) {
    const rows = [];
    rows.push({ type:'ESG Score', name:'Overall', value:sc.overall });
    rows.push({ type:'ESG Score', name:'Environmental', value:sc.environmental });
    rows.push({ type:'ESG Score', name:'Social', value:sc.social });
    rows.push({ type:'ESG Score', name:'Governance', value:sc.governance });
    dr.forEach(r => rows.push({ type:'Department', name:r.name, environmental:r.e, social:r.s, governance:r.g, overall:r.overall }));
    return rows;
  }
};
