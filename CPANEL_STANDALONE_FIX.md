# حل مشکل Standalone Build در cPanel

## مشکلات شناسایی شده:

1. ❌ CSS/JS فایل‌ها لود نمی‌شوند (بدون استایل)
2. ❌ اتصال به WooCommerce کار نمی‌کند

## راه‌حل: ساختار صحیح Standalone

برای standalone build در cPanel، باید ساختار زیر را داشته باشید:

```
~/30tel/
├── .next/
│   ├── standalone/
│   │   ├── server.js          # ✅ فایل اصلی
│   │   ├── package.json
│   │   ├── node_modules/
│   │   ├── .next/
│   │   │   └── static/        # ✅ باید اینجا باشد!
│   │   └── public/            # ✅ باید اینجا باشد!
│   └── static/                # ❌ این کافی نیست!
└── public/                    # ❌ این کافی نیست!
```

## مراحل Fix:

### مرحله 1: Build مجدد با ساختار صحیح

```bash
cd ~/30tel
npm run build
```

### مرحله 2: کپی کردن فایل‌های Static و Public به Standalone

```bash
# کپی static files به standalone
cp -r .next/static .next/standalone/.next/static

# کپی public folder به standalone
cp -r public .next/standalone/public
```

یا به صورت یکجا:

```bash
cd ~/30tel
npm run build

# کپی فایل‌های مورد نیاز
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

### مرحله 3: ساختار نهایی Standalone

بعد از کپی، ساختار باید این باشد:

```
.next/standalone/
├── server.js
├── package.json
├── node_modules/
├── .next/
│   ├── static/          # ✅ کپی شده از .next/static
│   └── server/
└── public/              # ✅ کپی شده از public/
```

### مرحله 4: تنظیمات cPanel Node.js

در cPanel → Node.js App:

```
Application Root: 30tel/.next/standalone
Startup File: server.js
Port: 3000 (یا پورت اختصاص داده شده)
```

**مهم**: Application Root باید به پوشه `standalone` اشاره کند، نه root پروژه!

### مرحله 5: Environment Variables

در cPanel → Node.js App → Environment Variables:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://30tel.com
WOOCOMMERCE_URL=https://app.30tel.com
WOOCOMMERCE_CONSUMER_KEY=your_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_secret_here
```

**نکته مهم**:

- `NEXT_PUBLIC_*` variables باید با `NEXT_PUBLIC_` شروع شوند
- بدون فاصله قبل و بعد از `=`
- بدون quotes

## اسکریپت خودکار برای Fix

یک فایل `fix-standalone.sh` ایجاد کنید:

```bash
#!/bin/bash
# fix-standalone.sh

echo "🔨 Building application..."
npm run build

echo "📦 Copying static files..."
cp -r .next/static .next/standalone/.next/static

echo "📁 Copying public folder..."
cp -r public .next/standalone/public

echo "✅ Standalone build is ready!"
echo "📂 Deploy folder: .next/standalone/"
```

اجرای اسکریپت:

```bash
chmod +x fix-standalone.sh
./fix-standalone.sh
```

## روش جایگزین: استفاده از Standard Build

اگر standalone مشکل دارد، می‌توانید از standard build استفاده کنید:

### تنظیمات:

1. در `next.config.ts`، `output: "standalone"` را حذف یا comment کنید:

```typescript
const nextConfig: NextConfig = {
  // output: "standalone",  // ❌ غیرفعال
  // ... بقیه تنظیمات
};
```

2. Build کنید:

```bash
npm run build
```

3. در cPanel Node.js:

```
Application Root: 30tel
Startup File: node_modules/next/dist/bin/next start
Port: 3000
```

4. Deploy کنید:
   - کل پوشه `30tel/` (با `node_modules` بعد از `npm install`)

## بررسی مشکلات

### مشکل 1: CSS لود نمی‌شود

**علت**: فایل‌های static در مسیر درست نیستند

**راه‌حل**:

```bash
# بررسی کنید که static files کپی شده‌اند
ls -la .next/standalone/.next/static/

# اگر نیست، کپی کنید
cp -r .next/static .next/standalone/.next/static
```

### مشکل 2: WooCommerce کار نمی‌کند

**علت**: Environment variables درست تنظیم نشده‌اند

**راه‌حل**:

1. در cPanel → Node.js → Environment Variables بررسی کنید
2. مطمئن شوید که همه متغیرها درست هستند
3. Restart کنید

### مشکل 3: Images لود نمی‌شوند

**علت**: پوشه `public` در مسیر درست نیست

**راه‌حل**:

```bash
# کپی public folder
cp -r public .next/standalone/public
```

## ساختار نهایی برای Deploy

بعد از fix، این فایل‌ها را deploy کنید:

```
.next/standalone/          # ✅ کل پوشه standalone
```

**نه**:

- `.next/static/` جداگانه (باید داخل standalone باشد)
- `public/` جداگانه (باید داخل standalone باشد)

## تست محلی

قبل از deploy، تست کنید:

```bash
cd .next/standalone
node server.js
```

سپس در مرورگر: `http://localhost:3000`

اگر CSS و JS لود شدند، deploy کنید.

## نکات مهم

1. ✅ Application Root باید به `standalone` folder اشاره کند
2. ✅ Startup File باید `server.js` باشد (نه path کامل)
3. ✅ Environment variables باید در cPanel تنظیم شوند
4. ✅ بعد از هر تغییر، Restart کنید
5. ✅ لاگ‌ها را بررسی کنید: cPanel → Node.js → View Logs

