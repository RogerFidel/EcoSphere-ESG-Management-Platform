import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down';
  trendLabel?: string;
  color?: string; // 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = 'up',
  trendLabel = 'vs last month',
  color = 'primary',
}) => {
  const isUp = trendType === 'up';

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Avatar
            color={color}
            sx={{
              bgcolor: `${color}.main`,
              width: 44,
              height: 44,
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
            }}
          >
            {icon}
          </Avatar>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isUp ? (
              <TrendingDownIcon sx={{ color: 'success.main', fontSize: 18 }} />
            ) : (
              <TrendingUpIcon sx={{ color: 'error.main', fontSize: 18 }} />
            )}
            <Typography
              variant="caption"
              color={isUp ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 600 }}
            >
              {trend}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {trendLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
export default StatCard;
