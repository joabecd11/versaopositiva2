
import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'PENDING' | 'REJECTED';
  country: string;
  budget: number;
  spent: number;
  clicks: number;
  impressions: number;
  targetUrl: string;
  finalUrl: string;
  createdAt: string;
  adAccountId: string;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        const newCampaign = await response.json();
        setCampaigns(prev => [newCampaign, ...prev]);
        return newCampaign;
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw error;
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setCampaigns(prev => 
          prev.map(campaign => 
            campaign.id === campaignId 
              ? { ...campaign, status: status as any }
              : campaign
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status da campanha:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      }
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaignStatus,
    deleteCampaign,
    fetchCampaigns
  };
};
