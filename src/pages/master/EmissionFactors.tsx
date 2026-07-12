import React from 'react';
import CrudPage from '../../components/CrudPage';

const EmissionFactors: React.FC = () => (
  <CrudPage
    title="Emission Factors"
    subtitle="Manage GHG emission conversion factors by category and regulatory source."
    endpoint="/emission-factors"
    queryKey="emission_factors"
    fields={[
      { key: 'categoryName', label: 'Category', tableOnly: true },
      { key: 'categoryId', label: 'Category ID', formOnly: true },
      { key: 'factor', label: 'Emission Factor', type: 'number' },
      { key: 'unit', label: 'Unit (kg CO2e per...)' },
      { key: 'source', label: 'Regulatory Source' },
      { key: 'year', label: 'Reference Year', type: 'number' },
    ]}
  />
);
export default EmissionFactors;
