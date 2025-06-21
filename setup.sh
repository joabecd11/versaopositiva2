
#!/bin/bash

echo "🚀 Configurando Cloaker Analyzer..."

# Criar pasta do servidor se não existir
mkdir -p server

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd server
npm install

# Instalar browsers do Playwright
echo "🌐 Instalando navegadores do Playwright..."
npx playwright install chromium

# Voltar para a raiz e instalar frontend
echo "📦 Instalando dependências do frontend..."
cd ..
npm install

echo "✅ Instalação concluída!"
echo ""
echo "Para usar o sistema:"
echo "1. Terminal 1: cd server && npm start"
echo "2. Terminal 2: npm run dev"
echo "3. Acesse: http://localhost:8080"
echo ""
echo "Exemplo de URL para testar:"
echo "https://example.com/campaign"
