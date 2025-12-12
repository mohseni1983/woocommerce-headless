# حل مشکل 508/507 Resource Limit Errors

## مشکل

در زمان build، خطاهای `508 Resource Limit Is Reached` یا `507 Insufficient Storage` رخ می‌دهد. این خطاها زمانی اتفاق می‌افتد که تعداد درخواست‌های API به WooCommerce خیلی زیاد است و سرور محدودیت منابع دارد.

## راه‌حل‌های پیاده‌سازی شده

### 1. Rate Limiting

- اضافه شدن delay بین درخواست‌ها (حداقل 300ms - افزایش یافته)
- جلوگیری از ارسال درخواست‌های همزمان زیاد

### 2. Retry Logic با Exponential Backoff

- در صورت خطای 507 یا 508، درخواست با delay تصاعدی دوباره ارسال می‌شود
- حداکثر 2 بار retry با delay های 1s, 2s (کاهش یافته برای جلوگیری از build طولانی)

### 3. محدود کردن Static Generation

- **Products**: فقط 10 محصول اول در build time generate می‌شوند (کاهش یافته از 20)
- **Categories**: فقط 5 دسته‌بندی اول در build time generate می‌شوند (کاهش یافته از 10)
- بقیه صفحات به صورت on-demand (dynamic) با `force-dynamic` generate می‌شوند
- این باعث می‌شود build سریع‌تر انجام شود و درخواست‌های کمتری در زمان build ارسال شود

### 4. محدود کردن Sitemap

- Products در sitemap: از 1000 به 100 کاهش یافت
- Categories در sitemap: از 100 به 50 کاهش یافت
- Sitemap هر 1 ساعت یکبار revalidate می‌شود (به جای هر build)

### 5. بهبود Error Handling

- خطاها gracefully handle می‌شوند
- در صورت خطا، empty array برگردانده می‌شود تا build ادامه پیدا کند
- بررسی وجود `product.images` قبل از دسترسی به آن
- اضافه شدن placeholder image در صورت نبودن تصویر محصول

## تنظیمات اضافی (در صورت نیاز)

### افزایش Delay بین درخواست‌ها

در فایل `src/lib/woocommerce.ts` می‌توانید `MIN_REQUEST_INTERVAL` را افزایش دهید:

```typescript
const MIN_REQUEST_INTERVAL = 500; // از 300ms به 500ms افزایش دهید
```

### کاهش تعداد Retry

در صورت نیاز می‌توانید تعداد retry را کاهش دهید:

```typescript
// در تابع fetchWooCommerce
retries: number = 2; // از 3 به 2 کاهش دهید
```

### غیرفعال کردن Static Generation

اگر هنوز مشکل دارید، می‌توانید `generateStaticParams` را کاملاً غیرفعال کنید:

```typescript
// در src/app/products/[id]/page.tsx و src/app/categories/[slug]/page.tsx
export async function generateStaticParams() {
  return []; // خالی برگرداندن = همه صفحات dynamic
}

// همچنین می‌توانید dynamic rendering را فعال کنید (قبلاً اضافه شده)
export const dynamic = "force-dynamic";
```

## تست Build

بعد از اعمال تغییرات:

```bash
npm run build
```

اگر هنوز خطا دارید:

1. **بررسی لاگ‌ها**: ببینید کدام endpoint بیشترین خطا را دارد
2. **افزایش delay**: `MIN_REQUEST_INTERVAL` را بیشتر کنید
3. **کاهش تعداد صفحات**: تعداد صفحات در `generateStaticParams` را کمتر کنید
4. **تماس با هاستینگ**: ممکن است نیاز به افزایش resource limit داشته باشید

## نکات مهم

- ✅ Build ممکن است کمی کندتر شود (به خاطر delay ها)
- ✅ صفحات به صورت on-demand generate می‌شوند (اولین بار کندتر است)
- ✅ بعد از اولین request، صفحات cache می‌شوند و سریع‌تر هستند
- ✅ Sitemap محدود شده است اما می‌توانید بعداً با API کامل‌تر کنید

## راه‌حل‌های جایگزین

### استفاده از ISR (Incremental Static Regeneration)

می‌توانید از ISR استفاده کنید تا صفحات به صورت تدریجی generate شوند:

```typescript
export const revalidate = 3600; // هر 1 ساعت revalidate
```

### استفاده از Dynamic Rendering

برای صفحاتی که زیاد تغییر می‌کنند:

```typescript
export const dynamic = "force-dynamic";
```

### استفاده از Cache

می‌توانید از Redis یا در-memory cache استفاده کنید تا درخواست‌های تکراری cache شوند.

## پشتیبانی

اگر مشکل حل نشد:

1. لاگ‌های کامل build را بررسی کنید
2. تعداد درخواست‌ها را در زمان build بشمارید
3. با هاستینگ WordPress تماس بگیرید تا resource limit را افزایش دهند
