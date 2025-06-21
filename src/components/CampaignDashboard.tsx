
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Activity, Target } from 'lucide-react';
import CampaignCreator from './CampaignCreator';
import CampaignList from './CampaignList';
import { useCampaigns } from '../hooks/useCampaigns';

const CampaignDashboard: React.FC = () => {
  const { campaigns, createCampaign, loading } = useCampaigns();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Campanhas</h1>
          <p className="text-muted-foreground">
            Crie campanhas automáticas para capturar parâmetros reais do Facebook Ads
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>{campaigns.filter(c => c.status === 'ACTIVE').length} Ativas</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>{campaigns.length} Total</span>
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>Criar Campanha</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Gerenciar Campanhas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Campanha de Teste</CardTitle>
              <CardDescription>
                Configure uma campanha automática para capturar parâmetros reais com macros dinâmicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignCreator onCampaignCreated={(campaign) => {
                createCampaign(campaign);
                setActiveTab('manage');
              }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <CampaignList campaigns={campaigns} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDashboard;
