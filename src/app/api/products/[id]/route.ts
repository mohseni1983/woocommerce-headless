import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/woocommerce";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Product not found" },
      { status: 404 }
    );
  }
}

