import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: any = {};

    if (searchParams.get("per_page")) {
      params.per_page = parseInt(searchParams.get("per_page")!);
    }
    if (searchParams.get("page")) {
      params.page = parseInt(searchParams.get("page")!);
    }
    if (searchParams.get("parent")) {
      params.parent = parseInt(searchParams.get("parent")!);
    }
    if (searchParams.get("hide_empty")) {
      params.hide_empty = searchParams.get("hide_empty") === "true";
    }

    const categories = await getCategories(params);

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}


