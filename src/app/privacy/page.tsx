import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";

export const metadata = genMeta({
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی فروشگاه 30tel",
});

export default function PrivacyPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "حریم خصوصی", url: "/privacy" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            حریم خصوصی
          </h1>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                جمع‌آوری اطلاعات
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ما اطلاعات شخصی شما را فقط برای ارائه خدمات بهتر و بهبود تجربه
                خرید شما جمع‌آوری می‌کنیم. این اطلاعات شامل نام، آدرس، شماره
                تماس و ایمیل می‌شود.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                استفاده از اطلاعات
              </h2>
              <p className="text-gray-700 leading-relaxed">
                اطلاعات شما برای موارد زیر استفاده می‌شود:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4 mr-4">
                <li>پردازش و ارسال سفارشات</li>
                <li>ارتباط با شما در مورد سفارشات</li>
                <li>ارسال اطلاعیه‌ها و پیشنهادات ویژه</li>
                <li>بهبود خدمات و تجربه کاربری</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                محافظت از اطلاعات
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ما از تمام اطلاعات شما با استفاده از آخرین تکنولوژی‌های امنیتی
                محافظت می‌کنیم و هیچ‌گاه اطلاعات شما را به اشتراک نمی‌گذاریم.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                کوکی‌ها
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ما از کوکی‌ها برای بهبود تجربه کاربری و تحلیل ترافیک سایت
                استفاده می‌کنیم. شما می‌توانید تنظیمات کوکی را در مرورگر خود
                تغییر دهید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                تماس با ما
              </h2>
              <p className="text-gray-700 leading-relaxed">
                اگر سوالی در مورد حریم خصوصی دارید، می‌توانید با ما از طریق
                صفحه تماس با ما ارتباط برقرار کنید.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}


