import { getProducts, getCategories } from "@/lib/woocommerce";
import { generateMetadata as genMeta } from "@/lib/seo";
import HeroSlider from "@/components/HeroSlider";
import CategorySection from "@/components/CategorySection";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import APIErrorBanner from "@/components/APIErrorBanner";

export const metadata = genMeta({
  title: "خانه",
  description:
    "فروشگاه آنلاین موبایل و گجت 30tel - بهترین قیمت و کیفیت برای خرید گوشی، تبلت، ساعت هوشمند و سایر گجت‌ها",
  keywords:
    "موبایل, گوشی, آیفون, سامسونگ, تبلت, ساعت هوشمند, گجت, فروشگاه آنلاین",
});

export default async function HomePage() {
  // Fetch featured products, newest products, and categories
  let featuredProducts: any[] = [];
  let newestProducts: any[] = [];
  let categories: any[] = [];

  try {
    [featuredProducts, newestProducts, categories] = await Promise.all([
      getProducts({ featured: true, per_page: 8 }).catch((error) => {
        console.error("Error fetching featured products:", error);
        return [];
      }),
      getProducts({ orderby: "date", order: "desc", per_page: 4 }).catch(
        (error) => {
          console.error("Error fetching newest products:", error);
          return [];
        }
      ),
      getCategories({ per_page: 12, hide_empty: true }).catch((error) => {
        console.error("Error fetching categories:", error);
        return [];
      }),
    ]);
  } catch (error) {
    console.error("Error in HomePage:", error);
  }

  // Log for debugging
  console.log("Featured products count:", featuredProducts.length);
  console.log("Newest products count:", newestProducts.length);

  // Transform categories for CategorySection
  const transformedCategories = Array.isArray(categories)
    ? categories.map((cat) => {
        // Extract icon from meta_data if exists
        let icon: string | undefined;
        if (cat.meta_data && Array.isArray(cat.meta_data)) {
          // Log meta_data for debugging
          console.log(
            `[DEBUG] Category ${cat.name} meta_data:`,
            JSON.stringify(cat.meta_data, null, 2)
          );

          // Try multiple possible field names (case-insensitive)
          const iconMeta = cat.meta_data.find((meta: any) => {
            const key = meta.key?.toLowerCase() || "";
            const value = meta.value?.toString() || "";

            // Check for common icon field names
            return (
              key === "icon" ||
              key === "category_icon" ||
              key === "_icon" ||
              key === "icon_class" ||
              key === "fa_icon" ||
              // Check if value contains Font Awesome classes
              (typeof value === "string" &&
                (value.includes("fa-") ||
                  value.includes("icon-") ||
                  value.includes("fas ") ||
                  value.includes("far ") ||
                  value.includes("fab ") ||
                  value.includes("fa-solid ") ||
                  value.includes("fa-regular ") ||
                  value.includes("fa-brands ")))
            );
          });

          if (iconMeta) {
            const iconValue = iconMeta.value;
            icon =
              typeof iconValue === "string"
                ? iconValue.trim()
                : iconValue?.toString().trim();

            console.log(`[DEBUG] Found icon for ${cat.name}:`, icon);
          } else {
            console.log(`[DEBUG] No icon found for category: ${cat.name}`);
          }
        }

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image?.src,
          count: cat.count,
          icon,
        };
      })
    : [];

  const hasApiError =
    featuredProducts.length === 0 && transformedCategories.length === 0;

  return (
    <>
      {hasApiError && (
        <div className="container mx-auto px-4 pt-8">
          <APIErrorBanner />
        </div>
      )}
      <HeroSlider />

      {/* Categories Section */}
      {categories.length > 0 && (
        <CategorySection categories={transformedCategories} />
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                محصولات ویژه
              </h2>
              <Link
                href="/products?featured=true"
                className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 font-semibold"
              >
                <span>مشاهده همه</span>
                <ArrowLeft size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={parseFloat(product.price)}
                  originalPrice={
                    product.regular_price
                      ? parseFloat(product.regular_price)
                      : undefined
                  }
                  image={product.images[0]?.src || "/placeholder-product.svg"}
                  badge={product.featured ? "ویژه" : undefined}
                  rating={parseFloat(product.average_rating) || 5}
                  stock_status={product.stock_status}
                  stock_quantity={product.stock_quantity}
                  manage_stock={product.manage_stock}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newestProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                جدیدترین محصولات
              </h2>
              <Link
                href="/products?sort=newest"
                className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 font-semibold"
              >
                <span>مشاهده همه</span>
                <ArrowLeft size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={parseFloat(product.price)}
                  originalPrice={
                    product.regular_price
                      ? parseFloat(product.regular_price)
                      : undefined
                  }
                  image={product.images[0]?.src || "/placeholder-product.svg"}
                  rating={parseFloat(product.average_rating) || 5}
                  stock_status={product.stock_status}
                  stock_quantity={product.stock_quantity}
                  manage_stock={product.manage_stock}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">گارانتی معتبر</h3>
              <p className="text-gray-600">
                تمام محصولات با گارانتی رسمی و معتبر ارائه می‌شوند
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">ارسال سریع</h3>
              <p className="text-gray-600">
                ارسال سریع و امن به سراسر کشور در کمترین زمان
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">بهترین قیمت</h3>
              <p className="text-gray-600">
                بهترین قیمت بازار با تضمین کیفیت و اصالت کالا
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
