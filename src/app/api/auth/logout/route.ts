import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/wordpress-auth";

export async function POST(request: NextRequest) {
  try {
    await logoutUser();

    const response = NextResponse.json({
      success: true,
      message: "خروج با موفقیت انجام شد",
    });

    // Clear all authentication cookies
    response.cookies.delete("wp_user_id");
    response.cookies.delete("jwt_token");
    response.cookies.delete("wp_user_data");
    response.cookies.delete("wp_customer_data");

    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در خروج از حساب",
      },
      { status: 500 }
    );
  }
}

