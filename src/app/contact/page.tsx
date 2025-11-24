import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = genMeta({
  title: "تماس با ما",
  description:
    "راه‌های ارتباط با فروشگاه 30tel - پشتیبانی 24 ساعته برای پاسخگویی به سوالات شما",
});

export default function ContactPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "تماس با ما", url: "/contact" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
              تماس با ما
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Contact Info Cards */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <Phone className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  تلفن تماس
                </h3>
                <p className="text-gray-600">021-12345678</p>
                <p className="text-gray-600">09123456789</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <Mail className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ایمیل
                </h3>
                <p className="text-gray-600">info@30tel.com</p>
                <p className="text-gray-600">support@30tel.com</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <MapPin className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  آدرس
                </h3>
                <p className="text-gray-600">
                  تهران، خیابان ولیعصر، پلاک 123
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <Clock className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ساعات کاری
                </h3>
                <p className="text-gray-600">شنبه تا پنجشنبه: 9 صبح تا 9 شب</p>
                <p className="text-gray-600">جمعه: 10 صبح تا 6 عصر</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ارسال پیام
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نام
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="نام شما"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    موضوع
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="موضوع پیام"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    پیام
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-colors"
                >
                  ارسال پیام
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


