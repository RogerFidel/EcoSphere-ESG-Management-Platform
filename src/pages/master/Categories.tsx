import React from 'react';
import { Chip } from '@mui/material';
import CrudPage from '../../components/CrudPage';

const scopeColors: Record<string, any> = { '1': 'error', '2': 'warning', '3': 'info' };

const Categories: React.FC = () => (
  <CrudPage
    title="Categories"
    subtitle="Manage emission source categories mapped to GHG scopes."
    endpoint="/categories"
    queryKey="categories"
    fields={[
      { key: 'name', label: 'Category Name' },
      { key: 'scope', label: 'GHG Scope', type: 'select', options: ['1', '2', '3'],
        tableRender: (row) => <Chip label={`Scope ${row.scope}`} size="small" color={scopeColors[String(row.scope)] || 'default'} /> },
      { key: 'unit', label: 'Measurement Unit' },
      { key: 'description', label: 'Description' },
    ]}
  />
);
export default Categories;
