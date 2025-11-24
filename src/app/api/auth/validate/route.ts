import { NextRequest, NextResponse } from "next/server";
import { jwtValidate } from "@/lib/simple-jwt-auth";

/**
 * Validate JWT token endpoint
 * Uses Simple JWT Login plugin
 * Documentation: https://simplejwtlogin.com/docs/authentication
 */
export async function GET(request: NextRequest) {
  try {
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const authHeader = request.headers.get("authorization");
    
    // Get JWT from cookie or Authorization header
    let jwt: string | undefined;
    if (jwtToken) {
      jwt = jwtToken;
    } else if (authHeader?.startsWith("Bearer ")) {
      jwt = authHeader.substring(7);
    }

    if (!jwt) {
      return NextResponse.json(
        { success: false, error: "JWT token required" },
        { status: 401 }
      );
    }

    const result = await jwtValidate(jwt);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "INVALID_TOKEN",
        message: result.message || "JWT token is invalid or expired",
      },
      { status: 401 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Validate JWT API error:", errorMessage);
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

