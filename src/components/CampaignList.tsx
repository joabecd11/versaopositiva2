
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Pause, 
  Play, 
  Trash2, 
  ExternalLink, 
  Eye, 
  DollarSign,
  Users,
  Clock,
  Target
} from 'lucide-react';

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

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, loading }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Activity className="h-3 w-3" />;
      case 'PAUSED': return <Pause className="h-3 w-3" />;
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'REJECTED': return <Target className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Nenhuma campanha criada ainda. Use a aba "Criar Campanha" para começar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>ID: {campaign.id}</span>
                  <span>•</span>
                  <span>Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</span>
                </CardDescription>
              </div>
              <Badge className={`flex items-center space-x-1 ${getStatusColor(campaign.status)}`}>
                {getStatusIcon(campaign.status)}
                <span>{campaign.status}</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600">Gasto</p>
                  <p className="text-sm font-medium">${campaign.spent.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <Target className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600">Cliques</p>
                  <p className="text-sm font-medium">{campaign.clicks}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                <Eye className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600">Impressões</p>
                  <p className="text-sm font-medium">{campaign.impressions}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-orange-600">País</p>
                  <p className="text-sm font-medium">{campaign.country}</p>
                </div>
              </div>
            </div>

            {/* URLs Section */}
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 mb-1">URL Base:</p>
                <code className="text-xs break-all">{campaign.targetUrl}</code>
              </div>
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">URL com Macros:</p>
                <code className="text-xs break-all">{campaign.finalUrl}</code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2 border-t">
              {campaign.status === 'ACTIVE' && (
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </Button>
              )}
              
              {campaign.status === 'PAUSED' && (
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Reativar
                </Button>
              )}
              
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver no Ads Manager
              </Button>
              
              <Button variant="destructive" size="sm" className="ml-auto">
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CampaignList;
