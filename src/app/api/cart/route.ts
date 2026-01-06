import { NextRequest, NextResponse } from "next/server";
import { fetchWooCommerce } from "@/lib/woocommerce";

/**
 * GET /api/cart - Get cart items
 * For now, we'll use localStorage on client side, but this can sync with WooCommerce session
 */
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you might want to sync with WooCommerce session
    // For now, return empty array - client will use localStorage
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Get cart API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در دریافت سبد خرید",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "شناسه محصول و تعداد الزامی است" },
        { status: 400 }
      );
    }

    // Fetch product to validate stock
    const product = await fetchWooCommerce(`products/${product_id}`);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    // Check stock availability
    if (product.stock_status !== "instock") {
      return NextResponse.json(
        { success: false, error: "محصول موجود نیست" },
        { status: 400 }
      );
    }

    // Check stock quantity if managed
    if (product.manage_stock && product.stock_quantity !== null) {
      if (quantity > product.stock_quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `فقط ${product.stock_quantity} عدد موجود است`,
            max_quantity: product.stock_quantity,
          },
          { status: 400 }
        );
      }
    }

    // Return product data for client to add to cart
    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        quantity,
        image: product.images?.[0]?.src || "/placeholder-product.svg",
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status,
        manage_stock: product.manage_stock,
        in_stock: product.stock_status === "instock",
        max_quantity: product.manage_stock
          ? product.stock_quantity || 999
          : 999,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Add to cart API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در افزودن به سبد خرید",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart - Update item quantity
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "شناسه محصول و تعداد الزامی است" },
        { status: 400 }
      );
    }

    // Fetch product to validate stock
    const product = await fetchWooCommerce(`products/${product_id}`);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    // Check stock availability
    if (product.stock_status !== "instock") {
      return NextResponse.json(
        { success: false, error: "محصول موجود نیست" },
        { status: 400 }
      );
    }

    // Check stock quantity if managed
    if (product.manage_stock && product.stock_quantity !== null) {
      if (quantity > product.stock_quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `فقط ${product.stock_quantity} عدد موجود است`,
            max_quantity: product.stock_quantity,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        product_id,
        quantity,
        max_quantity: product.manage_stock
          ? product.stock_quantity || 999
          : 999,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Update cart API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در به‌روزرسانی سبد خرید",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - Remove item from cart or clear cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const product_id = searchParams.get("product_id");

    if (product_id) {
      // Remove specific item
      return NextResponse.json({
        success: true,
        message: "محصول از سبد خرید حذف شد",
      });
    } else {
      // Clear entire cart
      return NextResponse.json({
        success: true,
        message: "سبد خرید پاک شد",
      });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Delete cart API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در حذف از سبد خرید",
      },
      { status: 500 }
    );
  }
}







