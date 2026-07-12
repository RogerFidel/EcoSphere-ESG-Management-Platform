import React from 'react';
import CrudPage from '../../components/CrudPage';

const Rewards: React.FC = () => (
  <CrudPage
    title="Rewards"
    subtitle="Manage items available in the employee Eco Reward Store."
    endpoint="/rewards"
    queryKey="rewards-admin"
    fields={[
      { key: 'title', label: 'Reward Title' },
      { key: 'description', label: 'Description' },
      { key: 'cost', label: 'EcoPoints Cost', type: 'number' },
      { key: 'stock', label: 'Stock Quantity', type: 'number' },
      { key: 'category', label: 'Category', type: 'select', options: ['Nature', 'Merchandise', 'Transit', 'Apparel', 'Tech', 'Experience'] },
    ]}
  />
);
export default Rewards;
