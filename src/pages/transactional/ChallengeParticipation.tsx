import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import CrudPage from '../../components/CrudPage';

const ChallengeParticipation: React.FC = () => (
  <CrudPage
    title="Challenge Participation"
    subtitle="Track individual employee progress and completion status for active challenges."
    endpoint="/challenge-participation"
    queryKey="challenge_participation"
    fields={[
      { key: 'employeeName', label: 'Employee' },
      { key: 'challengeTitle', label: 'Challenge', tableOnly: true },
      { key: 'challengeId', label: 'Challenge ID', formOnly: true },
      {
        key: 'progressPercent', label: 'Progress', tableOnly: true,
        tableRender: (row) => (
          <Box sx={{ minWidth: 120 }}>
            <LinearProgress variant="determinate" value={row.progressPercent}
              sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #34d399)' } }} />
            <Typography variant="caption" color="text.secondary">{row.progressPercent}%</Typography>
          </Box>
        )
      },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'Abandoned'] },
    ]}
    statusColors={{ Active: 'info', Completed: 'success', Abandoned: 'error' }}
  />
);
export default ChallengeParticipation;
