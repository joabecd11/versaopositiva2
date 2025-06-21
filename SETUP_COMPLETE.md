
# Cloaker Analyzer - Setup Completo

## Estrutura do Projeto
```
cloaker-analyzer/
├── server/
│   ├── package.json
│   ├── server.js
│   └── logs/ (será criado automaticamente)
├── src/
│   ├── components/
│   │   └── ui/ (todos os componentes shadcn)
│   ├── pages/
│   │   └── Index.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
├── public/
│   └── robots.txt
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── start.sh
├── setup.sh
└── README.md
```

## Passo 1: Criar pasta do projeto
```bash
mkdir cloaker-analyzer
cd cloaker-analyzer
```

## Passo 2: Configurar Backend
```bash
mkdir server
cd server
```

### server/package.json
```json
{
  "name": "cloaker-analyzer-server",
  "version": "1.0.0",
  "description": "Sistema para análise de cloakers com simulação de navegador humano",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "playwright": "^1.40.0",
    "cors": "^2.8.5",
    "fs-extra": "^11.1.1",
    "path": "^0.12.7",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### server/server.js
Copie o conteúdo completo do arquivo server/server.js do projeto atual.

## Passo 3: Configurar Frontend
```bash
cd ..
```

### package.json (raiz)
```json
{
  "name": "cloaker-analyzer-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 8080",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^4.32.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.263.1",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "react-day-picker": "^8.8.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.2",
    "react-resizable-panels": "^0.0.55",
    "react-router-dom": "^6.8.1",
    "recharts": "^2.7.2",
    "sonner": "^1.0.3",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.6",
    "vaul": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "lovable-tagger": "^0.0.1",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

## Passo 4: Scripts de Automação

### start.sh
```bash
#!/bin/bash
echo "🚀 Iniciando Cloaker Analyzer..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd server
npm install
npx playwright install chromium

# Iniciar servidor em background
echo "🚀 Iniciando servidor backend..."
npm start &
SERVER_PID=$!

sleep 3

# Voltar para a raiz e instalar frontend
cd ..
echo "📦 Instalando dependências do frontend..."
npm install

echo "🌐 Iniciando interface web..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Sistema iniciado com sucesso!"
echo "🔗 Frontend: http://localhost:8080"
echo "🔗 Backend:  http://localhost:3001"

trap "echo '🛑 Parando sistema...'; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
```

### setup.sh
```bash
#!/bin/bash
echo "🚀 Configurando Cloaker Analyzer..."

mkdir -p server
cd server
npm install
npx playwright install chromium

cd ..
npm install

echo "✅ Instalação concluída!"
echo "Para usar: ./start.sh"
```

## Passo 5: Arquivos de Configuração

Você precisará criar todos os arquivos de configuração (vite.config.ts, tailwind.config.ts, etc.) e todos os componentes React que estão atualmente no projeto.

## Passo 6: Executar
```bash
chmod +x setup.sh start.sh
./setup.sh
./start.sh
```

## Observações Importantes
- Este projeto requer Node.js 16+ e npm
- O Playwright será instalado automaticamente com os navegadores necessários
- Todos os arquivos de componentes React e configurações devem ser copiados manualmente
- O backend roda na porta 3001 e o frontend na porta 8080

## Lista de Arquivos a Copiar
1. Todos os arquivos em `src/components/ui/`
2. `src/pages/Index.tsx`
3. `src/main.tsx`
4. `src/App.tsx`
5. `src/index.css`
6. `src/lib/utils.ts`
7. `src/hooks/use-toast.ts`
8. `vite.config.ts`
9. `tailwind.config.ts`
10. `tsconfig.json`
11. `index.html`
