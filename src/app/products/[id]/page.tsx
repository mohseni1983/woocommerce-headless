import { getProduct, getProducts } from "@/lib/woocommerce";
import {
  generateMetadata as genMeta,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import AddToWishlistButton from "@/components/AddToWishlistButton";
import AddToCartButton from "@/components/AddToCartButton";
import { notFound } from "next/navigation";

// Disable static generation - all pages will be generated on-demand
export async function generateStaticParams() {
  return []; // Empty array = no static generation
}

// Enable dynamic rendering
export const dynamicParams = true;

// Force dynamic rendering - no SSG
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
      return genMeta({
        title: "محصول یافت نشد",
        description: "محصول مورد نظر یافت نشد",
      });
    }

    return genMeta({
      title: product.name,
      description: product.short_description || product.description,
      image: product.images[0]?.src || "/og-image.jpg",
      url: `/products/${product.id}`,
      type: "product",
    });
  } catch {
    return genMeta({
      title: "محصول یافت نشد",
      description: "محصول مورد نظر یافت نشد",
    });
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate id
  if (!id || id === "undefined" || id === "null") {
    console.error("[ERROR] ProductDetailPage: Invalid product ID:", id);
    notFound();
  }

  console.log("[DEBUG] ProductDetailPage: Fetching product with ID:", id);
  const product = await getProduct(id);

  if (!product) {
    console.error("[ERROR] ProductDetailPage: Product not found for ID:", id);
    notFound();
  }

  // Validate product has required fields
  if (
    !product.images ||
    !Array.isArray(product.images) ||
    product.images.length === 0
  ) {
    console.warn(
      "[WARN] ProductDetailPage: Product has no images, using placeholder"
    );
    // Add placeholder image if missing (with all required fields)
    product.images = [
      {
        id: 0,
        src: "/placeholder-product.svg",
        name: product.name,
        alt: product.name,
      },
    ];
  }

  // Get related products (with error handling)
  let relatedProducts: any[] = [];
  try {
    if (
      product.categories &&
      product.categories.length > 0 &&
      product.categories[0]?.id
    ) {
      relatedProducts = await getProducts({
        category: product.categories[0].id,
        per_page: 4,
      });
    }
  } catch (error) {
    console.error("[ERROR] Failed to fetch related products:", error);
    // Continue with empty array
  }

  const productStructuredData = generateProductStructuredData({
    name: product.name,
    description: product.description || product.short_description,
    image: product.images[0]?.src || "/placeholder-product.svg",
    price: product.price,
    currency: "IRR",
    availability: product.stock_status === "instock" ? "InStock" : "OutOfStock",
    sku: product.sku,
    rating: {
      value: parseFloat(product.average_rating) || 5,
      count: product.rating_count,
    },
  });

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "خانه", url: "/" },
    { name: "محصولات", url: "/products" },
    { name: product.name, url: `/products/${product.id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
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
              <Link href="/products" className="hover:text-blue-600">
                محصولات
              </Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="relative aspect-square mb-4">
                <Image
                  src={product.images[0]?.src || "/placeholder-product.svg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain rounded-xl"
                  priority
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image?.src || "/placeholder-product.svg"}
                        alt={image?.alt || product.name}
                        fill
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating_count > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.round(parseFloat(product.average_rating))
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    ({product.rating_count} نظر)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 space-x-reverse mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {parseFloat(product.price).toLocaleString("fa-IR")} تومان
                  </span>
                  {product.on_sale && product.regular_price && (
                    <span className="text-2xl text-gray-400 line-through">
                      {parseFloat(product.regular_price).toLocaleString(
                        "fa-IR"
                      )}
                    </span>
                  )}
                </div>
                {product.on_sale && product.regular_price && (
                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {Math.round(
                      ((parseFloat(product.regular_price) -
                        parseFloat(product.price)) /
                        parseFloat(product.regular_price)) *
                        100
                    )}
                    % تخفیف
                  </span>
                )}
              </div>

              {/* Description */}
              {product.short_description && (
                <div
                  className="mb-6 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              )}

              {/* Stock Status */}
              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                    product.stock_status === "instock"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock_status === "instock"
                    ? "موجود در انبار"
                    : "ناموجود"}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    regular_price: product.regular_price,
                    sale_price: product.sale_price,
                    images: product.images || [],
                    stock_quantity: product.stock_quantity,
                    stock_status: product.stock_status,
                    manage_stock: product.manage_stock,
                  }}
                  disabled={product.stock_status !== "instock"}
                />
                <AddToWishlistButton productId={product.id} />
              </div>

              {/* Features */}
              <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Truck className="text-blue-600" size={24} />
                  <span className="text-sm text-gray-600">ارسال رایگان</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Shield className="text-blue-600" size={24} />
                  <span className="text-sm text-gray-600">گارانتی معتبر</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RotateCcw className="text-blue-600" size={24} />
                  <span className="text-sm text-gray-600">بازگشت 7 روزه</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Star className="text-blue-600" size={24} />
                  <span className="text-sm text-gray-600">کیفیت تضمینی</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-16">
              <h2 className="text-2xl font-bold mb-6">توضیحات محصول</h2>
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8">محصولات مشابه</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts
                  .filter((p) => p.id !== product.id)
                  .slice(0, 4)
                  .map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct.id}
                      id={relatedProduct.id}
                      name={relatedProduct.name}
                      price={parseFloat(relatedProduct.price)}
                      originalPrice={
                        relatedProduct.regular_price
                          ? parseFloat(relatedProduct.regular_price)
                          : undefined
                      }
                      image={
                        relatedProduct.images[0]?.src ||
                        "/placeholder-product.svg"
                      }
                      rating={parseFloat(relatedProduct.average_rating) || 5}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
