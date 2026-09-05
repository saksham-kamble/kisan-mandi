#!/bin/bash

echo "🌾 Kisan Mandi - Startup Diagnostic Script"
echo "=========================================="
echo ""

# Check Node.js
echo "1. Checking Node.js..."
node --version || echo "❌ Node.js not found!"
echo ""

# Check npm
echo "2. Checking npm..."
npm --version || echo "❌ npm not found!"
echo ""

# Check if in client directory
if [ -f "package.json" ]; then
    echo "3. ✓ Found package.json"
else
    echo "❌ package.json not found. Are you in the client directory?"
    exit 1
fi
echo ""

# Check node_modules
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✓ node_modules exists"
else
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi
echo ""

# Check vite
echo "5. Checking Vite..."
if [ -f "node_modules/.bin/vite" ]; then
    echo "✓ Vite installed"
else
    echo "❌ Vite not found. Try: npm install"
fi
echo ""

echo "🚀 Ready to start! Run: npm run dev"
