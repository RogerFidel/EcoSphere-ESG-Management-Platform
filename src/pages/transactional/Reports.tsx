import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Grid, Button, FormControl, InputLabel,
  Select, MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Paper, Alert, Snackbar,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../api/mockApi';
import { ChartSkeleton } from '../../components/LoadingSkeleton';

const Reports: React.FC = () => {
  const [scope, setScope] = useState('all');
  const [period, setPeriod] = useState('monthly');
  const [snackOpen, setSnackOpen] = useState(false);

  const { data: txData, isLoading } = useQuery({
    queryKey: ['carbon_transactions_report'],
    queryFn: () => apiClient.get('/carbon-transactions', { params: { limit: 1000 } }).then(res => res.data),
  });

  const approvedTx = (txData?.data || []).filter((t: any) => {
    if (t.status !== 'Approved') return false;
    
    // Filter by Scope
    if (scope !== 'all' && String(t.scope) !== scope) return false;
    
    // Filter by Period
    const dateStr = t.date;
    if (period === 'monthly') {
      return dateStr.startsWith('2026-07');
    } else if (period === 'quarterly') {
      return dateStr.startsWith('2026-04') || dateStr.startsWith('2026-05') || dateStr.startsWith('2026-06');
    } else if (period === 'annual') {
      return dateStr.startsWith('2026');
    }
    return true;
  });

  // Calculate dynamic scope values
  const scope1Val = parseFloat(approvedTx.filter((t: any) => t.scope === 1 || t.scope === '1').reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2));
  const scope2Val = parseFloat(approvedTx.filter((t: any) => t.scope === 2 || t.scope === '2').reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2));
  const scope3Val = parseFloat(approvedTx.filter((t: any) => t.scope === 3 || t.scope === '3').reduce((sum: number, t: any) => sum + t.emissionsCo2, 0).toFixed(2));
  
  const totalVal = parseFloat((scope1Val + scope2Val + scope3Val).toFixed(2));

  // Dynamic departments chart data
  const deptEmissionsMap: Record<string, number> = {};
  approvedTx.forEach((t: any) => {
    const deptName = t.departmentName || 'Unknown';
    deptEmissionsMap[deptName] = (deptEmissionsMap[deptName] || 0) + t.emissionsCo2;
  });
  
  const deptChartData = Object.keys(deptEmissionsMap).map(name => ({
    name,
    emissions: parseFloat(deptEmissionsMap[name].toFixed(2)),
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>ESG Reports</Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and export comprehensive GHG emission and sustainability performance reports.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => window.print()}>
          Export PDF
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Report Filters</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>GHG Scope</InputLabel>
                <Select value={scope} onChange={(e) => setScope(e.target.value)} label="GHG Scope">
                  <MenuItem value="all">All Scopes (1, 2, 3)</MenuItem>
                  <MenuItem value="1">Scope 1 Only</MenuItem>
                  <MenuItem value="2">Scope 2 Only</MenuItem>
                  <MenuItem value="3">Scope 3 Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Reporting Period</InputLabel>
                <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Reporting Period">
                  <MenuItem value="monthly">Monthly (Jul 2026)</MenuItem>
                  <MenuItem value="quarterly">Q2 2026</MenuItem>
                  <MenuItem value="annual">Annual 2026</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button variant="outlined" fullWidth size="medium" startIcon={<AssessmentIcon />} onClick={() => setSnackOpen(true)}>
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        Displaying GHG emissions report summary for <strong>{period === 'monthly' ? 'July 2026' : period === 'quarterly' ? 'Q2 2026' : 'Annual 2026'}</strong>. All values in metric tons CO₂e unless stated.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Emissions by dept chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Emissions by Department</Typography>
              {isLoading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={deptChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
                    <Bar dataKey="emissions" name="CO₂e (t)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Table */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>GHG Inventory Summary</Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scope</TableCell>
                      <TableCell align="right">CO₂e (t)</TableCell>
                      <TableCell align="right">% Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { scope: 'Scope 1 — Direct', value: scope1Val, color: 'error' },
                      { scope: 'Scope 2 — Indirect', value: scope2Val, color: 'warning' },
                      { scope: 'Scope 3 — Value Chain', value: scope3Val, color: 'info' },
                    ].map(row => (
                      <TableRow key={row.scope}>
                        <TableCell><Chip label={row.scope} size="small" color={row.color as any} /></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{row.value}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>
                          {totalVal > 0 ? ((row.value / totalVal) * 100).toFixed(1) : '0.0'}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ borderTop: '2px solid', borderColor: 'divider' }}>
                      <TableCell sx={{ fontWeight: 800 }}>Total Verified</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>{totalVal}</TableCell>
                      <TableCell align="right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Raw Transactions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Raw Emission Transactions Log</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">CO₂e (t)</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedTx.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.departmentName}</TableCell>
                    <TableCell>{tx.categoryName}</TableCell>
                    <TableCell><Chip label={`Scope ${tx.scope}`} size="small" color={['', 'error', 'warning', 'info'][tx.scope] as any} /></TableCell>
                    <TableCell align="right">{tx.quantity.toLocaleString()} {tx.unit}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{tx.emissionsCo2}</TableCell>
                    <TableCell><Chip label={tx.status} size="small" color={tx.status === 'Approved' ? 'success' : 'warning'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>ESG report compiled successfully!</Alert>
      </Snackbar>
    </Box>
  );
};
export default Reports;
