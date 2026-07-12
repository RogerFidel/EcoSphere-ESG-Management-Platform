import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Typography, Card, CardContent, LinearProgress, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Alert,
} from '@mui/material';
import Co2Icon from '@mui/icons-material/Co2';
import FactoryIcon from '@mui/icons-material/Factory';
import BoltIcon from '@mui/icons-material/Bolt';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import FlagIcon from '@mui/icons-material/Flag';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DiamondIcon from '@mui/icons-material/Diamond';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { StatCard } from '../components/StatCard';
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { apiClient } from '../api/mockApi';

const MotionBox = motion(Box);

const scopeData = [
  { name: 'Week 1', actual: 82, target: 70 },
  { name: 'Week 2', actual: 68, target: 70 },
  { name: 'Week 3', actual: 75, target: 70 },
  { name: 'Week 4', actual: 59, target: 70 },
  { name: 'Week 5', actual: 71, target: 70 },
  { name: 'Week 6', actual: 65, target: 70 },
];

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  'Approved': 'success', 'Pending': 'warning', 'Rejected': 'error',
  'On Track': 'success', 'Delayed': 'warning', 'Completed': 'default',
  'Open': 'error', 'Resolved': 'success', 'Under Investigation': 'warning',
};

const Dashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiClient.get('/dashboard-summary').then(res => res.data),
  });

  const stats = data?.stats;

  return (
    <Box>
      <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
          ESG Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back! Here's your real-time sustainability overview.
        </Typography>
      </MotionBox>

      {/* STATS ROW */}
      {isLoading ? <CardSkeleton count={4} /> : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Emissions (CO₂e)', value: `${stats?.totalEmissions ?? 0} t`, icon: <Co2Icon />, trend: '12% reduction', trendType: 'up', color: 'primary' },
            { title: 'Scope 1 Emissions', value: `${stats?.scope1 ?? 0} t`, icon: <FactoryIcon />, trend: '8% reduction', trendType: 'up', color: 'secondary' },
            { title: 'Scope 2 Emissions', value: `${stats?.scope2 ?? 0} t`, icon: <BoltIcon />, trend: '15% reduction', trendType: 'up', color: 'info' },
            { title: 'Scope 3 Emissions', value: `${stats?.scope3 ?? 0} t`, icon: <AirplanemodeActiveIcon />, trend: '5% increase', trendType: 'down', color: 'warning' },
          ].map((card, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
              <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <StatCard {...card as any} />
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      )}

      {/* SECONDARY STATS */}
      {isLoading ? <CardSkeleton count={4} /> : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Active ESG Goals', value: stats?.activeGoals ?? 0, icon: <FlagIcon />, color: 'success' },
            { title: 'Open Compliance Issues', value: stats?.openComplianceIssues ?? 0, icon: <WarningIcon />, color: 'error' },
            { title: 'My EcoPoints', value: stats?.myPoints ?? 0, icon: <EmojiEventsIcon />, color: 'secondary' },
            { title: 'Badges Earned', value: stats?.myBadgesCount ?? 0, icon: <DiamondIcon />, color: 'primary' },
          ].map((card, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
              <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}>
                <StatCard title={card.title} value={card.value} icon={card.icon} color={card.color} />
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* AREA CHART */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              {isLoading ? <ChartSkeleton /> : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Weekly Emission Trend vs Target</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={scopeData}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                      <Legend />
                      <Area type="monotone" dataKey="actual" name="Actual (tCO₂e)" stroke="#10b981" strokeWidth={2.5} fill="url(#colorActual)" />
                      <Area type="monotone" dataKey="target" name="Target (tCO₂e)" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorTarget)" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ACTIVE GOALS PANEL */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Active ESG Goals</Typography>
              {isLoading ? <ChartSkeleton /> : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {(data?.activeGoals || []).map((goal: any) => {
                    const pct = Math.round((goal.currentValue / goal.targetValue) * 100);
                    return (
                      <Box key={goal.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', maxWidth: '75%' }}>{goal.title}</Typography>
                          <Chip label={goal.status} size="small" color={statusColor[goal.status] || 'default'} />
                        </Box>
                        <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                          sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #34d399)' } }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {goal.currentValue} / {goal.targetValue} {goal.unit} ({pct}%)
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RECENT TRANSACTIONS + COMPLIANCE ISSUES */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Carbon Transactions</Typography>
              {isLoading ? <TableSkeleton rows={4} cols={5} /> : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">CO₂e (t)</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data?.recentTransactions || []).map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.date}</TableCell>
                          <TableCell><Typography variant="body2" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.departmentName}</Typography></TableCell>
                          <TableCell>{tx.categoryName}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{tx.emissionsCo2}</TableCell>
                          <TableCell><Chip label={tx.status} size="small" color={statusColor[tx.status] || 'default'} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Compliance Alerts</Typography>
              {isLoading ? <TableSkeleton rows={3} cols={2} /> : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(data?.complianceIssues || []).map((issue: any) => (
                    <Alert key={issue.id}
                      severity={issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'info'}
                      icon={<WarningIcon fontSize="small" />}
                      sx={{ borderRadius: 2 }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{issue.title}</Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {issue.severity} severity · {issue.status}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;
