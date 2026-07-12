import React from 'react';
import { Chip } from '@mui/material';
import CrudPage from '../../components/CrudPage';

const scopeColors: Record<string, any> = { '1': 'error', '2': 'warning', '3': 'info' };

const CarbonTransactions: React.FC = () => (
  <CrudPage
    title="Carbon Transactions"
    subtitle="Log and manage all Scope 1, 2, and 3 GHG emission events across departments."
    endpoint="/carbon-transactions"
    queryKey="carbon_transactions"
    fields={[
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'departmentName', label: 'Department', tableOnly: true },
      { key: 'departmentId', label: 'Department ID', formOnly: true },
      { key: 'categoryName', label: 'Category', tableOnly: true },
      { key: 'categoryId', label: 'Category ID', formOnly: true },
      { key: 'scope', label: 'Scope', type: 'select', options: ['1', '2', '3'],
        tableRender: (row) => <Chip label={`Scope ${row.scope}`} size="small" color={scopeColors[String(row.scope)] || 'default'} /> },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit', label: 'Unit' },
      { key: 'emissionsCo2', label: 'CO₂e (t)', tableOnly: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
      { key: 'loggedBy', label: 'Logged By', tableOnly: true },
    ]}
    statusColors={{ Approved: 'success', Pending: 'warning', Rejected: 'error' }}
  />
);
export default CarbonTransactions;
