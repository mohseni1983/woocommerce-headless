# راهنمای Deploy روی cPanel با Node.js

## فایل‌هایی که باید به هاست کپی کنید

### ✅ فایل‌های ضروری (باید کپی شوند):

```
30tel/
├── src/                    # ✅ تمام پوشه src
├── public/                 # ✅ تمام پوشه public
├── package.json            # ✅ فایل package.json
├── package-lock.json       # ✅ فایل package-lock.json (اگر وجود دارد)
├── next.config.ts          # ✅ فایل کانفیگ Next.js
├── tsconfig.json           # ✅ فایل کانفیگ TypeScript
├── postcss.config.mjs      # ✅ فایل کانفیگ PostCSS
├── eslint.config.mjs       # ✅ فایل کانفیگ ESLint
├── .env.production         # ✅ فایل environment variables (بعد از ایجاد)
└── ecosystem.config.js     # ✅ فایل PM2 (اگر استفاده می‌کنید)
```

### ❌ فایل‌هایی که نباید کپی شوند:

```
30tel/
├── node_modules/           # ❌ نصب می‌شود روی سرور
├── .next/                  # ❌ build می‌شود روی سرور
├── .env.local              # ❌ فقط برای development
├── .env.development        # ❌ فقط برای development
├── .git/                   # ❌ اگر از git استفاده نمی‌کنید
├── .vscode/                # ❌ فقط برای IDE
├── *.log                   # ❌ فایل‌های لاگ
└── .DS_Store               # ❌ فایل‌های سیستم Mac
```

## مراحل Deploy

### مرحله 1: آماده‌سازی فایل‌ها

#### روش 1: استفاده از Git (توصیه می‌شود)

```bash
# روی کامپیوتر محلی
cd /path/to/30tel
git add .
git commit -m "Ready for production"
git push origin main

# روی سرور cPanel
cd ~/30tel  # یا مسیر پروژه شما
git pull origin main
```

#### روش 2: آپلود مستقیم با FTP/SFTP

1. از File Manager در cPanel استفاده کنید یا از FTP client مثل FileZilla
2. فایل‌های زیر را آپلود کنید:
   - تمام پوشه `src/`
   - تمام پوشه `public/`
   - فایل‌های root: `package.json`, `next.config.ts`, `tsconfig.json`, و غیره

**نکته مهم**: فایل‌های `.env.local` را آپلود نکنید! باید `.env.production` را روی سرور ایجاد کنید.

### مرحله 2: ایجاد فایل .env.production روی سرور

در File Manager یا از طریق SSH:

```bash
cd ~/30tel  # یا مسیر پروژه شما
nano .env.production
```

محتوای فایل:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# WooCommerce API
WOOCOMMERCE_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret
```

ذخیره کنید (Ctrl+X, سپس Y, سپس Enter)

### مرحله 3: نصب Dependencies

از Terminal در cPanel یا SSH:

```bash
cd ~/30tel
npm install --production=false
```

### مرحله 4: Build پروژه

```bash
npm run build
```

این مرحله ممکن است چند دقیقه طول بکشد.

### مرحله 5: اجرای اپلیکیشن

#### گزینه 1: استفاده از Node.js App در cPanel

1. در cPanel، به بخش **Node.js** بروید
2. روی **Create Application** کلیک کنید
3. تنظیمات را وارد کنید:
   - **Node.js Version**: آخرین نسخه (مثلاً 20.x)
   - **Application Mode**: Production
   - **Application Root**: `30tel` (یا نام پوشه شما)
   - **Application URL**: دامنه یا subdomain شما
   - **Application Startup File**: `.next/standalone/server.js` (اگر از standalone استفاده می‌کنید) یا `node_modules/next/dist/bin/next start`
   - **Application Port**: 3000 (یا پورت اختصاص داده شده)
4. Environment Variables را اضافه کنید:
   ```
   NODE_ENV=production
   PORT=3000
   WOOCOMMERCE_URL=https://your-wordpress-site.com
   WOOCOMMERCE_CONSUMER_KEY=your_key
   WOOCOMMERCE_CONSUMER_SECRET=your_secret
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```
5. روی **Create** کلیک کنید
6. سپس روی **Run NPM Install** کلیک کنید
7. سپس روی **Start App** کلیک کنید

#### گزینه 2: استفاده از PM2 (اگر دسترسی SSH دارید)

```bash
# نصب PM2
npm install -g pm2

