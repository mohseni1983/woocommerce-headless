import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders } from "@/lib/woocommerce-customers";
import { getCurrentUser } from "@/lib/wordpress-auth";
import { getCustomerByEmail } from "@/lib/woocommerce-customers";

export async function GET(request: NextRequest) {
  try {
    console.log("[DEBUG] Orders API called");
    
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
      console.log("[DEBUG] Customer not found, returning empty array");
      return NextResponse.json({
        success: true,
        data: [],
        message: "هیچ سفارشی یافت نشد",
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: any = {
      per_page: parseInt(searchParams.get("per_page") || "10"),
      page: parseInt(searchParams.get("page") || "1"),
    };

    if (searchParams.get("status")) {
      params.status = searchParams.get("status");
    }

    console.log("[DEBUG] Fetching orders with params:", params);

    // Get customer orders
    const orders = await getCustomerOrders(customer.id, params);

    console.log("[DEBUG] Customer ID:", customer.id);
    console.log("[DEBUG] Orders found:", orders?.length || 0);
    console.log("[DEBUG] Orders data:", orders);

    return NextResponse.json({
      success: true,
      data: orders || [],
    });
  } catch (error: any) {
    console.error("[DEBUG] Get orders API error:", error);
    console.error("[DEBUG] Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در دریافت سفارش‌ها",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

