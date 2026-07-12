import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip, LinearProgress,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { apiClient } from '../api/mockApi';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useAppSelector } from '../store';

const rankColors: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

const Leaderboard: React.FC = () => {
  const currentUser = useAppSelector(s => s.auth.user);

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.get('/leaderboard').then(res => res.data),
  });

  const maxPoints = leaders.length > 0 ? leaders[0].points : 1;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>ESG Leaderboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Rankings based on EcoPoints earned through challenges, CSR activities, and carbon contributions.
      </Typography>

      {/* Top 3 Podium */}
      {!isLoading && leaders.length >= 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, mb: 6 }}>
          {/* 2nd place */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar sx={{ width: 70, height: 70, mx: 'auto', bgcolor: '#C0C0C0', fontSize: '1.5rem', fontWeight: 800, border: '3px solid #C0C0C0', mb: 1 }}>
              {leaders[1].name.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{leaders[1].name}</Typography>
            <Typography variant="caption" color="text.secondary">{leaders[1].points} pts</Typography>
            <Box sx={{ height: 80, width: 100, bgcolor: '#C0C0C0', opacity: 0.3, borderRadius: '6px 6px 0 0', mx: 'auto', mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>2</Typography>
            </Box>
          </Box>
          {/* 1st place */}
          <Box sx={{ textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 36, mb: 0.5 }} />
            <Avatar sx={{ width: 90, height: 90, mx: 'auto', bgcolor: '#FFD700', fontSize: '1.8rem', fontWeight: 800, border: '4px solid #FFD700', mb: 1 }}>
              {leaders[0].name.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{leaders[0].name}</Typography>
            <Typography variant="caption" color="text.secondary">{leaders[0].points} pts</Typography>
            <Box sx={{ height: 110, width: 110, bgcolor: '#FFD700', opacity: 0.3, borderRadius: '6px 6px 0 0', mx: 'auto', mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>1</Typography>
            </Box>
          </Box>
          {/* 3rd place */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar sx={{ width: 70, height: 70, mx: 'auto', bgcolor: '#CD7F32', fontSize: '1.5rem', fontWeight: 800, border: '3px solid #CD7F32', mb: 1 }}>
              {leaders[2].name.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{leaders[2].name}</Typography>
            <Typography variant="caption" color="text.secondary">{leaders[2].points} pts</Typography>
            <Box sx={{ height: 60, width: 100, bgcolor: '#CD7F32', opacity: 0.3, borderRadius: '6px 6px 0 0', mx: 'auto', mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>3</Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Full Rankings</Typography>
          {isLoading ? <TableSkeleton rows={7} cols={5} /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>EcoPoints</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Badges</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaders.map((leader: any) => {
                    const isMe = leader.name === currentUser?.name;
                    return (
                      <TableRow key={leader.rank} sx={{ bgcolor: isMe ? 'rgba(16,185,129,0.06)' : 'transparent', fontWeight: isMe ? 700 : 400 }}>
                        <TableCell>
                          {leader.rank <= 3 ? (
                            <MilitaryTechIcon sx={{ color: rankColors[leader.rank], verticalAlign: 'middle' }} />
                          ) : (
                            <Typography sx={{ fontWeight: 700 }} color="text.secondary">#{leader.rank}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: rankColors[leader.rank] || 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                              {leader.name.split(' ').map((n: string) => n[0]).join('')}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: isMe ? 800 : 600 }}>{leader.name} {isMe && <Chip label="You" size="small" color="primary" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem' }} />}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{leader.department}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }} color="primary.main">{leader.points.toLocaleString()}</Typography></TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <LinearProgress variant="determinate" value={(leader.points / maxPoints) * 100}
                            sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: `linear-gradient(90deg, ${rankColors[leader.rank] || '#10b981'}, #34d399)` } }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={`${leader.badges} badges`} size="small" icon={<EmojiEventsIcon sx={{ fontSize: '14px !important' }} />} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
export default Leaderboard;
