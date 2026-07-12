// ============================================================
// ESG Analytics Platform - Mock Database
// All dashboards, reports, and analytics draw from this module
// ============================================================
window.ESG_DATA = {

  // ── Company Meta ────────────────────────────────────────────
  company: {
    name: "GreenVista Corp",
    fiscal_year: 2026,
    reporting_currency: "USD",
    baseline_year: 2024
  },

  // ── Departments ─────────────────────────────────────────────
  departments: [
    { id: "eng",   name: "Engineering",       head: "Sarah Chen",      headcount: 42, targetE: 85, targetS: 80, targetG: 95 },
    { id: "sales", name: "Sales & Marketing", head: "Michael Ross",    headcount: 28, targetE: 75, targetS: 85, targetG: 90 },
    { id: "hr",    name: "Human Resources",   head: "Elena Rostova",   headcount: 15, targetE: 80, targetS: 95, targetG: 95 },
    { id: "fin",   name: "Finance & Legal",   head: "David Vance",     headcount: 18, targetE: 70, targetS: 80, targetG: 100 },
    { id: "ops",   name: "Operations",        head: "Marcus Aurelius", headcount: 35, targetE: 90, targetS: 75, targetG: 90 },
    { id: "it",    name: "Information Tech",  head: "Priya Nair",      headcount: 22, targetE: 88, targetS: 82, targetG: 98 }
  ],

  // ── Employees ────────────────────────────────────────────────
  employees: [
    { id:"emp01", name:"Sarah Chen",    deptId:"eng",   title:"VP of Engineering",      volunteerHours:24, challengesCompleted:5, badges:["eco-warrior","leader-green"],           rewardPoints:1200, complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2021-03-01" },
    { id:"emp02", name:"Alex Kumar",    deptId:"eng",   title:"Senior Developer",        volunteerHours:18, challengesCompleted:3, badges:["eco-warrior","cycle-commute"],           rewardPoints:850,  complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2022-06-15" },
    { id:"emp03", name:"Elena Rostova", deptId:"hr",    title:"HR Director",             volunteerHours:32, challengesCompleted:6, badges:["volunteer-champ","leader-green"],        rewardPoints:1500, complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2020-01-10" },
    { id:"emp04", name:"John Doe",      deptId:"sales", title:"Account Executive",       volunteerHours:10, challengesCompleted:1, badges:["eco-warrior"],                           rewardPoints:400,  complianceStatus:{conduct:true, security:true, bribery:false, dei:true},   joinDate:"2023-02-20" },
    { id:"emp05", name:"Jane Smith",    deptId:"sales", title:"Marketing Manager",       volunteerHours:15, challengesCompleted:2, badges:["cycle-commute"],                         rewardPoints:600,  complianceStatus:{conduct:true, security:true, bribery:true, dei:false},   joinDate:"2022-09-05" },
    { id:"emp06", name:"David Vance",   deptId:"fin",   title:"Chief Legal Officer",     volunteerHours:8,  challengesCompleted:1, badges:["ethics-guard"],                          rewardPoints:500,  complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2019-07-22" },
    { id:"emp07", name:"Marcus Aurelius",deptId:"ops",  title:"Operations Manager",      volunteerHours:22, challengesCompleted:4, badges:["eco-warrior","waste-zero"],              rewardPoints:1050, complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2021-11-08" },
    { id:"emp08", name:"Robert Hall",   deptId:"ops",   title:"Logistics Specialist",    volunteerHours:12, challengesCompleted:2, badges:["waste-zero"],                            rewardPoints:550,  complianceStatus:{conduct:true, security:false, bribery:true, dei:true},   joinDate:"2023-04-17" },
    { id:"emp09", name:"Alice Martin",  deptId:"eng",   title:"QA Engineer",             volunteerHours:20, challengesCompleted:4, badges:["eco-warrior","volunteer-champ"],         rewardPoints:950,  complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2022-01-30" },
    { id:"emp10", name:"Bob Villanueva",deptId:"fin",   title:"Controller",              volunteerHours:5,  challengesCompleted:0, badges:[],                                        rewardPoints:100,  complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2024-03-12" },
    { id:"emp11", name:"Priya Nair",    deptId:"it",    title:"IT Director",             volunteerHours:28, challengesCompleted:5, badges:["leader-green","eco-warrior"],            rewardPoints:1300, complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2020-08-14" },
    { id:"emp12", name:"Leo Torres",    deptId:"it",    title:"DevOps Engineer",         volunteerHours:14, challengesCompleted:3, badges:["cycle-commute","waste-zero"],             rewardPoints:720,  complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2023-01-09" },
    { id:"emp13", name:"Anika Patel",   deptId:"hr",    title:"Talent Acquisition Lead", volunteerHours:26, challengesCompleted:5, badges:["volunteer-champ","ethics-guard"],        rewardPoints:1100, complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2021-06-28" },
    { id:"emp14", name:"Carlos Lima",   deptId:"sales", title:"Sales Director",          volunteerHours:9,  challengesCompleted:2, badges:["cycle-commute"],                         rewardPoints:480,  complianceStatus:{conduct:true, security:true, bribery:true, dei:false},   joinDate:"2022-12-01" },
    { id:"emp15", name:"Nina Shah",     deptId:"ops",   title:"Supply Chain Analyst",    volunteerHours:17, challengesCompleted:3, badges:["eco-warrior","waste-zero"],              rewardPoints:800,  complianceStatus:{conduct:true, security:true, bribery:true, dei:true},    joinDate:"2023-07-19" }
  ],

  // ── Carbon Footprint: 12-month history (Jul 2025 – Jun 2026) ──
  carbonFootprint: {
    months: ["Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026","Jun 2026"],
    baseline: { scope1: 48, scope2: 63, scope3: 92 }, // tCO2e monthly average at 2024 baseline
    datasets: {
      eng:   { scope1:[8.5,8.2,7.9,8.0,8.4,9.0,9.2,8.8,8.0,7.5,7.2,6.8], scope2:[12.0,11.5,11.0,10.5,11.2,12.5,13.0,12.0,10.8,9.8,9.0,8.5],  scope3:[15.0,14.5,14.0,15.2,16.0,17.5,16.8,15.5,14.2,13.0,12.5,12.0] },
      sales: { scope1:[5.0,4.8,4.6,5.2,5.5,5.8,6.0,5.5,5.0,4.5,4.2,4.0], scope2:[8.5,8.2,7.9,8.0,8.4,9.0,9.2,8.8,8.0,7.5,7.2,6.8],           scope3:[28.0,26.5,25.0,29.0,31.0,34.0,32.5,30.0,27.5,25.0,23.5,22.0] },
      hr:    { scope1:[2.0,1.9,1.8,2.0,2.1,2.4,2.5,2.3,2.0,1.8,1.7,1.6], scope2:[4.0,3.8,3.6,3.8,4.0,4.5,4.6,4.2,3.8,3.5,3.2,3.0],           scope3:[6.0,5.8,5.5,6.2,6.5,7.0,6.8,6.2,5.8,5.2,4.8,4.5] },
      fin:   { scope1:[2.2,2.1,2.0,2.2,2.3,2.5,2.6,2.4,2.2,2.0,1.9,1.8], scope2:[4.5,4.2,4.0,4.2,4.5,5.0,5.2,4.8,4.3,4.0,3.8,3.5],           scope3:[8.0,7.5,7.2,8.5,9.0,10.0,9.5,8.8,8.0,7.5,7.0,6.5] },
      ops:   { scope1:[24.0,23.5,22.8,23.0,24.5,26.0,26.5,25.0,23.8,22.0,21.0,20.0], scope2:[18.0,17.5,17.0,16.5,17.8,19.5,20.0,18.5,17.0,15.5,14.8,14.0], scope3:[12.0,11.5,11.0,11.8,12.5,13.5,13.0,12.2,11.5,10.8,10.2,9.8] },
      it:    { scope1:[3.2,3.0,2.9,3.1,3.3,3.8,4.0,3.6,3.2,2.8,2.6,2.4], scope2:[9.0,8.8,8.5,8.2,8.8,10.0,10.5,9.8,9.0,8.2,7.8,7.5],         scope3:[5.0,4.8,4.5,5.0,5.5,6.2,5.8,5.4,5.0,4.5,4.2,4.0] }
    }
  },

  // ── Environmental Metrics (Annual 2026) ──────────────────────
  environmentalMetrics: {
    renewableEnergyPercent: 42,
    wasteDiversionRate: 68,
    waterConservationIndex: 78,
    baselineCarbon: 750,
    actualCarbon: 692,
    solarPanelsInstalled: 320,
    electricVehiclesFleet: 8,
    treesPlaneted: 1250
  },

  // ── Quarterly Targets ────────────────────────────────────────
  quarterlyTargets: {
    Q1: { carbon: 195, energy: 35, waste: 60, water: 70 },
    Q2: { carbon: 185, energy: 38, waste: 64, water: 74 },
    Q3: { carbon: 175, energy: 40, waste: 67, water: 76 },
    Q4: { carbon: 165, energy: 42, waste: 70, water: 80 }
  },

  // ── CSR Challenges ───────────────────────────────────────────
  challenges: [
    { id:"ch01", name:"Zero Waste Week",          category:"Environmental", pillar:"E", month:"2026-01", quarter:"Q1", startDate:"2026-01-10", endDate:"2026-01-17", status:"Completed", participants:45, totalEligible:80, target:80, current:85, unit:"% Diversion",      pointsReward:300 },
    { id:"ch02", name:"Active Commute June",       category:"Environmental", pillar:"E", month:"2026-06", quarter:"Q2", startDate:"2026-06-01", endDate:"2026-06-30", status:"Completed", participants:32, totalEligible:80, target:500, current:480, unit:"kg CO2 Saved",    pointsReward:400 },
    { id:"ch03", name:"DEI Training Sprint",       category:"Social",        pillar:"S", month:"2026-07", quarter:"Q3", startDate:"2026-07-01", endDate:"2026-07-31", status:"Active",    participants:55, totalEligible:80, target:100, current:75,  unit:"% Completion",    pointsReward:200 },
    { id:"ch04", name:"Volunteer Day Out",         category:"Social",        pillar:"S", month:"2026-04", quarter:"Q2", startDate:"2026-04-15", endDate:"2026-04-15", status:"Completed", participants:60, totalEligible:80, target:100, current:120, unit:"Volunteer Hours", pointsReward:500 },
    { id:"ch05", name:"Ethics & Compliance Drive", category:"Governance",    pillar:"G", month:"2026-05", quarter:"Q2", startDate:"2026-05-10", endDate:"2026-05-31", status:"Completed", participants:78, totalEligible:80, target:100, current:95,  unit:"% Accepted",      pointsReward:350 },
    { id:"ch06", name:"Solar Awareness Month",     category:"Environmental", pillar:"E", month:"2026-03", quarter:"Q1", startDate:"2026-03-01", endDate:"2026-03-31", status:"Completed", participants:52, totalEligible:80, target:80,  current:78,  unit:"% Participation", pointsReward:250 },
    { id:"ch07", name:"Mental Health Week",        category:"Social",        pillar:"S", month:"2026-02", quarter:"Q1", startDate:"2026-02-10", endDate:"2026-02-14", status:"Completed", participants:70, totalEligible:80, target:80,  current:88,  unit:"% Participation", pointsReward:200 },
    { id:"ch08", name:"Cybersecurity Sprint",      category:"Governance",    pillar:"G", month:"2026-06", quarter:"Q2", startDate:"2026-06-01", endDate:"2026-06-15", status:"Completed", participants:72, totalEligible:80, target:100, current:90,  unit:"% Enrolled",      pointsReward:300 },
    { id:"ch09", name:"Water Conservation Drive",  category:"Environmental", pillar:"E", month:"2026-05", quarter:"Q2", startDate:"2026-05-01", endDate:"2026-05-31", status:"Completed", participants:38, totalEligible:80, target:70,  current:65,  unit:"% Reduction",     pointsReward:280 },
    { id:"ch10", name:"Financial Ethics Workshop", category:"Governance",    pillar:"G", month:"2026-03", quarter:"Q1", startDate:"2026-03-15", endDate:"2026-03-20", status:"Completed", participants:48, totalEligible:80, target:75,  current:80,  unit:"% Completion",    pointsReward:320 }
  ],

  // ── Governance Compliance ─────────────────────────────────────
  governanceCompliance: {
    auditScore: 92,
    policySignoffRate: 94,
    whistleblowerResolutionTime: 4.2,
    whistleblowerIncidents: { active:0, resolved:3, total:3 },
    // Quarterly audit results
    quarterlyAudit: {
      Q1: { score:89, issues:2, resolved:2 },
      Q2: { score:92, issues:1, resolved:1 },
      Q3: { score:94, issues:0, resolved:0 },
      Q4: { score:92, issues:1, resolved:0 }
    },
    incidentLog: [
      { id:"inc01", category:"Data Leak",              severity:"Low",    date:"2026-02-14", status:"Resolved", dept:"it",    details:"Accidental email sharing; contained in 2 hours." },
      { id:"inc02", category:"Conflict of Interest",   severity:"Medium", date:"2026-04-03", status:"Resolved", dept:"fin",   details:"Review of vendor relationship; conflict cleared." },
      { id:"inc03", category:"Gift Policy Deviation",  severity:"Low",    date:"2026-05-18", status:"Resolved", dept:"sales", details:"Gift reported post-deadline; warnings issued." }
    ],
    // Monthly policy completion rates per dept
    monthlyPolicyRates: {
      eng:   [88,90,92,93,94,95,95,96,96,97,97,98],
      sales: [80,82,84,85,86,86,87,88,88,89,90,90],
      hr:    [95,96,97,97,98,98,99,99,100,100,100,100],
      fin:   [90,92,93,95,96,97,97,98,98,99,99,100],
      ops:   [82,84,85,86,87,88,88,89,89,90,91,91],
      it:    [92,93,94,95,96,96,97,97,98,98,99,99]
    }
  },

  // ── Reward Program ────────────────────────────────────────────
  rewardsCatalog: [
    { id:"rew01", title:"Plant 10 Trees",           points:300,  category:"Environmental", stock:999, description:"We will plant trees in your name in partnership with local NGOs." },
    { id:"rew02", title:"Solar Charger Bundle",     points:800,  category:"Environmental", stock:15,  description:"Premium solar-powered charging kit for home or office." },
    { id:"rew03", title:"Charity Matching Gift $25",points:500,  category:"Social",        stock:999, description:"GreenVista matches your donation dollar-for-dollar up to $25." },
    { id:"rew04", title:"Volunteer Day Off Pass",   points:1000, category:"Social",        stock:50,  description:"Get a paid day off to volunteer at a cause of your choice." },
    { id:"rew05", title:"Anti-Plastic Lunch Set",   points:400,  category:"Environmental", stock:28,  description:"Bamboo cutlery, reusable straw, and beeswax wraps bundle." },
    { id:"rew06", title:"Bike Commute Gear Pack",   points:600,  category:"Environmental", stock:20,  description:"Helmet, lights, and panniers for sustainable commuting." },
    { id:"rew07", title:"Mental Health App 1-Year", points:350,  category:"Social",        stock:999, description:"1-year subscription to a leading mindfulness and mental wellness app." },
    { id:"rew08", title:"Ethics Training Certificate",points:200,category:"Governance",    stock:999, description:"Enroll in an accredited external ethics certification course." }
  ],

  redemptions: [
    { id:"red01", empId:"emp01", rewardId:"rew01", date:"2026-03-12", points:300, status:"Fulfilled",  month:"2026-03", quarter:"Q1" },
    { id:"red02", empId:"emp03", rewardId:"rew04", date:"2026-04-20", points:1000,status:"Fulfilled",  month:"2026-04", quarter:"Q2" },
    { id:"red03", empId:"emp07", rewardId:"rew02", date:"2026-05-02", points:800, status:"Fulfilled",  month:"2026-05", quarter:"Q2" },
    { id:"red04", empId:"emp02", rewardId:"rew05", date:"2026-06-15", points:400, status:"Fulfilled",  month:"2026-06", quarter:"Q2" },
    { id:"red05", empId:"emp09", rewardId:"rew03", date:"2026-07-05", points:500, status:"Processing", month:"2026-07", quarter:"Q3" },
    { id:"red06", empId:"emp11", rewardId:"rew06", date:"2026-02-28", points:600, status:"Fulfilled",  month:"2026-02", quarter:"Q1" },
    { id:"red07", empId:"emp13", rewardId:"rew07", date:"2026-04-10", points:350, status:"Fulfilled",  month:"2026-04", quarter:"Q2" },
    { id:"red08", empId:"emp15", rewardId:"rew05", date:"2026-05-22", points:400, status:"Fulfilled",  month:"2026-05", quarter:"Q2" },
    { id:"red09", empId:"emp06", rewardId:"rew08", date:"2026-01-18", points:200, status:"Fulfilled",  month:"2026-01", quarter:"Q1" },
    { id:"red10", empId:"emp12", rewardId:"rew01", date:"2026-06-30", points:300, status:"Fulfilled",  month:"2026-06", quarter:"Q2" }
  ],

  // ── Badges ────────────────────────────────────────────────────
  badges: {
    "eco-warrior":     { name:"Eco Warrior",            desc:"Completed 3+ Environmental challenges", icon:"🌱", pillar:"E", color:"#10b981" },
    "leader-green":    { name:"Sustainability Leader",  desc:"Department E-score leader",             icon:"👑", pillar:"E", color:"#059669" },
    "volunteer-champ": { name:"Volunteer Champion",     desc:"20+ volunteer hours logged",            icon:"🤝", pillar:"S", color:"#8b5cf6" },
    "cycle-commute":   { name:"Clean Commuter",         desc:"Participated in clean transit program",  icon:"🚲", pillar:"S", color:"#7c3aed" },
    "waste-zero":      { name:"Zero Waste Hero",        desc:"No single-use plastic for 30 days",     icon:"♻️", pillar:"E", color:"#34d399" },
    "ethics-guard":    { name:"Ethics Guardian",        desc:"100% compliance training speed",         icon:"🛡️", pillar:"G", color:"#f59e0b" }
  },

  // ── Monthly Period Labels ─────────────────────────────────────
  periods: {
    monthly: [
      {value:"2026-01",label:"Jan 2026"},{value:"2026-02",label:"Feb 2026"},{value:"2026-03",label:"Mar 2026"},
      {value:"2026-04",label:"Apr 2026"},{value:"2026-05",label:"May 2026"},{value:"2026-06",label:"Jun 2026"},
      {value:"2026-07",label:"Jul 2026"}
    ],
    quarterly: [
      {value:"Q1",label:"Q1 2026 (Jan–Mar)"},{value:"Q2",label:"Q2 2026 (Apr–Jun)"},{value:"Q3",label:"Q3 2026 (Jul–Sep)"}
    ],
    yearly: [
      {value:"2026",label:"FY 2026"},{value:"2025",label:"FY 2025"}
    ]
  },

  // ── Monthly ESG Score History (for trend charts) ─────────────
  monthlyScoreHistory: {
    months: ["Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026","Jun 2026","Jul 2026"],
    environmental: [68,70,71,73,74,76,78],
    social:        [72,73,74,75,76,77,79],
    governance:    [88,89,90,90,91,92,93],
    overall:       [75,76,77,78,79,80,82]
  }
};
