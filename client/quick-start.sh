#!/bin/bash
# Quick start script for Paint Connect with local database

echo "🎨 Paint Connect - Local Database Version"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
if npm install > /dev/null 2>&1; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
if cd server && npm install > /dev/null 2>&1 && cd ..; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Terminal 1 and run: cd server && npm run dev"
echo "2. Open Terminal 2 and run: npm run dev"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:3001"
echo ""
echo "📖 For more information, see LOCAL_DATABASE_SETUP.md"
echo ""
