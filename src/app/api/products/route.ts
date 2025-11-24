import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/woocommerce";

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
    if (searchParams.get("category")) {
      params.category = parseInt(searchParams.get("category")!);
    }
    if (searchParams.get("featured")) {
      params.featured = searchParams.get("featured") === "true";
    }
    if (searchParams.get("on_sale")) {
      params.on_sale = searchParams.get("on_sale") === "true";
    }
    if (searchParams.get("search")) {
      params.search = searchParams.get("search");
    }
    if (searchParams.get("orderby")) {
      params.orderby = searchParams.get("orderby");
    }
    if (searchParams.get("order")) {
      params.order = searchParams.get("order") as "asc" | "desc";
    }

    const products = await getProducts(params);

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}


