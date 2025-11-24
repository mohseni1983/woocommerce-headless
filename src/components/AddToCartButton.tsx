"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: string;
    regular_price: string;
    sale_price?: string;
    images: Array<{ src: string }>;
    stock_quantity: number | null;
    stock_status: string;
    manage_stock: boolean;
  };
  className?: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  product,
  className = "",
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock_status !== "instock") {
      return;
    }

    setAdding(true);
    try {
      const success = await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        images: product.images || [],
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status,
        manage_stock: product.manage_stock,
      });

      if (success) {
        // Optionally redirect to cart or show success message
        // router.push("/cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || adding || product.stock_status !== "instock"}
      className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse ${className}`}
    >
      {adding ? (
        <>
          <Loader2 className="animate-spin" size={22} />
          <span>در حال افزودن...</span>
        </>
      ) : (
        <>
          <ShoppingCart size={22} />
          <span>افزودن به سبد خرید</span>
        </>
      )}
    </button>
  );
}
