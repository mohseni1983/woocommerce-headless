import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, updateCustomer } from "@/lib/woocommerce-customers";
import { getCurrentUser } from "@/lib/wordpress-auth";

const WISHLIST_META_KEY = "wishlist_products";

/**
 * GET /api/wishlist - Get customer wishlist
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;

    if (!userId && !jwtToken && !userDataCookie) {
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    // Get user
    let user = null;
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
      } catch {
        // Continue to fetch user
      }
    }

    if (!user) {
      const cookie = request.headers.get("cookie") || "";
      user = await getCurrentUser(cookie, jwtToken || undefined);
    }

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get WooCommerce customer
    const customer = await getCustomerByEmail(user.email);

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get wishlist from meta_data
    const wishlistMeta = customer.meta_data?.find(
      (meta: any) => meta.key === WISHLIST_META_KEY
    );

    let wishlistProductIds: number[] = [];
    if (wishlistMeta && wishlistMeta.value) {
      try {
        wishlistProductIds =
          typeof wishlistMeta.value === "string"
            ? JSON.parse(wishlistMeta.value)
            : wishlistMeta.value;
      } catch {
        wishlistProductIds = [];
      }
    }

    // If no product IDs, return empty array
    if (!Array.isArray(wishlistProductIds) || wishlistProductIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Fetch product details for wishlist items
    const { fetchWooCommerce } = await import("@/lib/woocommerce");
    const products = await Promise.all(
      wishlistProductIds.map(async (productId: number) => {
        try {
          const product = await fetchWooCommerce(`products/${productId}`);
          return product;
        } catch {
          return null;
        }
      })
    );

    // Filter out null products and format
    const wishlistProducts = products
      .filter((p) => p !== null)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        images: product.images || [],
        stock_status: product.stock_status,
        in_stock: product.stock_status === "instock",
      }));

    return NextResponse.json({
      success: true,
      data: wishlistProducts,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Get wishlist API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در دریافت لیست علاقه‌مندی‌ها",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist - Add product to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;

    if (!userId && !jwtToken && !userDataCookie) {
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    // Accept both number and string, convert to number
    const productIdNum =
      typeof productId === "string" ? parseInt(productId, 10) : productId;

    if (!productIdNum || isNaN(productIdNum)) {
      return NextResponse.json(
        { success: false, error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    // Get user
    let user = null;
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
      } catch {
        // Continue to fetch user
      }
    }

    if (!user) {
      const cookie = request.headers.get("cookie") || "";
      user = await getCurrentUser(cookie, jwtToken || undefined);
    }

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get WooCommerce customer
    const customer = await getCustomerByEmail(user.email);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "CUSTOMER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get current wishlist
    const wishlistMeta = customer.meta_data?.find(
      (meta: any) => meta.key === WISHLIST_META_KEY
    );

    let wishlistProductIds: number[] = [];
    if (wishlistMeta && wishlistMeta.value) {
      try {
        wishlistProductIds =
          typeof wishlistMeta.value === "string"
            ? JSON.parse(wishlistMeta.value)
            : wishlistMeta.value;
      } catch {
        wishlistProductIds = [];
      }
    }

    // Add product if not already in wishlist
    if (!wishlistProductIds.includes(productIdNum)) {
      wishlistProductIds.push(productIdNum);
    }

    // Update customer meta_data
    // WooCommerce requires keeping the id for existing meta_data items
    const updatedMetaData = [...(customer.meta_data || [])];
    const existingIndex = updatedMetaData.findIndex(
      (meta: any) => meta.key === WISHLIST_META_KEY
    );

    if (existingIndex >= 0) {
      // Keep the existing id when updating
      updatedMetaData[existingIndex] = {
        ...updatedMetaData[existingIndex],
        value: JSON.stringify(wishlistProductIds),
      };
    } else {
      // Add new meta_data item (id will be assigned by WooCommerce)
      updatedMetaData.push({
        key: WISHLIST_META_KEY,
        value: JSON.stringify(wishlistProductIds),
      });
    }

    console.log("[DEBUG] Updating wishlist for customer:", customer.id);
    console.log("[DEBUG] Wishlist product IDs:", wishlistProductIds);
    console.log("[DEBUG] Meta data to update:", updatedMetaData);

    const updatedCustomer = await updateCustomer(customer.id, {
      meta_data: updatedMetaData,
    });

    if (!updatedCustomer) {
      console.error("[DEBUG] Failed to update customer");
      return NextResponse.json(
        { success: false, error: "UPDATE_FAILED", message: "خطا در به‌روزرسانی مشتری" },
        { status: 500 }
      );
    }

    console.log("[DEBUG] Customer updated successfully");

    return NextResponse.json({
      success: true,
      message: "محصول به علاقه‌مندی‌ها اضافه شد",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Add to wishlist API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در افزودن به علاقه‌مندی‌ها",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist - Remove product from wishlist
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;

    if (!userId && !jwtToken && !userDataCookie) {
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum)) {
      return NextResponse.json(
        { success: false, error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

    // Get user
    let user = null;
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
      } catch {
        // Continue to fetch user
      }
    }

    if (!user) {
      const cookie = request.headers.get("cookie") || "";
      user = await getCurrentUser(cookie, jwtToken || undefined);
    }

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get WooCommerce customer
    const customer = await getCustomerByEmail(user.email);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "CUSTOMER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get current wishlist
    const wishlistMeta = customer.meta_data?.find(
      (meta: any) => meta.key === WISHLIST_META_KEY
    );

    let wishlistProductIds: number[] = [];
    if (wishlistMeta && wishlistMeta.value) {
      try {
        wishlistProductIds =
          typeof wishlistMeta.value === "string"
            ? JSON.parse(wishlistMeta.value)
            : wishlistMeta.value;
      } catch {
        wishlistProductIds = [];
      }
    }

    // Remove product from wishlist
    wishlistProductIds = wishlistProductIds.filter(
      (id: number) => id !== productIdNum
    );

    // Update customer meta_data
    // WooCommerce requires keeping the id for existing meta_data items
    const updatedMetaData = [...(customer.meta_data || [])];
    const existingIndex = updatedMetaData.findIndex(
      (meta: any) => meta.key === WISHLIST_META_KEY
    );

    if (existingIndex >= 0) {
      if (wishlistProductIds.length > 0) {
        // Keep the existing id when updating
        updatedMetaData[existingIndex] = {
          ...updatedMetaData[existingIndex],
          value: JSON.stringify(wishlistProductIds),
        };
      } else {
        // Remove meta if wishlist is empty
        updatedMetaData.splice(existingIndex, 1);
      }
    }

    console.log("[DEBUG] Removing from wishlist for customer:", customer.id);
    console.log("[DEBUG] Remaining product IDs:", wishlistProductIds);

    const updatedCustomer = await updateCustomer(customer.id, {
      meta_data: updatedMetaData,
    });

    if (!updatedCustomer) {
      console.error("[DEBUG] Failed to update customer");
      return NextResponse.json(
        { success: false, error: "UPDATE_FAILED", message: "خطا در به‌روزرسانی مشتری" },
        { status: 500 }
      );
    }

    console.log("[DEBUG] Customer updated successfully");

    return NextResponse.json({
      success: true,
      message: "محصول از علاقه‌مندی‌ها حذف شد",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Remove from wishlist API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در حذف از علاقه‌مندی‌ها",
      },
      { status: 500 }
    );
  }
}

