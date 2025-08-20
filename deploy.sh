#!/bin/bash

# TotallyHelth API Deployment Script
echo "🚀 Starting TotallyHelth API deployment..."

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

# Copy environment file
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "✅ Production environment file copied"
else
    echo "⚠️  Warning: .env.production file not found. Please create it with your production variables."
fi

# Start/Restart with PM2
echo "🔄 Starting application with PM2..."
pm2 stop totallyhelth-api 2>/dev/null || true
pm2 delete totallyhelth-api 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo "📊 Check application status: pm2 status"
echo "📋 View logs: pm2 logs totallyhelth-api"
