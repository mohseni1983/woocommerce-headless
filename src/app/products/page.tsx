import { getProducts, getCategories } from "@/lib/woocommerce";
import { generateMetadata as genMeta } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import APIErrorBanner from "@/components/APIErrorBanner";

export const metadata = genMeta({
  title: "محصولات",
  description:
    "بررسی و خرید انواع موبایل، تبلت، ساعت هوشمند و گجت‌های دیجیتال با بهترین قیمت",
  keywords: "محصولات, موبایل, گوشی, تبلت, گجت, خرید آنلاین",
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page as string) || 1;
  const category = params.category
    ? parseInt(params.category as string)
    : undefined;
  const search = params.search as string | undefined;
  const orderby = (params.orderby as string) || "date";
  const order = (params.order as "asc" | "desc") || "desc";

  const [products, categories] = await Promise.all([
    getProducts({
      per_page: 12,
      page,
      category,
      search,
      orderby,
      order,
    }).catch(() => []),
    getCategories({ per_page: 100, hide_empty: true }).catch(() => []),
  ]);

  const hasApiError =
    products.length === 0 && categories.length === 0 && !search;

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "محصولات", url: "/products" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {hasApiError && <APIErrorBanner />}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">محصولات</h1>
            <p className="text-gray-600">
              تمام محصولات ما با بهترین کیفیت و قیمت
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6">فیلترها</h2>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">دسته‌بندی‌ها</h3>
                  <div className="space-y-2">
                    <Link
                      href="/products"
                      className={`block py-2 px-4 rounded-lg transition-colors ${
                        !category
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      همه محصولات
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        className={`block py-2 px-4 rounded-lg transition-colors ${
                          category === cat.id
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name} ({cat.count})
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
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
                        image={
                          product.images[0]?.src || "/placeholder-product.svg"
                        }
                        badge={product.featured ? "ویژه" : undefined}
                        rating={parseFloat(product.average_rating) || 5}
                        stock_status={product.stock_status}
                        stock_quantity={product.stock_quantity}
                        manage_stock={product.manage_stock}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center items-center space-x-2 space-x-reverse">
                    {page > 1 && (
                      <Link
                        href={`/products?page=${page - 1}${
                          category ? `&category=${category}` : ""
                        }${search ? `&search=${search}` : ""}`}
                        className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        قبلی
                      </Link>
                    )}
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      صفحه {page}
                    </span>
                    <Link
                      href={`/products?page=${page + 1}${
                        category ? `&category=${category}` : ""
                      }${search ? `&search=${search}` : ""}`}
                      className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      بعدی
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-gray-500">محصولی یافت نشد</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
