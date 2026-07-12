import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import CrudPage from '../../components/CrudPage';

const Goals: React.FC = () => (
  <CrudPage
    title="Goals"
    subtitle="Set and track corporate sustainability targets, reduction commitments, and KPIs."
    endpoint="/goals"
    queryKey="goals"
    fields={[
      { key: 'title', label: 'Goal Title' },
      { key: 'targetValue', label: 'Target Value', type: 'number' },
      { key: 'currentValue', label: 'Current Value', type: 'number' },
      { key: 'unit', label: 'Unit' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['On Track', 'Delayed', 'Completed', 'Cancelled'] },
      {
        key: 'progress', label: 'Progress', tableOnly: true,
        tableRender: (row) => {
          const pct = Math.min(100, Math.round((row.currentValue / row.targetValue) * 100));
          return (
            <Box sx={{ minWidth: 100 }}>
              <LinearProgress variant="determinate" value={pct}
                sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #34d399)' } }} />
              <Typography variant="caption" color="text.secondary">{pct}%</Typography>
            </Box>
          );
        }
      }
    ]}
    statusColors={{ 'On Track': 'success', 'Delayed': 'warning', 'Completed': 'default', 'Cancelled': 'error' }}
  />
);
export default Goals;
