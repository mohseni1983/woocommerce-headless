# راهنمای Deploy روی هاست Node.js

این راهنما برای build و deploy کردن اپلیکیشن Next.js روی هاست Node.js است.

## پیش‌نیازها

- Node.js نسخه 20 یا بالاتر
- npm یا yarn
- PM2 (برای مدیریت process)
- Nginx (برای reverse proxy - اختیاری)

## مراحل Deploy

### 1. آماده‌سازی فایل‌ها

ابتدا فایل‌های پروژه را روی سرور آپلود کنید:

```bash
# روی سرور
cd /var/www/30tel  # یا مسیر دلخواه شما
git clone <repository-url> .  # یا فایل‌ها را آپلود کنید
```

### 2. نصب Dependencies

```bash
npm install --production=false
```

### 3. تنظیم Environment Variables

فایل `.env.production` یا `.env.local` را ایجاد کنید:

```bash
# .env.production
NODE_ENV=production

# WooCommerce API
WOOCOMMERCE_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

# Next.js
NEXT_PUBLIC_SITE_URL=https://your-domain.com
PORT=3000
```

### 4. Build کردن پروژه

```bash
npm run build
```

این دستور:

- فایل‌های TypeScript را کامپایل می‌کند
- فایل‌های استاتیک را تولید می‌کند
- فایل‌های standalone را در `.next/standalone` ایجاد می‌کند

### 5. اجرای Production با PM2

PM2 را نصب کنید (اگر نصب نشده):

```bash
npm install -g pm2
```

سپس یک فایل `ecosystem.config.js` ایجاد کنید:

```javascript
module.exports = {
  apps: [
    {
      name: "30tel",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/30tel",
      instances: 2, // تعداد instance ها (برای load balancing)
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

یا برای استفاده از standalone build:

```javascript
module.exports = {
  apps: [
    {
      name: "30tel",
      script: ".next/standalone/server.js",
      cwd: "/var/www/30tel",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

اجرای با PM2:

```bash
# ایجاد پوشه logs
mkdir -p logs

# شروع اپلیکیشن
pm2 start ecosystem.config.js

# ذخیره تنظیمات PM2
pm2 save

# تنظیم برای اجرای خودکار بعد از restart
pm2 startup
```

### 6. تنظیم Nginx (Reverse Proxy)

اگر از Nginx استفاده می‌کنید، یک فایل کانفیگ ایجاد کنید:

```nginx
# /etc/nginx/sites-available/30tel
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Cache images
    location /images {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1h;
        add_header Cache-Control "public";
    }
}
```

فعال‌سازی سایت:

```bash
sudo ln -s /etc/nginx/sites-available/30tel /etc/nginx/sites-enabled/
sudo nginx -t  # تست کانفیگ
sudo systemctl reload nginx
```

### 7. استفاده از systemd (جایگزین PM2)

اگر PM2 استفاده نمی‌کنید، می‌توانید از systemd استفاده کنید:

```bash
# ایجاد فایل سرویس
sudo nano /etc/systemd/system/30tel.service
```

محتوای فایل:

```ini
[Unit]
Description=30tel Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/30tel
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=30tel

[Install]
WantedBy=multi-user.target
```

فعال‌سازی و شروع سرویس:

```bash
sudo systemctl daemon-reload
sudo systemctl enable 30tel
sudo systemctl start 30tel
sudo systemctl status 30tel
```

## اسکریپت Deploy خودکار

یک اسکریپت برای deploy خودکار ایجاد کنید:

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart ecosystem.config.js

echo "✅ Deployment completed!"
```

اجرای اسکریپت:

```bash
chmod +x deploy.sh
./deploy.sh
```

## بررسی و Monitoring

### بررسی وضعیت PM2

```bash
pm2 status
pm2 logs 30tel
pm2 monit
```

### بررسی وضعیت systemd

```bash
sudo systemctl status 30tel
sudo journalctl -u 30tel -f
```

### بررسی پورت

```bash
netstat -tulpn | grep 3000
# یا
ss -tulpn | grep 3000
```

## Troubleshooting

### مشکل: اپلیکیشن شروع نمی‌شود

1. بررسی لاگ‌ها:

   ```bash
   pm2 logs 30tel
   # یا
   sudo journalctl -u 30tel -n 50
   ```

2. بررسی environment variables:

   ```bash
   pm2 env 0  # نمایش env variables برای app با id 0
   ```

3. بررسی پورت:
   ```bash
   lsof -i :3000
   ```

### مشکل: Memory leak

```bash
# افزایش memory limit در PM2
pm2 restart 30tel --update-env --max-memory-restart 1G
```

### مشکل: Build failed

1. پاک کردن cache:
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run build
   ```

## بهینه‌سازی Performance

1. **فعال‌سازی caching در Nginx**
2. **استفاده از CDN برای فایل‌های استاتیک**
3. **فعال‌سازی compression**
4. **استفاده از Redis برای caching** (اختیاری)

## امنیت

1. **فعال‌سازی SSL/TLS**
2. **تنظیم firewall**:

   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **بررسی و به‌روزرسانی منظم dependencies**:
   ```bash
   npm audit
   npm audit fix
   ```

## به‌روزرسانی

برای به‌روزرسانی اپلیکیشن:

```bash
# Pull تغییرات جدید
git pull origin main

# نصب dependencies جدید
npm install --production=false

# Build مجدد
npm run build

# Restart
pm2 restart ecosystem.config.js
# یا
sudo systemctl restart 30tel
```

## نکات مهم

1. همیشه قبل از deploy در production، در محیط test تست کنید
2. از environment variables برای اطلاعات حساس استفاده کنید
3. لاگ‌ها را به صورت منظم بررسی کنید
4. Backup منظم از دیتابیس و فایل‌ها بگیرید
5. از PM2 یا systemd برای مدیریت process استفاده کنید
6. برای production حتماً از HTTPS استفاده کنید

