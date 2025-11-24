import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = await searchProducts(query, {
      per_page: 10,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}


