"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating?: number;
  stock_status?: string;
  stock_quantity?: number | null;
  manage_stock?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  badge,
  rating = 5,
  stock_status = "instock",
  stock_quantity = null,
  manage_stock = false,
}: ProductCardProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [checking, setChecking] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Check if product is in wishlist on mount
  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    } else {
      setChecking(false);
    }
  }, [user, id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const isInWishlist = data.data.some(
            (item: { id: number }) => item.id === id
          );
          setInWishlist(isInWishlist);
        }
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    if (inWishlist) {
      // Remove from wishlist
      try {
        setAddingToWishlist(true);
        const response = await fetch(`/api/wishlist?productId=${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInWishlist(false);
            await checkWishlistStatus();
          } else {
            console.error(
              "Failed to remove from wishlist:",
              data.message || data.error
            );
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response:", response.status, errorData);
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      } finally {
        setAddingToWishlist(false);
      }
    } else {
      // Add to wishlist
      try {
        setAddingToWishlist(true);
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productId: id }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInWishlist(true);
            await checkWishlistStatus();
          } else {
            console.error(
              "Failed to add to wishlist:",
              data.message || data.error
            );
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response:", response.status, errorData);
        }
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      } finally {
        setAddingToWishlist(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {badge && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
              {badge}
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
              {discount}% تخفیف
            </div>
          )}
          <div
            className={`absolute top-3 left-3 transition-opacity ${
              inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <button
              onClick={handleAddToWishlist}
              disabled={addingToWishlist || checking}
              className={`p-2 bg-white rounded-full shadow-md transition-colors ${
                inWishlist
                  ? "bg-red-50 text-red-600"
                  : "hover:bg-red-50 text-gray-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                inWishlist ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
              }
            >
              <Heart size={18} className={inWishlist ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating && (
          <div className="flex items-center space-x-1 space-x-reverse mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-500 mr-1">({rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-xl font-bold text-gray-900">
              {price.toLocaleString("fa-IR")} تومان
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                {originalPrice.toLocaleString("fa-IR")}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Check stock status first
            if (stock_status !== "instock") {
              alert("این محصول در حال حاضر موجود نیست.");
              return;
            }

            setAddingToCart(true);
            try {
              // Try to use existing data first, then fetch if needed
              let productData = {
                id,
                name,
                price: price.toString(),
                regular_price: originalPrice?.toString() || price.toString(),
                sale_price:
                  originalPrice && originalPrice > price
                    ? price.toString()
                    : undefined,
                images: [{ src: image }],
                stock_quantity,
                stock_status,
                manage_stock: manage_stock || false,
              };

              // If we don't have complete stock info, fetch from API
              if (
                stock_status === undefined ||
                (manage_stock && stock_quantity === null)
              ) {
                console.log("[DEBUG] Fetching product data from API for:", id);
                const response = await fetch(`/api/products/${id}`);

                if (response.ok) {
                  const data = await response.json();
                  if (data.success && data.data) {
                    const product = data.data;
                    productData = {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      regular_price: product.regular_price,
                      sale_price: product.sale_price,
                      images: product.images || [{ src: image }],
                      stock_quantity: product.stock_quantity,
                      stock_status: product.stock_status,
                      manage_stock: product.manage_stock,
                    };
                  } else {
                    console.error("[DEBUG] Product data not found:", data);
                  }
                } else {
                  const errorData = await response.json().catch(() => ({}));
                  console.error(
                    "[DEBUG] Failed to fetch product:",
                    response.status,
                    errorData
                  );
                }
              }

              // Add to cart using CartContext
              console.log("[DEBUG] Adding product to cart:", productData.id);
              const success = await addItem(productData);

              if (success) {
                console.log("[DEBUG] Product added to cart successfully");
                // Optionally show success message or redirect
                // router.push("/cart");
              } else {
                console.error("[DEBUG] Failed to add product to cart");
                alert(
                  "خطا در افزودن محصول به سبد خرید. لطفا دوباره تلاش کنید."
                );
              }
            } catch (error) {
              console.error("[DEBUG] Error adding to cart:", error);
              alert("خطا در افزودن به سبد خرید. لطفا دوباره تلاش کنید.");
            } finally {
              setAddingToCart(false);
            }
          }}
          disabled={addingToCart || stock_status !== "instock"}
          className="w-full bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none group/btn"
        >
          {addingToCart ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>در حال افزودن...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>افزودن به سبد خرید</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
