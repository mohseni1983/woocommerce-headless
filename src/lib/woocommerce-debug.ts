// Debug utility for WooCommerce API
// Use this to test API connection and diagnose issues

export async function testWooCommerceConnection() {
  const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || "http://localhost:8000";
  const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

  console.log("=== WooCommerce API Connection Test ===");
  console.log("URL:", WOOCOMMERCE_URL);
  console.log("Consumer Key:", WOOCOMMERCE_CONSUMER_KEY ? `${WOOCOMMERCE_CONSUMER_KEY.substring(0, 10)}...` : "NOT SET");
  console.log("Consumer Secret:", WOOCOMMERCE_CONSUMER_SECRET ? "SET" : "NOT SET");

  // Test 1: Check if WordPress is accessible
  try {
    const wpResponse = await fetch(`${WOOCOMMERCE_URL}/wp-json/`);
    console.log("\n1. WordPress REST API:", wpResponse.ok ? "✅ Accessible" : `❌ ${wpResponse.status}`);
    if (!wpResponse.ok) {
      const text = await wpResponse.text();
      console.log("   Response:", text.substring(0, 200));
    }
  } catch (error: any) {
    console.log("\n1. WordPress REST API: ❌ Connection failed");
    console.log("   Error:", error.message);
    console.log("   ⚠️  WordPress/WooCommerce might not be running on port 8000");
    return { success: false, error: "WordPress not accessible" };
  }

  // Test 2: Check WooCommerce endpoint
  try {
    const wcResponse = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/`);
    console.log("\n2. WooCommerce REST API:", wcResponse.ok ? "✅ Accessible" : `❌ ${wcResponse.status}`);
  } catch (error: any) {
    console.log("\n2. WooCommerce REST API: ❌ Connection failed");
    console.log("   Error:", error.message);
    return { success: false, error: "WooCommerce API not accessible" };
  }

  // Test 3: Test with credentials
  if (!WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
    console.log("\n3. API Credentials: ❌ Not configured");
    return { success: false, error: "API credentials not set" };
  }

  const testUrl = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}&per_page=1`;
  
  try {
    const response = await fetch(testUrl);
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { raw: data };
    }

    console.log("\n3. API Authentication Test:");
    console.log("   Status:", response.status, response.statusText);
    
    if (response.ok) {
      console.log("   ✅ SUCCESS! API is working correctly");
      console.log("   Response:", Array.isArray(jsonData) ? `${jsonData.length} product(s) returned` : "Data received");
      return { success: true, data: jsonData };
    } else {
      console.log("   ❌ FAILED");
      if (response.status === 401) {
        console.log("   Error: 401 Unauthorized");
        console.log("   Message:", jsonData.message || jsonData.code);
        console.log("\n   🔧 SOLUTION:");
        console.log("   1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API");
        console.log("   2. Find your API key and ensure it has 'Read' permissions");
        console.log("   3. Verify the user has Administrator or Editor role");
      } else {
        console.log("   Response:", data.substring(0, 200));
      }
      return { success: false, status: response.status, error: jsonData };
    }
  } catch (error: any) {
    console.log("\n3. API Authentication Test: ❌ Error");
    console.log("   Error:", error.message);
    return { success: false, error: error.message };
  }
}

