import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Chip, Button, Divider, IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { apiClient } from '../api/mockApi';

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  info: { icon: <InfoIcon />, color: '#3b82f6' },
  warning: { icon: <WarningIcon />, color: '#f59e0b' },
  success: { icon: <CheckCircleIcon />, color: '#10b981' },
};

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then(res => res.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiClient.put('/notifications'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Notifications</Typography>
          <Typography variant="body1" color="text.secondary">
            System alerts, activity updates, and ESG notifications — {unread} unread.
          </Typography>
        </Box>
        {unread > 0 && (
          <Button startIcon={<DoneAllIcon />} variant="outlined" onClick={() => markAllMutation.mutate()}>
            Mark All Read
          </Button>
        )}
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading notifications...</Typography>
            </Box>
          )}
          {!isLoading && notifications.length === 0 && (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>All clear!</Typography>
              <Typography color="text.secondary">No new notifications at this time.</Typography>
            </Box>
          )}
          <List sx={{ p: 0 }}>
            {notifications.map((notif: any, idx: number) => {
              const cfg = typeConfig[notif.type] || typeConfig.info;
              return (
                <React.Fragment key={notif.id}>
                  <ListItem
                    sx={{
                      px: 3, py: 2.5,
                      bgcolor: notif.read ? 'transparent' : 'rgba(16,185,129,0.04)',
                      borderLeft: notif.read ? '4px solid transparent' : '4px solid',
                      borderColor: notif.read ? 'transparent' : 'primary.main',
                      transition: 'all 0.2s ease',
                    }}
                    secondaryAction={
                      !notif.read && (
                        <IconButton edge="end" size="small" onClick={() => markOneMutation.mutate(notif.id)}>
                          <DoneAllIcon fontSize="small" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${cfg.color}22`, color: cfg.color }}>
                        {cfg.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{notif.title}</Typography>
                          {!notif.read && <Chip label="New" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{notif.message}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(notif.date).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
export default Notifications;
