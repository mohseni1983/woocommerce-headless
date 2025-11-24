import { getCategories } from "@/lib/woocommerce";
import { generateMetadata as genMeta } from "@/lib/seo";
import CategorySection from "@/components/CategorySection";
import Link from "next/link";

export const metadata = genMeta({
  title: "دسته‌بندی‌ها",
  description: "بررسی تمام دسته‌بندی‌های محصولات موبایل و گجت در فروشگاه 30tel",
  keywords: "دسته‌بندی, موبایل, گوشی, تبلت, گجت",
});

export default async function CategoriesPage() {
  const categories = await getCategories({ per_page: 100, hide_empty: true });

  const transformedCategories = categories.map((cat) => {
    // Extract icon from meta_data if exists
    let icon: string | undefined;
    if (cat.meta_data && Array.isArray(cat.meta_data)) {
      const iconMeta = cat.meta_data.find(
        (meta: any) =>
          meta.key === "icon" ||
          meta.key === "category_icon" ||
          meta.key === "_icon" ||
          (typeof meta.value === "string" &&
            (meta.value.includes("fa-") || meta.value.includes("icon-")))
      );
      if (iconMeta) {
        icon = typeof iconMeta.value === "string" ? iconMeta.value : iconMeta.value?.toString();
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
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            دسته‌بندی محصولات
          </h1>
          <p className="text-xl text-gray-600">
            تمام دسته‌بندی‌های محصولات ما را بررسی کنید
          </p>
        </div>

        <CategorySection categories={transformedCategories} />

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {transformedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {category.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {category.count} محصول در این دسته‌بندی
              </p>
              <span className="text-blue-600 font-semibold">
                مشاهده محصولات →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


