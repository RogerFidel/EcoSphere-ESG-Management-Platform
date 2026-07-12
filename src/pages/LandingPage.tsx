import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Container, Grid, Card, CardContent, Chip, Stack, Avatar,
} from '@mui/material';
import { motion } from 'framer-motion';
import EcoIcon from '@mui/icons-material/Park';
import BarChartIcon from '@mui/icons-material/BarChart';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const features = [
  { icon: <BarChartIcon sx={{ fontSize: 40 }} />, title: 'Real-Time ESG Analytics', desc: 'Track Scope 1, 2, 3 carbon emissions across all departments with live dashboards and forecasting charts.' },
  { icon: <GavelIcon sx={{ fontSize: 40 }} />, title: 'Compliance & Audit Trails', desc: 'Automatically log regulatory compliance issues, schedule audits, and receive proactive risk alerts.' },
  { icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />, title: 'Gamified Engagement', desc: 'Reward employees with EcoPoints and Badges for participating in green challenges and CSR activities.' },
  { icon: <EcoIcon sx={{ fontSize: 40 }} />, title: 'Carbon Transaction Ledger', desc: 'Log every emission event with automatic CO₂ calculation using the latest approved emission factor database.' },
];

const stats = [
  { value: '12,840', label: 'Metric Tons CO₂e Tracked' },
  { value: '94%', label: 'Compliance Score' },
  { value: '1,240', label: 'ESG Events Logged' },
  { value: '680+', label: 'Volunteer Hours Contributed' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)', color: '#fff', overflow: 'hidden' }}>
      {/* NAV */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 3, md: 8 }, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#10b981', width: 38, height: 38 }}><EcoIcon sx={{ color: '#fff', fontSize: 22 }} /></Avatar>
          <Typography variant="h6" sx={{ letterSpacing: 0.5, fontWeight: 800 }}>
            EcoSphere <Typography component="span" sx={{ color: '#34d399', fontWeight: 400, fontSize: '0.9rem' }}>ESG</Typography>
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff', '&:hover': { borderColor: '#10b981' } }} onClick={() => navigate('/auth')}>Sign In</Button>
          <Button variant="contained" sx={{ background: 'linear-gradient(135deg, #10b981, #059669)', px: 3 }} onClick={() => navigate('/auth')}>Get Started</Button>
        </Stack>
      </Box>

      {/* HERO */}
      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 16 }, pb: 8, textAlign: 'center' }}>
        <MotionBox initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Chip label="ESG Management Platform 2026" sx={{ mb: 4, bgcolor: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, fontWeight: 900, lineHeight: 1.1, mb: 3 }}>
            Powering the World's
            <br />
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sustainable Future
            </Box>
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 680, mx: 'auto', fontWeight: 400, mb: 6, lineHeight: 1.7 }}>
            A comprehensive ESG management platform for measuring, managing, and reporting your organization's environmental, social, and governance performance.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/auth')}
              endIcon={<ArrowForwardIcon />}
              sx={{ background: 'linear-gradient(135deg, #10b981, #059669)', py: 1.8, px: 5, fontSize: '1.05rem', borderRadius: 3 }}
            >
              Enter Platform
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff', py: 1.8, px: 5, fontSize: '1.05rem', borderRadius: 3, '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' } }}
            >
              Watch Demo
            </Button>
          </Stack>
        </MotionBox>

        {/* STATS STRIP */}
        <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          sx={{ mt: 12, p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {stats.map((stat) => (
              <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                <Typography variant="h4" sx={{ color: '#34d399', mb: 0.5, fontWeight: 800 }}>{stat.value}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{stat.label}</Typography>
              </Grid>
            ))}
          </Grid>
        </MotionBox>
      </Container>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 800 }}>
          Everything you need for ESG Excellence
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 8, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
          From carbon accounting to employee gamification — EcoSphere is the complete end-to-end ESG operating system.
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={feature.title}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                sx={{ height: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', backdropFilter: 'blur(12px)', '&:hover': { borderColor: 'rgba(16,185,129,0.4)', transform: 'translateY(-4px)', transition: 'all 0.3s ease' } }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: '#10b981', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>{feature.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>{feature.desc}</Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA BANNER */}
      <Container maxWidth="md" sx={{ pb: 16, textAlign: 'center' }}>
        <MotionBox initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
          sx={{ p: { xs: 4, md: 8 }, borderRadius: 5, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(16,185,129,0.25)' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>Ready to take your ESG program to the next level?</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.55)', mb: 4 }}>Join forward-thinking organizations measuring what matters. Start your sustainability journey today.</Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {['ISO 14001 Ready', 'TCFD Aligned', 'GHG Protocol', 'UN SDGs Mapped'].map(tag => (
              <Chip key={tag} icon={<CheckCircleIcon sx={{ color: '#10b981 !important' }} />} label={tag} sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#fff', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }} />
            ))}
          </Stack>
          <Button variant="contained" size="large" onClick={() => navigate('/auth')} sx={{ mt: 4, background: 'linear-gradient(135deg, #10b981, #059669)', py: 1.8, px: 6, fontSize: '1rem', borderRadius: 3 }}>
            Start Free Trial
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
};
export default LandingPage;
