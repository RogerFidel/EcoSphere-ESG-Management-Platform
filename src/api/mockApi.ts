import axios from 'axios';

// --- INITIAL SEED DATA ---
const DEFAULT_DEPARTMENTS = [
  { id: 'dept-1', name: 'Logistics & Supply Chain', head: 'Sarah Jenkins', employeesCount: 120, budget: 45000 },
  { id: 'dept-2', name: 'Corporate Headquarters', head: 'Robert Chen', employeesCount: 85, budget: 30000 },
  { id: 'dept-3', name: 'Manufacturing Division', head: 'Marcus Vance', employeesCount: 450, budget: 120000 },
  { id: 'dept-4', name: 'Research & Development', head: 'Dr. Elena Rostova', employeesCount: 65, budget: 50000 },
  { id: 'dept-5', name: 'Sales & Marketing', head: 'Patricia Diaz', employeesCount: 140, budget: 25000 },
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Electricity Consumption', scope: 2, unit: 'kWh', description: 'Purchased electricity for building operations' },
  { id: 'cat-2', name: 'Natural Gas Heating', scope: 1, unit: 'm3', description: 'On-site natural gas combustion for heating' },
  { id: 'cat-3', name: 'Corporate Jet Travel', scope: 1, unit: 'km', description: 'Fuel combusted during private jet flights' },
  { id: 'cat-4', name: 'Employee Commuting', scope: 3, unit: 'Passenger-km', description: 'Carbon emissions from employees commuting to work' },
  { id: 'cat-5', name: 'Commercial Flights', scope: 3, unit: 'km', description: 'Business travel on third-party commercial airlines' },
  { id: 'cat-6', name: 'Waste Disposal', scope: 3, unit: 'metric-tons', description: 'Landfill and recycling disposal footprint' },
  { id: 'cat-7', name: 'Company Owned Vehicles', scope: 1, unit: 'Liters', description: 'Diesel and petrol consumed by delivery trucks and fleet' },
];

const DEFAULT_EMISSION_FACTORS = [
  { id: 'ef-1', categoryId: 'cat-1', categoryName: 'Electricity Consumption', factor: 0.385, unit: 'kg CO2e / kWh', source: 'EPA eGRID 2024', year: 2024 },
  { id: 'ef-2', categoryId: 'cat-2', categoryName: 'Natural Gas Heating', factor: 2.021, unit: 'kg CO2e / m3', source: 'IPCC Guidelines v6', year: 2023 },
  { id: 'ef-3', categoryId: 'cat-3', categoryName: 'Corporate Jet Travel', factor: 9.54, unit: 'kg CO2e / km', source: 'GHG Protocol 2024', year: 2024 },
  { id: 'ef-4', categoryId: 'cat-4', categoryName: 'Employee Commuting', factor: 0.178, unit: 'kg CO2e / Passenger-km', source: 'UK DEFRA 2024', year: 2024 },
  { id: 'ef-5', categoryId: 'cat-5', categoryName: 'Commercial Flights', factor: 0.115, unit: 'kg CO2e / km', source: 'ICAO Carbon Calculator', year: 2023 },
  { id: 'ef-6', categoryId: 'cat-6', categoryName: 'Waste Disposal', factor: 450.0, unit: 'kg CO2e / metric-ton', source: 'EPA WARM Model', year: 2024 },
  { id: 'ef-7', categoryId: 'cat-7', categoryName: 'Company Owned Vehicles', factor: 2.68, unit: 'kg CO2e / Liter', source: 'US EIA 2024', year: 2024 },
];

