# راهنمای سریع Deploy روی هاست Node.js

## مراحل سریع (5 دقیقه)

### 1. آپلود فایل‌ها روی سرور

```bash
cd /var/www/30tel
git clone <repository-url> .
# یا فایل‌ها را با FTP/SFTP آپلود کنید
```

### 2. نصب و Build

```bash
npm install
npm run build
```

### 3. ایجاد فایل .env.production

```bash
nano .env.production
```

محتوای فایل:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
WOOCOMMERCE_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=your_key
WOOCOMMERCE_CONSUMER_SECRET=your_secret
```

### 4. نصب و اجرا با PM2

```bash
npm install -g pm2
pm2 start npm --name "30tel" -- start
pm2 save
pm2 startup  # برای اجرای خودکار بعد از restart
```

### 5. تنظیم Nginx (اختیاری)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## دستورات مفید

```bash
# مشاهده لاگ‌ها
pm2 logs 30tel

# Restart
pm2 restart 30tel

# Stop
pm2 stop 30tel

# Status
pm2 status

# استفاده از اسکریپت deploy
./deploy.sh
```

## Troubleshooting

**مشکل**: پورت 3000 در حال استفاده است

```bash
lsof -i :3000
kill -9 <PID>
```

**مشکل**: Build failed

```bash
rm -rf .next node_modules
npm install
npm run build
```

**مشکل**: Memory limit

```bash
pm2 restart 30tel --update-env --max-memory-restart 1G
```

## نکات مهم

1. ✅ حتماً فایل `.env.production` را ایجاد کنید
2. ✅ از PM2 برای مدیریت process استفاده کنید
3. ✅ برای production از HTTPS استفاده کنید
4. ✅ لاگ‌ها را به صورت منظم بررسی کنید

برای راهنمای کامل، فایل `NODEJS_DEPLOY.md` را مطالعه کنید.

