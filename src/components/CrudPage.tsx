import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton, Button,
  TextField, InputAdornment, Chip, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { TableSkeleton } from './LoadingSkeleton';
import { apiClient } from '../api/mockApi';

interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  tableRender?: (row: any) => React.ReactNode;
  formOnly?: boolean;
  tableOnly?: boolean;
}

interface CrudPageProps {
  title: string;
  subtitle: string;
  endpoint: string;
  queryKey: string;
  fields: FieldDef[];
  colorField?: string;
  statusColors?: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'>;
}

const CrudPage: React.FC<CrudPageProps> = ({ title, subtitle, endpoint, queryKey, fields, statusColors = {} }) => {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data: any }>({ open: false, mode: 'add', data: {} });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; label: string } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: [queryKey, page, limit, debouncedQ],
    queryFn: () => apiClient.get(endpoint, { params: { page: page + 1, limit, q: debouncedQ || undefined } }).then((r: any) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post(endpoint, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setDialog({ ...dialog, open: false }); setSnack({ open: true, msg: `${title.replace(/s$/, '')} added successfully!`, severity: 'success' }); },
    onError: () => setSnack({ open: true, msg: 'Failed to add record.', severity: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => apiClient.put(`${endpoint}/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setDialog({ ...dialog, open: false }); setSnack({ open: true, msg: `${title.replace(/s$/, '')} updated successfully!`, severity: 'success' }); },
    onError: () => setSnack({ open: true, msg: 'Failed to update record.', severity: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`${endpoint}/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setDeleteDialog(null); setSnack({ open: true, msg: 'Record deleted.', severity: 'success' }); },
    onError: () => setSnack({ open: true, msg: 'Delete failed.', severity: 'error' }),
  });

  const handleSearchChange = (val: string) => {
    setQ(val);
    clearTimeout((window as any)._searchTimeout);
    (window as any)._searchTimeout = setTimeout(() => { setDebouncedQ(val); setPage(0); }, 400);
  };

  const openAdd = () => setDialog({ open: true, mode: 'add', data: {} });
  const openEdit = (row: any) => setDialog({ open: true, mode: 'edit', data: { ...row } });

  const handleFormSubmit = () => {
    const payload = { ...dialog.data };
    if (dialog.mode === 'add') createMutation.mutate(payload);
    else updateMutation.mutate({ id: dialog.data.id, payload });
  };

  const tableFields = fields.filter(f => !f.formOnly);
  const formFields = fields.filter(f => !f.tableOnly);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>{title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{subtitle}</Typography>

      <Card>
        <CardContent>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <TextField
              size="small" placeholder={`Search ${title.toLowerCase()}...`} value={q}
              onChange={e => handleSearchChange(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
              sx={{ minWidth: 280 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh data">
                <IconButton onClick={() => refetch()} size="small"><RefreshIcon /></IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ borderRadius: 2.5 }}>
                Add {title.replace(/s$/, '')}
              </Button>
            </Box>
          </Box>

          {/* Table */}
          {isLoading ? <TableSkeleton rows={5} cols={tableFields.length + 1} /> : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {tableFields.map(f => <TableCell key={f.key}>{f.label}</TableCell>)}
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.data || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={tableFields.length + 1} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                          No records found. Try adjusting your search or add a new entry.
                        </TableCell>
                      </TableRow>
                    ) : (data?.data || []).map((row: any) => (
                      <TableRow key={row.id}>
                        {tableFields.map(f => (
                          <TableCell key={f.key}>
                            {f.tableRender ? f.tableRender(row) : (
                              f.key in statusColors || (row[f.key] && statusColors[row[f.key]]) ? (
                                <Chip label={row[f.key]} size="small" color={statusColors[row[f.key]] || 'default'} />
                              ) : (
                                <Typography variant="body2"
                                  sx={f.key === tableFields[0].key ? { fontWeight: 600 } : {}}
                                >
                                  {String(row[f.key] ?? '–')}
                                </Typography>
                              )
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(row)} color="primary"><EditIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: row.id, label: row[tableFields[0].key] || row.id })} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={data?.total || 0}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={limit}
                rowsPerPageOptions={[10]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{dialog.mode === 'add' ? `Add New ${title.replace(/s$/, '')}` : `Edit ${title.replace(/s$/, '')}`}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {formFields.map(f => (
              <Grid size={{ xs: 12 }} key={f.key}>
                {f.type === 'select' && f.options ? (
                  <TextField
                    select label={f.label} fullWidth size="small"
                    value={dialog.data[f.key] || ''} onChange={e => setDialog({ ...dialog, data: { ...dialog.data, [f.key]: e.target.value } })}
                    slotProps={{ select: { native: true } }}
                  >
                    <option value="">— Select —</option>
                    {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </TextField>
                ) : (
                  <TextField
                    label={f.label} fullWidth size="small"
                    type={f.type || 'text'}
                    value={dialog.data[f.key] || ''}
                    onChange={e => setDialog({ ...dialog, data: { ...dialog.data, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value } })}
                    slotProps={{ inputLabel: f.type === 'date' ? { shrink: true } : undefined }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialog({ ...dialog, open: false })} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={20} color="inherit" /> : dialog.mode === 'add' ? 'Add Record' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialog?.open} onClose={() => setDeleteDialog(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete <strong>{deleteDialog?.label}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialog(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteDialog && deleteMutation.mutate(deleteDialog.id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};
export default CrudPage;