const DEFAULT_POLICIES = [
  { id: 'pol-1', title: 'Zero Waste to Landfill Policy', description: 'Mandates that 95% of operational waste across manufacturing branches must be composted, reused, or recycled by 2028.', effectiveDate: '2026-01-01', status: 'Active', docUrl: '#' },
  { id: 'pol-2', title: 'Renewable Electricity Directive', description: 'Requires all local offices to transition electricity contracts to 100% certified green energy tariffs where available.', effectiveDate: '2025-06-15', status: 'Active', docUrl: '#' },
  { id: 'pol-3', title: 'Business Travel Carbon Cap', description: 'Establishes a strict annual carbon budget per department for commercial air flights. Restricts first-class bookings.', effectiveDate: '2026-04-01', status: 'Active', docUrl: '#' },
  { id: 'pol-4', title: 'Supplier Sustainability Code of Conduct', description: 'Defines ESG standards for Scope 3 upstream suppliers, enforcing carbon declarations and fair labor audits.', effectiveDate: '2026-07-01', status: 'Draft', docUrl: '#' },
];

const DEFAULT_GOALS = [
  { id: 'goal-1', title: 'Reduce Scope 1 & 2 Carbon Footprint by 25%', targetValue: 3500, currentValue: 4200, unit: 'metric tons CO2e', deadline: '2027-12-31', status: 'On Track' },
  { id: 'goal-2', title: 'Transition Corporate Fleet to EV', targetValue: 100, currentValue: 45, unit: '% EVs in fleet', deadline: '2026-12-31', status: 'On Track' },
  { id: 'goal-3', title: 'Achieve 1000 CSR Volunteer Hours', targetValue: 1000, currentValue: 680, unit: 'Hours', deadline: '2026-09-30', status: 'On Track' },
  { id: 'goal-4', title: 'Complete ISO 14001 Audits', targetValue: 5, currentValue: 2, unit: 'Certified Plants', deadline: '2026-08-31', status: 'Delayed' },
  { id: 'goal-5', title: 'Zero Plastics in Cafeterias', targetValue: 100, currentValue: 100, unit: '% single-use plastic free', deadline: '2026-05-31', status: 'Completed' },
];

const DEFAULT_REWARDS = [
  { id: 'rew-1', title: 'Plant 10 Trees Certification', description: 'EcoSphere will sponsor planting 10 native trees in your name via OneTreePlanted.', cost: 500, stock: 999, category: 'Nature' },
  { id: 'rew-2', title: 'Eco Coffee Mug & Thermos', description: 'Double-walled stainless steel reusable bottle with bamboo accent, engraved with EcoSphere logo.', cost: 800, stock: 45, category: 'Merchandise' },
  { id: 'rew-3', title: 'Public Transit Pass Coupon', description: 'A $50 contribution voucher valid for your regional metropolitan subway or bus transit system.', cost: 1200, stock: 100, category: 'Transit' },
  { id: 'rew-4', title: 'Sustainable Apparel Hoodie', description: '100% organic cotton and recycled polyester heavy-blend hoodie.', cost: 2000, stock: 24, category: 'Apparel' },
  { id: 'rew-5', title: 'Solar Power Bank', description: '10,000mAh solar charging emergency backup charger for mobile devices.', cost: 1500, stock: 12, category: 'Tech' },
];

const DEFAULT_BADGES = [
  { id: 'bad-1', title: 'Carbon Custodian', description: 'Log your first 5 verified carbon entries', icon: 'Park', pointsRequired: 100 },
  { id: 'bad-2', title: 'CSR Champion', description: 'Volunteer in 3 different CSR activities', icon: 'VolunteerActivism', pointsRequired: 300 },
  { id: 'bad-3', title: 'Eco Warrior', description: 'Complete a Hard category ESG challenge', icon: 'EmojiEvents', pointsRequired: 500 },
  { id: 'bad-4', title: 'Zero Waste Guru', description: 'Submit 3 verified zero-waste initiatives', icon: 'DeleteSweep', pointsRequired: 400 },
  { id: 'bad-5', title: 'Climate Leader', description: 'Reach top 3 on the organization leaderboard', icon: 'AutoAwesome', pointsRequired: 1000 },
];

