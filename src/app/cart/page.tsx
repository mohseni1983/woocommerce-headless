"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, getTotal, refreshCart } =
    useCart();
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  // Don't call refreshCart on mount - it would overwrite localStorage with empty array
  // Cart is managed client-side via localStorage
  // useEffect(() => {
  //   refreshCart();
  // }, []);

  const handleUpdateQuantity = async (
    productId: number,
    newQuantity: number
  ) => {
    setUpdating(productId);
    setError("");
    const success = await updateQuantity(productId, newQuantity);
    if (!success) {
      setError("خطا در به‌روزرسانی تعداد");
    }
    setUpdating(null);
  };

  const handleRemove = async (productId: number) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) {
      return;
    }
    setUpdating(productId);
    setError("");
    const success = await removeItem(productId);
    if (!success) {
      setError("خطا در حذف محصول");
    }
    setUpdating(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">سبد خرید</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              سبد خرید شما خالی است
            </h2>
            <p className="text-gray-600 mb-6">
              محصولات مورد نظر خود را به سبد خرید اضافه کنید
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center space-x-6 space-x-reverse">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder-product.svg"}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                          {item.sale_price ? (
                            <>
                              <p className="text-blue-600 font-bold">
                                {formatPrice(parseFloat(item.sale_price))}
                              </p>
                              <p className="text-gray-400 text-sm line-through">
                                {formatPrice(parseFloat(item.regular_price))}
                              </p>
                            </>
                          ) : (
                            <p className="text-blue-600 font-bold">
                              {formatPrice(parseFloat(item.price))}
                            </p>
                          )}
                        </div>
                        {!item.in_stock && (
                          <p className="text-red-600 text-sm font-medium">
                            ناموجود
                          </p>
                        )}
                        {item.manage_stock && item.stock_quantity !== null && (
                          <p className="text-gray-500 text-sm">
                            موجودی: {item.stock_quantity} عدد
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 space-x-reverse flex-shrink-0">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            updating === item.id ||
                            item.quantity <= 1 ||
                            !item.in_stock
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === item.id ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Minus size={20} />
                          )}
                        </button>
                        <span className="text-lg font-semibold w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            updating === item.id ||
                            !item.in_stock ||
                            (item.manage_stock &&
                              item.stock_quantity !== null &&
                              item.quantity >= item.stock_quantity)
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === item.id ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Plus size={20} />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updating === item.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0"
                      >
                        {updating === item.id ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6">خلاصه سفارش</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      جمع کل ({items.length} محصول)
                    </span>
                    <span className="font-semibold">
                      {formatPrice(getTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">هزینه ارسال</span>
                    <span className="font-semibold">محاسبه در checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-lg font-bold">مجموع</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(getTotal())}
                    </span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-semibold transition-colors"
                >
                  ادامه خرید
                </Link>
                <Link
                  href="/products"
                  className="block text-center text-gray-600 hover:text-gray-900 mt-4 font-medium"
                >
                  ادامه خرید
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
