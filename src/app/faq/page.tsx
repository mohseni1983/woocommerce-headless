import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";
import FAQAccordion from "@/components/FAQAccordion";

export const metadata = genMeta({
  title: "سوالات متداول",
  description: "پاسخ به سوالات متداول مشتریان فروشگاه 30tel",
});

export default function FAQPage() {
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "سوالات متداول", url: "/faq" },
  ]);

  const faqs = [
    {
      id: 1,
      question: "چگونه می‌توانم محصولی را خریداری کنم؟",
      answer:
        "شما می‌توانید با جستجو در بخش محصولات، کالای مورد نظر خود را پیدا کرده و به سبد خرید اضافه کنید. سپس با تکمیل اطلاعات و پرداخت، سفارش شما ثبت می‌شود.",
    },
    {
      id: 2,
      question: "روش‌های پرداخت چیست؟",
      answer:
        "شما می‌توانید از طریق پرداخت آنلاین با کارت‌های بانکی یا پرداخت در محل (پس از دریافت) خرید خود را انجام دهید.",
    },
    {
      id: 3,
      question: "هزینه ارسال چقدر است؟",
      answer:
        "برای خریدهای بالای 500 هزار تومان، ارسال رایگان است. برای سایر سفارش‌ها، هزینه ارسال بر اساس وزن و مسافت محاسبه می‌شود.",
    },
    {
      id: 4,
      question: "چقدر طول می‌کشد تا سفارش من تحویل داده شود؟",
      answer:
        "سفارش‌های داخل تهران معمولاً در 24 ساعت و سفارش‌های شهرستان در 2 تا 5 روز کاری تحویل داده می‌شوند.",
    },
    {
      id: 5,
      question: "آیا محصولات گارانتی دارند؟",
      answer:
        "بله، تمام محصولات ما با گارانتی معتبر و رسمی ارائه می‌شوند. مدت زمان گارانتی بسته به نوع محصول متفاوت است.",
    },
    {
      id: 6,
      question: "چگونه می‌توانم محصول را پس بفرستم؟",
      answer:
        "شما می‌توانید تا 7 روز پس از دریافت محصول، در صورت عدم رضایت، آن را بازگردانید. شرایط بازگشت در صفحه قوانین و مقررات توضیح داده شده است.",
    },
    {
      id: 7,
      question: "آیا امکان خرید اقساطی وجود دارد؟",
      answer:
        "بله، برای برخی محصولات امکان خرید اقساطی وجود دارد. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.",
    },
    {
      id: 8,
      question: "چگونه می‌توانم از وضعیت سفارش خود مطلع شوم؟",
      answer:
        "پس از ثبت سفارش، یک کد پیگیری برای شما ارسال می‌شود که می‌توانید با استفاده از آن وضعیت سفارش خود را در بخش پیگیری سفارش مشاهده کنید.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            سوالات متداول
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            پاسخ به سوالات متداول شما
          </p>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQAccordion
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