const DEFAULT_CARBON_TRANSACTIONS = [
  { id: 'tx-1', date: '2026-07-01', departmentId: 'dept-3', departmentName: 'Manufacturing Division', categoryId: 'cat-1', categoryName: 'Electricity Consumption', scope: 2, quantity: 45200, unit: 'kWh', emissionsCo2: 17.40, status: 'Approved', loggedBy: 'Sarah Jenkins' },
  { id: 'tx-2', date: '2026-07-02', departmentId: 'dept-1', departmentName: 'Logistics & Supply Chain', categoryId: 'cat-7', categoryName: 'Company Owned Vehicles', scope: 1, quantity: 2400, unit: 'Liters', emissionsCo2: 6.43, status: 'Approved', loggedBy: 'Marcus Vance' },
  { id: 'tx-3', date: '2026-07-05', departmentId: 'dept-2', departmentName: 'Corporate Headquarters', categoryId: 'cat-1', categoryName: 'Electricity Consumption', scope: 2, quantity: 8900, unit: 'kWh', emissionsCo2: 3.43, status: 'Pending', loggedBy: 'Robert Chen' },
  { id: 'tx-4', date: '2026-07-08', departmentId: 'dept-5', departmentName: 'Sales & Marketing', categoryId: 'cat-5', categoryName: 'Commercial Flights', scope: 3, quantity: 18500, unit: 'km', emissionsCo2: 2.13, status: 'Approved', loggedBy: 'Patricia Diaz' },
  { id: 'tx-5', date: '2026-07-10', departmentId: 'dept-3', departmentName: 'Manufacturing Division', categoryId: 'cat-2', categoryName: 'Natural Gas Heating', scope: 1, quantity: 1450, unit: 'm3', emissionsCo2: 2.93, status: 'Approved', loggedBy: 'Sarah Jenkins' },
  { id: 'tx-6', date: '2026-07-11', departmentId: 'dept-4', departmentName: 'Research & Development', categoryId: 'cat-6', categoryName: 'Waste Disposal', scope: 3, quantity: 4.8, unit: 'metric-tons', emissionsCo2: 2.16, status: 'Pending', loggedBy: 'Dr. Elena Rostova' },
  { id: 'tx-7', date: '2026-07-12', departmentId: 'dept-1', departmentName: 'Logistics & Supply Chain', categoryId: 'cat-3', categoryName: 'Corporate Jet Travel', scope: 1, quantity: 1200, unit: 'km', emissionsCo2: 11.45, status: 'Pending', loggedBy: 'Sarah Jenkins' },
];

const DEFAULT_CSR_ACTIVITIES = [
  { id: 'csr-1', title: 'Local Park Reforestation Drive', description: 'Planting 250 native saplings in partnership with the local municipal forest range.', date: '2026-06-15', hoursSpent: 4, organizer: 'EcoSphere Green Team', pointsAwarded: 150, status: 'Completed' },
  { id: 'csr-2', title: 'Coastal Cleanup Volunteering', description: 'Beach clearing event addressing microplastics and waste removal along the eastern shoreline.', date: '2026-07-20', hoursSpent: 5, organizer: 'Logistics Green Committee', pointsAwarded: 200, status: 'Planned' },
  { id: 'csr-3', title: 'E-Waste Recycling Drop-off', description: 'Collecting and properly disposing of redundant IT hardware, batteries, and personal smartphones.', date: '2026-08-05', hoursSpent: 3, organizer: 'IT & Headquarters Operations', pointsAwarded: 100, status: 'Planned' },
  { id: 'csr-4', title: 'Sustainability Workshop & Training', description: 'Seminars covering sustainable purchasing, home sorting, and operational waste audits.', date: '2026-05-10', hoursSpent: 2, organizer: 'HR Training Division', pointsAwarded: 50, status: 'Completed' },
];

