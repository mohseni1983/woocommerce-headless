import { NextResponse } from "next/server";

export async function GET() {
  try {
    const WORDPRESS_URL = process.env.WOOCOMMERCE_URL || "http://localhost:8000";
    
    // Test WordPress REST API
    const wpTest = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/`);
    const wpStatus = wpTest.ok ? "✅ OK" : `❌ ${wpTest.status}`;
    
    // Test WooCommerce REST API
    const wcTest = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/`);
    const wcStatus = wcTest.ok ? "✅ OK" : `❌ ${wcTest.status}`;
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      wordpress_url: WORDPRESS_URL,
      wordpress_api: wpStatus,
      woocommerce_api: wcStatus,
      environment: {
        node_env: process.env.NODE_ENV,
        has_consumer_key: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
        has_consumer_secret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

