#!/bin/bash

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

set -e

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# بررسی وجود git
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    git pull origin main || git pull origin master
fi

# نصب dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production=false

# Build کردن پروژه
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# ایجاد پوشه logs اگر وجود نداشته باشد
mkdir -p logs

# بررسی وجود PM2
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Restarting PM2...${NC}"
    
    # بررسی وجود ecosystem.config.js
    if [ -f "ecosystem.config.js" ]; then
        pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
    else
        # استفاده از دستور مستقیم
        pm2 restart 30tel || pm2 start npm --name "30tel" -- start
    fi
    
    pm2 save
    echo -e "${GREEN}✅ PM2 restarted successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Starting with npm...${NC}"
    echo -e "${RED}⚠️  Warning: Application will stop when you close the terminal!${NC}"
    echo -e "${YELLOW}💡 Install PM2: npm install -g pm2${NC}"
fi

echo -e "${GREEN}✅ Deployment completed!${NC}"

# نمایش وضعیت
if command -v pm2 &> /dev/null; then
    echo -e "\n${GREEN}📊 Application status:${NC}"
    pm2 status
fi

