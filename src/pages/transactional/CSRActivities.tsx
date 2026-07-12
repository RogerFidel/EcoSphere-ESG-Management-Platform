import React from 'react';
import CrudPage from '../../components/CrudPage';

const CSRActivities: React.FC = () => (
  <CrudPage
    title="CSR Activities"
    subtitle="Manage corporate social responsibility events, volunteer programs, and community impact initiatives."
    endpoint="/csr-activities"
    queryKey="csr_activities"
    fields={[
      { key: 'title', label: 'Activity Title' },
      { key: 'description', label: 'Description' },
      { key: 'date', label: 'Event Date', type: 'date' },
      { key: 'hoursSpent', label: 'Duration (hours)', type: 'number' },
      { key: 'organizer', label: 'Organizing Team' },
      { key: 'pointsAwarded', label: 'EcoPoints Awarded', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'Active', 'Completed', 'Cancelled'] },
    ]}
    statusColors={{ Planned: 'info', Active: 'warning', Completed: 'success', Cancelled: 'error' }}
  />
);
export default CSRActivities;
