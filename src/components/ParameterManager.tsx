
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Download, Link, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CapturedParam {
  id: string;
  url: string;
  description: string;
  extractedAt: string;
  paramCount: number;
  categorized: {
    facebook: Record<string, string>;
    google: Record<string, string>;
    tiktok: Record<string, string>;
    generic: Record<string, string>;
    custom: Record<string, string>;
  };
  allParams: Record<string, string>;
}

interface ParameterManagerProps {
  serverUrl?: string;
}

const ParameterManager: React.FC<ParameterManagerProps> = ({ serverUrl = 'http://localhost:3001' }) => {
  const [capturedParams, setCapturedParams] = useState<CapturedParam[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCapture, setLoadingCapture] = useState(false);

  // Carregar parâmetros salvos
  const loadCapturedParams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/captured-params`);
      const data = await response.json();
      setCapturedParams(data.params || []);
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
      toast.error('Erro ao carregar parâmetros salvos');
    } finally {
      setLoading(false);
    }
  };

  // Capturar novos parâmetros
  const captureParams = async () => {
    if (!newUrl.trim()) {
      toast.error('Insira uma URL válida');
      return;
    }

    setLoadingCapture(true);
    try {
      const response = await fetch(`${serverUrl}/capture-params`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl.trim(),
          description: newDescription.trim() || undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`${data.extracted.paramCount} parâmetros capturados com sucesso!`);
        setNewUrl('');
        setNewDescription('');
        await loadCapturedParams();
      } else {
        toast.error(data.error || 'Erro ao capturar parâmetros');
      }
    } catch (error) {
      console.error('Erro ao capturar parâmetros:', error);
      toast.error('Erro ao capturar parâmetros');
    } finally {
      setLoadingCapture(false);
    }
  };

  // Deletar parâmetros
  const deleteParams = async (id: string) => {
    try {
      const response = await fetch(`${serverUrl}/captured-params/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Parâmetros removidos');
        await loadCapturedParams();
      } else {
        toast.error('Erro ao remover parâmetros');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao remover parâmetros');
    }
  };

  // Copiar parâmetros
  const copyParams = (params: CapturedParam) => {
    const text = Object.entries(params.allParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Parâmetros copiados para clipboard');
    });
  };

  useEffect(() => {
    loadCapturedParams();
  }, []);

  const renderParamCategory = (title: string, params: Record<string, string>, color: string) => {
    if (Object.keys(params).length === 0) return null;

    return (
      <div className="space-y-2">
        <h5 className={`text-sm font-medium text-${color}-700`}>{title}</h5>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
              <span className="font-mono text-gray-600">{key}:</span>
              <span className="font-mono text-gray-800 truncate ml-2 max-w-32">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Gerenciador de Parâmetros</span>
          </div>
          <Badge variant="outline">{capturedParams.length} salvos</Badge>
        </CardTitle>
        <CardDescription>
          Capture e gerencie parâmetros reais de campanhas para melhorar a eficácia contra cloakers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="capture" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="capture">Capturar Novos</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Salvos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="capture" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">URL com Parâmetros</label>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/?fbclid=IwAR123&utm_source=facebook..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
                <Textarea
                  placeholder="Ex: Campanha Black Friday 2024 - iPhone"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>
              
              <Button 
                onClick={captureParams} 
                disabled={loadingCapture || !newUrl.trim()}
                className="w-full"
              >
                {loadingCapture ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Capturando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Capturar Parâmetros
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Como capturar parâmetros reais:</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 ml-6">
                <li>• Crie uma campanha real no Meta Ads/Google Ads</li>
                <li>• Configure para aparecer apenas para você</li>
                <li>• Clique no anúncio e copie a URL completa</li>
                <li>• Cole aqui para extrair os parâmetros genuínos</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Carregando parâmetros...</p>
              </div>
            ) : capturedParams.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nenhum parâmetro capturado ainda</p>
                <p className="text-xs text-gray-500">Use a aba "Capturar Novos" para começar</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {capturedParams.map((param) => (
                  <Card key={param.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <h4 className="text-sm font-medium">{param.description}</h4>
                          <p className="text-xs text-gray-500 font-mono truncate">
                            {param.url.substring(0, 80)}...
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{new Date(param.extractedAt).toLocaleString()}</span>
                            <Badge variant="secondary" className="text-xs">
                              {param.paramCount} parâmetros
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyParams(param)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteParams(param.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {renderParamCategory('Facebook/Meta', param.categorized.facebook, 'blue')}
                      {renderParamCategory('Google Ads', param.categorized.google, 'green')}
                      {renderParamCategory('TikTok', param.categorized.tiktok, 'purple')}
                      {renderParamCategory('UTM Genéricos', param.categorized.generic, 'orange')}
                      {renderParamCategory('Personalizados', param.categorized.custom, 'gray')}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ParameterManager;
