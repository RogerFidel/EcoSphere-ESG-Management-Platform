// ============================================================
// ESG Analytics Portal – All Dashboard Renderers
// 8 Dashboards + 4 Analytics Sub-panels
// ============================================================
window.ESG_DASHBOARDS = {
  activeCharts: {},

  _ch: function(id, config) {
    if (this.activeCharts[id]) { this.activeCharts[id].destroy(); }
    const el = document.getElementById(id);
    if (!el) return;
    const ctx = el.getContext('2d');
    this.activeCharts[id] = new Chart(ctx, config);
  },

  destroyCharts: function() {
    Object.keys(this.activeCharts).forEach(k => {
      try { if (this.activeCharts[k]) this.activeCharts[k].destroy(); } catch(e){}
    });
    this.activeCharts = {};
  },

  _container: function() { return document.getElementById('dashboard-content'); },

  _chartDefaults: function() {
    return {
      gridColor: 'rgba(255,255,255,0.06)',
      tickColor: '#8b9cb8',
      legendColor: '#f0f4ff',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    };
  },

  // ────────────────────────────────────────────────────────────
  // 1. OVERALL ESG DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderOverall: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const rankings = window.ESG_CALC.getDepartmentRankings(filters);
    const history = window.ESG_CALC.getScoreHistory();
    const top = window.ESG_CALC.getTopPerformers(3);
    this.destroyCharts();
    const D = this._chartDefaults();

    this._container().innerHTML = `
      <div class="fade-in">
        <!-- KPI Cards -->
        <div class="kpi-grid">
          ${this._kpi('overall','📊','Overall ESG Score',sc.overall+'/100','↑ 2.4% vs last quarter','trend-up')}
          ${this._kpi('environmental','🌱','Environmental (E)',sc.environmental+'/100','Target: 80/100','trend-up')}
          ${this._kpi('social','🤝','Social (S)',sc.social+'/100','Target: 80/100','trend-up')}
          ${this._kpi('governance','🛡️','Governance (G)',sc.governance+'/100','Target: 90/100','trend-neutral')}
        </div>

        <!-- Charts Row 1 -->
        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Pillar Radar Analysis <span class="card-subtitle">vs Enterprise Target</span></div>
            <div class="chart-container"><canvas id="ch-radar"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">Department ESG Scores <span class="card-subtitle">Current Rankings</span></div>
            <div class="chart-container"><canvas id="ch-depts"></canvas></div>
          </div>
        </div>

        <!-- Charts Row 2 -->
        <div class="visuals-grid">
          <div class="card col-8">
            <div class="card-title">ESG Score Trend <span class="card-subtitle">Monthly progression (Jan–Jul 2026)</span></div>
            <div class="chart-container"><canvas id="ch-trend"></canvas></div>
          </div>
          <div class="card col-4">
            <div class="card-title">Pillar Score Split <span class="card-subtitle">Weight contribution</span></div>
            <div class="chart-container-sm" style="height:200px;"><canvas id="ch-pie"></canvas></div>
          </div>
        </div>

        <!-- Goals + Insights -->
        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Annual Goal Tracking</div>
            <div style="padding-top:6px;">
              ${this._goalBar('E: Carbon Footprint Offset', sc.subMetrics.carbon, 'env')}
              ${this._goalBar('E: Renewable Energy Adoption', sc.subMetrics.energy, 'env')}
              ${this._goalBar('S: Volunteer Hours Target', Math.min(100,sc.subMetrics.volunteerHours*5), 'soc')}
              ${this._goalBar('S: CSR Challenge Participation', sc.subMetrics.participation, 'soc')}
              ${this._goalBar('G: Code of Conduct Sign-off', sc.subMetrics.conduct, 'gov')}
              ${this._goalBar('G: Cybersecurity Training', sc.subMetrics.security, 'gov')}
            </div>
          </div>
          <div class="card col-6">
            <div class="card-title">🏆 Top Performers</div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>Rank</th><th>Employee</th><th>Department</th><th>CSR Points</th><th>Vol. Hrs</th></tr></thead>
                <tbody>
                  ${top.map((e,i)=>`<tr>
                    <td>${['🥇','🥈','🥉'][i]||'#'+(i+1)}</td>
                    <td><strong>${e.name}</strong></td>
                    <td><span class="chip">${e.deptName}</span></td>
                    <td><strong class="text-soc">${e.rewardPoints} pts</strong></td>
                    <td>${e.volunteerHours} hrs</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div class="insights-panel mt-16">
              <h3>✨ Key Insights</h3>
              <ul class="insights-list">
                <li>Overall ESG Score of <strong>${sc.overall}/100</strong> outperforms industry median by 8.3%.</li>
                <li>HR Department leads with highest Social score driven by <strong>95%+ DEI training completion</strong>.</li>
                <li>Carbon emissions reduced by <strong>7.7% vs baseline</strong> through Engineering's server migrations.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;

    // Radar
    this._ch('ch-radar', { type:'radar', data:{
      labels:['Environmental','Social','Governance'],
      datasets:[
        { label:'Current', data:[sc.environmental,sc.social,sc.governance], backgroundColor:'rgba(6,182,212,0.18)', borderColor:'#06b6d4', borderWidth:2, pointBackgroundColor:'#06b6d4' },
        { label:'Target',  data:[80,80,90], backgroundColor:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.2)', borderWidth:1.5, pointBackgroundColor:'rgba(255,255,255,0.4)', borderDash:[5,3] }
      ]}, options:{ responsive:true, maintainAspectRatio:false,
        scales:{ r:{ grid:{color:'rgba(255,255,255,0.08)'}, angleLines:{color:'rgba(255,255,255,0.08)'}, pointLabels:{color:D.tickColor,font:{family:D.fontFamily,size:12}}, ticks:{color:D.tickColor,backdropColor:'transparent',min:0,max:100} }},
        plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
      }
    });

    // Dept Bar
    this._ch('ch-depts', { type:'bar', data:{
      labels: rankings.map(r=>r.name),
      datasets:[
        { label:'Environmental', data:rankings.map(r=>r.e), backgroundColor:'#10b981' },
        { label:'Social',        data:rankings.map(r=>r.s), backgroundColor:'#8b5cf6' },
        { label:'Governance',    data:rankings.map(r=>r.g), backgroundColor:'#f59e0b' }
      ]}, options:{ responsive:true, maintainAspectRatio:false,
        scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:0,max:100} },
        plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
      }
    });

    // Trend Line
    this._ch('ch-trend', { type:'line', data:{
      labels: history.months,
      datasets:[
        { label:'Overall ESG', data:history.overall, borderColor:'#06b6d4', backgroundColor:'rgba(6,182,212,0.1)', fill:true, tension:0.4 },
        { label:'Environmental', data:history.environmental, borderColor:'#10b981', backgroundColor:'transparent', tension:0.4 },
        { label:'Social', data:history.social, borderColor:'#8b5cf6', backgroundColor:'transparent', tension:0.4 },
        { label:'Governance', data:history.governance, borderColor:'#f59e0b', backgroundColor:'transparent', tension:0.4 }
      ]}, options:{ responsive:true, maintainAspectRatio:false,
        scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:50,max:100} },
        plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
      }
    });

    // Pie
    this._ch('ch-pie', { type:'doughnut', data:{
      labels:['Environmental (40%)','Social (30%)','Governance (30%)'],
      datasets:[{ data:[sc.environmental*0.4,sc.social*0.3,sc.governance*0.3], backgroundColor:['#10b981','#8b5cf6','#f59e0b'], borderColor:'transparent', borderWidth:0 }]
    }, options:{ responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins:{ legend:{position:'bottom',labels:{color:D.legendColor,font:{family:D.fontFamily,size:11},padding:10}} }
    }});
  },

  // ────────────────────────────────────────────────────────────
  // 2. ENVIRONMENTAL DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderEnvironmental: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const tr = window.ESG_CALC.calculateCarbonTrends(filters);
    this.destroyCharts();
    const D = this._chartDefaults();

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${this._kpi('environmental','☁️','Environmental Score',sc.environmental+'/100','Weight: 40% of ESG','trend-up')}
          ${this._kpi('environmental','📉','Carbon Index',sc.subMetrics.carbon+'/100','vs Baseline Target','trend-up')}
          ${this._kpi('environmental','⚡','Renewable Energy',sc.subMetrics.energy+'%','Target: 50%','trend-neutral')}
          ${this._kpi('environmental','♻️','Waste Diverted',sc.subMetrics.waste+'%','Goal met: Yes','trend-up')}
          ${this._kpi('environmental','💧','Water Conservation',sc.subMetrics.water+'/100','Target: 80/100','trend-neutral')}
        </div>

        <div class="visuals-grid">
          <div class="card col-8">
            <div class="card-title">Carbon Emission Trends – Scope 1, 2, 3 <span class="card-subtitle">Last 12 months (tCO2e)</span></div>
            <div class="chart-container-lg"><canvas id="ch-env-carbon"></canvas></div>
          </div>
          <div class="card col-4">
            <div class="card-title">Energy Mix <span class="card-subtitle">Renewable vs Grid</span></div>
            <div class="chart-container"><canvas id="ch-env-energy"></canvas></div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Waste Management <span class="card-subtitle">Diversion breakdown</span></div>
            <div class="chart-container"><canvas id="ch-env-waste"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">Department Carbon Footprints <span class="card-subtitle">Average monthly tCO2e</span></div>
            <div class="chart-container"><canvas id="ch-env-dept-carbon"></canvas></div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Environmental Goal Tracking</div>
            ${this._goalBar('Carbon Reduction Index', sc.subMetrics.carbon, 'env')}
            ${this._goalBar('Renewable Energy Rate', sc.subMetrics.energy, 'env')}
            ${this._goalBar('Waste Diversion Rate', sc.subMetrics.waste, 'env')}
            ${this._goalBar('Water Conservation Index', sc.subMetrics.water, 'env')}
          </div>
          <div class="card col-6">
            <div class="insights-panel" style="margin:0;">
              <h3>🌱 Carbon Insights</h3>
              <ul class="insights-list">
                <li><strong>Scope 3 (Value Chain)</strong> is our largest emission source, driven by Sales business travel.</li>
                <li>Operations leads Scope 1 direct emissions from fleet vehicles – EVs planned for Q4 2026.</li>
                <li>Switching Operations to solar supply would add <strong>+18% renewable share</strong> immediately.</li>
                <li>YTD carbon vs baseline: <strong>−7.7%</strong> – on track for 2026 net-zero pathway.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;

    // Carbon Trend Line
    this._ch('ch-env-carbon', { type:'line', data:{
      labels: tr.months,
      datasets:[
        { label:'Scope 1 (Direct)',           data:tr.scope1, borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.08)',   fill:true, tension:0.3 },
        { label:'Scope 2 (Indirect Grid)',    data:tr.scope2, borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.08)',  fill:true, tension:0.3 },
        { label:'Scope 3 (Value Chain)',      data:tr.scope3, borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0.08)', fill:true, tension:0.3 }
      ]}, options:{ responsive:true, maintainAspectRatio:false,
        scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor}} },
        plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
      }
    });

    // Pie energy mix
    this._ch('ch-env-energy', { type:'doughnut', data:{
      labels:['Renewable','Standard Grid'],
      datasets:[{ data:[sc.subMetrics.energy, 100-sc.subMetrics.energy], backgroundColor:['#10b981','#1e2a3a'], borderColor:'transparent' }]
    }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%',
      plugins:{ legend:{position:'bottom',labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});

    // Waste bar
    this._ch('ch-env-waste', { type:'bar', data:{
      labels:['Recycled','Composted','Landfill'],
      datasets:[{ label:'Waste Breakdown (%)', data:[+(sc.subMetrics.waste*0.58).toFixed(1), +(sc.subMetrics.waste*0.42).toFixed(1), +(100-sc.subMetrics.waste).toFixed(1)], backgroundColor:['#10b981','#34d399','#ef4444'] }]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:0,max:100} },
      plugins:{ legend:{display:false} }
    }});

    // Dept carbon bar
    const depts = window.ESG_DATA.departments;
    const deptTotals = depts.map(d => {
      const cd = window.ESG_DATA.carbonFootprint.datasets[d.id];
      if (!cd) return { name:d.name, val:0 };
      const avg = (cd.scope1.reduce((a,b)=>a+b,0) + cd.scope2.reduce((a,b)=>a+b,0) + cd.scope3.reduce((a,b)=>a+b,0)) / 12;
      return { name:d.name, val:+avg.toFixed(1) };
    });
    this._ch('ch-env-dept-carbon', { type:'bar', data:{
      labels: deptTotals.map(d=>d.name),
      datasets:[{ label:'Avg Monthly tCO2e', data:deptTotals.map(d=>d.val), backgroundColor:'rgba(16,185,129,0.6)', borderColor:'#10b981', borderWidth:1 }]
    }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{color:D.gridColor},ticks:{color:D.tickColor}}, y:{grid:{display:false},ticks:{color:D.tickColor}} },
      plugins:{ legend:{display:false} }
    }});
  },

  // ────────────────────────────────────────────────────────────
  // 3. SOCIAL DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderSocial: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const employees = window.ESG_DATA.employees;
    const depts = window.ESG_DATA.departments;
    this.destroyCharts();
    const D = this._chartDefaults();

    const deptVolHours = depts.map(d => ({
      name: d.name,
      hours: employees.filter(e=>e.deptId===d.id).reduce((s,e)=>s+e.volunteerHours,0)
    }));
    const badgeCounts = {};
    employees.forEach(e => e.badges.forEach(b => { badgeCounts[b]=(badgeCounts[b]||0)+1; }));

    const totalVolHours = employees.reduce((s,e)=>s+e.volunteerHours,0);

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${this._kpi('social','🤝','Social Score',sc.social+'/100','Weight: 30% of ESG','trend-up')}
          ${this._kpi('social','⏱️','Total Volunteer Hours',totalVolHours+' hrs','Across all employees','trend-up')}
          ${this._kpi('social','🎯','CSR Participation',sc.subMetrics.participation+'%','Challenge enrollment','trend-up')}
          ${this._kpi('social','🎓','DEI Training',sc.subMetrics.deiTraining+'%','Completion rate','trend-neutral')}
          ${this._kpi('social','🧘','Wellness Index',sc.subMetrics.wellness+'%','Challenge completion','trend-up')}
        </div>

        <div class="visuals-grid">
          <div class="card col-8">
            <div class="card-title">Volunteer Hours by Department <span class="card-subtitle">CSR Participation</span></div>
            <div class="chart-container"><canvas id="ch-soc-vol"></canvas></div>
          </div>
          <div class="card col-4">
            <div class="card-title">Badge Distribution <span class="card-subtitle">By type</span></div>
            <div class="chart-container"><canvas id="ch-soc-badges"></canvas></div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">CSR Challenge Progress <span class="card-subtitle">Completion rates</span></div>
            <div class="chart-container"><canvas id="ch-soc-challenges"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">CSR Reward Store <span class="card-subtitle">Points required to redeem</span></div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>Reward</th><th>Points</th><th>Category</th><th>Stock</th></tr></thead>
                <tbody>
                  ${window.ESG_DATA.rewardsCatalog.map(r=>`<tr>
                    <td><strong>${r.title}</strong></td>
                    <td>${r.points} pts</td>
                    <td><span class="badge badge-${r.category==='Environmental'?'env':r.category==='Social'?'soc':'gov'}">${r.category}</span></td>
                    <td><span class="badge ${r.stock>100?'badge-success':'badge-warning'}">${r.stock>100?'In Stock':'Low Stock'}</span></td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Social Goal Tracking</div>
            ${this._goalBar('CSR Participation Rate', sc.subMetrics.participation, 'soc')}
            ${this._goalBar('Avg Volunteer Hours (×5)', Math.min(100,sc.subMetrics.volunteerHours*5), 'soc')}
            ${this._goalBar('DEI Training Completion', sc.subMetrics.deiTraining, 'soc')}
            ${this._goalBar('Wellness Challenge Rate', sc.subMetrics.wellness, 'soc')}
          </div>
          <div class="card col-6">
            <div class="insights-panel" style="margin:0;">
              <h3>🤝 Social Insights</h3>
              <ul class="insights-list">
                <li>Total community impact: <strong>${totalVolHours} volunteer hours</strong> this fiscal year.</li>
                <li>Most popular badge: <strong>Eco Warrior</strong> – held by 5 employees across 4 departments.</li>
                <li>Volunteer hours surge <strong>+42%</strong> during Q2 Earth Month drives.</li>
                <li>DEI training gap of <strong>${100-sc.subMetrics.deiTraining}%</strong> – targeted Q3 sprint underway.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;

    this._ch('ch-soc-vol', { type:'bar', data:{
      labels: deptVolHours.map(d=>d.name),
      datasets:[{ label:'Volunteer Hours', data:deptVolHours.map(d=>d.hours), backgroundColor:'rgba(139,92,246,0.7)', borderColor:'#8b5cf6', borderWidth:1, borderRadius:6 }]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor}} },
      plugins:{ legend:{display:false} }
    }});

    const badgeNames = Object.keys(badgeCounts).map(k=>window.ESG_DATA.badges[k]?.name||k);
    this._ch('ch-soc-badges', { type:'doughnut', data:{
      labels: badgeNames,
      datasets:[{ data:Object.values(badgeCounts), backgroundColor:['#10b981','#8b5cf6','#f59e0b','#3b82f6','#ef4444','#34d399'], borderColor:'transparent' }]
    }, options:{ responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{ legend:{position:'bottom',labels:{color:D.legendColor,font:{family:D.fontFamily,size:10},boxWidth:10,padding:8}} }
    }});

    const challenges = window.ESG_CALC.getChallengeStats({category:'Social'});
    this._ch('ch-soc-challenges', { type:'bar', data:{
      labels: challenges.map(c=>c.name),
      datasets:[
        { label:'Completion %', data:challenges.map(c=>c.completionRate), backgroundColor:'#10b981' },
        { label:'Enrollment %', data:challenges.map(c=>c.enrollmentRate), backgroundColor:'#8b5cf6' }
      ]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor,maxRotation:30}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:0,max:100} },
      plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});
  },

  // ────────────────────────────────────────────────────────────
  // 4. GOVERNANCE DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderGovernance: function(filters) {
    const sc = window.ESG_CALC.calculateScores(filters);
    const compliance = window.ESG_CALC.getComplianceAnalytics(filters);
    const gov = window.ESG_DATA.governanceCompliance;
    this.destroyCharts();
    const D = this._chartDefaults();

    const depts = window.ESG_DATA.departments;
    const deptAudit = { eng:95, sales:90, hr:95, fin:98, ops:88, it:96 };

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${this._kpi('governance','🛡️','Governance Score',sc.governance+'/100','Weight: 30% of ESG','trend-up')}
          ${this._kpi('governance','📋','Audit Rating',sc.subMetrics.audit+'%','Quality: Excellent','trend-up')}
          ${this._kpi('governance','✍️','Policy Sign-off',sc.subMetrics.policy+'%','Anti-bribery rate','trend-neutral')}
          ${this._kpi('governance','📖','Code of Conduct',sc.subMetrics.conduct+'%','Training completion','trend-up')}
          ${this._kpi('governance','💻','Cybersecurity',sc.subMetrics.security+'%','Awareness training','trend-neutral')}
        </div>

        <div class="visuals-grid">
          <div class="card col-8">
            <div class="card-title">Audit Scores by Department <span class="card-subtitle">Internal compliance rating</span></div>
            <div class="chart-container"><canvas id="ch-gov-audit"></canvas></div>
          </div>
          <div class="card col-4">
            <div class="card-title">Compliance Heat Map <span class="card-subtitle">Training modules per employee</span></div>
            <div style="padding-top:8px;">
              <div class="heatmap-container">
                ${window.ESG_DATA.employees.map(e => {
                  const n=(e.complianceStatus.conduct?1:0)+(e.complianceStatus.security?1:0)+(e.complianceStatus.bribery?1:0)+(e.complianceStatus.dei?1:0);
                  return `<div class="heatmap-cell cell-intensity-${n}" title="${e.name}: ${n}/4 modules">${e.name.substring(0,2)}</div>`;
                }).join('')}
              </div>
              <div style="display:flex;gap:14px;justify-content:center;margin-top:14px;font-size:11px;color:var(--color-text-muted);">
                <span>🟥 0 modules</span><span>🟨 1–2</span><span>🟩 3–4</span>
              </div>
            </div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Compliance Modules <span class="card-subtitle">Completion breakdown</span></div>
            <div class="chart-container"><canvas id="ch-gov-modules"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">Quarterly Audit Trends <span class="card-subtitle">Score progression</span></div>
            <div class="chart-container"><canvas id="ch-gov-quarterly"></canvas></div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-12">
            <div class="card-title">Whistleblower & Incident Log <span class="card-subtitle">All incidents this fiscal year</span></div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>ID</th><th>Category</th><th>Severity</th><th>Department</th><th>Date Logged</th><th>Status</th><th>Details</th></tr></thead>
                <tbody>
                  ${gov.incidentLog.map(i=>`<tr>
                    <td><strong>${i.id}</strong></td>
                    <td>${i.category}</td>
                    <td><span class="badge ${i.severity==='High'?'badge-danger':i.severity==='Medium'?'badge-warning':'badge-info'}">${i.severity}</span></td>
                    <td><span class="chip">${(window.ESG_DATA.departments.find(d=>d.id===i.dept)||{name:i.dept}).name}</span></td>
                    <td>${i.date}</td>
                    <td><span class="badge badge-success">${i.status}</span></td>
                    <td style="max-width:260px;font-size:12px;color:var(--color-text-secondary);">${i.details}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;

    this._ch('ch-gov-audit', { type:'bar', data:{
      labels: depts.map(d=>d.name),
      datasets:[
        { label:'Audit Score (%)', data:depts.map(d=>deptAudit[d.id]||88), backgroundColor:'rgba(245,158,11,0.7)', borderColor:'#f59e0b', borderWidth:1, borderRadius:6 },
        { label:'Target (90%)', data:depts.map(()=>90), type:'line', borderColor:'rgba(255,255,255,0.3)', borderDash:[5,3], pointRadius:0, fill:false }
      ]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:80,max:100} },
      plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});

    this._ch('ch-gov-modules', { type:'bar', data:{
      labels: compliance.map(m=>m.name),
      datasets:[
        { label:'Completed', data:compliance.map(m=>m.rate),        backgroundColor:'rgba(16,185,129,0.7)', borderRadius:4 },
        { label:'Pending',   data:compliance.map(m=>100-m.rate),    backgroundColor:'rgba(239,68,68,0.4)',  borderRadius:4 }
      ]
    }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, scales:{
      x:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:0,max:100,stacked:true},
      y:{grid:{display:false},ticks:{color:D.tickColor},stacked:true}
    }, plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});

    const qa = gov.quarterlyAudit;
    this._ch('ch-gov-quarterly', { type:'line', data:{
      labels: ['Q1 2026','Q2 2026','Q3 2026','Q4 2026'],
      datasets:[{ label:'Audit Score', data:[qa.Q1.score,qa.Q2.score,qa.Q3.score,qa.Q4.score], borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.1)', fill:true, tension:0.35, pointBackgroundColor:'#f59e0b', pointRadius:5 }]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:85,max:100} },
      plugins:{ legend:{display:false} }
    }});
  },

  // ────────────────────────────────────────────────────────────
  // 5. DEPARTMENT DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderDepartment: function(filters) {
    const rankings = window.ESG_CALC.getDepartmentRankings(filters);
    this.destroyCharts();
    const D = this._chartDefaults();

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Department Rankings <span class="card-subtitle">E, S, G pillar breakdown</span></div>
            <div class="chart-container"><canvas id="ch-dept-radar-compare"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">Overall ESG by Dept <span class="card-subtitle">Ranked scores</span></div>
            <div class="chart-container"><canvas id="ch-dept-bar"></canvas></div>
          </div>
        </div>

        <div class="card mb-24">
          <div class="card-title">Department Comparison Table <span class="card-subtitle">Click a row to view department profile</span></div>
          <div class="data-table-container">
            <table>
              <thead><tr><th>Rank</th><th>Department</th><th>Head</th><th>Headcount</th><th>Environmental</th><th>Social</th><th>Governance</th><th>Overall ESG</th></tr></thead>
              <tbody>
                ${rankings.map((r,i)=>`<tr style="cursor:pointer;" onclick="window.ESG_DASHBOARDS.viewDeptDetail('${r.id}')">
                  <td>${['🥇','🥈','🥉'][i]||'<strong>#'+(i+1)+'</strong>'}</td>
                  <td><strong>${r.name}</strong></td>
                  <td>${r.head}</td>
                  <td>${r.headcount}</td>
                  <td><div class="flex items-center gap-8"><span class="dot dot-env"></span>${r.e}/100</div></td>
                  <td><div class="flex items-center gap-8"><span class="dot dot-soc"></span>${r.s}/100</div></td>
                  <td><div class="flex items-center gap-8"><span class="dot dot-gov"></span>${r.g}/100</div></td>
                  <td><strong class="text-overall">${r.overall}/100</strong></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div id="dept-detail-area"></div>
      </div>`;

    // Radar comparison
    const colors = ['#10b981','#8b5cf6','#f59e0b','#06b6d4','#ef4444','#a855f7'];
    this._ch('ch-dept-radar-compare', { type:'radar', data:{
      labels:['Environmental','Social','Governance'],
      datasets: rankings.slice(0,4).map((r,i)=>({ label:r.name, data:[r.e,r.s,r.g], borderColor:colors[i], backgroundColor:colors[i].replace(')',',0.08)').replace('rgb','rgba'), borderWidth:2, pointBackgroundColor:colors[i] }))
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ r:{ grid:{color:'rgba(255,255,255,0.08)'}, angleLines:{color:'rgba(255,255,255,0.08)'}, pointLabels:{color:D.tickColor,font:{family:D.fontFamily,size:12}}, ticks:{color:D.tickColor,backdropColor:'transparent'} }},
      plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily,size:11}}} }
    }});

    this._ch('ch-dept-bar', { type:'bar', data:{
      labels: rankings.map(r=>r.name),
      datasets:[ { label:'Overall ESG', data:rankings.map(r=>r.overall), backgroundColor:rankings.map((_,i)=>colors[i]), borderRadius:6 } ]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:60,max:100} },
      plugins:{ legend:{display:false} }
    }});

    this.viewDeptDetail(rankings[0].id);
  },

  viewDeptDetail: function(deptId) {
    const dept = window.ESG_DATA.departments.find(d=>d.id===deptId);
    if (!dept) return;
    const scores = window.ESG_CALC.calculateScores({deptId});
    const emps = window.ESG_DATA.employees.filter(e=>e.deptId===deptId);
    document.getElementById('dept-detail-area').innerHTML = `
      <div class="card scale-in">
        <div class="card-title">${dept.name} – Department Profile <span class="card-subtitle">Head: ${dept.head} · ${dept.headcount} employees</span></div>
        <div class="visuals-grid" style="margin-bottom:0;">
          <div class="col-4">
            <div class="stat-row"><span class="stat-label">Overall ESG</span><span class="stat-value text-overall fw-800">${scores.overall}/100</span></div>
            <div class="stat-row"><span class="stat-label">Environmental</span><span class="stat-value text-env fw-bold">${scores.environmental}/100</span></div>
            <div class="stat-row"><span class="stat-label">Social</span><span class="stat-value text-soc fw-bold">${scores.social}/100</span></div>
            <div class="stat-row"><span class="stat-label">Governance</span><span class="stat-value text-gov fw-bold">${scores.governance}/100</span></div>
            <div class="stat-row"><span class="stat-label">Headcount</span><span class="stat-value">${dept.headcount}</span></div>
          </div>
          <div class="col-8">
            <div class="data-table-container">
              <table>
                <thead><tr><th>Employee</th><th>Role</th><th>Vol. Hrs</th><th>CSR Points</th><th>Badges</th><th>Compliance</th></tr></thead>
                <tbody>
                  ${emps.map(e=>{
                    const done=(e.complianceStatus.conduct?1:0)+(e.complianceStatus.security?1:0)+(e.complianceStatus.bribery?1:0)+(e.complianceStatus.dei?1:0);
                    return `<tr>
                      <td><strong>${e.name}</strong></td><td>${e.title}</td>
                      <td>${e.volunteerHours} hrs</td>
                      <td><strong class="text-soc">${e.rewardPoints} pts</strong></td>
                      <td>${e.badges.map(b=>`<span title="${window.ESG_DATA.badges[b]?.name||b}">${window.ESG_DATA.badges[b]?.icon||'🏅'}</span>`).join(' ')||'—'}</td>
                      <td><span class="badge ${done===4?'badge-success':'badge-warning'}">${done}/4</span></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
  },

  // ────────────────────────────────────────────────────────────
  // 6. EMPLOYEE DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderEmployee: function(filters) {
    const employees = window.ESG_DATA.employees;
    this.destroyCharts();
    this._container().innerHTML = `
      <div class="fade-in">
        <div class="card mb-24">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--color-text-muted);">Select Employee</label>
            <select id="emp-select" class="filter-control" style="max-width:320px;" onchange="window.ESG_DASHBOARDS.viewEmployeeDetail(this.value)">
              ${employees.map(e=>`<option value="${e.id}" ${filters&&filters.empId===e.id?'selected':''}>${e.name} – ${e.title}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="emp-detail"></div>
      </div>`;
    const startId = (filters&&filters.empId) ? filters.empId : employees[0].id;
    this.viewEmployeeDetail(startId);
  },

  viewEmployeeDetail: function(empId) {
    const e = window.ESG_DATA.employees.find(x=>x.id===empId);
    if (!e) return;
    const dept = window.ESG_DATA.departments.find(d=>d.id===e.deptId);
    const redemptions = window.ESG_DATA.redemptions.filter(r=>r.empId===empId);
    const done = Object.keys(e.complianceStatus).filter(k=>e.complianceStatus[k]).length;

    document.getElementById('emp-detail').innerHTML = `
      <div class="visuals-grid scale-in">
        <div class="card col-4">
          <div style="text-align:center;padding:16px 0 20px;">
            <div style="font-size:56px;margin-bottom:10px;">👤</div>
            <h2 style="font-family:var(--font-title);font-size:22px;font-weight:700;margin-bottom:4px;">${e.name}</h2>
            <p style="color:var(--color-text-secondary);font-size:13px;margin-bottom:8px;">${e.title}</p>
            <span class="badge badge-info">${dept.name}</span>
          </div>
          <div style="margin-top:16px;">
            <div class="stat-row"><span class="stat-label">CSR Reward Points</span><span class="stat-value text-soc fw-800">${e.rewardPoints} pts</span></div>
            <div class="stat-row"><span class="stat-label">Volunteer Hours</span><span class="stat-value fw-bold">${e.volunteerHours} hrs</span></div>
            <div class="stat-row"><span class="stat-label">Challenges Completed</span><span class="stat-value">${e.challengesCompleted}</span></div>
            <div class="stat-row"><span class="stat-label">Compliance Modules</span><span class="stat-value"><span class="badge ${done===4?'badge-success':'badge-warning'}">${done}/4</span></span></div>
            <div class="stat-row"><span class="stat-label">Badges Earned</span><span class="stat-value">${e.badges.length}</span></div>
            <div class="stat-row"><span class="stat-label">Member Since</span><span class="stat-value">${e.joinDate}</span></div>
          </div>
        </div>

        <div class="card col-8">
          <div class="card-title">Compliance Training Status</div>
          <div class="data-table-container mb-16">
            <table>
              <thead><tr><th>Module</th><th>Pillar</th><th>Status</th><th>Score</th></tr></thead>
              <tbody>
                ${[
                  {name:'Code of Conduct',       key:'conduct',  pillar:'G'},
                  {name:'Cybersecurity Awareness',key:'security', pillar:'G'},
                  {name:'Anti-Bribery & Corruption',key:'bribery',pillar:'G'},
                  {name:'DEI Foundations',        key:'dei',      pillar:'S'}
                ].map(m=>`<tr>
                  <td><strong>${m.name}</strong></td>
                  <td><span class="badge badge-${m.pillar==='G'?'gov':'soc'}">${m.pillar==='G'?'Governance':'Social'}</span></td>
                  <td><span class="badge ${e.complianceStatus[m.key]?'badge-success':'badge-warning'}">${e.complianceStatus[m.key]?'✓ Completed':'⚠ Pending'}</span></td>
                  <td>${e.complianceStatus[m.key]?'Passed (100%)':'—'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <div class="card-title mt-16">Earned Badges</div>
          <div class="badges-showcase">
            ${e.badges.length > 0
              ? e.badges.map(bk=>{ const b=window.ESG_DATA.badges[bk]; return `<div class="badge-item" title="${b.desc}"><div class="badge-item-icon">${b.icon}</div><div class="badge-item-name">${b.name}</div></div>`; }).join('')
              : '<p style="color:var(--color-text-muted);font-size:13px;grid-column:span 3;">No badges yet. Complete challenges to earn badges.</p>'}
          </div>

          ${redemptions.length > 0 ? `
            <div class="card-title mt-16">Reward Redemption History</div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>Reward</th><th>Points</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  ${redemptions.map(r=>{ const rw=window.ESG_DATA.rewardsCatalog.find(x=>x.id===r.rewardId)||{}; return `<tr>
                    <td><strong>${rw.title||r.rewardId}</strong></td>
                    <td>${r.points} pts</td><td>${r.date}</td>
                    <td><span class="badge ${r.status==='Fulfilled'?'badge-success':'badge-warning'}">${r.status}</span></td>
                  </tr>`; }).join('')}
                </tbody>
              </table>
            </div>` : ''}
        </div>
      </div>`;
  },

  // ────────────────────────────────────────────────────────────
  // 7. LEADERBOARD DASHBOARD
  // ────────────────────────────────────────────────────────────
  renderLeaderboard: function(filters) {
    const deptRankings = window.ESG_CALC.getDepartmentRankings(filters);
    const empByPoints  = [...window.ESG_DATA.employees].sort((a,b)=>b.rewardPoints-a.rewardPoints);
    const empByHours   = [...window.ESG_DATA.employees].sort((a,b)=>b.volunteerHours-a.volunteerHours);
    const empByBadges  = [...window.ESG_DATA.employees].sort((a,b)=>b.badges.length-a.badges.length);
    this.destroyCharts();
    const D = this._chartDefaults();

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">🏆 Department ESG Leaderboard <span class="card-subtitle">Overall ranking</span></div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>Rank</th><th>Department</th><th>ESG Score</th><th>E</th><th>S</th><th>G</th></tr></thead>
                <tbody>
                  ${deptRankings.map((r,i)=>`<tr>
                    <td class="${i===0?'rank-gold':i===1?'rank-silver':i===2?'rank-bronze':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</td>
                    <td><strong>${r.name}</strong><br><span style="font-size:11px;color:var(--color-text-muted);">${r.head}</span></td>
                    <td><strong class="text-overall">${r.overall}/100</strong></td>
                    <td class="text-env">${r.e}</td><td class="text-soc">${r.s}</td><td class="text-gov">${r.g}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="card col-6">
            <div class="card-title">🎯 Employee CSR Points Ranking <span class="card-subtitle">Top earners</span></div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>Rank</th><th>Employee</th><th>Department</th><th>Points</th><th>Badges</th></tr></thead>
                <tbody>
                  ${empByPoints.slice(0,10).map((e,i)=>{ const dept=window.ESG_DATA.departments.find(d=>d.id===e.deptId); return `<tr>
                    <td class="${i===0?'rank-gold':i===1?'rank-silver':i===2?'rank-bronze':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</td>
                    <td><strong>${e.name}</strong></td>
                    <td><span class="chip">${dept.name}</span></td>
                    <td><strong class="text-soc">${e.rewardPoints} pts</strong></td>
                    <td>${e.badges.map(b=>window.ESG_DATA.badges[b]?.icon||'🏅').join('')||'—'}</td>
                  </tr>`; }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">⏱️ Top Volunteers <span class="card-subtitle">By hours logged</span></div>
            <div class="chart-container"><canvas id="ch-leader-hours"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">🏅 Badge Earners <span class="card-subtitle">Most badges earned</span></div>
            <div class="chart-container"><canvas id="ch-leader-badges"></canvas></div>
          </div>
        </div>
      </div>`;

    this._ch('ch-leader-hours', { type:'bar', data:{
      labels: empByHours.slice(0,8).map(e=>e.name),
      datasets:[{ label:'Volunteer Hours', data:empByHours.slice(0,8).map(e=>e.volunteerHours), backgroundColor:'rgba(139,92,246,0.7)', borderColor:'#8b5cf6', borderWidth:1, borderRadius:5 }]
    }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{color:D.gridColor},ticks:{color:D.tickColor}}, y:{grid:{display:false},ticks:{color:D.tickColor}} },
      plugins:{ legend:{display:false} }
    }});

    this._ch('ch-leader-badges', { type:'bar', data:{
      labels: empByBadges.slice(0,8).map(e=>e.name),
      datasets:[{ label:'Badges', data:empByBadges.slice(0,8).map(e=>e.badges.length), backgroundColor:'rgba(245,158,11,0.7)', borderColor:'#f59e0b', borderWidth:1, borderRadius:5 }]
    }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{color:D.gridColor},ticks:{color:D.tickColor},precision:0}, y:{grid:{display:false},ticks:{color:D.tickColor}} },
      plugins:{ legend:{display:false} }
    }});
  },

  // ────────────────────────────────────────────────────────────
  // 8. ANALYTICS DASHBOARD – Multi-Dimensional Data Matrix
  // ────────────────────────────────────────────────────────────
  renderAnalytics: function(filters) {
    const employees = window.ESG_DATA.employees;
    const depts = window.ESG_DATA.departments;
    this.destroyCharts();
    let rows = employees;
    if (filters) {
      if (filters.deptId) rows = rows.filter(e=>e.deptId===filters.deptId);
      if (filters.empId)  rows = rows.filter(e=>e.id===filters.empId);
    }

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="card">
          <div class="card-title">ESG Multi-Dimensional Data Matrix <span class="card-subtitle">Cross-filter slice-and-dice analytics</span></div>
          <div class="data-table-container">
            <table>
              <thead><tr><th>Employee</th><th>Department</th><th>Vol. Hours</th><th>CSR Points</th><th>Challenges</th><th>Badges</th><th>Env Badges</th><th>Compliance</th><th>Joined</th></tr></thead>
              <tbody>
                ${rows.map(e=>{ const dept=depts.find(d=>d.id===e.deptId); const comp=(e.complianceStatus.conduct?1:0)+(e.complianceStatus.security?1:0)+(e.complianceStatus.bribery?1:0)+(e.complianceStatus.dei?1:0); const envBadges=e.badges.filter(b=>window.ESG_DATA.badges[b]?.pillar==='E').length; return `<tr>
                  <td><strong>${e.name}</strong></td>
                  <td><span class="chip">${dept.name}</span></td>
                  <td>${e.volunteerHours} hrs</td>
                  <td><strong class="text-soc">${e.rewardPoints}</strong></td>
                  <td>${e.challengesCompleted}</td>
                  <td>${e.badges.map(b=>window.ESG_DATA.badges[b]?.icon||'🏅').join(' ')||'—'}</td>
                  <td>${envBadges}</td>
                  <td><span class="badge ${comp===4?'badge-success':'badge-warning'}">${comp}/4</span></td>
                  <td style="color:var(--color-text-muted);font-size:12px;">${e.joinDate}</td>
                </tr>`; }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  },

  // ────────────────────────────────────────────────────────────
  // ANALYTICS SUB-PANELS
  // ────────────────────────────────────────────────────────────

  renderChallengeAnalytics: function(filters) {
    const challenges = window.ESG_CALC.getChallengeStats(filters);
    this.destroyCharts();
    const D = this._chartDefaults();

    const envCh = challenges.filter(c=>c.pillar==='E');
    const socCh = challenges.filter(c=>c.pillar==='S');
    const govCh = challenges.filter(c=>c.pillar==='G');

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${this._kpi('overall','🎯','Total Challenges',challenges.length,'Across all pillars','trend-neutral')}
          ${this._kpi('environmental','🌱','Environmental',envCh.length,'Active & Completed','trend-up')}
          ${this._kpi('social','🤝','Social',socCh.length,'Active & Completed','trend-up')}
          ${this._kpi('governance','🛡️','Governance',govCh.length,'Active & Completed','trend-up')}
        </div>

        <div class="visuals-grid">
          <div class="card col-8">
            <div class="card-title">Challenge Completion vs Enrollment <span class="card-subtitle">All challenges</span></div>
            <div class="chart-container"><canvas id="ch-chal-compare"></canvas></div>
          </div>
          <div class="card col-4">
            <div class="card-title">Challenges by Pillar</div>
            <div class="chart-container"><canvas id="ch-chal-pie"></canvas></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">All CSR Challenges – Detailed Status</div>
          <div class="data-table-container">
            <table>
              <thead><tr><th>Challenge</th><th>Pillar</th><th>Category</th><th>Period</th><th>Participants</th><th>Enrollment %</th><th>Completion %</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                ${challenges.map(c=>`<tr>
                  <td><strong>${c.name}</strong></td>
                  <td><span class="badge badge-${c.pillar==='E'?'env':c.pillar==='S'?'soc':'gov'}">${c.pillar==='E'?'Environmental':c.pillar==='S'?'Social':'Governance'}</span></td>
                  <td>${c.category}</td>
                  <td><span class="chip">${c.quarter}</span></td>
                  <td>${c.participants}/${c.totalEligible}</td>
                  <td>
                    <div class="goal-bar-bg" style="width:80px;display:inline-block;vertical-align:middle;margin-right:6px;"><div class="goal-bar-fill ${c.pillar==='E'?'env':c.pillar==='S'?'soc':'gov'}" style="width:${c.enrollmentRate}%"></div></div>
                    ${c.enrollmentRate}%
                  </td>
                  <td>
                    <div class="goal-bar-bg" style="width:80px;display:inline-block;vertical-align:middle;margin-right:6px;"><div class="goal-bar-fill ${c.pillar==='E'?'env':c.pillar==='S'?'soc':'gov'}" style="width:${c.completionRate}%"></div></div>
                    ${c.completionRate}%
                  </td>
                  <td>${c.pointsReward} pts</td>
                  <td><span class="badge ${c.status==='Completed'?'badge-success':c.status==='Active'?'badge-info':'badge-warning'}">${c.status}</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    this._ch('ch-chal-compare', { type:'bar', data:{
      labels: challenges.map(c=>c.name),
      datasets:[
        { label:'Enrollment %',  data:challenges.map(c=>c.enrollmentRate),  backgroundColor:'rgba(6,182,212,0.6)',   borderRadius:4 },
        { label:'Completion %',  data:challenges.map(c=>c.completionRate),  backgroundColor:'rgba(16,185,129,0.6)',  borderRadius:4 }
      ]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor,maxRotation:30}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},min:0,max:100} },
      plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});

    this._ch('ch-chal-pie', { type:'doughnut', data:{
      labels:['Environmental','Social','Governance'],
      datasets:[{ data:[envCh.length,socCh.length,govCh.length], backgroundColor:['#10b981','#8b5cf6','#f59e0b'], borderColor:'transparent' }]
    }, options:{ responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{ legend:{position:'bottom',labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});
  },

  renderComplianceAnalytics: function(filters) {
    const compliance = window.ESG_CALC.getComplianceAnalytics(filters);
    const employees  = window.ESG_DATA.employees;
    this.destroyCharts();
    const D = this._chartDefaults();
    const depts = window.ESG_DATA.departments;

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${compliance.map(m=>`<div class="kpi-card ${m.pillar==='G'?'governance':'social'}">
            <div class="kpi-header"><span class="kpi-title">${m.name}</span><span class="kpi-icon">${m.pillar==='G'?'🛡️':'🎓'}</span></div>
            <div class="kpi-value">${m.rate}%</div>
            <div class="kpi-trend ${m.rate>=90?'trend-up':m.rate>=70?'trend-neutral':'trend-down'}">${m.completed}/${m.total} completed</div>
          </div>`).join('')}
        </div>

        <div class="visuals-grid">
          <div class="card col-8">
            <div class="card-title">Compliance Rate by Module <span class="card-subtitle">% of employees signed off</span></div>
            <div class="chart-container"><canvas id="ch-comp-bar"></canvas></div>
          </div>
          <div class="card col-4">
            <div class="card-title">Dept Compliance Heat Map <span class="card-subtitle">All modules combined</span></div>
            <div style="padding:8px 0;">
              ${depts.map(d=>{
                const emps=employees.filter(e=>e.deptId===d.id);
                if(!emps.length) return '';
                const avgComp=emps.reduce((s,e)=>s+(e.complianceStatus.conduct?1:0)+(e.complianceStatus.security?1:0)+(e.complianceStatus.bribery?1:0)+(e.complianceStatus.dei?1:0),0)/(emps.length*4)*100;
                return `<div style="margin-bottom:12px;">
                  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span>${d.name}</span><strong>${Math.round(avgComp)}%</strong></div>
                  <div class="goal-bar-bg"><div class="goal-bar-fill gov" style="width:${avgComp}%"></div></div>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Employee Compliance Detail</div>
          <div class="data-table-container">
            <table>
              <thead><tr><th>Employee</th><th>Dept</th><th>Code of Conduct</th><th>Cybersecurity</th><th>Anti-Bribery</th><th>DEI</th><th>Overall</th></tr></thead>
              <tbody>
                ${employees.map(e=>{ const dept=depts.find(d=>d.id===e.deptId); const done=(e.complianceStatus.conduct?1:0)+(e.complianceStatus.security?1:0)+(e.complianceStatus.bribery?1:0)+(e.complianceStatus.dei?1:0); return `<tr>
                  <td><strong>${e.name}</strong></td>
                  <td><span class="chip">${dept.name}</span></td>
                  ${['conduct','security','bribery','dei'].map(k=>`<td><span class="badge ${e.complianceStatus[k]?'badge-success':'badge-danger'}">${e.complianceStatus[k]?'✓':'✗'}</span></td>`).join('')}
                  <td><span class="badge ${done===4?'badge-success':'badge-warning'}">${done}/4</span></td>
                </tr>`; }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    this._ch('ch-comp-bar', { type:'bar', data:{
      labels: compliance.map(m=>m.name),
      datasets:[
        { label:'Completed (%)', data:compliance.map(m=>m.rate),       backgroundColor:'rgba(16,185,129,0.7)',  borderRadius:5 },
        { label:'Pending (%)',   data:compliance.map(m=>100-m.rate),   backgroundColor:'rgba(239,68,68,0.35)', borderRadius:5 }
      ]
    }, options:{ responsive:true, maintainAspectRatio:false, scales:{
      x:{grid:{display:false},ticks:{color:D.tickColor}},
      y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},stacked:false,min:0,max:100}
    }, plugins:{ legend:{labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});
  },

  renderRewardAnalytics: function(filters) {
    const analytics = window.ESG_CALC.getRewardAnalytics(filters);
    this.destroyCharts();
    const D = this._chartDefaults();

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${this._kpi('social','🎁','Points Redeemed',analytics.totalPointsRedeemed,'Total this period','trend-up')}
          ${this._kpi('social','🛒','Transactions',analytics.totalTransactions,'Redemption events','trend-up')}
          ${this._kpi('environmental','🌱','Env. Rewards',Object.keys(analytics.byCategory).includes('Environmental')?analytics.byCategory['Environmental']+'pts':'0 pts','Environmental category','trend-up')}
          ${this._kpi('social','🤝','Social Rewards',Object.keys(analytics.byCategory).includes('Social')?analytics.byCategory['Social']+'pts':'0 pts','Social category','trend-neutral')}
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Points by Category <span class="card-subtitle">Distribution of redemptions</span></div>
            <div class="chart-container"><canvas id="ch-rew-cat"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">Monthly Redemption Volume <span class="card-subtitle">Points redeemed per month</span></div>
            <div class="chart-container"><canvas id="ch-rew-month"></canvas></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Reward Redemption History</div>
          <div class="data-table-container">
            <table>
              <thead><tr><th>Transaction ID</th><th>Employee</th><th>Reward</th><th>Category</th><th>Points</th><th>Date</th><th>Quarter</th><th>Status</th></tr></thead>
              <tbody>
                ${analytics.redemptions.map(r=>{ const emp=window.ESG_DATA.employees.find(e=>e.id===r.empId)||{}; const rw=window.ESG_DATA.rewardsCatalog.find(x=>x.id===r.rewardId)||{}; return `<tr>
                  <td><strong>${r.id}</strong></td>
                  <td>${emp.name||r.empId}</td>
                  <td><strong>${rw.title||r.rewardId}</strong></td>
                  <td><span class="badge badge-${rw.category==='Environmental'?'env':rw.category==='Social'?'soc':'gov'}">${rw.category||'—'}</span></td>
                  <td><strong class="text-soc">${r.points} pts</strong></td>
                  <td>${r.date}</td>
                  <td><span class="chip">${r.quarter}</span></td>
                  <td><span class="badge ${r.status==='Fulfilled'?'badge-success':'badge-warning'}">${r.status}</span></td>
                </tr>`; }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    const catData = analytics.byCategory;
    this._ch('ch-rew-cat', { type:'pie', data:{
      labels: Object.keys(catData),
      datasets:[{ data:Object.values(catData), backgroundColor:['#10b981','#8b5cf6','#f59e0b'], borderColor:'transparent' }]
    }, options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:'bottom',labels:{color:D.legendColor,font:{family:D.fontFamily}}} }
    }});

    const months = Object.keys(analytics.byMonth).sort();
    this._ch('ch-rew-month', { type:'bar', data:{
      labels: months,
      datasets:[{ label:'Points Redeemed', data:months.map(m=>analytics.byMonth[m]), backgroundColor:'rgba(139,92,246,0.7)', borderColor:'#8b5cf6', borderWidth:1, borderRadius:5 }]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor}} },
      plugins:{ legend:{display:false} }
    }});
  },

  renderBadgeAnalytics: function(filters) {
    const analytics = window.ESG_CALC.getBadgeAnalytics(filters);
    this.destroyCharts();
    const D = this._chartDefaults();

    this._container().innerHTML = `
      <div class="fade-in">
        <div class="kpi-grid">
          ${this._kpi('social','🏅','Total Badges Issued',analytics.totalBadges,'All badge types','trend-up')}
          ${this._kpi('environmental','🌱','Environmental Badges',Object.entries(analytics.counts).filter(([k])=>window.ESG_DATA.badges[k]?.pillar==='E').reduce((s,[,v])=>s+v,0),'E-pillar badges','trend-up')}
          ${this._kpi('social','🤝','Social Badges',Object.entries(analytics.counts).filter(([k])=>window.ESG_DATA.badges[k]?.pillar==='S').reduce((s,[,v])=>s+v,0),'S-pillar badges','trend-up')}
          ${this._kpi('governance','🛡️','Governance Badges',Object.entries(analytics.counts).filter(([k])=>window.ESG_DATA.badges[k]?.pillar==='G').reduce((s,[,v])=>s+v,0),'G-pillar badges','trend-neutral')}
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">Badge Distribution <span class="card-subtitle">Count by type</span></div>
            <div class="chart-container"><canvas id="ch-badge-dist"></canvas></div>
          </div>
          <div class="card col-6">
            <div class="card-title">Badges by Department <span class="card-subtitle">Total earned per dept</span></div>
            <div class="chart-container"><canvas id="ch-badge-dept"></canvas></div>
          </div>
        </div>

        <div class="visuals-grid">
          <div class="card col-6">
            <div class="card-title">🏆 Top Badge Earners</div>
            <div class="data-table-container">
              <table>
                <thead><tr><th>Rank</th><th>Employee</th><th>Badges</th><th>Badge Icons</th></tr></thead>
                <tbody>
                  ${analytics.topEarners.map((e,i)=>`<tr>
                    <td>${['🥇','🥈','🥉'][i]||'#'+(i+1)}</td>
                    <td><strong>${e.name}</strong></td>
                    <td><strong>${e.badges.length}</strong></td>
                    <td>${e.badges.map(b=>window.ESG_DATA.badges[b]?.icon||'🏅').join(' ')||'—'}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="card col-6">
            <div class="card-title">Badge Catalogue</div>
            <div class="badges-showcase" style="margin-top:0;">
              ${Object.entries(window.ESG_DATA.badges).map(([k,b])=>`
                <div class="badge-item" title="${b.desc}">
                  <div class="badge-item-icon">${b.icon}</div>
                  <div class="badge-item-name">${b.name}</div>
                  <div style="margin-top:4px;font-size:10px;color:var(--color-text-muted);">${analytics.counts[k]||0} earned</div>
                  <span class="badge badge-${b.pillar==='E'?'env':b.pillar==='S'?'soc':'gov'}" style="margin-top:6px;">${b.pillar}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;

    const badgeKeys = Object.keys(analytics.counts);
    this._ch('ch-badge-dist', { type:'bar', data:{
      labels: badgeKeys.map(k=>window.ESG_DATA.badges[k]?.name||k),
      datasets:[{ label:'Times Earned', data:badgeKeys.map(k=>analytics.counts[k]), backgroundColor:badgeKeys.map(k=>{ const p=window.ESG_DATA.badges[k]?.pillar; return p==='E'?'#10b981':p==='S'?'#8b5cf6':'#f59e0b'; }), borderRadius:5 }]
    }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{color:D.gridColor},ticks:{color:D.tickColor},precision:0}, y:{grid:{display:false},ticks:{color:D.tickColor}} },
      plugins:{ legend:{display:false} }
    }});

    this._ch('ch-badge-dept', { type:'bar', data:{
      labels: Object.keys(analytics.byDept),
      datasets:[{ label:'Total Badges', data:Object.values(analytics.byDept), backgroundColor:'rgba(6,182,212,0.7)', borderColor:'#06b6d4', borderWidth:1, borderRadius:5 }]
    }, options:{ responsive:true, maintainAspectRatio:false,
      scales:{ x:{grid:{display:false},ticks:{color:D.tickColor}}, y:{grid:{color:D.gridColor},ticks:{color:D.tickColor},precision:0} },
      plugins:{ legend:{display:false} }
    }});
  },

  // ────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────
  _kpi: function(type, icon, title, value, sub, trendClass) {
    return `<div class="kpi-card ${type}">
      <div class="kpi-header"><span class="kpi-title">${title}</span><span class="kpi-icon">${icon}</span></div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-trend ${trendClass||'trend-neutral'}"><span>${sub}</span></div>
    </div>`;
  },

  _goalBar: function(label, pct, type) {
    const w = Math.min(100, Math.max(0, pct));
    return `<div class="goal-track">
      <div class="goal-header">
        <span class="goal-name">${label}</span>
        <span class="goal-pct">${pct}%</span>
      </div>
      <div class="goal-bar-bg"><div class="goal-bar-fill ${type}" style="width:${w}%"></div></div>
    </div>`;
  }
};
