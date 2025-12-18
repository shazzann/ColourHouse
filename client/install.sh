#!/bin/bash

echo "🎨 Installing Paint Connect - Local Database Version"
echo ""

echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1 - Backend: cd server && npm run dev"
echo "2. Terminal 2 - Frontend: npm run dev"
echo ""
echo "For more information, see LOCAL_DATABASE_SETUP.md"