# اجرای اپلیکیشن
cd ~/30tel
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # برای اجرای خودکار بعد از restart
```

### مرحله 6: تنظیم Domain/Subdomain

1. در cPanel، به **Subdomains** بروید
2. یک subdomain ایجاد کنید (مثلاً `app.yourdomain.com`)
3. Document Root را به پوشه پروژه تنظیم کنید
4. یا از **Addon Domain** استفاده کنید

### مرحله 7: تنظیم Reverse Proxy (اختیاری اما توصیه می‌شود)

اگر می‌خواهید از پورت 80/443 استفاده کنید، باید Nginx یا Apache را تنظیم کنید.

در cPanel، فایل `.htaccess` را در root domain ایجاد کنید:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

یا از Nginx استفاده کنید (اگر در دسترس است).

## ساختار فایل‌های نهایی روی سرور

```
~/30tel/
├── src/                    # Source code
├── public/                 # Static files
├── .next/                  # Build output (بعد از npm run build)
├── node_modules/          # Dependencies (بعد از npm install)
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── .env.production         # Environment variables
└── ecosystem.config.js     # PM2 config (اگر استفاده می‌کنید)
```

## دستورات مفید

### بررسی وضعیت اپلیکیشن

```bash
# اگر از Node.js App استفاده می‌کنید
# در cPanel → Node.js → Status را چک کنید

# اگر از PM2 استفاده می‌کنید
pm2 status
pm2 logs 30tel
```

### Restart اپلیکیشن

```bash
# در cPanel → Node.js → Restart App

# یا با PM2
pm2 restart 30tel
```

### به‌روزرسانی اپلیکیشن

```bash
cd ~/30tel
git pull origin main  # اگر از git استفاده می‌کنید
# یا فایل‌های جدید را آپلود کنید

npm install --production=false
npm run build
pm2 restart 30tel  # یا Restart در cPanel
```

## Troubleshooting

### مشکل: اپلیکیشن شروع نمی‌شود

1. لاگ‌ها را بررسی کنید:

   ```bash
   pm2 logs 30tel
   # یا در cPanel → Node.js → View Logs
   ```

2. بررسی کنید که پورت درست است:

   ```bash
   netstat -tulpn | grep 3000
   ```

3. بررسی کنید که `.env.production` درست تنظیم شده است

### مشکل: Build failed

```bash
# پاک کردن cache و rebuild
rm -rf .next node_modules
npm install --production=false
npm run build
```

### مشکل: Memory limit

اگر خطای memory دارید:

- در cPanel → Node.js → Environment Variables → `NODE_OPTIONS=--max-old-space-size=2048` اضافه کنید
- یا با هاستینگ تماس بگیرید تا memory limit را افزایش دهند

## نکات مهم

1. ✅ همیشه `.env.production` را روی سرور ایجاد کنید (نه `.env.local`)
2. ✅ فایل‌های `.env.*` را در `.gitignore` نگه دارید
3. ✅ `node_modules` و `.next` را آپلود نکنید (روی سرور build کنید)
4. ✅ از Git استفاده کنید برای مدیریت بهتر کد
5. ✅ لاگ‌ها را به صورت منظم بررسی کنید
6. ✅ Backup منظم از فایل‌ها و دیتابیس بگیرید

## ساختار پیشنهادی برای آپلود

اگر از FTP استفاده می‌کنید، این فایل‌ها را آپلود کنید:

```
✅ src/                    (کل پوشه)
✅ public/                 (کل پوشه)
✅ package.json
✅ package-lock.json
✅ next.config.ts
✅ tsconfig.json
✅ postcss.config.mjs
✅ eslint.config.mjs
✅ ecosystem.config.js
✅ .gitignore             (اختیاری)
✅ README.md              (اختیاری)
```

**نکته**: بعد از آپلود، حتماً `npm install` و `npm run build` را روی سرور اجرا کنید!

