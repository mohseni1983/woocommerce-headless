import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Shield, CheckCircle, Clock, Phone } from "lucide-react";

export const metadata = genMeta({
  title: "گارانتی",
  description: "اطلاعات مربوط به گارانتی محصولات فروشگاه 30tel",
});

export default function WarrantyPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "گارانتی", url: "/warranty" },
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
            گارانتی
          </h1>

          <div className="space-y-8">
            {/* Warranty Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 space-x-reverse mb-6">
                <Shield className="text-blue-600" size={32} />
                <h2 className="text-2xl font-bold text-gray-900">
                  گارانتی معتبر
                </h2>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                تمام محصولات ما با گارانتی معتبر و رسمی ارائه می‌شوند. مدت زمان
                و شرایط گارانتی برای هر محصول متفاوت است و در صفحه محصول مشخص
                شده است.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      گارانتی اصالت
                    </h3>
                    <p className="text-gray-600 text-sm">
                      تضمین اصالت تمام محصولات
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Clock className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      پشتیبانی 24/7
                    </h3>
                    <p className="text-gray-600 text-sm">
                      پشتیبانی در تمام ساعات شبانه‌روز
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warranty Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                شرایط گارانتی
              </h2>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    مدت زمان گارانتی
                  </h3>
                  <p>
                    مدت زمان گارانتی برای هر محصول متفاوت است و معمولاً بین 12
                    تا 24 ماه است. این اطلاعات در صفحه هر محصول مشخص شده است.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    موارد تحت پوشش
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>نقص‌های ساختاری و فنی</li>
                    <li>مشکلات نرم‌افزاری</li>
                    <li>خرابی‌های غیر عمدی</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    موارد خارج از پوشش
                  </h3>
                  <ul className="list-disc list-inside space-y-2 mr-4">
                    <li>آسیب‌های ناشی از استفاده نادرست</li>
                    <li>آسیب‌های فیزیکی ناشی از ضربه</li>
                    <li>آسیب‌های ناشی از آب یا رطوبت</li>
                    <li>تغییرات نرم‌افزاری غیرمجاز</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact for Warranty */}
            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <Phone className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">
                  نیاز به کمک دارید؟
                </h2>
              </div>
              <p className="text-gray-700 mb-4">
                اگر سوالی در مورد گارانتی دارید یا نیاز به استفاده از گارانتی
                دارید، با ما تماس بگیرید.
              </p>
              <a
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                تماس با پشتیبانی
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


