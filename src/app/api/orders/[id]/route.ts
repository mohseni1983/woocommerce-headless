import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/woocommerce-customers";
import { getCurrentUser } from "@/lib/wordpress-auth";
import { getCustomerByEmail } from "@/lib/woocommerce-customers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[DEBUG] Get order API called");
    
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;
    
    console.log("[DEBUG] Auth check - userId:", userId ? "exists" : "missing");
    console.log("[DEBUG] Auth check - jwtToken:", jwtToken ? "exists" : "missing");
    console.log("[DEBUG] Auth check - userDataCookie:", userDataCookie ? "exists" : "missing");
    
    if (!userId && !jwtToken && !userDataCookie) {
      console.log("[DEBUG] No authentication found, returning 401");
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);
    
    console.log("[DEBUG] Order ID requested:", orderId);

    // Get current user - try multiple methods
    let user = null;
    
    // Try to get user from cookie first
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
        console.log("[DEBUG] User from cookie:", user?.email);
      } catch (e) {
        console.log("[DEBUG] Failed to parse user cookie");
      }
    }

    // If not found, try getCurrentUser
    if (!user) {
      const cookie = request.headers.get("cookie") || "";
      console.log("[DEBUG] Calling getCurrentUser");
      user = await getCurrentUser(cookie, jwtToken || undefined);
      console.log("[DEBUG] getCurrentUser result:", user ? user.email : "null");
    }

    if (!user || !user.email) {
      console.log("[DEBUG] User not found, returning 404");
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND", message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // Get WooCommerce customer
    console.log("[DEBUG] Getting customer by email:", user.email);
    const customer = await getCustomerByEmail(user.email);
    console.log("[DEBUG] Customer found:", customer ? `ID: ${customer.id}` : "null");

    if (!customer) {
      console.log("[DEBUG] Customer not found, returning 404");
      return NextResponse.json(
        { success: false, error: "CUSTOMER_NOT_FOUND", message: "مشتری یافت نشد" },
        { status: 404 }
      );
    }

    // Get order
    console.log("[DEBUG] Fetching order:", orderId);
    const order = await getOrder(orderId);
    console.log("[DEBUG] Order found:", order ? `ID: ${order.id}, Customer ID: ${order.customer_id}` : "null");

    if (!order) {
      console.log("[DEBUG] Order not found, returning 404");
      return NextResponse.json(
        { success: false, error: "ORDER_NOT_FOUND", message: "سفارش یافت نشد" },
        { status: 404 }
      );
    }

    // Verify order belongs to customer
    console.log("[DEBUG] Verifying order ownership - Order customer_id:", order.customer_id, "Customer ID:", customer.id);
    if (order.customer_id !== customer.id) {
      console.log("[DEBUG] Order does not belong to customer, returning 403");
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "شما دسترسی به این سفارش ندارید" },
        { status: 403 }
      );
    }

    console.log("[DEBUG] Order verified, returning order data");
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("[DEBUG] Get order API error:", error);
    console.error("[DEBUG] Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در دریافت سفارش",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

