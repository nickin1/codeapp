#!/bin/bash

# Update repository
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Run database migrations
npx prisma migrate deploy

# Restart PM2 process
pm2 restart ecosystem.config.js 