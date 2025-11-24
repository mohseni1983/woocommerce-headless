"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AddToWishlistButtonProps {
  productId: number;
  className?: string;
  size?: number;
  variant?: "button" | "icon";
}

export default function AddToWishlistButton({
  productId,
  className = "",
  size = 22,
  variant = "button",
}: AddToWishlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if product is in wishlist
  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    } else {
      setChecking(false);
      setInWishlist(false);
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const isInWishlist = data.data.some(
            (item: { id: number }) => item.id === productId
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

  const handleAddToWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (inWishlist) {
      // Remove from wishlist
      try {
        setAddingToWishlist(true);
        const response = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInWishlist(false);
            // Refresh wishlist status
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
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInWishlist(true);
            // Refresh wishlist status
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

  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToWishlist}
        disabled={addingToWishlist || checking}
        className={`p-2 bg-white rounded-full shadow-md transition-colors ${
          inWishlist
            ? "bg-red-50 text-red-600"
            : "hover:bg-red-50 text-gray-600"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={inWishlist ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      >
        <Heart size={size} className={inWishlist ? "fill-current" : ""} />
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToWishlist}
      disabled={addingToWishlist || checking}
      className={`w-full border-2 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed ${
        inWishlist
          ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-gray-300 hover:border-gray-400 text-gray-700"
      } py-4 rounded-xl font-semibold ${className}`}
    >
      <Heart size={size} className={inWishlist ? "fill-current" : ""} />
      <span>
        {addingToWishlist
          ? "در حال پردازش..."
          : inWishlist
          ? "حذف از علاقه‌مندی‌ها"
          : "افزودن به علاقه‌مندی‌ها"}
      </span>
    </button>
  );
}
