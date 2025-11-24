import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, updateCustomer } from "@/lib/woocommerce-customers";
import { getCurrentUser } from "@/lib/wordpress-auth";

/**
 * GET /api/addresses - Get customer addresses (billing and shipping)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;

    if (!userId && !jwtToken && !userDataCookie) {
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    // Get user
    let user = null;
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
      } catch {
        // Continue to fetch user
      }
    }

    if (!user) {
      const cookie = request.headers.get("cookie") || "";
      user = await getCurrentUser(cookie, jwtToken || undefined);
    }

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get WooCommerce customer
    const customer = await getCustomerByEmail(user.email);

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: {
          billing: null,
          shipping: null,
        },
      });
    }

    // Format addresses
    const addresses = {
      billing: customer.billing
        ? {
            first_name: customer.billing.first_name || "",
            last_name: customer.billing.last_name || "",
            company: customer.billing.company || "",
            address_1: customer.billing.address_1 || "",
            address_2: customer.billing.address_2 || "",
            city: customer.billing.city || "",
            state: customer.billing.state || "",
            postcode: customer.billing.postcode || "",
            country: customer.billing.country || "IR",
            email: customer.billing.email || customer.email,
            phone: customer.billing.phone || "",
          }
        : null,
      shipping: customer.shipping
        ? {
            first_name: customer.shipping.first_name || "",
            last_name: customer.shipping.last_name || "",
            company: customer.shipping.company || "",
            address_1: customer.shipping.address_1 || "",
            address_2: customer.shipping.address_2 || "",
            city: customer.shipping.city || "",
            state: customer.shipping.state || "",
            postcode: customer.shipping.postcode || "",
            country: customer.shipping.country || "IR",
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Get addresses API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در دریافت آدرس‌ها",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/addresses - Update customer addresses
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.cookies.get("wp_user_id")?.value;
    const jwtToken = request.cookies.get("jwt_token")?.value;
    const userDataCookie = request.cookies.get("wp_user_data")?.value;

    if (!userId && !jwtToken && !userDataCookie) {
      return NextResponse.json(
        { success: false, error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, address } = body; // type: 'billing' or 'shipping'

    if (!type || !address) {
      return NextResponse.json(
        { success: false, error: "نوع آدرس و اطلاعات آدرس الزامی است" },
        { status: 400 }
      );
    }

    if (type !== "billing" && type !== "shipping") {
      return NextResponse.json(
        { success: false, error: "نوع آدرس باید billing یا shipping باشد" },
        { status: 400 }
      );
    }

    // Get user
    let user = null;
    if (userDataCookie) {
      try {
        user = JSON.parse(userDataCookie);
      } catch {
        // Continue to fetch user
      }
    }

    if (!user) {
      const cookie = request.headers.get("cookie") || "";
      user = await getCurrentUser(cookie, jwtToken || undefined);
    }

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get WooCommerce customer
    const customer = await getCustomerByEmail(user.email);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "CUSTOMER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Update customer address
    const updateData: any = {};
    updateData[type] = {
      first_name: address.first_name || "",
      last_name: address.last_name || "",
      company: address.company || "",
      address_1: address.address_1 || "",
      address_2: address.address_2 || "",
      city: address.city || "",
      state: address.state || "",
      postcode: address.postcode || "",
      country: address.country || "IR",
    };

    // For billing, also include email and phone
    if (type === "billing") {
      updateData.billing.email = address.email || customer.email;
      updateData.billing.phone = address.phone || "";
    }

    const updatedCustomer = await updateCustomer(customer.id, updateData);

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, error: "UPDATE_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        billing: updatedCustomer.billing,
        shipping: updatedCustomer.shipping,
      },
      message: "آدرس با موفقیت به‌روزرسانی شد",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Update address API error:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "خطا در به‌روزرسانی آدرس",
      },
      { status: 500 }
    );
  }
}

