import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Download, 
  ExternalLink, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  FileText,
  Image,
  Database,
  WifiOff,
  Target,
  Eye,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import AnalysisForm from '@/components/AnalysisForm';

interface RedirectInfo {
  from: string;
  to: string;
  status: number;
  timestamp: string;
}

interface CloakerAnalysis {
  urlsAttempted: number;
  successfulAttempts: number;
  bestScore: number;
  pageType: 'offer' | 'safe' | 'unknown';
  confidence: 'low' | 'medium' | 'high';
  detectedOfferPage: boolean;
  detectedSafePage: boolean;
  analysis: {
    offerIndicators: string[];
    safeIndicators: string[];
    suspiciousElements: string[];
  };
  allAttempts: Array<{
    attempt: number;
    url: string;
    success: boolean;
    pageType: string;
    score: number;
  }>;
}

interface AnalysisResult {
  sessionId: string;
  originalUrl: string;
  finalUrl: string;
  pageTitle: string;
  redirectChain: RedirectInfo[];
  cloakerAnalysis: CloakerAnalysis;
  analysis: {
    redirected: boolean;
    redirectCount: number;
    suspiciousRedirects: number;
    finalDomain: string;
    originalDomain: string;
    cloakingDetected: boolean;
  };
  timestamp: string;
  simulationConfig: any;
}

interface LogEntry {
  filename: string;
  sessionId: string;
  originalUrl: string;
  finalUrl: string;
  timestamp: string;
  redirectCount: number;
  pageType: string;
  isOfferPage: boolean;
}

