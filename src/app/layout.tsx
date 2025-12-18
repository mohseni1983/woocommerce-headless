import type { Metadata } from "next";
import { Vazirmatn, Lalezar } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { generateMetadata as genMeta } from "@/lib/seo";
import { generateOrganizationStructuredData } from "@/lib/seo";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const lalezar = Lalezar({
  variable: "--font-lalezar",
  subsets: ["arabic", "latin"],
  weight: "400",
});

export const metadata: Metadata = genMeta({
  title: "30tel - فروشگاه موبایل و گجت",
  description:
    "فروشگاه آنلاین موبایل و گجت 30tel - بهترین قیمت و کیفیت برای خرید گوشی، تبلت، ساعت هوشمند و سایر گجت‌ها",
  keywords:
    "موبایل, گوشی, آیفون, سامسونگ, تبلت, ساعت هوشمند, گجت, فروشگاه آنلاین",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = generateOrganizationStructuredData();

  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <head>
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_SITE_URL || "https://30tel.com"}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#2563eb" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="IR" />
        <meta name="geo.placename" content="Iran" />
        <meta name="language" content="Persian" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body
        className={`${vazirmatn.variable} ${lalezar.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
