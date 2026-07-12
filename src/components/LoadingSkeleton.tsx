import React from 'react';
import { Box, Skeleton, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <Grid container spacing={3}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} width="60%" />
            <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
            <Skeleton variant="text" width="40%" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <TableContainer component={Paper} sx={{ border: 'none', boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from(new Array(cols)).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width={80} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(new Array(rows)).map((_, r) => (
            <TableRow key={r}>
              {Array.from(new Array(cols)).map((_, c) => (
                <TableCell key={c}>
                  <Skeleton variant="text" width={c === 0 ? 150 : 80} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="rectangular" width="100%" height={260} sx={{ borderRadius: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
        <Skeleton variant="text" width="15%" />
      </Box>
    </Box>
  );
};
