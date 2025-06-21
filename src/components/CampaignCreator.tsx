import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Globe, DollarSign, Target, Link, Eye, AlertTriangle, Zap, PlusCircle } from 'lucide-react';

interface CampaignData {
  accessToken: string;
  adAccountId: string;
  campaignName: string;
  country: string;
  budget: number;
  targetUrl: string;
  objective: string;
  audienceSize: 'minimal' | 'small' | 'medium';
  autoStart: boolean;
}

interface CampaignCreatorProps {
  onCampaignCreated: (campaign: any) => void;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({ onCampaignCreated }) => {
  const [formData, setFormData] = useState<CampaignData>({
    accessToken: '',
    adAccountId: '',
    campaignName: '',
    country: 'BR',
    budget: 5,
    targetUrl: '',
    objective: 'LINK_CLICKS',
    audienceSize: 'minimal',
    autoStart: false
  });
  
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Gerar URL de preview com macros
  React.useEffect(() => {
    if (formData.targetUrl) {
      const urlParams = new URLSearchParams({
        cwr: '{{campaign.id}}',
        cname: '{{campaign.name}}',
        domain: '{{domain}}',
        placement: '{{placement}}',
        adset: '{{adset.name}}',
        adname: '{{ad.name}}',
        site: '{{site_source_name}}',
        xid: '983tvvwh'
      });
      
      const separator = formData.targetUrl.includes('?') ? '&' : '?';
      setPreviewUrl(`${formData.targetUrl}${separator}${urlParams.toString()}`);
    }
  }, [formData.targetUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          finalUrl: previewUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar campanha: ${response.statusText}`);
      }

      const campaign = await response.json();
      onCampaignCreated(campaign);
      
      // Reset form
      setFormData({
        accessToken: '',
        adAccountId: '',
        campaignName: '',
        country: 'BR',
        budget: 5,
        targetUrl: '',
        objective: 'LINK_CLICKS',
        audienceSize: 'minimal',
        autoStart: false
      });
      
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Access Token Section */}
      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Credenciais da API</span>
            </CardTitle>
            <CardDescription>
              Conecte sua conta do Business Manager para criar campanhas automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="EAAxxxxxxxxxxxxxxxx..."
                value={formData.accessToken}
                onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
                required
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="adAccountId">ID da Conta de Anúncios</Label>
              <Input
                id="adAccountId"
                placeholder="act_1234567890"
                value={formData.adAccountId}
                onChange={(e) => setFormData({...formData, adAccountId: e.target.value})}
                required
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignName">Nome da Campanha</Label>
          <Input
            id="campaignName"
            placeholder="Teste Cloaker - [Data]"
            value={formData.campaignName}
            onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>País de Segmentação</span>
          </Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
              <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
              <SelectItem value="MX">🇲🇽 México</SelectItem>
              <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
              <SelectItem value="CO">🇨🇴 Colômbia</SelectItem>
              <SelectItem value="PE">🇵🇪 Peru</SelectItem>
              <SelectItem value="CL">🇨🇱 Chile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Orçamento Diário (USD)</span>
          </Label>
          <Input
            type="number"
            min="1"
            max="100"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Tamanho do Público</span>
          </Label>
          <Select value={formData.audienceSize} onValueChange={(value: any) => setFormData({...formData, audienceSize: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Mínimo (1K-10K)</SelectItem>
              <SelectItem value="small">Pequeno (10K-50K)</SelectItem>
              <SelectItem value="medium">Médio (50K-200K)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Target URL */}
      <div className="space-y-3">
        <Label htmlFor="targetUrl" className="flex items-center space-x-2">
          <Link className="h-4 w-4" />
          <span>URL do Cloaker (Base)</span>
        </Label>
        <Input
          id="targetUrl"
          type="url"
          placeholder="https://seusite.com/offer"
          value={formData.targetUrl}
          onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
          required
        />
        
        {previewUrl && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2 mb-2">
              <Eye className="h-4 w-4" />
              <span>Preview da URL Final com Macros:</span>
            </Label>
            <code className="text-xs text-gray-600 break-all">{previewUrl}</code>
          </div>
        )}
      </div>

      {/* Auto Start Option */}
      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center space-x-3">
          <Switch
            id="autoStart"
            checked={formData.autoStart}
            onCheckedChange={(checked) => setFormData({...formData, autoStart: checked})}
          />
          <Label htmlFor="autoStart" className="text-sm font-medium text-orange-800">
            Iniciar Automaticamente Após Aprovação
          </Label>
        </div>
        <Badge variant={formData.autoStart ? "default" : "secondary"}>
          {formData.autoStart ? "Ativado" : "Manual"}
        </Badge>
      </div>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> A campanha será criada com orçamento real. Monitore os gastos e pause quando necessário.
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={loading || !formData.accessToken || !formData.targetUrl}
        className="w-full h-12 text-base"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Criando Campanha...
          </>
        ) : (
          <>
            <PlusCircle className="h-5 w-5 mr-2" />
            Criar Campanha de Teste
          </>
        )}
      </Button>
    </form>
  );
};

export default CampaignCreator;
