
# Cloaker Analyzer - Backend

Servidor Node.js com Playwright para análise de cloakers.

## Instalação Rápida

```bash
npm install
npx playwright install chromium
npm start
```

## Endpoints

### POST /analyze
Analisa uma URL com simulação completa de usuário mexicano.

**Payload:**
```json
{
  "url": "https://exemplo.com/campanha"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "originalUrl": "https://exemplo.com/campanha",
  "finalUrl": "https://destino-real.com",
  "redirectChain": [...],
  "browserFingerprint": {...},
  "analysis": {
    "redirected": true,
    "redirectCount": 3,
    "suspiciousRedirects": 2,
    "finalDomain": "destino-real.com",
    "originalDomain": "exemplo.com"
  }
}
```

### GET /logs
Lista as 10 análises mais recentes.

### GET /download/:sessionId/:type
Download de arquivos salvos (json, html, screenshot).

## Configurações

- **Port**: 3001
- **Logs**: ./logs/
- **Timeout**: 30 segundos
- **Headless**: false (para debug)

## Logs Salvos

Cada análise gera:
- `analysis_{sessionId}.json` - Dados completos
- `page_{sessionId}.html` - HTML capturado  
- `screenshot_{sessionId}.png` - Screenshot da página
