#!/bin/bash

# Script to fix standalone build for cPanel deployment

echo "🔨 Building application..."
npm run build

echo "📦 Copying static files to standalone..."
if [ -d ".next/static" ]; then
    mkdir -p .next/standalone/.next
    cp -r .next/static .next/standalone/.next/static
    echo "✅ Static files copied"
else
    echo "❌ Error: .next/static not found"
    exit 1
fi

echo "📁 Copying public folder to standalone..."
if [ -d "public" ]; then
    cp -r public .next/standalone/public
    echo "✅ Public folder copied"
else
    echo "❌ Error: public folder not found"
    exit 1
fi

echo ""
echo "✅ Standalone build is ready!"
echo "📂 Deploy folder: .next/standalone/"
echo ""
echo "📋 Next steps:"
echo "1. Upload .next/standalone/ folder to cPanel"
echo "2. Set Application Root to: 30tel/.next/standalone"
echo "3. Set Startup File to: server.js"
echo "4. Add environment variables in cPanel Node.js settings"

