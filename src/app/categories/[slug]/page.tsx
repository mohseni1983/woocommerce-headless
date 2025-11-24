import { getCategoryBySlug, getProducts, getCategories } from "@/lib/woocommerce";
import { generateMetadata as genMeta, generateBreadcrumbStructuredData } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  const categories = await getCategories({ per_page: 100 });
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return genMeta({
        title: "دسته‌بندی یافت نشد",
        description: "دسته‌بندی مورد نظر یافت نشد",
      });
    }
    return genMeta({
      title: category.name,
      description: category.description || `خرید ${category.name} با بهترین قیمت`,
    });
  } catch {
    return genMeta({
      title: "دسته‌بندی یافت نشد",
      description: "دسته‌بندی مورد نظر یافت نشد",
    });
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const paramsResolved = await searchParams;
  
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  const page = parseInt(paramsResolved.page as string) || 1;
  const products = await getProducts({
    category: category.id,
    per_page: 12,
    page,
  });

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "دسته‌بندی‌ها", url: "/categories" },
    { name: category.name, url: `/categories/${category.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                خانه
              </Link>
              <span>/</span>
              <Link href="/categories" className="hover:text-blue-600">
                دسته‌بندی‌ها
              </Link>
              <span>/</span>
              <span className="text-gray-900">{category.name}</span>
            </div>
          </nav>

          {/* Category Header */}
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {category.description}
              </p>
            )}
            <p className="text-gray-500 mt-4">
              {category.count} محصول در این دسته‌بندی
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    href={`/categories/${category.slug}?page=${page - 1}`}
                    className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    قبلی
                  </Link>
                )}
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  صفحه {page}
                </span>
                <Link
                  href={`/categories/${category.slug}?page=${page + 1}`}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  بعدی
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-xl text-gray-500">
                محصولی در این دسته‌بندی یافت نشد
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

