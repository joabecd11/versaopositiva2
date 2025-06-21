
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Globe, Smartphone, Languages, ExternalLink, Link, AlertTriangle, Shield } from 'lucide-react';

interface AnalysisFormProps {
  onAnalyze: (url: string, config: any) => void;
  loading: boolean;
  serverConnected: boolean;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, loading, serverConnected }) => {
  const [url, setUrl] = useState('');
  const [isRawUrl, setIsRawUrl] = useState(false);
  const [country, setCountry] = useState('mexico');
  const [userAgent, setUserAgent] = useState('iphone');
  const [language, setLanguage] = useState('spanish');
  const [referer, setReferer] = useState('facebook');
  const [useCapturedParams, setUseCapturedParams] = useState(true);
  const [hasRecaptcha, setHasRecaptcha] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    onAnalyze(url.trim(), {
      isRawUrl,
      country,
      userAgent,
      language,
      referer,
      useCapturedParams,
      hasRecaptcha
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Análise Avançada de URLs</span>
        </CardTitle>
        <CardDescription>
          Configure os parâmetros de simulação para análise profunda contra cloakers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input Section */}
          <div className="space-y-3">
            <Label htmlFor="url" className="text-sm font-medium">
              URL para Análise
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://exemplo.com/campanha"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="font-mono"
            />
            
            {/* Raw URL Toggle */}
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Switch
                id="raw-url"
                checked={isRawUrl}
                onCheckedChange={setIsRawUrl}
              />
              <div className="flex-1">
                <Label htmlFor="raw-url" className="text-sm font-medium text-orange-800">
                  URL Bruta da Biblioteca de Anúncios
                </Label>
                <p className="text-xs text-orange-600 mt-1">
                  Ative se a URL vem diretamente da biblioteca de anúncios do Facebook (l.facebook.com)
                </p>
              </div>
              <Link className="h-4 w-4 text-orange-600" />
            </div>

            {isRawUrl && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Modo URL Bruta:</strong> A ferramenta primeiro vai interceptar os redirecionamentos 
                  para descobrir a URL final e então aplicar os parâmetros de bypass.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>País/Localização</span>
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mexico">🇲🇽 México</SelectItem>
                  <SelectItem value="usa">🇺🇸 Estados Unidos</SelectItem>
                  <SelectItem value="brazil">🇧🇷 Brasil</SelectItem>
                  <SelectItem value="france">🇫🇷 França</SelectItem>
                  <SelectItem value="germany">🇩🇪 Alemanha</SelectItem>
                  <SelectItem value="uk">🇬🇧 Reino Unido</SelectItem>
                  <SelectItem value="canada">🇨🇦 Canadá</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Agent Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span>Dispositivo</span>
              </Label>
              <Select value={userAgent} onValueChange={setUserAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iphone">📱 iPhone (iOS)</SelectItem>
                  <SelectItem value="android">🤖 Android</SelectItem>
                  <SelectItem value="desktop">💻 Desktop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <Languages className="h-4 w-4" />
                <span>Idioma</span>
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spanish">🇪🇸 Espanhol</SelectItem>
                  <SelectItem value="english">🇺🇸 Inglês</SelectItem>
                  <SelectItem value="portuguese">🇧🇷 Português</SelectItem>
                  <SelectItem value="french">🇫🇷 Francês</SelectItem>
                  <SelectItem value="german">🇩🇪 Alemão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Referer Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Origem do Tráfego</span>
              </Label>
              <Select value={referer} onValueChange={setReferer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="google">🔍 Google</SelectItem>
                  <SelectItem value="instagram">📷 Instagram</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                  <SelectItem value="youtube">📺 YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parameters Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Switch
                id="use-captured"
                checked={useCapturedParams}
                onCheckedChange={setUseCapturedParams}
              />
              <Label htmlFor="use-captured" className="text-sm font-medium text-blue-800">
                Usar Parâmetros Reais Capturados
              </Label>
            </div>
            <Badge variant={useCapturedParams ? "default" : "secondary"}>
              {useCapturedParams ? "Ativado" : "Desativado"}
            </Badge>
          </div>

          {/* reCAPTCHA Toggle */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <Switch
                id="has-recaptcha"
                checked={hasRecaptcha}
                onCheckedChange={setHasRecaptcha}
              />
              <div className="flex-1">
                <Label htmlFor="has-recaptcha" className="text-sm font-medium text-yellow-800 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Página tem reCAPTCHA</span>
                </Label>
                <p className="text-xs text-yellow-600 mt-1">
                  Ative se a página de destino contém verificação reCAPTCHA ("I'm not a robot")
                </p>
              </div>
            </div>
            <Badge variant={hasRecaptcha ? "default" : "secondary"} className={hasRecaptcha ? "bg-yellow-600" : ""}>
              {hasRecaptcha ? "Detectado" : "Não"}
            </Badge>
          </div>

          {hasRecaptcha && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-sm space-y-2">
                <div><strong>Modo Anti-reCAPTCHA Avançado:</strong></div>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• <strong>2captcha Integration:</strong> Resolução automática via API</li>
                  <li>• <strong>Browser Stealth:</strong> Emulação de comportamento humano</li>
                  <li>• <strong>Audio Challenge:</strong> Bypass por reconhecimento de voz</li>
                  <li>• <strong>Multiple Attempts:</strong> Tentativas com diferentes fingerprints</li>
                  <li>• <strong>Delay Randomization:</strong> Timing humano realístico</li>
                </ul>
                <div className="text-xs mt-2 p-2 bg-yellow-100 rounded">
                  <strong>⚠️ Nota:</strong> Se persistir o reCAPTCHA, pode ser necessário usar solvers manuais ou aguardar variações de IP.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || !serverConnected || !url.trim()}
            className="w-full h-12 text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isRawUrl ? 'Interceptando Redirecionamentos...' : 'Analisando...'}
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                {isRawUrl ? 'Interceptar e Analisar' : 'Iniciar Análise'}
              </>
            )}
          </Button>

          {!serverConnected && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Servidor desconectado. Verifique se o servidor está rodando em localhost:3001
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AnalysisForm;
