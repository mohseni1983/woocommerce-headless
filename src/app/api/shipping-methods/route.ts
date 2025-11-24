import { NextRequest, NextResponse } from "next/server";
import { fetchWooCommerce } from "@/lib/woocommerce";

/**
 * GET /api/shipping-methods - Get available shipping methods
 * Query params: country, state (optional) - to filter methods by location
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get("country");
    const state = searchParams.get("state");

    // Get shipping zones and methods from WooCommerce
    const shippingZones = await fetchWooCommerce("shipping/zones");

    const methods: Array<{
      id: string;
      title: string;
      description: string;
      cost: number;
      zone_id: number;
      zone_name: string;
    }> = [];

    // Fetch methods for each zone
    for (const zone of shippingZones || []) {
      // Check if zone matches the selected country/state
      let zoneMatches = true;

      if (country) {
        // Check if zone locations match the selected country
        const zoneLocations = zone.locations || [];
        const matchesCountry = zoneLocations.some((loc: any) => {
          const locCode = loc.code || "";
          const locCountry = locCode.split(":")[0];
          return locCountry === country;
        });

        // If state is provided, also check state match
        if (state && matchesCountry) {
          const matchesState = zoneLocations.some((loc: any) => {
            const locCode = loc.code || "";
            return locCode === `${country}:${state}` || locCode === country;
          });
          zoneMatches = matchesState;
        } else {
          zoneMatches = matchesCountry;
        }
      }

      // Only fetch methods for matching zones
      if (zoneMatches) {
        const zoneMethods = await fetchWooCommerce(
          `shipping/zones/${zone.id}/methods`
        );

        if (zoneMethods && Array.isArray(zoneMethods)) {
          for (const method of zoneMethods) {
            methods.push({
              id: `${zone.id}_${method.id}`,
              title: method.title || method.method_title || "ارسال استاندارد",
              description: method.description || "",
              cost: parseFloat(method.settings?.cost?.value || "0"),
              zone_id: zone.id,
              zone_name: zone.name || "ایران",
            });
          }
        }
      }
    }

    // If no methods found, return default methods
    if (methods.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "free_shipping",
            title: "ارسال رایگان",
            description: "ارسال رایگان برای سفارش‌های بالای 500,000 تومان",
            cost: 0,
            zone_id: 0,
            zone_name: "ایران",
          },
          {
            id: "flat_rate",
            title: "ارسال استاندارد",
            description: "ارسال در 2-3 روز کاری",
            cost: 25000,
            zone_id: 0,
            zone_name: "ایران",
          },
          {
            id: "express",
            title: "ارسال سریع",
            description: "ارسال در 24 ساعت",
            cost: 50000,
            zone_id: 0,
            zone_name: "ایران",
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
    console.error("Get shipping methods API error:", errorMessage);

    // Return default methods on error
    return NextResponse.json({
      success: true,
      data: [
        {
          id: "free_shipping",
          title: "ارسال رایگان",
          description: "ارسال رایگان برای سفارش‌های بالای 500,000 تومان",
          cost: 0,
          zone_id: 0,
          zone_name: "ایران",
        },
        {
          id: "flat_rate",
          title: "ارسال استاندارد",
          description: "ارسال در 2-3 روز کاری",
          cost: 25000,
          zone_id: 0,
          zone_name: "ایران",
        },
        {
          id: "express",
          title: "ارسال سریع",
          description: "ارسال در 24 ساعت",
          cost: 50000,
          zone_id: 0,
          zone_name: "ایران",
        },
      ],
    });
  }
}