const Index = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);

  const SERVER_URL = 'http://localhost:3001';

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      console.log('🔍 Verificando conexão com o servidor...');
      const response = await fetch(`${SERVER_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setServerConnected(true);
        console.log('✅ Servidor conectado');
        fetchLogs();
      } else {
        setServerConnected(false);
        console.error('❌ Servidor retornou erro:', response.status);
      }
    } catch (error) {
      setServerConnected(false);
      console.error('❌ Erro ao conectar com servidor:', error);
    }
  };

  const fetchLogs = async () => {
    if (!serverConnected) return;
    
    try {
      console.log('📋 Buscando logs...');
      const response = await fetch(`${SERVER_URL}/logs`, {
        signal: AbortSignal.timeout(10000)
      });
      if (response.ok) {
        const logsData = await response.json();
        setLogs(logsData);
        console.log('📋 Logs carregados:', logsData.length);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  const analyzeUrl = async (url: string, config: any) => {
    if (!serverConnected) {
      toast.error('Servidor não está conectado. Verifique se está rodando na porta 3001');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Iniciando análise da URL:', url);
      console.log('⚙️ Configurações:', config);
      
      const response = await fetch(`${SERVER_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          config: config
        }),
        signal: AbortSignal.timeout(90000) // 90 segundos para análise completa
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      fetchLogs();
      
      // Toast personalizado baseado no resultado
      if (analysisResult.cloakerAnalysis?.detectedOfferPage) {
        toast.success('🎯 Offer Page detectada! Cloaker quebrado com sucesso!');
      } else if (analysisResult.cloakerAnalysis?.detectedSafePage) {
        toast.warning('🛡️ Safe Page detectada. Cloaker não foi quebrado.');
      } else {
        toast.success('✅ Análise concluída');
      }
      
      console.log('✅ Análise concluída:', analysisResult.sessionId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro na análise: ${errorMessage}`);
      console.error('❌ Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (sessionId: string, type: 'json' | 'html' | 'screenshot') => {
    if (!serverConnected) {
      toast.error('Servidor não conectado');
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/download/${sessionId}/${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sessionId}_${type}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Download do ${type} iniciado!`);
      } else {
        toast.error('Erro no download');
      }
    } catch (error) {
      toast.error('Erro no download');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getPageTypeBadge = (pageType: string, confidence: string) => {
    if (pageType === 'offer') {
      return <Badge variant="default" className="bg-green-600">🎯 Offer Page</Badge>;
    } else if (pageType === 'safe') {
      return <Badge variant="destructive">🛡️ Safe Page</Badge>;
    } else {
      return <Badge variant="secondary">❓ Desconhecido</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-600',
      medium: 'bg-yellow-600', 
      low: 'bg-red-600'
    };
    return <Badge className={colors[confidence as keyof typeof colors] || 'bg-gray-600'}>
      {confidence === 'high' ? '🔥 Alta' : confidence === 'medium' ? '⚡ Média' : '❄️ Baixa'}
    </Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cloaker Analyzer
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sistema avançado para análise e quebra de cloakers TWR com detecção de Offer Page vs Safe Page.
            Engenharia reversa de parâmetros URL e simulação de navegador humano.
          </p>
        </div>

        {/* Server Status */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {serverConnected === null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Verificando servidor...</span>
                  </>
                ) : serverConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Servidor conectado (BrightData Premium API)</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Servidor desconectado</span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkServerConnection}
                disabled={serverConnected === null}
              >
                Verificar Conexão
              </Button>
            </div>
            
            {serverConnected === false && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>O servidor backend não está rodando. Para iniciar:</p>
                    <div className="bg-black text-green-400 p-2 rounded font-mono text-xs">
                      cd server<br/>
                      npm install<br/>
                      npm start
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Form */}
        <AnalysisForm 
          onAnalyze={analyzeUrl}
          loading={loading}
          serverConnected={!!serverConnected}
        />

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  {result.cloakerAnalysis?.detectedOfferPage ? (
                    <Target className="h-5 w-5 text-green-600" />
                  ) : result.cloakerAnalysis?.detectedSafePage ? (
                    <ShieldCheck className="h-5 w-5 text-red-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-600" />
                  )}
                  <span>Resultado da Análise Avançada</span>
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(result.sessionId, 'json')}
                  >
                    <Database className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(result.sessionId, 'html')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(result.sessionId, 'screenshot')}
                  >
                    <Image className="h-4 w-4 mr-1" />
                    Screenshot
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cloaker" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="cloaker">Cloaker</TabsTrigger>
                  <TabsTrigger value="overview">Resumo</TabsTrigger>
                  <TabsTrigger value="config">Simulação</TabsTrigger>
                  <TabsTrigger value="redirects">Redirecionamentos</TabsTrigger>
                  <TabsTrigger value="attempts">Tentativas</TabsTrigger>
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                </TabsList>

                <TabsContent value="cloaker" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.cloakerAnalysis?.urlsAttempted || 0}
                        </div>
                        <div className="text-sm text-gray-500">URLs Testadas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {result.cloakerAnalysis?.successfulAttempts || 0}
                        </div>
                        <div className="text-sm text-gray-500">Sucessos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {result.cloakerAnalysis?.bestScore || 0}
                        </div>
                        <div className="text-sm text-gray-500">Melhor Score</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        {getPageTypeBadge(result.cloakerAnalysis?.pageType || 'unknown', result.cloakerAnalysis?.confidence || 'low')}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <Shield className="h-6 w-6 text-yellow-600" />
                          <div className="text-xs font-medium">
                            reCAPTCHA
                          </div>
                          <Badge variant={result.simulationConfig?.hasRecaptcha ? "default" : "secondary"} className="text-xs">
                            {result.simulationConfig?.hasRecaptcha ? "🔒 Detectado" : "✅ Livre"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Target className="h-5 w-5 mr-2 text-green-600" />
                          Tipo de Página
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Tipo:</span>
                          {getPageTypeBadge(result.cloakerAnalysis?.pageType || 'unknown', result.cloakerAnalysis?.confidence || 'low')}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Confiança:</span>
                          {getConfidenceBadge(result.cloakerAnalysis?.confidence || 'low')}
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Score:</span>
                          <Badge variant="outline">{result.cloakerAnalysis?.bestScore || 0}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                          Indicadores
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm">
                          <div className="font-medium text-green-600">Indicadores de Offer:</div>
                          <div className="text-xs text-gray-600">
                            {result.cloakerAnalysis?.analysis?.offerIndicators?.length || 0} encontrados
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-red-600">Indicadores de Safe:</div>
                          <div className="text-xs text-gray-600">
                            {result.cloakerAnalysis?.analysis?.safeIndicators?.length || 0} encontrados
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {result.cloakerAnalysis?.analysis && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base text-green-600">Indicadores de Offer Page</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-32">
                              {result.cloakerAnalysis.analysis.offerIndicators?.length > 0 ? (
                                <ul className="text-sm space-y-1">
                                  {result.cloakerAnalysis.analysis.offerIndicators.map((indicator, idx) => (
                                    <li key={idx} className="text-green-700">• {indicator}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">Nenhum indicador encontrado</p>
                              )}
                            </ScrollArea>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base text-red-600">Indicadores de Safe Page</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-32">
                              {result.cloakerAnalysis.analysis.safeIndicators?.length > 0 ? (
                                <ul className="text-sm space-y-1">
                                  {result.cloakerAnalysis.analysis.safeIndicators.map((indicator, idx) => (
                                    <li key={idx} className="text-red-700">• {indicator}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">Nenhum indicador encontrado</p>
                              )}
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.analysis.redirectCount}
                        </div>
                        <div className="text-sm text-gray-500">Redirecionamentos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {result.analysis.suspiciousRedirects || 0}
                        </div>
                        <div className="text-sm text-gray-500">Suspeitos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Badge variant={result.analysis.redirected ? "destructive" : "default"}>
                          {result.analysis.redirected ? "Redirecionado" : "Direto"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">URL Original:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm break-all">
                        {result.originalUrl}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">URL Final:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm break-all">
                        {result.finalUrl}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Título da Página:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                        {result.pageTitle || 'N/A'}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  {result.simulationConfig && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Geolocalização</h4>
                          <div className="text-sm text-gray-600">
                            <div>Latitude: {result.simulationConfig.country.lat}</div>
                            <div>Longitude: {result.simulationConfig.country.lng}</div>
                            <div>Timezone: {result.simulationConfig.country.timezone}</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Navegador</h4>
                          <div className="text-sm text-gray-600">
                            <div>Mobile: {result.simulationConfig.userAgent.isMobile ? 'Sim' : 'Não'}</div>
                            <div>Viewport: {result.simulationConfig.userAgent.viewport.width}x{result.simulationConfig.userAgent.viewport.height}</div>
                            <div>Touch: {result.simulationConfig.userAgent.hasTouch ? 'Sim' : 'Não'}</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Idioma</h4>
                          <div className="text-sm text-gray-600">
                            <div>Locale: {result.simulationConfig.language.locale}</div>
                            <div>Languages: {result.simulationConfig.language.languages.join(', ')}</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Referer</h4>
                          <div className="text-sm text-gray-600">
                            <div>Origem: {result.simulationConfig.referer.referer}</div>
                            <div>Domínio: {result.simulationConfig.referer.domain}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="redirects" className="space-y-4">
                  {result.redirectChain.length > 0 ? (
                    <div className="space-y-3">
                      {result.redirectChain.map((redirect, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={redirect.status === 301 ? "default" : "secondary"}>
                              {redirect.status}
                            </Badge>
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(redirect.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="flex-1 bg-gray-50 p-2 rounded break-all">
                              {getDomainFromUrl(redirect.from)}
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 bg-gray-50 p-2 rounded break-all">
                              {getDomainFromUrl(redirect.to)}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum redirecionamento detectado
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attempts" className="space-y-4">
                  <div className="space-y-3">
                    {result.cloakerAnalysis?.allAttempts?.map((attempt, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Tentativa {attempt.attempt}</Badge>
                            <Badge variant={attempt.success ? "default" : "destructive"}>
                              {attempt.success ? "Sucesso" : "Falha"}
                            </Badge>
                            {getPageTypeBadge(attempt.pageType, 'medium')}
                          </div>
                          <Badge variant="secondary">Score: {attempt.score}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 break-all">
                          {attempt.url}
                        </div>
                      </Card>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        Nenhuma tentativa registrada
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium">Session ID:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded break-all">
                        {result.sessionId}
                      </div>
                    </div>
                    <div>
                      <label className="font-medium">Timestamp:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded">
                        {formatTimestamp(result.timestamp)}
                      </div>
                    </div>
                    <div>
                      <label className="font-medium">Domínio Original:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded">
                        {result.analysis.originalDomain}
                      </div>
                    </div>
                    <div>
                      <label className="font-medium">Domínio Final:</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded">
                        {result.analysis.finalDomain}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Recent Logs */}
        {logs.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Análises Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.sessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="text-sm font-medium truncate">
                          {getDomainFromUrl(log.originalUrl)}
                        </div>
                        {log.isOfferPage && (
                          <Badge variant="default" className="bg-green-600 text-xs">🎯 Offer</Badge>
                        )}
                        {log.pageType === 'safe' && (
                          <Badge variant="destructive" className="text-xs">🛡️ Safe</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)} • {log.redirectCount} redirecionamentos
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(log.sessionId, 'json')}
                      >
                        <Database className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(log.sessionId, 'html')}
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(log.sessionId, 'screenshot')}
                      >
                        <Image className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
