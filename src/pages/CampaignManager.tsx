
import React from 'react';
import CampaignDashboard from '../components/CampaignDashboard';

const CampaignManager: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <CampaignDashboard />
      </div>
    </div>
  );
};

export default CampaignManager;
