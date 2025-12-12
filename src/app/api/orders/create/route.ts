import { NextRequest, NextResponse } from "next/server";
import { fetchWooCommerce } from "@/lib/woocommerce";
import { getCurrentUser } from "@/lib/wordpress-auth";
import { getCustomerByEmail } from "@/lib/woocommerce-customers";

/**
 * POST /api/orders/create - Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;

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

    const body = await request.json();
    const { line_items, shipping, billing, shipping_method, payment_method } =
      body;

    // Validate required fields
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { success: false, error: "سبد خرید خالی است" },
        { status: 400 }
      );
    }

    if (!shipping || !billing) {
      return NextResponse.json(
        { success: false, error: "اطلاعات ارسال و صورتحساب الزامی است" },
        { status: 400 }
      );
    }

    // Validate stock for each item
    for (const item of line_items) {
      const product = await fetchWooCommerce(`products/${item.product_id}`);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `محصول با شناسه ${item.product_id} یافت نشد`,
          },
          { status: 404 }
        );
      }

      if (product.stock_status !== "instock") {
        return NextResponse.json(
          { success: false, error: `محصول ${product.name} موجود نیست` },
          { status: 400 }
        );
      }

      if (product.manage_stock && product.stock_quantity !== null) {
        if (item.quantity > product.stock_quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `فقط ${product.stock_quantity} عدد از محصول ${product.name} موجود است`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Get customer ID if user is logged in
    let customerId = 0;
    if (user && user.email) {
      const customer = await getCustomerByEmail(user.email);
      if (customer) {
        customerId = customer.id;
      }
    }

    // Prepare order data
    const orderData: any = {
      payment_method: payment_method || "cod",
      payment_method_title:
        payment_method === "cod" ? "پرداخت در محل" : "پرداخت آنلاین",
      set_paid: false,
      billing: {
        first_name: billing.first_name || "",
        last_name: billing.last_name || "",
        email: billing.email || "",
        phone: billing.phone || "",
        address_1: billing.address_1 || "",
        address_2: billing.address_2 || "",
        city: billing.city || "",
        state: billing.state || "",
        postcode: billing.postcode || "",
        country: billing.country || "IR",
      },
      shipping: {
        first_name: shipping.first_name || billing.first_name || "",
        last_name: shipping.last_name || billing.last_name || "",
        address_1: shipping.address_1 || billing.address_1 || "",
        address_2: shipping.address_2 || billing.address_2 || "",
        city: shipping.city || billing.city || "",
        state: shipping.state || billing.state || "",
        postcode: shipping.postcode || billing.postcode || "",
        country: shipping.country || billing.country || "IR",
      },
      line_items: line_items.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      shipping_lines: [
        {
          method_id: shipping_method || "flat_rate",
          method_title: "ارسال استاندارد",
          total: "0",
        },
      ],
    };

    if (customerId > 0) {
      orderData.customer_id = customerId;
    }

    // Create order in WooCommerce
    const order = await fetchWooCommerce("orders", {}, "POST", orderData);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "خطا در ایجاد سفارش" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "سفارش با موفقیت ثبت شد",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Create order API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در ثبت سفارش",
      },
      { status: 500 }
    );
  }
}

