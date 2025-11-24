import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Truck, Clock, Shield, MapPin } from "lucide-react";

export const metadata = genMeta({
  title: "ارسال و بازگشت",
  description: "اطلاعات مربوط به ارسال و بازگشت کالا در فروشگاه 30tel",
});

export default function ShippingPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "ارسال و بازگشت", url: "/shipping" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            ارسال و بازگشت
          </h1>

          <div className="space-y-8">
            {/* Shipping Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <Truck className="text-blue-600" size={32} />
                <h2 className="text-2xl font-bold text-gray-900">ارسال کالا</h2>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    هزینه ارسال
                  </h3>
                  <p>
                    برای خریدهای بالای 500 هزار تومان، ارسال رایگان است. برای
                    سایر سفارش‌ها، هزینه ارسال بر اساس وزن و مسافت محاسبه
                    می‌شود.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    زمان ارسال
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>تهران: 24 ساعت کاری</li>
                    <li>شهرستان: 2 تا 5 روز کاری</li>
                    <li>مناطق دور: 5 تا 7 روز کاری</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    روش‌های ارسال
                  </h3>
                  <p>
                    ما از پست پیشتاز، پیک موتوری (تهران) و پست سفارشی برای
                    ارسال کالا استفاده می‌کنیم.
                  </p>
                </div>
              </div>
            </div>

            {/* Return Policy */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <Shield className="text-blue-600" size={32} />
                <h2 className="text-2xl font-bold text-gray-900">بازگشت کالا</h2>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    شرایط بازگشت
                  </h3>
                  <p>
                    شما می‌توانید تا 7 روز پس از دریافت محصول، در صورت عدم
                    رضایت و با حفظ بسته‌بندی اصلی، کالا را بازگردانید.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    موارد غیر قابل بازگشت
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>محصولات باز شده و استفاده شده</li>
                    <li>محصولات بدون بسته‌بندی اصلی</li>
                    <li>محصولات شخصی‌سازی شده</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    فرآیند بازگشت
                  </h3>
                  <p>
                    برای بازگشت کالا، لطفاً با پشتیبانی تماس بگیرید. پس از
                    تایید، کالا را به آدرس اعلام شده ارسال کنید. هزینه بازگشت
                    در صورت نقص یا اشتباه فروشگاه بر عهده ما است.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


