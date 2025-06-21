
# Cloaker Analyzer

Sistema avançado para análise de cloakers com simulação de navegador humano. Detecta redirecionamentos suspeitos e burla proteções de geolocalização, fingerprinting e headers.

## 🎯 Funcionalidades

- **Simulação de Usuário Mexicano**: Geolocalização, idioma e timezone do México
- **User-Agent de iPhone**: Simula Safari Mobile iOS
- **Headers do Facebook**: Inclui referer e fbclid para simular clique em anúncio
- **Anti-Detecção**: Remove sinais de automação e protege contra fingerprinting
- **Comportamento Humano**: Movimento do mouse, scroll e tempos de espera realistas
- **Captura Completa**: HTML, screenshots, redirecionamentos e fingerprint
- **Interface Web**: Dashboard para análise e visualização de resultados
- **Logs Locais**: Salva todos os dados em arquivos JSON, HTML e PNG

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn

### 1. Instalar o Backend

```bash
# Navegar para a pasta do servidor
cd server

# Instalar dependências
npm install

# Instalar browsers do Playwright
npx playwright install chromium

# Iniciar o servidor
npm start
```

O servidor backend estará rodando em `http://localhost:3001`

### 2. Instalar o Frontend

```bash
# Na pasta raiz do projeto
npm install

# Iniciar a interface web
npm run dev
```

A interface web estará disponível em `http://localhost:8080`

## 📱 Como Usar

### Interface Web

1. Acesse `http://localhost:8080`
2. Digite a URL que deseja analisar
3. Clique em "Analisar" 
4. Aguarde a análise (pode levar 30-60 segundos)
5. Visualize os resultados nas abas:
   - **Resumo**: Visão geral dos redirecionamentos
   - **Redirecionamentos**: Cadeia completa de redirecionamentos
   - **Fingerprint**: Dados do navegador capturados
   - **Detalhes**: Informações técnicas da sessão

### API Direta

```bash
# Analisar uma URL
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://exemplo.com/campanha"}'

# Listar análises recentes  
curl http://localhost:3001/logs

# Download de arquivos
curl http://localhost:3001/download/{sessionId}/json
curl http://localhost:3001/download/{sessionId}/html  
curl http://localhost:3001/download/{sessionId}/screenshot
```

## 🛡️ Simulações Implementadas

### Geolocalização
- **Latitude**: 19.4326 (Cidade do México)
- **Longitude**: -99.1332 (Cidade do México)
- **Timezone**: America/Mexico_City

### Navegador
- **User-Agent**: iPhone Safari iOS 17
- **Idioma**: Espanhol México (es-MX)
- **Viewport**: 375x812 (iPhone)
- **Touch**: Habilitado

### Headers HTTP
```
Referer: https://www.facebook.com/
Accept-Language: es-MX,es;q=0.9,en;q=0.8
Sec-Fetch-Site: cross-site
fbclid: [gerado automaticamente]
utm_source: facebook
utm_medium: cpc
```

### Anti-Detecção
- `navigator.webdriver = false`
- `navigator.languages = ['es-MX', 'es', 'en-US']`
- Plugins simulados do Chrome
- Proteção contra Canvas Fingerprinting
- Remoção de sinais de automação

### Comportamento Humano
- Movimento aleatório do mouse
- Scroll com mouse wheel
- Esperas entre 2-5 segundos
- Padrões de navegação realistas

## 📁 Estrutura de Arquivos

```
/server/
  ├── server.js           # Servidor backend
  ├── package.json        # Dependências do servidor
  └── logs/              # Arquivos salvos
      ├── analysis_*.json # Dados da análise
      ├── page_*.html    # HTML capturado
      └── screenshot_*.png # Screenshots

/src/
  └── pages/
      └── Index.tsx      # Interface web principal
```

## 📊 Dados Capturados

Cada análise gera:

- **JSON**: Dados completos da análise, redirecionamentos e fingerprint
- **HTML**: Código fonte da página final
- **PNG**: Screenshot em resolução completa
- **Metadados**: URLs, timestamps, headers, status codes

## 🔧 Configuração Avançada

### Personalizar User-Agent

Edite `server.js` linha ~67:

```javascript
userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...'
```

### Mudar Geolocalização

Edite `server.js` linha ~72:

```javascript
geolocation: { 
  latitude: 19.4326,   // Sua latitude
  longitude: -99.1332  // Sua longitude
}
```

### Ajustar Comportamento

Edite a função `simulateHumanBehavior()` para:
- Mudar tempo de espera
- Adicionar mais interações
- Modificar padrões de movimento

## 🎯 Casos de Uso

- **Teste de Cloakers**: Verificar se páginas redirecionam por geolocalização
- **Análise de Campanhas**: Descobrir destinos reais de anúncios
- **Detecção de Fraude**: Identificar páginas que escondem conteúdo
- **Compliance**: Verificar conformidade de landing pages
- **Research**: Estudar técnicas de cloaking e redirecionamento

## ⚠️ Disclaimer

Este sistema é para fins educacionais e de teste em suas próprias propriedades. Use com responsabilidade e respeite os termos de serviço dos sites que você está testando.

## 🐛 Solução de Problemas

### Erro: "Browser not found"
```bash
cd server
npx playwright install chromium
```

### Erro: "ECONNREFUSED"
Verifique se o servidor backend está rodando na porta 3001.

### Timeout na análise
Aumente o timeout em `server.js` linha ~156:
```javascript
timeout: 60000  // 60 segundos
```

### Problemas de CORS
O servidor já inclui CORS habilitado para desenvolvimento local.

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no console do servidor
2. Confira se todas as dependências estão instaladas
3. Teste com URLs simples primeiro
4. Verifique se as portas 3001 e 8080 estão livres
