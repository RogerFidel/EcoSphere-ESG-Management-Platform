import React from 'react';
import CrudPage from '../../components/CrudPage';

const ComplianceIssues: React.FC = () => (
  <CrudPage
    title="Compliance Issues"
    subtitle="Log and investigate regulatory non-compliance incidents and environmental violations."
    endpoint="/compliance-issues"
    queryKey="compliance_issues"
    fields={[
      { key: 'title', label: 'Issue Title' },
      { key: 'description', label: 'Description' },
      { key: 'dateLogged', label: 'Date Logged', type: 'date' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Under Investigation', 'Resolved', 'Escalated'] },
      { key: 'resolvedDate', label: 'Resolved Date', type: 'date' },
    ]}
    statusColors={{ Open: 'error', 'Under Investigation': 'warning', Resolved: 'success', Escalated: 'error' }}
  />
);
export default ComplianceIssues;
