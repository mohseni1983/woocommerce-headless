import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/wordpress-auth";
import {
  getCustomerByEmail,
  createCustomer,
} from "@/lib/woocommerce-customers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    // Try WordPress login
    let loginResult;
    try {
      loginResult = await loginUser(username, password);
    } catch (loginError: any) {
      console.error("Login error:", loginError);
      return NextResponse.json(
        {
          success: false,
          error: "LOGIN_ERROR",
          message: loginError.message || "خطا در ورود به سیستم",
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!loginResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: loginResult.error || "INVALID_CREDENTIALS",
          message: loginResult.message || "نام کاربری یا رمز عبور اشتباه است",
        },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get or create WooCommerce customer (don't fail if this fails)
    // Use customer from loginResult if available (from WooCommerce custom endpoint)
    let customer = loginResult.customer || null;

    // If no customer from login, try to fetch/create
    if (!customer) {
      try {
        if (loginResult.user?.email) {
          customer = await getCustomerByEmail(loginResult.user.email);

          // If customer doesn't exist in WooCommerce, create one
          if (!customer && loginResult.user) {
            try {
              customer = await createCustomer({
                email: loginResult.user.email,
                username: loginResult.user.username,
                first_name: loginResult.user.first_name || "",
                last_name: loginResult.user.last_name || "",
              });
            } catch (createError: unknown) {
              const errorMessage =
                createError instanceof Error
                  ? createError.message
                  : "Unknown error";
              console.error("Error creating customer:", errorMessage);
              // Continue without customer - login still succeeds
            }
          }
        }
      } catch (customerError: unknown) {
        const errorMessage =
          customerError instanceof Error
            ? customerError.message
            : "Unknown error";
        console.error("Error fetching/creating customer:", errorMessage);
        // Continue without customer - login still succeeds
      }
    }

    // Set cookie for session (in production, use secure, httpOnly cookies)
    const response = NextResponse.json({
      success: true,
      user: loginResult.user,
      customer,
      token: loginResult.token, // Include JWT token if available
    });

    // Store user ID in cookie
    if (loginResult.user) {
      console.log(
        "[DEBUG] /api/auth/login - Setting wp_user_id cookie:",
        loginResult.user.id
      );
      response.cookies.set("wp_user_id", loginResult.user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/", // Ensure cookie is available for all paths
      });

      // Store user data in cookie so /api/auth/me can return it without fetching from WordPress
      // This is needed because WordPress session cookies aren't forwarded to Next.js
      response.cookies.set("wp_user_data", JSON.stringify(loginResult.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/", // Ensure cookie is available for all paths
      });
    } else {
      console.log(
        "[DEBUG] /api/auth/login - WARNING: loginResult.user is null/undefined"
      );
    }

    // Store JWT token in cookie if available (for API authentication)
    if (loginResult.token) {
      console.log("[DEBUG] /api/auth/login - Setting jwt_token cookie");
      response.cookies.set("jwt_token", loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/", // Ensure cookie is available for all paths
      });
    }

    console.log(
      "[DEBUG] /api/auth/login - Login successful, user:",
      loginResult.user?.id,
      loginResult.user?.username
    );
    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در سرور. لطفا دوباره تلاش کنید.",
      },
      { status: 500 }
    );
  }
}
