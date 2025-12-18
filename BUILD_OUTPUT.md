# ساختار خروجی Build Next.js

با تنظیم `output: "standalone"` در `next.config.ts`، Next.js یک نسخه standalone از اپلیکیشن ایجاد می‌کند که برای deploy مناسب است.

## ساختار پوشه‌های Build

بعد از اجرای `npm run build`، ساختار زیر ایجاد می‌شود:

```
30tel/
├── .next/                          # ✅ پوشه اصلی build output
│   ├── standalone/                 # ✅ نسخه standalone (برای deploy)
│   │   ├── server.js              # ✅ فایل اصلی سرور
│   │   ├── package.json           # ✅ package.json برای standalone
│   │   ├── node_modules/          # ✅ فقط dependencies مورد نیاز
│   │   └── .next/                 # ✅ فایل‌های compiled
│   │       ├── server/            # ✅ Server-side code
│   │       └── ...
│   ├── static/                    # ✅ فایل‌های static (CSS, JS, images)
│   │   ├── chunks/               # ✅ JavaScript chunks
│   │   ├── css/                  # ✅ CSS files
│   │   └── media/                # ✅ Media files
│   ├── server/                    # ✅ Server-side rendered pages
│   ├── cache/                     # ✅ Build cache
│   └── BUILD_ID                   # ✅ Build ID
├── public/                        # ✅ فایل‌های static عمومی (بدون تغییر)
└── node_modules/                  # ✅ Dependencies (برای development)
```

## فایل‌های مهم برای Deploy

### برای Standalone Deploy (Docker/cPanel):

```
✅ .next/standalone/               # کل پوشه standalone
✅ .next/static/                  # فایل‌های static
✅ public/                        # فایل‌های public
```

### برای Standard Deploy (cPanel Node.js):

```
✅ .next/                         # کل پوشه .next
✅ public/                        # فایل‌های public
✅ node_modules/                  # Dependencies
✅ package.json
✅ next.config.ts
```

## استفاده از Standalone Output

### مزایا:

- ✅ حجم کمتر (فقط dependencies مورد نیاز)
- ✅ مناسب برای Docker
- ✅ مستقل از node_modules اصلی
- ✅ سریع‌تر برای deploy

### نحوه استفاده:

#### روش 1: با Standalone (توصیه می‌شود)

```bash
# در cPanel Node.js App:
Startup File: .next/standalone/server.js
```

#### روش 2: با Standard Next.js

```bash
# در cPanel Node.js App:
Startup File: node_modules/next/dist/bin/next start
```

## محتوای پوشه Standalone

پوشه `.next/standalone/` شامل:

```
standalone/
├── server.js                     # ✅ فایل اصلی - این را اجرا کنید
├── package.json                  # ✅ فقط production dependencies
├── node_modules/                 # ✅ فقط dependencies مورد نیاز (کوچکتر)
└── .next/                        # ✅ Compiled application
    ├── server/                   # ✅ Server-side code
    │   ├── app/                 # ✅ App router pages
    │   ├── pages/               # ✅ Pages router (اگر استفاده می‌کنید)
    │   └── chunks/              # ✅ Server chunks
    └── ...
```

## فایل‌های Static

پوشه `.next/static/` شامل:

```
static/
├── chunks/                       # ✅ JavaScript bundles
│   ├── [hash].js                # ✅ Main chunks
│   └── ...
├── css/                          # ✅ CSS files
│   └── [hash].css
└── media/                        # ✅ Media files (اگر استفاده می‌کنید)
```

## حجم تقریبی Build Output

```
.next/
├── standalone/          ~50-100 MB  (با node_modules)
├── static/              ~5-20 MB    (بسته به محتوا)
└── server/              ~10-30 MB  (compiled code)

کل حجم: ~65-150 MB
```

## دستورات مفید

### بررسی ساختار Build

```bash
# دیدن ساختار .next
ls -la .next/

# دیدن محتوای standalone
ls -la .next/standalone/

# بررسی حجم
du -sh .next/
du -sh .next/standalone/
```

### تست Standalone Build

```bash
# اجرای standalone
cd .next/standalone
node server.js

# یا از root
node .next/standalone/server.js
```

### پاک کردن Build

```bash
# پاک کردن build قبلی
rm -rf .next
npm run build
```

## نکات مهم برای Deploy

### ✅ باید Deploy کنید:

1. **برای Standalone:**

   ```
   .next/standalone/     (کل پوشه)
   .next/static/        (کل پوشه)
   public/              (کل پوشه)
   ```

2. **برای Standard:**
   ```
   .next/               (کل پوشه)
   public/              (کل پوشه)
   node_modules/        (بعد از npm install)
   package.json
   next.config.ts
   ```

### ❌ نباید Deploy کنید:

```
❌ .next/cache/         (cache موقت)
❌ node_modules/        (اگر از standalone استفاده می‌کنید)
❌ src/                 (فقط برای development)
❌ .env.local           (فقط برای development)
```

## تنظیمات cPanel Node.js

### گزینه 1: Standalone (توصیه می‌شود)

```
Application Root: 30tel
Startup File: .next/standalone/server.js
Port: 3000
```

### گزینه 2: Standard Next.js

```
Application Root: 30tel
Startup File: node_modules/next/dist/bin/next start
Port: 3000
```

## Environment Variables

در cPanel Node.js App، این متغیرها را اضافه کنید:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
WOOCOMMERCE_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=your_key
WOOCOMMERCE_CONSUMER_SECRET=your_secret
```

## Troubleshooting

### مشکل: Standalone پیدا نمی‌شود

```bash
# بررسی کنید که build انجام شده است
ls -la .next/standalone/

# اگر وجود ندارد، build کنید
npm run build
```

### مشکل: فایل‌های static لود نمی‌شوند

- مطمئن شوید که `.next/static/` در مسیر درست است
- بررسی کنید که `public/` هم deploy شده است
- در `next.config.ts` بررسی کنید که `output: "standalone"` تنظیم شده است

### مشکل: حجم زیاد

```bash
# پاک کردن cache
rm -rf .next/cache

# Build مجدد
npm run build
```

## خلاصه

**برای cPanel با Standalone:**

1. `npm run build` را اجرا کنید
2. پوشه‌های زیر را deploy کنید:
   - `.next/standalone/`
   - `.next/static/`
   - `public/`
3. Startup File را `next/standalone/server.js` تنظیم کنید

**برای cPanel با Standard:**

1. `npm run build` را اجرا کنید
2. تمام فایل‌های پروژه را deploy کنید
3. `npm install --production` را روی سرور اجرا کنید
4. Startup File را `node_modules/next/dist/bin/next start` تنظیم کنید

