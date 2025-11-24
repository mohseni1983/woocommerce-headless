import { NextResponse } from "next/server";
import { testWooCommerceConnection } from "@/lib/woocommerce-debug";

export async function GET() {
  const result = await testWooCommerceConnection();
  
  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString(),
    environment: {
      url: process.env.WOOCOMMERCE_URL || "http://localhost:8000",
      hasKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
      hasSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
    },
  });
}


