"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Eye, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price?: string;
  images: Array<{ id: number; src: string; alt: string }>;
  stock_status: string;
  in_stock: boolean;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/wishlist", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems(data.data || []);
        } else {
          setError(data.message || "خطا در دریافت لیست علاقه‌مندی‌ها");
        }
      } else {
        setError("خطا در دریافت لیست علاقه‌مندی‌ها");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setError("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("آیا از حذف این محصول از علاقه‌مندی‌ها مطمئن هستید؟")) {
      return;
    }

    try {
      setRemoving(id);
      const response = await fetch(`/api/wishlist?productId=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems(items.filter((item) => item.id !== id));
        } else {
          setError(data.message || "خطا در حذف محصول");
        }
      } else {
        setError("خطا در حذف محصول");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      setError("خطا در حذف محصول");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("آیا از حذف همه محصولات از علاقه‌مندی‌ها مطمئن هستید؟")) {
      return;
    }

    try {
      setRemoving(0); // Use 0 to indicate clearing all
      // Remove all items one by one
      for (const item of items) {
        await fetch(`/api/wishlist?productId=${item.id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
      setItems([]);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      setError("خطا در پاک کردن لیست");
    } finally {
      setRemoving(null);
    }
  };

  const formatPrice = (price: string) => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return "قیمت نامشخص";
    return new Intl.NumberFormat("fa-IR").format(priceNum) + " تومان";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          علاقه‌مندی‌های من
        </h1>
        <p className="text-gray-600">محصولات مورد علاقه شما</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لیست علاقه‌مندی‌ها خالی است
          </h3>
          <p className="text-gray-600 mb-6">
            محصولاتی که به علاقه‌مندی‌ها اضافه می‌کنید اینجا نمایش داده می‌شوند
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              {items.length} محصول در لیست علاقه‌مندی‌ها
            </p>
            <button
              onClick={handleClearAll}
              disabled={removing === 0}
              className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {removing === 0 && <Loader2 className="animate-spin" size={16} />}
              <span>پاک کردن همه</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={
                      item.images && item.images.length > 0
                        ? item.images[0].src
                        : "/placeholder-product.svg"
                    }
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {!item.in_stock && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ناموجود
                      </span>
                    )}
                    {item.sale_price && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        تخفیف
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removing === item.id}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removing === item.id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/products/${item.slug}`}
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={18} className="inline-block ml-2" />
                      مشاهده محصول
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-lg font-bold text-gray-900">
                      {item.sale_price
                        ? formatPrice(item.sale_price)
                        : formatPrice(item.price)}
                      {item.sale_price && (
                        <span className="text-sm text-gray-500 line-through mr-2">
                          {formatPrice(item.regular_price)}
                        </span>
                      )}
                    </div>
                    <button
                      disabled={!item.in_stock}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        item.in_stock
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart size={18} />
                      <span>افزودن به سبد</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
