import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { href: "/products", label: "محصولات" },
      { href: "/categories", label: "دسته‌بندی‌ها" },
      { href: "/new-arrivals", label: "جدیدترین‌ها" },
      { href: "/offers", label: "پیشنهادات ویژه" },
    ],
    support: [
      { href: "/about", label: "درباره ما" },
      { href: "/contact", label: "تماس با ما" },
      { href: "/faq", label: "سوالات متداول" },
      { href: "/shipping", label: "ارسال و بازگشت" },
    ],
    legal: [
      { href: "/privacy", label: "حریم خصوصی" },
      { href: "/terms", label: "قوانین و مقررات" },
      { href: "/warranty", label: "گارانتی" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="30tel Logo"
                width={100}
                height={40}
                className="h-10 w-auto object-contain brightness-0 invert"
                style={{ maxHeight: "40px" }}
              />
            </Link>
            <p className="text-gray-400 mb-4 leading-relaxed">
              فروشگاه آنلاین موبایل و گجت با بهترین قیمت و کیفیت. ما بهترین
              محصولات را با گارانتی معتبر به شما ارائه می‌دهیم.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">فروشگاه</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">پشتیبانی</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">تماس با ما</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 space-x-reverse">
                <Phone size={18} className="text-blue-500" />
                <span className="text-gray-400">05155429526</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse">
                <Mail size={18} className="text-blue-500" />
                <span className="text-gray-400">info@30tel.com</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <MapPin size={18} className="text-blue-500 mt-1" />
                <span className="text-gray-400">
                خراسان رضوی <br /> شهر بردسکن- خیابان امام خمینی <br /> روبروی امام هشت <br /> موبایل سی تل
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} 30tel. تمامی حقوق محفوظ است.
            </p>
            <div className="flex space-x-6 space-x-reverse text-sm">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


