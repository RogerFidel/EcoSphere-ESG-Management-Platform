import React from 'react';
import CrudPage from '../../components/CrudPage';

const Departments: React.FC = () => (
  <CrudPage
    title="Departments"
    subtitle="Manage organizational departments and their ESG budget allocations."
    endpoint="/departments"
    queryKey="departments"
    fields={[
      { key: 'name', label: 'Department Name' },
      { key: 'head', label: 'Department Head' },
      { key: 'employeesCount', label: 'Employees', type: 'number' },
      { key: 'budget', label: 'ESG Budget ($)', type: 'number' },
    ]}
  />
);
export default Departments;
