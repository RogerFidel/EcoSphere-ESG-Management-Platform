import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  Box, Button, Card, CardContent, TextField, Typography, Tab, Tabs, Alert,
  InputAdornment, IconButton, CircularProgress, Avatar, Stack,
} from '@mui/material';
import EcoIcon from '@mui/icons-material/Park';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';
import { apiClient } from '../api/mockApi';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';

const MotionBox = motion(Box);

interface LoginForm { email: string; password: string; }
interface RegisterForm { name: string; email: string; password: string; confirmPassword: string; }

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginForm>({ defaultValues: { email: 'alice.greenwell@ecosphere.com', password: 'password' } });
  const registerForm = useForm<RegisterForm>();

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => apiClient.post('/auth/login', data).then(res => res.data),
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      navigate('/dashboard');
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Login failed. Try again.'),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) => apiClient.post('/auth/register', data).then(res => res.data),
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      navigate('/dashboard');
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Registration failed.'),
  });

  const onLogin = (data: LoginForm) => { setError(''); loginMutation.mutate(data); };
  const onRegister = (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(160deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)' }}>
      {/* Left side — branding */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8 }}>
        <MotionBox initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Avatar sx={{ bgcolor: '#10b981', width: 72, height: 72, mb: 3, mx: 'auto' }}>
            <EcoIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Avatar>
          <Typography variant="h2" sx={{ color: '#fff', textAlign: 'center', mb: 2, fontWeight: 900 }}>
            EcoSphere ESG
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 380, mx: 'auto', fontWeight: 400, lineHeight: 1.8 }}>
            The intelligent platform for measuring, managing, and reporting your organization's sustainability journey.
          </Typography>

          <Stack spacing={2} sx={{ mt: 6 }}>
            {['Scope 1, 2, 3 Emissions Tracking', 'Gamified Employee Engagement', 'Real-time Compliance Monitoring', 'Interactive ESG Analytics'].map(item => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'rgba(255,255,255,0.7)' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', flexShrink: 0 }} />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Stack>
        </MotionBox>
      </Box>

      {/* Right side — auth card */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 3, md: 4 } }}>
        <MotionBox initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} sx={{ width: '100%', maxWidth: 460 }}>
          <Card sx={{ borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
            <CardContent sx={{ p: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Avatar sx={{ bgcolor: '#10b981', width: 42, height: 42 }}><EcoIcon sx={{ fontSize: 22, color: '#fff' }} /></Avatar>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>EcoSphere</Typography>
              </Box>

              <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }}
                sx={{ mb: 4, '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 600 }, '& .Mui-selected': { color: '#10b981' }, '& .MuiTabs-indicator': { bgcolor: '#10b981' } }}>
                <Tab label="Sign In" />
                <Tab label="Create Account" />
              </Tabs>

              {error && <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</Alert>}

              {tab === 0 ? (
                <Box component="form" onSubmit={loginForm.handleSubmit(onLogin)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Email Address" fullWidth variant="outlined"
                    {...loginForm.register('email', { required: 'Email is required' })}
                    error={!!loginForm.formState.errors.email}
                    helperText={loginForm.formState.errors.email?.message}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#10b981', fontSize: 20 }} /></InputAdornment> } }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover fieldset': { borderColor: '#10b981' }, '&.Mui-focused fieldset': { borderColor: '#10b981' } }, '& label': { color: 'rgba(255,255,255,0.5)' }, '& label.Mui-focused': { color: '#10b981' } }}
                  />
                  <TextField
                    label="Password" fullWidth variant="outlined" type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password', { required: 'Password is required' })}
                    error={!!loginForm.formState.errors.password}
                    helperText={loginForm.formState.errors.password?.message}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#10b981', fontSize: 20 }} /></InputAdornment>,
                        endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.5)' }}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment>
                      }
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover fieldset': { borderColor: '#10b981' }, '&.Mui-focused fieldset': { borderColor: '#10b981' } }, '& label': { color: 'rgba(255,255,255,0.5)' }, '& label.Mui-focused': { color: '#10b981' } }}
                  />
                  <Button
                    type="submit" variant="contained" fullWidth size="large" disabled={loginMutation.isPending}
                    sx={{ py: 1.6, mt: 1, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '1rem', borderRadius: 2.5 }}
                  >
                    {loginMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Sign In to EcoSphere'}
                  </Button>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', display: 'block' }}>
                    Demo: alice.greenwell@ecosphere.com / password
                  </Typography>
                </Box>
              ) : (
                <Box component="form" onSubmit={registerForm.handleSubmit(onRegister)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { name: 'name', label: 'Full Name', icon: <PersonIcon sx={{ color: '#10b981', fontSize: 20 }} />, type: 'text' },
                    { name: 'email', label: 'Email Address', icon: <EmailIcon sx={{ color: '#10b981', fontSize: 20 }} />, type: 'email' },
                    { name: 'password', label: 'Password', icon: <LockIcon sx={{ color: '#10b981', fontSize: 20 }} />, type: 'password' },
                    { name: 'confirmPassword', label: 'Confirm Password', icon: <LockIcon sx={{ color: '#10b981', fontSize: 20 }} />, type: 'password' },
                  ].map(field => (
                    <TextField key={field.name} label={field.label} fullWidth variant="outlined" type={field.type}
                      {...registerForm.register(field.name as any, { required: `${field.label} is required` })}
                      error={!!registerForm.formState.errors[field.name as keyof RegisterForm]}
                      helperText={registerForm.formState.errors[field.name as keyof RegisterForm]?.message}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">{field.icon}</InputAdornment> } }}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover fieldset': { borderColor: '#10b981' }, '&.Mui-focused fieldset': { borderColor: '#10b981' } }, '& label': { color: 'rgba(255,255,255,0.5)' }, '& label.Mui-focused': { color: '#10b981' } }}
                    />
                  ))}
                  <Button
                    type="submit" variant="contained" fullWidth size="large" disabled={registerMutation.isPending}
                    sx={{ py: 1.6, mt: 1, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '1rem', borderRadius: 2.5 }}
                  >
                    {registerMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Create ESG Account'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </MotionBox>
      </Box>
    </Box>
  );
};
export default AuthPage;
