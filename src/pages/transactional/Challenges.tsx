import React from 'react';
import CrudPage from '../../components/CrudPage';

const Challenges: React.FC = () => (
  <CrudPage
    title="Challenges"
    subtitle="Design and launch gamified green challenges to motivate employee ESG participation."
    endpoint="/challenges"
    queryKey="challenges"
    fields={[
      { key: 'title', label: 'Challenge Title' },
      { key: 'description', label: 'Description' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'endDate', label: 'End Date', type: 'date' },
      { key: 'rewardPoints', label: 'Reward Points', type: 'number' },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'] },
      { key: 'participantsCount', label: 'Participants', tableOnly: true },
    ]}
    statusColors={{ Easy: 'success', Medium: 'warning', Hard: 'error' }}
  />
);
export default Challenges;
