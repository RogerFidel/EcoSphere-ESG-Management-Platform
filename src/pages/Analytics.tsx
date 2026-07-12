import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Typography, Card, CardContent, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { ChartSkeleton } from '../components/LoadingSkeleton';
import { apiClient } from '../api/mockApi';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const Analytics: React.FC = () => {
  const [view, setView] = useState('monthly');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: () => apiClient.get('/analytics-data').then(res => res.data),
  });

  const forecastData = [
    { name: 'Jul', actual: 46, forecast: 46 },
    { name: 'Aug', actual: null, forecast: 43 },
    { name: 'Sep', actual: null, forecast: 40 },
    { name: 'Oct', actual: null, forecast: 37 },
    { name: 'Nov', actual: null, forecast: 35 },
    { name: 'Dec', actual: null, forecast: 32 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>Analytics & Insights</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Deep ESG performance analytics with trend forecasting and category breakdowns.
      </Typography>

      {/* View toggle */}
      <Box sx={{ mb: 4 }}>
        <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
          <ToggleButton value="monthly" sx={{ px: 3, fontWeight: 600 }}>Monthly</ToggleButton>
          <ToggleButton value="quarterly" sx={{ px: 3, fontWeight: 600 }}>Quarterly</ToggleButton>
          <ToggleButton value="annual" sx={{ px: 3, fontWeight: 600 }}>Annual</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Monthly Scope Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>GHG Emissions by Scope — Monthly</Typography>
              {isLoading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.monthlyEmissions || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Legend />
                    <Bar dataKey="scope1" name="Scope 1 (Direct)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="scope2" name="Scope 2 (Indirect)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="scope3" name="Scope 3 (Value Chain)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart — Emissions by Category */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Emissions by Category</Typography>
              {isLoading ? <ChartSkeleton /> : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data?.categoryEmissions || [{ name: 'Electricity', value: 20 }, { name: 'Fleet', value: 15 }, { name: 'Flights', value: 8 }]}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={100}
                        paddingAngle={3} dataKey="value"
                      >
                        {(data?.categoryEmissions || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                    {(data?.categoryEmissions || []).map((c: any, i: number) => (
                      <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                        <Typography variant="caption" color="text.secondary">{c.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Emissions by Department */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Emissions by Department</Typography>
              {isLoading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data?.deptEmissions || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={130} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Bar dataKey="emissions" name="CO₂e (t)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Emission Forecast */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Emission Forecast (Jul–Dec 2026)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>AI-assisted trajectory model — on track for 30% annual reduction</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="colorActualF" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" name="Actual CO₂e" stroke="#10b981" strokeWidth={2.5} fill="url(#colorActualF)" connectNulls={false} />
                  <Area type="monotone" dataKey="forecast" name="Forecast CO₂e" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="5 5" fill="url(#colorForecast)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Analytics;