const DEFAULT_EMPLOYEE_PARTICIPATION = [
  { id: 'ep-1', employeeName: 'Alice Greenwell', departmentName: 'Corporate Headquarters', activityId: 'csr-1', activityTitle: 'Local Park Reforestation Drive', hoursVolunteered: 4, status: 'Attended' },
  { id: 'ep-2', employeeName: 'Ethan Hunter', departmentName: 'Logistics & Supply Chain', activityId: 'csr-1', activityTitle: 'Local Park Reforestation Drive', hoursVolunteered: 4, status: 'Attended' },
  { id: 'ep-3', employeeName: 'Alice Greenwell', departmentName: 'Corporate Headquarters', activityId: 'csr-2', activityTitle: 'Coastal Cleanup Volunteering', hoursVolunteered: 5, status: 'Registered' },
  { id: 'ep-4', employeeName: 'Sarah Jenkins', departmentName: 'Logistics & Supply Chain', activityId: 'csr-2', activityTitle: 'Coastal Cleanup Volunteering', hoursVolunteered: 5, status: 'Registered' },
  { id: 'ep-5', employeeName: 'Marcus Vance', departmentName: 'Manufacturing Division', activityId: 'csr-4', activityTitle: 'Sustainability Workshop & Training', hoursVolunteered: 2, status: 'Attended' },
];

const DEFAULT_CHALLENGES = [
  { id: 'ch-1', title: 'Eco-Commute Week', description: 'Leave the car at home! Commute via public transport, cycling, carpooling, or walking for 5 consecutive days.', startDate: '2026-07-10', endDate: '2026-07-17', rewardPoints: 250, difficulty: 'Medium', participantsCount: 48 },
  { id: 'ch-2', title: 'Zero Single-Use Plastics', description: 'Use only reusable water bottles, lunch boxes, and shopping bags. Submit pictures of your reusable kit.', startDate: '2026-07-01', endDate: '2026-07-07', rewardPoints: 150, difficulty: 'Easy', participantsCount: 82 },
  { id: 'ch-3', title: 'Paperless Office Campaign', description: 'Reduce local office printer outputs to absolute zero. Store and sign all documents digitally.', startDate: '2026-08-01', endDate: '2026-08-31', rewardPoints: 500, difficulty: 'Hard', participantsCount: 14 },
];

const DEFAULT_CHALLENGE_PARTICIPATION = [
  { id: 'cp-1', challengeId: 'ch-2', challengeTitle: 'Zero Single-Use Plastics', employeeName: 'Alice Greenwell', progressPercent: 100, status: 'Completed' },
  { id: 'cp-2', challengeId: 'ch-1', challengeTitle: 'Eco-Commute Week', employeeName: 'Alice Greenwell', progressPercent: 60, status: 'Active' },
  { id: 'cp-3', challengeId: 'ch-1', challengeTitle: 'Eco-Commute Week', employeeName: 'Ethan Hunter', progressPercent: 80, status: 'Active' },
  { id: 'cp-4', challengeId: 'ch-3', challengeTitle: 'Paperless Office Campaign', employeeName: 'Sarah Jenkins', progressPercent: 10, status: 'Active' },
];

const DEFAULT_COMPLIANCE_ISSUES = [
  { id: 'co-1', title: 'Unapproved Wastewater Discharge', description: 'Minor chemical imbalance registered in municipal wastewater discharge outlet from Plant 3.', dateLogged: '2026-06-20', severity: 'High', status: 'Resolved', resolvedDate: '2026-06-25' },
  { id: 'co-2', title: 'Missing Refrigerant Safety Logbook', description: 'Internal audit flagged missing maintenance inspection receipts for chiller units in Warehouse B.', dateLogged: '2026-07-04', severity: 'Medium', status: 'Under Investigation' },
  { id: 'co-3', title: 'Carbon Cap Budget Overage', description: 'Logistics carbon output for Q2 exceeded the authorized policy allocation by 14.5%.', dateLogged: '2026-07-08', severity: 'High', status: 'Open' },
  { id: 'co-4', title: 'Improper Sorting of Electronic Scrap', description: 'Disposal team flagged lead-containing circuits mixed in standard recyclable plastics container.', dateLogged: '2026-07-11', severity: 'Low', status: 'Open' },
];

