import { NextRequest, NextResponse } from "next/server";
import { fetchWooCommerce } from "@/lib/woocommerce";

/**
 * GET /api/payment-methods - Get available payment methods
 */
export async function GET(request: NextRequest) {
  try {
    // Get payment gateways from WooCommerce
    const gateways = await fetchWooCommerce("payment_gateways");

    const methods: Array<{
      id: string;
      title: string;
      description: string;
      enabled: boolean;
      order: number;
    }> = [];

    if (gateways && Array.isArray(gateways)) {
      for (const gateway of gateways) {
        if (gateway.enabled) {
          methods.push({
            id: gateway.id,
            title: gateway.title || gateway.method_title || "پرداخت",
            description:
              gateway.description || gateway.method_description || "",
            enabled: gateway.enabled,
            order: gateway.order || 0,
          });
        }
      }
    }

    // Sort by order
    methods.sort((a, b) => a.order - b.order);

    // If no methods found, return default methods
    if (methods.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "bacs",
            title: "پرداخت آنلاین",
            description: "پرداخت از طریق درگاه بانکی",
            enabled: true,
            order: 1,
          },
          {
            id: "cod",
            title: "پرداخت در محل",
            description: "پرداخت هنگام دریافت کالا",
            enabled: true,
            order: 2,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      data: methods,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Get payment methods API error:", errorMessage);

    // Return default methods on error
    return NextResponse.json({
      success: true,
      data: [
        {
          id: "bacs",
          title: "پرداخت آنلاین",
          description: "پرداخت از طریق درگاه بانکی",
          enabled: true,
          order: 1,
        },
        {
          id: "cod",
          title: "پرداخت در محل",
          description: "پرداخت هنگام دریافت کالا",
          enabled: true,
          order: 2,
        },
      ],
    });
  }
}




