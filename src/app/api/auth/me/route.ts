import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/wordpress-auth";
import { getCustomerByEmail } from "@/lib/woocommerce-customers";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;
    const customerDataCookie = request.cookies.get("wp_customer_data")?.value;

    console.log(
      "[DEBUG] /api/auth/me - userId:",
      userId,
      "jwtToken:",
      jwtToken ? "present" : "missing",
      "userDataCookie:",
      userDataCookie ? "present" : "missing"
    );

    // Method 1: Try to get user from stored cookie (fastest, no API call needed)
    if (userDataCookie) {
      try {
        const user = JSON.parse(userDataCookie);
        console.log("[DEBUG] /api/auth/me - Using user data from cookie");

        // Get customer data
        let customer = null;
        if (customerDataCookie) {
          try {
            customer = JSON.parse(customerDataCookie);
          } catch {
            // If customer cookie parsing fails, try to fetch it
            if (user.email) {
              try {
                const { getCustomerByEmail } = await import(
                  "@/lib/woocommerce-customers"
                );
                customer = await getCustomerByEmail(user.email);
              } catch {
                // Continue without customer
              }
            }
          }
        } else if (user.email) {
          // Try to fetch customer if not in cookie
          try {
            const { getCustomerByEmail } = await import(
              "@/lib/woocommerce-customers"
            );
            customer = await getCustomerByEmail(user.email);
          } catch {
            // Continue without customer
          }
        }

        return NextResponse.json({
          success: true,
          user,
          customer,
        });
      } catch (parseError: unknown) {
        const errorMessage =
          parseError instanceof Error ? parseError.message : "Unknown error";
        console.error(
          "[DEBUG] /api/auth/me - Failed to parse user data cookie:",
          errorMessage
        );
        // Continue to try other methods
      }
    }

    if (!userId && !jwtToken) {
      console.log("[DEBUG] /api/auth/me - No authentication found");
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    // Method 2: Try to fetch from WordPress (JWT or cookie auth)
    let user = null;
    try {
      // Use getCurrentUser which handles both JWT and cookie auth
      const cookie = request.headers.get("cookie") || "";
      console.log(
        "[DEBUG] /api/auth/me - Attempting to get user with cookie and JWT"
      );
      user = await getCurrentUser(cookie, jwtToken || undefined);

      if (!user && userId) {
        // If getCurrentUser failed but we have userId, try direct fetch
        console.log(
          "[DEBUG] /api/auth/me - getCurrentUser failed, trying direct fetch with userId:",
          userId
        );
        try {
          const userResponse = await fetch(
            `${
              process.env.WOOCOMMERCE_URL || "http://localhost:8000"
            }/wp-json/wp/v2/users/${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              cache: "no-store",
            }
          );

          if (userResponse.ok) {
            user = await userResponse.json();
            console.log(
              "[DEBUG] /api/auth/me - Successfully fetched user via direct userId"
            );
          } else {
            const errorText = await userResponse.text();
            console.log(
              "[DEBUG] /api/auth/me - Direct fetch failed:",
              userResponse.status,
              errorText.substring(0, 200)
            );
          }
        } catch (directFetchError: unknown) {
          const errorMessage =
            directFetchError instanceof Error
              ? directFetchError.message
              : "Unknown error";
          console.error(
            "[DEBUG] /api/auth/me - Direct fetch error:",
            errorMessage
          );
        }
      }

      if (!user) {
        // User not found or invalid credentials
        console.log("[DEBUG] /api/auth/me - User not found, clearing cookies");
        const response = NextResponse.json(
          { success: false, error: "USER_NOT_FOUND" },
          { status: 404 }
        );
        response.cookies.delete("wp_user_id");
        response.cookies.delete("jwt_token");
        response.cookies.delete("wp_user_data");
        response.cookies.delete("wp_customer_data");
        return response;
      }

      console.log("[DEBUG] /api/auth/me - User found:", user.id, user.username);
    } catch (fetchError: unknown) {
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Unknown error";
      console.error(
        "[DEBUG] /api/auth/me - Error fetching user:",
        errorMessage
      );
      // Try getCurrentUser as fallback
      const cookie = request.headers.get("cookie") || "";
      user = await getCurrentUser(cookie, jwtToken || undefined);

      if (!user) {
        const response = NextResponse.json(
          { success: false, error: "USER_NOT_FOUND" },
          { status: 404 }
        );
        response.cookies.delete("wp_user_id");
        response.cookies.delete("jwt_token");
        response.cookies.delete("wp_user_data");
        response.cookies.delete("wp_customer_data");
        return response;
      }
    }

    // Get WooCommerce customer (don't fail if this fails)
    let customer = null;
    try {
      if (user.email) {
        customer = await getCustomerByEmail(user.email);
      }
    } catch (customerError: unknown) {
      const errorMessage =
        customerError instanceof Error
          ? customerError.message
          : "Unknown error";
      console.error("Error fetching customer:", errorMessage);
      // Continue without customer data
    }

    return NextResponse.json({
      success: true,
      user,
      customer,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Get current user API error:", errorMessage);
    if (errorStack) {
      console.error("Error stack:", errorStack);
    }
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: errorMessage || "خطا در دریافت اطلاعات کاربر",
      },
      { status: 500 }
    );
  }
}
