import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useAppSelector } from './store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import RewardStore from './pages/RewardStore';

// Master Data
import Departments from './pages/master/Departments';
import Categories from './pages/master/Categories';
import EmissionFactors from './pages/master/EmissionFactors';
import Policies from './pages/master/Policies';
import Goals from './pages/master/Goals';
import Rewards from './pages/master/Rewards';
import Badges from './pages/master/Badges';

// Transactional
import CarbonTransactions from './pages/transactional/CarbonTransactions';
import CSRActivities from './pages/transactional/CSRActivities';
import EmployeeParticipation from './pages/transactional/EmployeeParticipation';
import Challenges from './pages/transactional/Challenges';
import ChallengeParticipation from './pages/transactional/ChallengeParticipation';
import ComplianceIssues from './pages/transactional/ComplianceIssues';
import Audits from './pages/transactional/Audits';
import Reports from './pages/transactional/Reports';

const App: React.FC = () => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
          },
          error: { main: '#ef4444' },
          warning: { main: '#f59e0b' },
          info: { main: '#3b82f6' },
          success: { main: '#10b981' },
          background: darkMode
            ? { default: '#0f172a', paper: '#1e293b' }
            : { default: '#f0fdf4', paper: '#ffffff' },
          text: darkMode
            ? { primary: '#f1f5f9', secondary: '#94a3b8' }
            : { primary: '#0f172a', secondary: '#64748b' },
          divider: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        },
        typography: {
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          h1: { fontWeight: 800 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { fontWeight: 600, textTransform: 'none' },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: darkMode
                  ? '0 1px 3px rgba(0,0,0,0.3)'
                  : '0 1px 4px rgba(16, 185, 129, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.06)',
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 10, padding: '8px 20px' },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-root': {
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                  borderBottom: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                },
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:hover': { backgroundColor: darkMode ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)' },
                transition: 'background-color 0.15s ease',
              },
            },
          },
          MuiChip: {
            styleOverrides: { root: { fontWeight: 600, fontSize: '0.75rem' } },
          },
          MuiPaper: {
            styleOverrides: { root: { backgroundImage: 'none' } },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: { backgroundImage: 'none' },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/reward-store" element={<RewardStore />} />
                  {/* Master Data */}
                  <Route path="/departments" element={<Departments />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/emission-factors" element={<EmissionFactors />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/badges" element={<Badges />} />
                  {/* Transactional */}
                  <Route path="/carbon-transactions" element={<CarbonTransactions />} />
                  <Route path="/csr-activities" element={<CSRActivities />} />
                  <Route path="/employee-participation" element={<EmployeeParticipation />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/challenge-participation" element={<ChallengeParticipation />} />
                  <Route path="/compliance-issues" element={<ComplianceIssues />} />
                  <Route path="/audits" element={<Audits />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
