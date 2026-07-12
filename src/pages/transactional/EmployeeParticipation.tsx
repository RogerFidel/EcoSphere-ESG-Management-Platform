import React from 'react';
import CrudPage from '../../components/CrudPage';

const EmployeeParticipation: React.FC = () => (
  <CrudPage
    title="Employee Participation"
    subtitle="Track individual employee attendance and participation in CSR activities."
    endpoint="/employee-participation"
    queryKey="employee_participation"
    fields={[
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'departmentName', label: 'Department' },
      { key: 'activityTitle', label: 'CSR Activity', tableOnly: true },
      { key: 'activityId', label: 'Activity ID', formOnly: true },
      { key: 'hoursVolunteered', label: 'Hours Volunteered', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Registered', 'Attended', 'No-Show', 'Cancelled'] },
    ]}
    statusColors={{ Attended: 'success', Registered: 'info', 'No-Show': 'error', Cancelled: 'default' }}
  />
);
export default EmployeeParticipation;
