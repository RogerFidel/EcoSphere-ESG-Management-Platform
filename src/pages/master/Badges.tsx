import React from 'react';
import CrudPage from '../../components/CrudPage';

const Badges: React.FC = () => (
  <CrudPage
    title="Badges"
    subtitle="Define achievement badges and their criteria for the gamification engine."
    endpoint="/badges"
    queryKey="badges"
    fields={[
      { key: 'title', label: 'Badge Title' },
      { key: 'description', label: 'Criteria Description' },
      { key: 'icon', label: 'Icon Name', type: 'select', options: ['Park', 'VolunteerActivism', 'EmojiEvents', 'DeleteSweep', 'AutoAwesome', 'WaterDrop', 'Bolt'] },
      { key: 'pointsRequired', label: 'Points Required', type: 'number' },
    ]}
  />
);
export default Badges;
