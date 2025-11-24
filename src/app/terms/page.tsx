import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";

export const metadata = genMeta({
  title: "قوانین و مقررات",
  description: "قوانین و مقررات استفاده از فروشگاه 30tel",
});

export default function TermsPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "قوانین و مقررات", url: "/terms" },
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
            قوانین و مقررات
          </h1>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                شرایط استفاده
              </h2>
              <p className="text-gray-700 leading-relaxed">
                با استفاده از این وب‌سایت، شما موافقت خود را با قوانین و
                مقررات ما اعلام می‌کنید. لطفاً قبل از استفاده، این قوانین را
                به‌دقت مطالعه کنید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ثبت سفارش
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                با ثبت سفارش، شما موافقت می‌کنید که:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mr-4">
                <li>اطلاعات ارائه شده صحیح و کامل است</li>
                <li>قیمت‌ها و موجودی محصولات ممکن است تغییر کند</li>
                <li>ما حق لغو سفارش در صورت عدم موجودی را داریم</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                بازگشت کالا
              </h2>
              <p className="text-gray-700 leading-relaxed">
                شما می‌توانید تا 7 روز پس از دریافت محصول، در صورت عدم رضایت
                و با حفظ بسته‌بندی اصلی، کالا را بازگردانید. هزینه ارسال بازگشت
                بر عهده مشتری است مگر در صورت نقص یا اشتباه فروشگاه.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                گارانتی
              </h2>
              <p className="text-gray-700 leading-relaxed">
                تمام محصولات با گارانتی معتبر ارائه می‌شوند. مدت زمان و شرایط
                گارانتی برای هر محصول متفاوت است و در صفحه محصول مشخص شده است.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                مالکیت فکری
              </h2>
              <p className="text-gray-700 leading-relaxed">
                تمام محتوا، طراحی و لوگوی این وب‌سایت تحت مالکیت 30tel است و
                هرگونه کپی‌برداری بدون اجازه ممنوع است.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}


