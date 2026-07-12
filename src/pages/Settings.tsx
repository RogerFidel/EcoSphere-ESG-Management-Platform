import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Switch, FormControlLabel,
  Divider, Button, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleDarkMode } from '../store/uiSlice';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(s => s.ui.darkMode);
  const [snackOpen, setSnackOpen] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [complianceAlerts, setComplianceAlerts] = useState(true);
  const [rewardAlerts, setRewardAlerts] = useState(true);
  const [challengeAlerts, setChallengeAlerts] = useState(false);
  const [reportFreq, setReportFreq] = useState('monthly');

  const handleSave = () => setSnackOpen(true);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>Settings</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Configure your ESG platform preferences and notification settings.</Typography>

      <Grid container spacing={3}>
        {/* Appearance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Appearance</Typography>
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={() => dispatch(toggleDarkMode())} color="primary" />}
                label={<Box><Typography variant="body2" sx={{ fontWeight: 600 }}>Dark Mode</Typography><Typography variant="caption" color="text.secondary">Switch between light and dark interface themes</Typography></Box>}
                sx={{ alignItems: 'flex-start', gap: 1, mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <FormControl size="small" fullWidth>
                <InputLabel>Dashboard Language</InputLabel>
                <Select value="en" label="Dashboard Language">
                  <MenuItem value="en">English (United States)</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Notification Preferences</Typography>
              {[
                { label: 'Email Alerts for Compliance Issues', sub: 'Receive email notifications when new compliance issues are raised', checked: complianceAlerts, onChange: setComplianceAlerts },
                { label: 'Email Activity Digest', sub: 'Weekly summary of ESG performance, goals, and CSR activities', checked: emailAlerts, onChange: setEmailAlerts },
                { label: 'Reward & Badge Notifications', sub: 'Get notified when you earn points, badges, or redeem rewards', checked: rewardAlerts, onChange: setRewardAlerts },
                { label: 'Challenge Reminders', sub: 'Push alerts when active challenges approach deadlines', checked: challengeAlerts, onChange: setChallengeAlerts },
              ].map(item => (
                <React.Fragment key={item.label}>
                  <FormControlLabel
                    control={<Switch checked={item.checked} onChange={e => item.onChange(e.target.checked)} color="primary" />}
                    label={<Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.sub}</Typography></Box>}
                    sx={{ alignItems: 'flex-start', gap: 1, mb: 1.5, width: '100%' }}
                  />
                  <Divider sx={{ my: 1.5 }} />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Report Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Report Generation</Typography>
              <FormControl size="small" fullWidth sx={{ mb: 3 }}>
                <InputLabel>Default Report Frequency</InputLabel>
                <Select value={reportFreq} onChange={(e) => setReportFreq(e.target.value)} label="Default Report Frequency">
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Default Emissions Scope</InputLabel>
                <Select value="all" label="Default Emissions Scope">
                  <MenuItem value="all">All Scopes (1, 2, 3)</MenuItem>
                  <MenuItem value="scope1">Scope 1 Only</MenuItem>
                  <MenuItem value="scope12">Scope 1 & 2</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Data & Privacy */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Data & Privacy</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage your ESG data preferences, data retention policies, and privacy settings for your organization's sustainability reporting.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button variant="outlined" color="warning" size="small">Export My Data</Button>
                <Button variant="outlined" color="error" size="small">Reset Demo Data</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" onClick={handleSave}>Save All Settings</Button>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackOpen(false)}>Settings saved successfully!</Alert>
      </Snackbar>
    </Box>
  );
};
export default Settings;
