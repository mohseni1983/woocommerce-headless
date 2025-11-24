import { NextRequest, NextResponse } from "next/server";
import { jwtResetPassword } from "@/lib/simple-jwt-auth";

/**
 * Reset password endpoint
 * Uses Simple JWT Login plugin
 * Documentation: https://simplejwtlogin.com/docs/reset-password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, auth_code } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "ایمیل الزامی است" },
        { status: 400 }
      );
    }

    const result = await jwtResetPassword(email, auth_code);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || "ایمیل بازنشانی رمز عبور ارسال شد",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error || "RESET_FAILED",
        message: result.message || "خطا در بازنشانی رمز عبور",
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Reset password API error:", errorMessage);
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

