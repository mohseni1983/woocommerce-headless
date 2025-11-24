import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";
import { generateOrganizationStructuredData } from "@/lib/seo";
import { Award, Users, ShoppingBag, Heart } from "lucide-react";

export const metadata = genMeta({
  title: "درباره ما",
  description:
    "درباره فروشگاه آنلاین 30tel - فروشگاه تخصصی موبایل و گجت با بهترین قیمت و کیفیت",
});

export default function AboutPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "درباره ما", url: "/about" },
  ]);

  const organizationData = generateOrganizationStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              درباره 30tel
            </h1>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm mb-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                فروشگاه آنلاین 30tel با بیش از یک دهه تجربه در زمینه فروش
                موبایل و گجت‌های دیجیتال، یکی از معتبرترین و محبوب‌ترین
                فروشگاه‌های آنلاین در ایران است.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                ما با ارائه بهترین محصولات از برندهای معتبر جهانی، تضمین اصالت
                کالا، گارانتی معتبر و پشتیبانی 24 ساعته، همواره تلاش کرده‌ایم
                تا رضایت کامل مشتریان را جلب کنیم.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                تیم ما متشکل از کارشناسان مجرب و متعهد است که در تمام مراحل
                خرید، از انتخاب محصول تا تحویل و پشتیبانی پس از فروش، در کنار
                شما هستند.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  50,000+
                </div>
                <div className="text-gray-600">مشتری راضی</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  10,000+
                </div>
                <div className="text-gray-600">محصول</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">10+</div>
                <div className="text-gray-600">سال تجربه</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600">رضایت مشتری</div>
              </div>
            </div>

            {/* Values */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                ارزش‌های ما
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    کیفیت و اصالت
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    تمام محصولات ما با گارانتی معتبر و تضمین اصالت کالا ارائه
                    می‌شوند.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    قیمت مناسب
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    بهترین قیمت بازار با تضمین کیفیت و اصالت کالا.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    پشتیبانی 24/7
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    تیم پشتیبانی ما در تمام ساعات شبانه‌روز آماده خدمت‌رسانی
                    هستند.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    ارسال سریع
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    ارسال سریع و امن به سراسر کشور در کمترین زمان ممکن.
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


