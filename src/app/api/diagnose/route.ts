import { NextResponse } from "next/server";

export async function GET() {
  const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || "http://localhost:8000";
  const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      url: WOOCOMMERCE_URL,
      hasKey: !!WOOCOMMERCE_CONSUMER_KEY,
      hasSecret: !!WOOCOMMERCE_CONSUMER_SECRET,
      keyPrefix: WOOCOMMERCE_CONSUMER_KEY ? WOOCOMMERCE_CONSUMER_KEY.substring(0, 15) + "..." : "NOT SET",
    },
    tests: [],
  };

  // Test 1: WordPress REST API
  try {
    const wpResponse = await fetch(`${WOOCOMMERCE_URL}/wp-json/`);
    diagnostics.tests.push({
      name: "WordPress REST API",
      status: wpResponse.ok ? "✅ PASS" : "❌ FAIL",
      httpStatus: wpResponse.status,
      message: wpResponse.ok ? "WordPress REST API is accessible" : "WordPress REST API not accessible",
    });
  } catch (error: any) {
    diagnostics.tests.push({
      name: "WordPress REST API",
      status: "❌ FAIL",
      error: error.message,
      message: "Cannot connect to WordPress",
    });
  }

  // Test 2: WooCommerce REST API
  try {
    const wcResponse = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/`);
    diagnostics.tests.push({
      name: "WooCommerce REST API",
      status: wcResponse.ok ? "✅ PASS" : "❌ FAIL",
      httpStatus: wcResponse.status,
      message: wcResponse.ok ? "WooCommerce REST API is accessible" : "WooCommerce REST API not accessible",
    });
  } catch (error: any) {
    diagnostics.tests.push({
      name: "WooCommerce REST API",
      status: "❌ FAIL",
      error: error.message,
    });
  }

  // Test 3: API with Query Parameters
  if (WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET) {
    try {
      const queryUrl = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}&per_page=1`;
      const queryResponse = await fetch(queryUrl);
      const queryData = await queryResponse.text();
      let queryJson;
      try {
        queryJson = JSON.parse(queryData);
      } catch {
        queryJson = { raw: queryData };
      }

      diagnostics.tests.push({
        name: "API Authentication (Query Parameters)",
        status: queryResponse.ok ? "✅ PASS" : "❌ FAIL",
        httpStatus: queryResponse.status,
        method: "Query Parameters",
        response: queryJson,
        message: queryResponse.ok
          ? "Authentication successful with query parameters"
          : queryJson.message || "Authentication failed",
      });
    } catch (error: any) {
      diagnostics.tests.push({
        name: "API Authentication (Query Parameters)",
        status: "❌ FAIL",
        error: error.message,
      });
    }

    // Test 4: API with Basic Auth
    try {
      const credentials = Buffer.from(
        `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`
      ).toString("base64");
      const basicResponse = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=1`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      });
      const basicData = await basicResponse.text();
      let basicJson;
      try {
        basicJson = JSON.parse(basicData);
      } catch {
        basicJson = { raw: basicData };
      }

      diagnostics.tests.push({
        name: "API Authentication (Basic Auth)",
        status: basicResponse.ok ? "✅ PASS" : "❌ FAIL",
        httpStatus: basicResponse.status,
        method: "Basic Auth",
        response: basicJson,
        message: basicResponse.ok
          ? "Authentication successful with Basic Auth"
          : basicJson.message || "Authentication failed",
      });
    } catch (error: any) {
      diagnostics.tests.push({
        name: "API Authentication (Basic Auth)",
        status: "❌ FAIL",
        error: error.message,
      });
    }
  } else {
    diagnostics.tests.push({
      name: "API Authentication",
      status: "⚠️ SKIP",
      message: "API credentials not configured",
    });
  }

  // Test 5: Check if keys are in correct format
  if (WOOCOMMERCE_CONSUMER_KEY) {
    const keyFormat = WOOCOMMERCE_CONSUMER_KEY.startsWith("ck_") ? "✅ Valid" : "❌ Invalid";
    diagnostics.tests.push({
      name: "Consumer Key Format",
      status: keyFormat,
      message: keyFormat === "✅ Valid" ? "Key format is correct" : "Key should start with 'ck_'",
    });
  }

  if (WOOCOMMERCE_CONSUMER_SECRET) {
    const secretFormat = WOOCOMMERCE_CONSUMER_SECRET.startsWith("cs_") ? "✅ Valid" : "❌ Invalid";
    diagnostics.tests.push({
      name: "Consumer Secret Format",
      status: secretFormat,
      message: secretFormat === "✅ Valid" ? "Secret format is correct" : "Secret should start with 'cs_'",
    });
  }

  // Summary
  const passed = diagnostics.tests.filter((t: any) => t.status?.includes("✅")).length;
  const failed = diagnostics.tests.filter((t: any) => t.status?.includes("❌")).length;
  diagnostics.summary = {
    total: diagnostics.tests.length,
    passed,
    failed,
    skipped: diagnostics.tests.filter((t: any) => t.status?.includes("SKIP")).length,
  };

  return NextResponse.json(diagnostics, { status: 200 });
}

