import { NextRequest, NextResponse } from "next/server";
import { updateUser, getCurrentUser } from "@/lib/wordpress-auth";
import { getCustomerByEmail, updateCustomer } from "@/lib/woocommerce-customers";

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const cookie = request.headers.get("cookie") || "";

    // Update WordPress user
    const updatedUser = await updateUser(parseInt(userId), body, cookie);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "UPDATE_FAILED" },
        { status: 400 }
      );
    }

    // Update WooCommerce customer if exists
    let customer = null;
    if (updatedUser.email) {
      customer = await getCustomerByEmail(updatedUser.email);
      if (customer) {
        customer = await updateCustomer(customer.id, {
          first_name: updatedUser.first_name || body.first_name || "",
          last_name: updatedUser.last_name || body.last_name || "",
          email: updatedUser.email,
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      customer,
      message: "پروفایل با موفقیت به‌روزرسانی شد",
    });
  } catch (error: any) {
    console.error("Update profile API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در به‌روزرسانی پروفایل",
      },
      { status: 500 }
    );
  }
}

