import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  Badge, Avatar, Menu, MenuItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, useTheme, Button, Alert, Chip, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import ScienceIcon from '@mui/icons-material/Science';
import GavelIcon from '@mui/icons-material/Gavel';
import FlagIcon from '@mui/icons-material/Flag';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddTaskIcon from '@mui/icons-material/AddTask';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

import { useAppDispatch, useAppSelector } from '../store';
import { toggleDarkMode, toggleSidebar, setUnreadCount } from '../store/uiSlice';
import { clearCredentials } from '../store/authSlice';
import { apiClient } from '../api/mockApi';

const drawerWidth = 260;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const user = useAppSelector((state) => state.auth.user);
  const unreadCount = useAppSelector((state) => state.ui.unreadCount);

  // Sub-menu collapses
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [transactionalOpen, setTransactionalOpen] = useState(false);

  // Menus anchor
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications').then(res => res.data),
    refetchInterval: 10000, // polling notifications
  });

  useEffect(() => {
    const unread = notifications.filter((n: any) => !n.read).length;
    dispatch(setUnreadCount(unread));
  }, [notifications, dispatch]);

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.put('/notifications'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    dispatch(clearCredentials());
    navigate('/auth');
  };

  const handleNav = (path: string) => {
    navigate(path);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
    { text: 'Reward Store', icon: <StorefrontIcon />, path: '/reward-store' },
  ];

  const masterDataItems = [
    { text: 'Departments', icon: <BusinessIcon />, path: '/departments' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Emission Factors', icon: <ScienceIcon />, path: '/emission-factors' },
    { text: 'Policies', icon: <GavelIcon />, path: '/policies' },
    { text: 'Goals', icon: <FlagIcon />, path: '/goals' },
    { text: 'Rewards', icon: <CardGiftcardIcon />, path: '/rewards' },
    { text: 'Badges', icon: <EmojiEventsIcon />, path: '/badges' },
  ];

  const transactionalItems = [
    { text: 'Carbon Transactions', icon: <ReceiptLongIcon />, path: '/carbon-transactions' },
    { text: 'CSR Activities', icon: <VolunteerActivismIcon />, path: '/csr-activities' },
    { text: 'Employee Participation', icon: <GroupAddIcon />, path: '/employee-participation' },
    { text: 'Challenges', icon: <AssignmentIcon />, path: '/challenges' },
    { text: 'Challenge Participation', icon: <AddTaskIcon />, path: '/challenge-participation' },
    { text: 'Compliance Issues', icon: <WarningAmberIcon />, path: '/compliance-issues' },
    { text: 'Audits', icon: <FactCheckIcon />, path: '/audits' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => dispatch(toggleSidebar())}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Box
              component="img"
              src="https://img.icons8.com/color/48/000000/eco-energy.png"
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
              EcoSphere <span style={{ fontWeight: 400, fontSize: '0.85rem', color: theme.palette.primary.main }}>ESG Management</span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Eco Points Tally */}
            {user && (
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'secondary.main', color: '#fff' }}><EmojiEventsIcon sx={{ fontSize: '1rem', color: '#fff' }} /></Avatar>}
                label={`${user.points} EP`}
                variant="outlined"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            )}

            <IconButton color="inherit" onClick={() => dispatch(toggleDarkMode())}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <IconButton color="inherit" onClick={() => setNotifDrawerOpen(true)}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Tooltip title="Account profile">
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, fontSize: '0.95rem' }}>
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Profile Dropdown */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                Profile Details
              </MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                ESG Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><ExitToAppIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* COLLAPSIBLE SIDEBAR */}
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 64,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          [`& .MuiDrawer-paper`]: {
            width: sidebarOpen ? drawerWidth : 64,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <List sx={{ px: 1, py: 1.5 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.text}
                onClick={() => handleNav(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.light' },
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto', justifyContent: 'center', color: isActive(item.path) ? 'primary.contrastText' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: isActive(item.path) ? 700 : 500 } } }} />}
              </ListItemButton>
            ))}

            {/* MASTER DATA COLLAPSIBLE SECTION */}
            {sidebarOpen ? (
              <>
                <ListItemButton onClick={() => setMasterDataOpen(!masterDataOpen)} sx={{ borderRadius: 2, mb: 0.5, px: 2.5 }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'text.secondary' }}>
                    <CategoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Master Data" slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 600 } } }} />
                  {masterDataOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={masterDataOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {masterDataItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        onClick={() => handleNav(subItem.path)}
                        selected={isActive(subItem.path)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          pl: 3,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: isActive(subItem.path) ? 'primary.contrastText' : 'text.secondary' }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} slotProps={{ primary: { sx: { fontSize: '0.85rem', fontWeight: isActive(subItem.path) ? 600 : 500 } } }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : null}

            {/* TRANSACTIONAL COLLAPSIBLE SECTION */}
            {sidebarOpen ? (
              <>
                <ListItemButton onClick={() => setTransactionalOpen(!transactionalOpen)} sx={{ borderRadius: 2, mb: 0.5, px: 2.5 }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'text.secondary' }}>
                    <ReceiptLongIcon />
                  </ListItemIcon>
                  <ListItemText primary="Transactional Logs" slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 600 } } }} />
                  {transactionalOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={transactionalOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {transactionalItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        onClick={() => handleNav(subItem.path)}
                        selected={isActive(subItem.path)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          pl: 3,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: isActive(subItem.path) ? 'primary.contrastText' : 'text.secondary' }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} slotProps={{ primary: { sx: { fontSize: '0.85rem', fontWeight: isActive(subItem.path) ? 600 : 500 } } }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : null}
          </List>

          <List sx={{ px: 1, pb: 2 }}>
            <ListItemButton
              onClick={() => handleNav('/settings')}
              selected={isActive('/settings')}
              sx={{
                borderRadius: 2,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto', justifyContent: 'center', color: isActive('/settings') ? 'primary.contrastText' : 'text.secondary' }}>
                <SettingsIcon />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="Settings" slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: isActive('/settings') ? 600 : 500 } } }} />}
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* NOTIFICATIONS DRAWER */}
      <Drawer
        anchor="right"
        open={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 340, p: 2 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>System Alerts</Typography>
          <Box>
            <Button size="small" onClick={() => markAllReadMutation.mutate()} sx={{ mr: 1 }}>Clear All</Button>
            <IconButton size="small" onClick={() => setNotifDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No new alerts or system flags.
          </Typography>
        ) : (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {notifications.map((notif: any) => (
              <Box key={notif.id} onClick={() => !notif.read && markReadMutation.mutate(notif.id)} sx={{ cursor: 'pointer' }}>
                <Alert
                  severity={notif.read ? 'info' : notif.type === 'warning' ? 'warning' : notif.type === 'success' ? 'success' : 'info'}
                  sx={{
                    opacity: notif.read ? 0.65 : 1,
                    boxShadow: notif.read ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                    borderLeft: notif.read ? 'none' : `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                    {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(notif.date).toLocaleDateString()}
                  </Typography>
                </Alert>
              </Box>
            ))}
          </List>
        )}
      </Drawer>

      {/* CORE WORKSPACE */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${sidebarOpen ? drawerWidth : 64}px)`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          mt: 8,
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
export default Layout;