const DEFAULT_AUDITS = [
  { id: 'aud-1', title: 'ISO 14001 Pre-Certification Audit', auditorName: 'Bureau Veritas', date: '2026-05-18', score: 92, findingsCount: 4, status: 'Passed' },
  { id: 'aud-2', title: 'Scope 1 Emissions Audit', auditorName: 'SGS ESG Assurance Services', date: '2026-06-12', score: 88, findingsCount: 2, status: 'Passed' },
  { id: 'aud-3', title: 'Hazardous Waste Regulatory Audit', auditorName: 'Environmental Protection Agency (EPA)', date: '2026-07-06', score: 74, findingsCount: 8, status: 'Action Required' },
  { id: 'aud-4', title: 'Annual Corporate Governance Check', auditorName: 'PricewaterhouseCoopers (PwC)', date: '2026-07-15', score: 0, findingsCount: 0, status: 'In Progress' },
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'not-1', title: 'Carbon Transaction Logged', message: 'Sarah Jenkins logged 1200 km of travel under Corporate Jet Travel.', date: '2026-07-12T09:30:00Z', read: false, type: 'info' },
  { id: 'not-2', title: 'High Severity Compliance Logged', message: 'A new compliance issue "Carbon Cap Budget Overage" has been raised for Logistics.', date: '2026-07-08T14:20:00Z', read: false, type: 'warning' },
  { id: 'not-3', title: 'Goal Completed!', message: 'The organization has achieved "Zero Plastics in Cafeterias" goal!', date: '2026-05-31T17:00:00Z', read: true, type: 'success' },
];

const DEFAULT_LEADERBOARD = [
  { rank: 1, name: 'Alice Greenwell', department: 'Corporate Headquarters', points: 1450, badges: 4 },
  { rank: 2, name: 'Ethan Hunter', department: 'Logistics & Supply Chain', points: 1220, badges: 3 },
  { rank: 3, name: 'Marcus Vance', department: 'Manufacturing Division', points: 980, badges: 2 },
  { rank: 4, name: 'Dr. Elena Rostova', department: 'Research & Development', points: 840, badges: 2 },
  { rank: 5, name: 'Sarah Jenkins', department: 'Logistics & Supply Chain', points: 760, badges: 2 },
  { rank: 6, name: 'Robert Chen', department: 'Corporate Headquarters', points: 550, badges: 1 },
  { rank: 7, name: 'Patricia Diaz', department: 'Sales & Marketing', points: 480, badges: 1 },
];

const CURRENT_USER_MOCK = {
  name: 'Alice Greenwell',
  email: 'alice.greenwell@ecosphere.com',
  role: 'ESG Administrator / Sustainability Lead',
  department: 'Corporate Headquarters',
  avatarUrl: '',
  points: 1450,
  badgesEarned: ['bad-1', 'bad-2', 'bad-4'],
  registeredDate: '2025-09-01',
};

