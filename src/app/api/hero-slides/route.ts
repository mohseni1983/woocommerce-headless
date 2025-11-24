import { NextResponse } from "next/server";
import { getProducts } from "@/lib/woocommerce";

export async function GET() {
  try {
    // Get featured products for hero slider
    const featuredProducts = await getProducts({
      featured: true,
      per_page: 3,
    });

    const slides = featuredProducts.map((product, index) => ({
      id: product.id,
      title: product.name,
      subtitle: product.short_description || "بهترین انتخاب برای شما",
      image: product.images[0]?.src || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
      link: `/products/${product.id}`,
      buttonText: "مشاهده محصول",
    }));

    // If no featured products, return default slides
    if (slides.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 1,
            title: "جدیدترین محصولات",
            subtitle: "بهترین قیمت و کیفیت",
            image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
            link: "/products",
            buttonText: "مشاهده محصولات",
          },
          {
            id: 2,
            title: "پیشنهادات ویژه",
            subtitle: "تخفیف‌های شگفت‌انگیز",
            image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&h=600&fit=crop",
            link: "/products?on_sale=true",
            buttonText: "خرید کنید",
          },
          {
            id: 3,
            title: "گجت‌های هوشمند",
            subtitle: "زندگی هوشمندتر",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=600&fit=crop",
            link: "/categories",
            buttonText: "کشف کنید",
          },
        ],
      });
    }

    return NextResponse.json({ success: true, data: slides });
  } catch (error: any) {
    console.error("Hero slides API Error:", error);
    // Return default slides on error
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: "جدیدترین محصولات",
          subtitle: "بهترین قیمت و کیفیت",
          image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
          link: "/products",
          buttonText: "مشاهده محصولات",
        },
      ],
    });
  }
}


