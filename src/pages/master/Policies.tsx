import React from 'react';
import CrudPage from '../../components/CrudPage';

const Policies: React.FC = () => (
  <CrudPage
    title="Policies"
    subtitle="Define and manage organizational ESG policies and environmental directives."
    endpoint="/policies"
    queryKey="policies"
    fields={[
      { key: 'title', label: 'Policy Title' },
      { key: 'description', label: 'Description' },
      { key: 'effectiveDate', label: 'Effective Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Draft', 'Archived'] },
    ]}
    statusColors={{ Active: 'success', Draft: 'warning', Archived: 'default' }}
  />
);
export default Policies;
