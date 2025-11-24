import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/wordpress-auth";
import { createCustomer } from "@/lib/woocommerce-customers";

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "درخواست نامعتبر است",
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { username, email, password, firstName, lastName } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "نام کاربری، ایمیل و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "رمز عبور باید حداقل 6 کاراکتر باشد" },
        { status: 400 }
      );
    }

    // Try to register user in WordPress
    let registerResult;
    try {
      registerResult = await registerUser(
        username,
        email,
        password,
        firstName,
        lastName
      );
    } catch (registerError: any) {
      console.error("WordPress registration error:", registerError);
      console.error("Error details:", {
        message: registerError.message,
        stack: registerError.stack,
      });

      // Return proper JSON error response
      return NextResponse.json(
        {
          success: false,
          error: "REGISTRATION_ERROR",
          message: registerError.message || "خطا در ثبت‌نام کاربر",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // If WordPress registration failed, try WooCommerce customer creation as fallback
    if (!registerResult.success) {
      // Check if it's a permission error
      if (
        registerResult.error === "rest_cannot_create_user" ||
        registerResult.error === "REGISTRATION_ERROR"
      ) {
        // Try creating customer via WooCommerce API instead
        try {
          const customer = await createCustomer({
            email,
            username,
            first_name: firstName || "",
            last_name: lastName || "",
            password, // WooCommerce might accept password
          });

          if (customer) {
            // Create a minimal user object from customer
            const mockUser = {
              id: customer.id,
              username: customer.username || username,
              email: customer.email,
              first_name: customer.first_name || firstName || "",
              last_name: customer.last_name || lastName || "",
              name:
                `${customer.first_name || firstName || ""} ${
                  customer.last_name || lastName || ""
                }`.trim() || username,
            };

            const response = NextResponse.json({
              success: true,
              user: mockUser,
              customer,
              message: "ثبت‌نام با موفقیت انجام شد (از طریق WooCommerce)",
              warning:
                "لطفا در تنظیمات WordPress، گزینه 'هر کسی می‌تواند ثبت‌نام کند' را فعال کنید",
            });

            response.cookies.set("wp_user_id", customer.id.toString(), {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7,
            });

            return response;
          }
        } catch (wcError: any) {
          console.error("WooCommerce customer creation error:", wcError);
          // Fall through to return the original error
        }
      }

      // Return the original WordPress registration error
      return NextResponse.json(
        {
          success: false,
          error: registerResult.error,
          message: registerResult.message,
        },
        { status: 400 }
      );
    }

    // WordPress registration succeeded, create WooCommerce customer
    let customer = null;
    try {
      if (registerResult.user) {
        customer = await createCustomer({
          email: registerResult.user.email,
          username: registerResult.user.username,
          first_name: registerResult.user.first_name || firstName || "",
          last_name: registerResult.user.last_name || lastName || "",
        });
      }
    } catch (customerError: any) {
      console.error("Error creating WooCommerce customer:", customerError);
      // Continue without customer - registration still succeeds
    }

    const response = NextResponse.json({
      success: true,
      user: registerResult.user,
      customer,
      message: "ثبت‌نام با موفقیت انجام شد",
    });

    // Set cookie for session
    if (registerResult.user) {
      response.cookies.set("wp_user_id", registerResult.user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    console.error("Error stack:", error.stack);

    // Ensure we always return JSON, even on unexpected errors
    try {
      return NextResponse.json(
        {
          success: false,
          error: "SERVER_ERROR",
          message: error.message || "خطا در سرور. لطفا دوباره تلاش کنید.",
          details:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (jsonError: any) {
      // Fallback if JSON.stringify fails
      console.error("Failed to create JSON response:", jsonError);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "SERVER_ERROR",
          message: "خطا در سرور. لطفا دوباره تلاش کنید.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }
}
