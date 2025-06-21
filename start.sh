
#!/bin/bash

echo "🚀 Iniciando Cloaker Analyzer..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) encontrado"

# Criar pasta do servidor se não existir
mkdir -p server

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "📦 Dependências do backend já instaladas"
fi

# Instalar browsers do Playwright
echo "🌐 Verificando instalação do Playwright..."
if [ ! -d "$HOME/.cache/ms-playwright" ] && [ ! -d "$HOME/Library/Caches/ms-playwright" ]; then
    echo "🌐 Instalando navegadores do Playwright..."
    npx playwright install chromium
else
    echo "🌐 Navegadores do Playwright já instalados"
fi

# Iniciar servidor em background
echo "🚀 Iniciando servidor backend..."
npm start &
SERVER_PID=$!

# Aguardar servidor inicializar
echo "⏳ Aguardando servidor inicializar..."
sleep 3

# Verificar se servidor está rodando
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Servidor backend rodando em http://localhost:3001"
else
    echo "❌ Erro ao iniciar servidor backend"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Voltar para a raiz e instalar frontend
echo "📦 Instalando dependências do frontend..."
cd ..
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "📦 Dependências do frontend já instaladas"
fi

echo "🌐 Iniciando interface web..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "🔗 Links:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Para parar o sistema: Ctrl+C"
echo ""

# Manter script rodando
trap "echo '🛑 Parando sistema...'; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
