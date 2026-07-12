import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import CrudPage from '../../components/CrudPage';

const Audits: React.FC = () => (
  <CrudPage
    title="Audits"
    subtitle="Schedule, manage, and track internal and third-party ESG audit assessments."
    endpoint="/audits"
    queryKey="audits"
    fields={[
      { key: 'title', label: 'Audit Title' },
      { key: 'auditorName', label: 'Auditor / Agency' },
      { key: 'date', label: 'Audit Date', type: 'date' },
      {
        key: 'score', label: 'Score', tableOnly: true,
        tableRender: (row) => (
          <Box sx={{ minWidth: 100 }}>
            <LinearProgress variant="determinate" value={row.score || 0}
              sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: row.score >= 85 ? 'linear-gradient(90deg, #10b981, #34d399)' : row.score >= 70 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)' } }} />
            <Typography variant="caption" color="text.secondary">{row.score > 0 ? `${row.score}/100` : 'Pending'}</Typography>
          </Box>
        )
      },
      { key: 'findingsCount', label: 'Findings', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['In Progress', 'Passed', 'Failed', 'Action Required'] },
    ]}
    statusColors={{ Passed: 'success', Failed: 'error', 'In Progress': 'info', 'Action Required': 'warning' }}
  />
);
export default Audits;
