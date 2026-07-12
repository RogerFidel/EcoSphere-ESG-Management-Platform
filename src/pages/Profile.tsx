import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Box, Grid, Typography, Card, CardContent, Avatar, Chip, Button, TextField,
  LinearProgress, Stack, Snackbar, Alert,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ParkIcon from '@mui/icons-material/Park';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { apiClient } from '../api/mockApi';
import { useAppDispatch } from '../store';
import { updateUser } from '../store/authSlice';

const badgeIconMap: Record<string, React.ReactNode> = {
  Park: <ParkIcon />, VolunteerActivism: <VolunteerActivismIcon />,
  EmojiEvents: <EmojiEventsIcon />, DeleteSweep: <DeleteSweepIcon />, AutoAwesome: <AutoAwesomeIcon />,
};

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.get('/auth/me').then(res => res.data),
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['badges-list'],
    queryFn: () => apiClient.get('/badges').then(res => res.data.data),
  });

  const form = useForm({ values: { name: me?.name, role: me?.role, department: me?.department } });

  const saveMutation = useMutation({
    mutationFn: (vals: any) => apiClient.put('/auth/profile', vals).then(r => r.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      dispatch(updateUser(updated));
      setEditing(false);
      setSnackOpen(true);
    }
  });

  const initials = me?.name?.split(' ').map((n: string) => n[0]).join('') || 'AG';
  const earnedIds: string[] = me?.badgesEarned || [];
  const levelPct = Math.min(100, ((me?.points || 0) % 500) / 5);
  const currentLevel = Math.floor((me?.points || 0) / 500) + 1;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>My Profile</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Your EcoSphere sustainability profile and achievements.</Typography>

      <Grid container spacing={3}>
        {/* PROFILE CARD */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2.2rem', fontWeight: 800 }}>
                {initials}
              </Avatar>
              {editing ? (
                <Box component="form" onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField label="Name" size="small" fullWidth {...form.register('name')} />
                  <TextField label="Role / Title" size="small" fullWidth {...form.register('role')} />
                  <TextField label="Department" size="small" fullWidth {...form.register('department')} />
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                    <Button variant="contained" size="small" type="submit" startIcon={<SaveIcon />} disabled={saveMutation.isPending}>Save</Button>
                    <Button variant="outlined" size="small" onClick={() => setEditing(false)}>Cancel</Button>
                  </Stack>
                </Box>
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{me?.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{me?.role}</Typography>
                  <Chip label={me?.department} size="small" sx={{ mt: 1, bgcolor: 'primary.light', color: '#fff', fontWeight: 600 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Member since {me?.registeredDate}
                  </Typography>
                  <Button startIcon={<EditIcon />} size="small" sx={{ mt: 2 }} onClick={() => setEditing(true)}>Edit Profile</Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* ECO POINTS CARD */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>EcoPoints Balance</Typography>
                <Chip icon={<EmojiEventsIcon sx={{ fontSize: 16, color: '#f59e0b !important' }} />} label={me?.points || 0} color="warning" size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">Level {currentLevel} Sustainability Advocate</Typography>
              <LinearProgress variant="determinate" value={levelPct}
                sx={{ mt: 1.5, height: 8, borderRadius: 4, bgcolor: 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #34d399)' } }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {500 - ((me?.points || 0) % 500)} pts to Level {currentLevel + 1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* BADGES */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Badges & Achievements
                <Chip label={`${earnedIds.length} / ${allBadges.length} Earned`} size="small" color="primary" sx={{ ml: 2, fontWeight: 600 }} />
              </Typography>
              <Grid container spacing={2}>
                {allBadges.map((badge: any) => {
                  const earned = earnedIds.includes(badge.id);
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={badge.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: earned ? 'primary.light' : 'divider', bgcolor: earned ? 'rgba(16,185,129,0.06)' : 'transparent', opacity: earned ? 1 : 0.5 }}>
                        <Avatar sx={{ bgcolor: earned ? 'primary.main' : 'action.disabledBackground', width: 48, height: 48 }}>
                          {badgeIconMap[badge.icon] || <EmojiEventsIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{badge.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{badge.description}</Typography>
                          {!earned && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'warning.main', fontWeight: 600 }}>
                              Requires {badge.pointsRequired} pts
                            </Typography>
                          )}
                          {earned && <Chip label="Earned" size="small" color="success" sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} />}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>Profile updated successfully!</Alert>
      </Snackbar>
    </Box>
  );
};
export default Profile;
