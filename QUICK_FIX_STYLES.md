# راه‌حل سریع برای مشکل CSS/JS در Standalone Build

## مشکل: استایل‌ها لود نمی‌شوند

علت اصلی: فایل‌های static در مسیر درست نیستند.

## راه‌حل فوری (روی سرور cPanel):

### مرحله 1: SSH به سرور یا استفاده از Terminal در cPanel

```bash
cd ~/30tel  # یا مسیر پروژه شما
```

### مرحله 2: Build مجدد

```bash
npm run build
```

### مرحله 3: کپی فایل‌های Static و Public

```bash
# ایجاد پوشه .next در standalone (اگر وجود ندارد)
mkdir -p .next/standalone/.next

# کپی static files
cp -r .next/static .next/standalone/.next/static

# کپی public folder
cp -r public .next/standalone/public
```

### مرحله 4: بررسی ساختار

```bash
# بررسی کنید که فایل‌ها کپی شده‌اند
ls -la .next/standalone/.next/static/
ls -la .next/standalone/public/
```

باید این ساختار را ببینید:

```
.next/standalone/
├── server.js
├── package.json
├── node_modules/
├── .next/
│   ├── static/          ✅ باید اینجا باشد
│   └── server/
└── public/              ✅ باید اینجا باشد
```

### مرحله 5: Restart اپلیکیشن

در cPanel → Node.js → Restart App

## بررسی تنظیمات cPanel

مطمئن شوید که:

1. **Application Root**: `30tel/.next/standalone` (نه فقط `30tel`)
2. **Startup File**: `server.js` (نه `next/standalone/server.js`)
3. **Port**: پورت اختصاص داده شده (مثلاً 3000)

## اسکریپت خودکار

اگر می‌خواهید یک اسکریپت داشته باشید:

```bash
#!/bin/bash
cd ~/30tel

echo "🔨 Building..."
npm run build

echo "📦 Copying static files..."
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static

echo "📁 Copying public folder..."
cp -r public .next/standalone/public

echo "✅ Done! Now restart your Node.js app in cPanel"
```

ذخیره کنید به عنوان `fix-styles.sh` و اجرا کنید:

```bash
chmod +x fix-styles.sh
./fix-styles.sh
```

## اگر هنوز کار نمی‌کند:

### بررسی لاگ‌ها

```bash
# در cPanel → Node.js → View Logs
# یا از SSH
tail -f ~/logs/nodejs/30tel.log
```

### بررسی مسیرها

```bash
# بررسی کنید که server.js درست اجرا می‌شود
cd ~/30tel/.next/standalone
node server.js
```

### استفاده از Standard Build (جایگزین)

اگر standalone مشکل دارد:

1. در `next.config.ts`:

```typescript
// output: "standalone",  // comment کنید
```

2. Build کنید:

```bash
npm run build
```

3. در cPanel:

```
Application Root: 30tel
Startup File: node_modules/next/dist/bin/next start
```

4. Deploy کنید:

- کل پوشه `30tel/` (با `node_modules` بعد از `npm install`)

## نکات مهم

- ✅ فایل‌های static باید در `.next/standalone/.next/static/` باشند
- ✅ پوشه public باید در `.next/standalone/public/` باشد
- ✅ Application Root باید به پوشه `standalone` اشاره کند
- ✅ بعد از هر تغییر، Restart کنید