// --- INITIALIZE STORAGE HELPER ---
const getStorageData = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(`ecosphere_${key}`);
  if (!data) {
    localStorage.setItem(`ecosphere_${key}`, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setStorageData = <T>(key: string, data: T): void => {
  localStorage.setItem(`ecosphere_${key}`, JSON.stringify(data));
};

// Ensure storage is seeded
const getEmissionFactors = () => getStorageData('emission_factors', DEFAULT_EMISSION_FACTORS);
const getCarbonTransactions = () => getStorageData('carbon_transactions', DEFAULT_CARBON_TRANSACTIONS);
const getNotifications = () => getStorageData('notifications', DEFAULT_NOTIFICATIONS);
const getLeaderboard = () => getStorageData('leaderboard', DEFAULT_LEADERBOARD);
const getMe = () => getStorageData('me', CURRENT_USER_MOCK);
const getRewards = () => getStorageData('rewards', DEFAULT_REWARDS);
const getGoals = () => getStorageData('goals', DEFAULT_GOALS);
const getComplianceIssues = () => getStorageData('compliance_issues', DEFAULT_COMPLIANCE_ISSUES);
const getDepartments = () => getStorageData('departments', DEFAULT_DEPARTMENTS);
const getCategories = () => getStorageData('categories', DEFAULT_CATEGORIES);

// --- AXIOS INSTANCE ---
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- MOCK IMPLEMENTATION ---
apiClient.interceptors.request.use(async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null;

  const successResponse = (responseData: any) => ({
    ...config,
    adapter: () => Promise.resolve({ data: responseData, status: 200, statusText: 'OK', headers: {}, config }),
  });

  const createdResponse = (responseData: any) => ({
    ...config,
    adapter: () => Promise.resolve({ data: responseData, status: 201, statusText: 'Created', headers: {}, config }),
  });

  const badRequestResponse = (message: string) => ({
    ...config,
    adapter: () => Promise.reject({ response: { data: { message }, status: 400 } }),
  });

  const params = config.params || {};

  // Auth routes
  if (url === '/auth/login') {
    if (data.email === 'alice.greenwell@ecosphere.com' && data.password === 'password') {
      return successResponse({ token: 'mock-jwt-token', user: getMe() });
    }
    return badRequestResponse('Invalid email or password.');
  }

  if (url === '/auth/register') {
    const newUser = {
      ...CURRENT_USER_MOCK,
      name: data.name || 'New User',
      email: data.email || 'user@ecosphere.com',
      points: 100,
      badgesEarned: [],
    };
    setStorageData('me', newUser);
    return createdResponse({ token: 'mock-jwt-token', user: newUser });
  }

  if (url === '/auth/me') {
    return successResponse(getMe());
  }

  if (url === '/auth/profile' && method === 'put') {
    const me = getMe();
    const updated = { ...me, ...data };
    setStorageData('me', updated);
    return successResponse(updated);
  }

  // Helper function to build CRUD endpoints
  const handleCrud = (key: string, defaultData: any[]) => {
    let list = getStorageData(key, defaultData);

    if (method === 'get') {
      if (params.q) {
        const query = params.q.toLowerCase();
        list = list.filter((item: any) => 
          Object.values(item).some(val => 
            String(val).toLowerCase().includes(query)
          )
        );
      }

      Object.keys(params).forEach(pKey => {
        if (pKey !== 'q' && pKey !== 'page' && pKey !== 'limit' && pKey !== 'sort' && pKey !== 'order') {
          list = list.filter((item: any) => String(item[pKey]) === String(params[pKey]));
        }
      });

      if (params.sort) {
        const sField = params.sort;
        const isAsc = params.order !== 'desc';
        list.sort((a: any, b: any) => {
          if (a[sField] < b[sField]) return isAsc ? -1 : 1;
          if (a[sField] > b[sField]) return isAsc ? 1 : -1;
          return 0;
        });
      }

      const page = parseInt(params.page || '1', 10);
      const limit = parseInt(params.limit || '10', 10);
      const total = list.length;
      const paginated = list.slice((page - 1) * limit, page * limit);

      return successResponse({
        data: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    }

    if (method === 'post') {
      const newItem = { id: `${key.slice(0, 3)}-${Date.now()}`, ...data };
      
      if (key === 'carbon_transactions') {
        const factors = getEmissionFactors();
        const factorObj = factors.find(f => f.categoryId === newItem.categoryId);
        const factor = factorObj ? factorObj.factor : 0.1;
        newItem.emissionsCo2 = parseFloat(((newItem.quantity * factor) / 1000).toFixed(2));
        newItem.status = 'Pending';
        newItem.loggedBy = getMe().name;

        const notifList = getNotifications();
        notifList.unshift({
          id: `not-${Date.now()}`,
          title: 'Carbon Transaction Logged',
          message: `${newItem.loggedBy} logged ${newItem.quantity} ${newItem.unit} of emissions for ${newItem.departmentName}.`,
          date: new Date().toISOString(),
          read: false,
          type: 'info'
        });
        setStorageData('notifications', notifList);
      }

      list.unshift(newItem);
      setStorageData(key, list);
      return createdResponse(newItem);
    }

    if (method === 'put') {
      const id = url.split('/').pop();
      const index = list.findIndex((item: any) => item.id === id);
      if (index > -1) {
        if (key === 'carbon_transactions') {
          const updatedItem = { ...list[index], ...data };
          const factors = getEmissionFactors();
          const factorObj = factors.find(f => f.categoryId === updatedItem.categoryId);
          const factor = factorObj ? factorObj.factor : 0.1;
          updatedItem.emissionsCo2 = parseFloat(((updatedItem.quantity * factor) / 1000).toFixed(2));
          list[index] = updatedItem;
        } else {
          list[index] = { ...list[index], ...data };
        }
        setStorageData(key, list);
        return successResponse(list[index]);
      }
      return badRequestResponse('Record not found.');
    }

    if (method === 'delete') {
      const id = url.split('/').pop();
      const filtered = list.filter((item: any) => item.id !== id);
      setStorageData(key, filtered);
      return successResponse({ success: true });
    }

    return badRequestResponse('Method not supported.');
  };

  // Dispatch API Paths
  if (url.startsWith('/departments')) return handleCrud('departments', DEFAULT_DEPARTMENTS);
  if (url.startsWith('/categories')) return handleCrud('categories', DEFAULT_CATEGORIES);
  if (url.startsWith('/emission-factors')) return handleCrud('emission_factors', DEFAULT_EMISSION_FACTORS);
  if (url.startsWith('/policies')) return handleCrud('policies', DEFAULT_POLICIES);
  if (url.startsWith('/goals')) return handleCrud('goals', DEFAULT_GOALS);
  if (url.startsWith('/rewards')) return handleCrud('rewards', DEFAULT_REWARDS);
  if (url.startsWith('/badges')) return handleCrud('badges', DEFAULT_BADGES);
  if (url.startsWith('/carbon-transactions')) return handleCrud('carbon_transactions', DEFAULT_CARBON_TRANSACTIONS);
  if (url.startsWith('/csr-activities')) return handleCrud('csr_activities', DEFAULT_CSR_ACTIVITIES);
  if (url.startsWith('/employee-participation')) return handleCrud('employee_participation', DEFAULT_EMPLOYEE_PARTICIPATION);
  if (url.startsWith('/challenges')) return handleCrud('challenges', DEFAULT_CHALLENGES);
  if (url.startsWith('/challenge-participation')) return handleCrud('challenge_participation', DEFAULT_CHALLENGE_PARTICIPATION);
  if (url.startsWith('/compliance-issues')) return handleCrud('compliance_issues', DEFAULT_COMPLIANCE_ISSUES);
  if (url.startsWith('/audits')) return handleCrud('audits', DEFAULT_AUDITS);

  // Leaderboard
  if (url === '/leaderboard') {
    return successResponse(getLeaderboard());
  }

  // Notifications
  if (url === '/notifications') {
    const notifs = getNotifications();
    if (method === 'put') {
      const updated = notifs.map((n: any) => ({ ...n, read: true }));
      setStorageData('notifications', updated);
      return successResponse(updated);
    }
    return successResponse(notifs);
  }

  if (url.startsWith('/notifications/') && method === 'put') {
    const id = url.split('/').pop();
    const notifs = getNotifications();
    const index = notifs.findIndex((n: any) => n.id === id);
    if (index > -1) {
      notifs[index].read = true;
      setStorageData('notifications', notifs);
      return successResponse(notifs[index]);
    }
    return badRequestResponse('Notification not found.');
  }

  // Reward Store Redeem
  if (url === '/reward-store/redeem' && method === 'post') {
    const { rewardId } = data;
    const rewards = getRewards();
    const me = getMe();
    const reward = rewards.find((r: any) => r.id === rewardId);

    if (!reward) return badRequestResponse('Reward item not found.');
    if (me.points < reward.cost) return badRequestResponse('Insufficient EcoPoints.');
    if (reward.stock <= 0) return badRequestResponse('Reward out of stock.');

    me.points -= reward.cost;
    reward.stock -= 1;
    setStorageData('me', me);
    setStorageData('rewards', rewards);

    const notifs = getNotifications();
    notifs.unshift({
      id: `not-${Date.now()}`,
      title: 'Reward Redeemed',
      message: `You successfully redeemed ${reward.title} for ${reward.cost} EcoPoints!`,
      date: new Date().toISOString(),
      read: false,
      type: 'success'
    });
    setStorageData('notifications', notifs);

    const board = getLeaderboard();
    const boardIndex = board.findIndex((b: any) => b.name === me.name);
    if (boardIndex > -1) {
      board[boardIndex].points = me.points;
      setStorageData('leaderboard', board);
    }

    return successResponse({ success: true, points: me.points, reward });
  }

  // Dashboard Aggregates
  if (url === '/dashboard-summary') {
    const tx = getCarbonTransactions().filter((t: any) => t.status === 'Approved');
    const goals = getGoals();
    const compliance = getComplianceIssues();
    const me = getMe();

    const scope1 = tx.filter((t: any) => t.scope === 1).reduce((sum: number, t: any) => sum + t.emissionsCo2, 0);
    const scope2 = tx.filter((t: any) => t.scope === 2).reduce((sum: number, t: any) => sum + t.emissionsCo2, 0);
    const scope3 = tx.filter((t: any) => t.scope === 3).reduce((sum: number, t: any) => sum + t.emissionsCo2, 0);
    const totalEmissions = scope1 + scope2 + scope3;

    return successResponse({
      stats: {
        totalEmissions: parseFloat(totalEmissions.toFixed(2)),
        scope1: parseFloat(scope1.toFixed(2)),
        scope2: parseFloat(scope2.toFixed(2)),
        scope3: parseFloat(scope3.toFixed(2)),
        activeGoals: goals.filter((g: any) => g.status === 'On Track' || g.status === 'Delayed').length,
        openComplianceIssues: compliance.filter((c: any) => c.status !== 'Resolved').length,
        myPoints: me.points,
        myBadgesCount: me.badgesEarned.length,
      },
      recentTransactions: getCarbonTransactions().slice(0, 4),
      activeGoals: goals.slice(0, 3),
      complianceIssues: compliance.slice(0, 3)
    });
  }

  // Analytics Data
  if (url === '/analytics-data') {
    const tx = getCarbonTransactions().filter((t: any) => t.status === 'Approved');
    const depts = getDepartments();
    const deptEmissions = depts.map((d: any) => {
      const deptTx = tx.filter((t: any) => t.departmentId === d.id);
      return {
        name: d.name,
        emissions: parseFloat(deptTx.reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2)),
      };
    });

    const monthlyEmissions = [
      { name: 'Jan', scope1: 450, scope2: 300, scope3: 200 },
      { name: 'Feb', scope1: 420, scope2: 310, scope3: 190 },
      { name: 'Mar', scope1: 510, scope2: 340, scope3: 220 },
      { name: 'Apr', scope1: 380, scope2: 290, scope3: 170 },
      { name: 'May', scope1: 390, scope2: 280, scope3: 180 },
      { name: 'Jun', scope1: 410, scope2: 320, scope3: 210 },
      { name: 'Jul', scope1: parseFloat(tx.filter((t: any) => t.scope === 1).reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2)), 
                     scope2: parseFloat(tx.filter((t: any) => t.scope === 2).reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2)), 
                     scope3: parseFloat(tx.filter((t: any) => t.scope === 3).reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2)) }
    ];

    const categories = getCategories();
    const categoryEmissions = categories.map((c: any) => {
      const catTx = tx.filter((t: any) => t.categoryId === c.id);
      return {
        name: c.name,
        value: parseFloat(catTx.reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2)),
      };
    }).filter((c: any) => c.value > 0);

    return successResponse({
      deptEmissions,
      monthlyEmissions,
      categoryEmissions
    });
  }

  return successResponse({});
});
