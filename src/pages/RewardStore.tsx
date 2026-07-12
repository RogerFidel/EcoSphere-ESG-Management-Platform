import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Alert,
} from '@mui/material';
import NatureIcon from '@mui/icons-material/Nature';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { apiClient } from '../api/mockApi';
import { useAppSelector, useAppDispatch } from '../store';
import { updateUser } from '../store/authSlice';
import { CardSkeleton } from '../components/LoadingSkeleton';

const categoryIcons: Record<string, React.ReactNode> = {
  Nature: <NatureIcon />,
  Merchandise: <LocalCafeIcon />,
  Transit: <DirectionsBusIcon />,
  Apparel: <CheckroomIcon />,
  Tech: <BatteryChargingFullIcon />,
};

const RewardStore: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector(s => s.auth.user);
  const [selected, setSelected] = useState<any>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards-store'],
    queryFn: () => apiClient.get('/rewards').then(res => res.data.data),
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => apiClient.post('/reward-store/redeem', { rewardId }).then(r => r.data),
    onSuccess: (data) => {
      dispatch(updateUser({ points: data.points }));
      queryClient.invalidateQueries({ queryKey: ['rewards-store'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSelected(null);
      setSnack({ open: true, msg: `Successfully redeemed! Your new balance: ${data.points} EP`, severity: 'success' });
    },
    onError: (err: any) => {
      setSelected(null);
      setSnack({ open: true, msg: err?.response?.data?.message || 'Redemption failed.', severity: 'error' });
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>Eco Reward Store</Typography>
          <Typography variant="body1" color="text.secondary">Redeem your EcoPoints for sustainable rewards and experiences.</Typography>
        </Box>
        <Chip
          icon={<EmojiEventsIcon sx={{ color: '#f59e0b !important' }} />}
          label={`${user?.points || 0} EcoPoints available`}
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.95rem', p: 1.5 }}
        />
      </Box>

      {isLoading ? <CardSkeleton count={6} /> : (
        <Grid container spacing={3}>
          {rewards.map((reward: any) => {
            const canAfford = (user?.points || 0) >= reward.cost;
            const inStock = reward.stock > 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reward.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(16,185,129,0.15)' } }}>
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(16,185,129,0.08)', borderRadius: '12px 12px 0 0' }}>
                    <Avatar sx={{ width: 72, height: 72, bgcolor: canAfford ? 'primary.main' : 'action.disabledBackground', fontSize: '2rem' }}>
                      {categoryIcons[reward.category] || <NatureIcon />}
                    </Avatar>
                  </Box>
                  <CardContent sx={{ flex: 1 }}>
                    <Chip label={reward.category} size="small" variant="outlined" color="primary" sx={{ mb: 1.5, fontWeight: 600 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{reward.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{reward.description}</Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2.5, pt: 0, justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }} color={canAfford ? 'primary.main' : 'text.disabled'}>
                        {reward.cost} EP
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{reward.stock} in stock</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      disabled={!canAfford || !inStock}
                      onClick={() => setSelected(reward)}
                      sx={{ borderRadius: 2.5 }}
                    >
                      {!inStock ? 'Out of Stock' : !canAfford ? 'Not Enough EP' : 'Redeem'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirm Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Redemption</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to redeem <strong>{selected?.title}</strong> for <strong>{selected?.cost} EcoPoints</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your remaining balance will be: <strong>{(user?.points || 0) - (selected?.cost || 0)} EP</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSelected(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={() => redeemMutation.mutate(selected?.id)} disabled={redeemMutation.isPending}>
            {redeemMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Confirm Redemption'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};
export default RewardStore;
