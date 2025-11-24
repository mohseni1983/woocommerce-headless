"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price?: string;
  quantity: number;
  image: string;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  in_stock: boolean;
  max_quantity: number; // Maximum available quantity
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (
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
    },
    quantity?: number
  ) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getTotal: () => number;
  getItemCount: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = () => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const cartItems = JSON.parse(stored);
        setItems(cartItems);
      }
    } catch (error) {
      console.error("Error loading cart from storage:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = (cartItems: CartItem[]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(cartItems));
        console.log(
          "[DEBUG] Saved cart to storage:",
          cartItems.length,
          "items"
        );
      }
    } catch (error) {
      console.error("Error saving cart to storage:", error);
    }
  };

  const refreshCart = async () => {
    // Don't overwrite localStorage with empty array from API
    // The API returns empty array by design (cart is client-side)
    // Just validate existing items if needed
    console.log("[DEBUG] refreshCart called, current items:", items.length);
    // Keep existing items from localStorage
    // Only validate stock if needed in the future
  };

  const addItem = async (
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
    },
    quantity: number = 1
  ): Promise<boolean> => {
    try {
      // Check stock availability
      if (product.stock_status !== "instock") {
        return false;
      }

      // Check if product manages stock
      let maxQuantity = quantity;
      if (product.manage_stock && product.stock_quantity !== null) {
        maxQuantity = Math.min(quantity, product.stock_quantity);
        if (maxQuantity <= 0) {
          return false;
        }
      }

      // Validate with API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          quantity: maxQuantity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Add to local cart immediately
          const existingItem = items.find((item) => item.id === product.id);
          const newItems = existingItem
            ? items.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + maxQuantity,
                      max_quantity: data.data.max_quantity,
                    }
                  : item
              )
            : [
                ...items,
                {
                  id: data.data.id,
                  name: data.data.name,
                  price: data.data.price,
                  regular_price: data.data.regular_price,
                  sale_price: data.data.sale_price,
                  quantity: data.data.quantity,
                  image: data.data.image,
                  stock_quantity: data.data.stock_quantity,
                  stock_status: data.data.stock_status,
                  manage_stock: data.data.manage_stock,
                  in_stock: data.data.in_stock,
                  max_quantity: data.data.max_quantity,
                },
              ];
          setItems(newItems);
          saveCartToStorage(newItems);
          console.log(
            "[DEBUG] Product added to cart successfully:",
            product.id,
            "Total items:",
            newItems.length
          );
          // Force re-render by updating state
          return true;
        } else {
          console.error(
            "[DEBUG] Add to cart failed:",
            data.error,
            data.message
          );
          return false;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "[DEBUG] Add to cart API error:",
          response.status,
          errorData
        );
        return false;
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return false;
    }
  };

  const updateQuantity = async (
    productId: number,
    quantity: number
  ): Promise<boolean> => {
    if (quantity <= 0) {
      return removeItem(productId);
    }

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Update local cart immediately
          const newItems = items.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity: data.data.quantity,
                  max_quantity: data.data.max_quantity,
                }
              : item
          );
          setItems(newItems);
          saveCartToStorage(newItems);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error updating cart item:", error);
      return false;
    }
  };

  const removeItem = async (productId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/cart?product_id=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove from local cart immediately
          const newItems = items.filter((item) => item.id !== productId);
          setItems(newItems);
          saveCartToStorage(newItems);
          return true;
        }
      }
      // Even if API fails, remove from local cart
      const newItems = items.filter((item) => item.id !== productId);
      setItems(newItems);
      saveCartToStorage(newItems);
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      // Even on error, remove from local cart
      const newItems = items.filter((item) => item.id !== productId);
      setItems(newItems);
      saveCartToStorage(newItems);
      return true;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems([]);
          saveCartToStorage([]);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  };

  const getTotal = (): number => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.sale_price || item.price);
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        getItemCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
