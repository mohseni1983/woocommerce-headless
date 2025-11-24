import Link from "next/link";
import {
  ArrowRight,
  Package,
  MapPin,
  Phone,
  Calendar,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

interface OrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  id: string | number;
  date: string;
  status: string;
  total: number;
  shipping: number;
  discount: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
  };
  trackingNumber?: string;
  paymentMethod?: string;
}

// Fetch order from API
async function getOrderDetails(
  id: string,
  cookies?: string
): Promise<OrderDetails | null> {
  try {
    console.log("[DEBUG] getOrderDetails called with ID:", id);

    // Use server-side fetch with cookies
    // In Next.js server components, we can use relative URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const apiUrl = `${baseUrl}/api/orders/${id}`;

    console.log("[DEBUG] Fetching from:", apiUrl);
    console.log("[DEBUG] Cookies provided:", cookies ? "yes" : "no");

    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: cookies
        ? {
            Cookie: cookies,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          },
    });

    console.log("[DEBUG] Response status:", response.status);
    console.log("[DEBUG] Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEBUG] API error response:", response.status, errorText);

      if (response.status === 404) {
        console.log("[DEBUG] Order not found (404)");
        return null;
      }
      throw new Error(
        `Failed to fetch order: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("[DEBUG] API response data:", data);

    if (!data.success || !data.data) {
      console.log("[DEBUG] API response indicates failure or no data");
      return null;
    }

    const order = data.data;

    // Format order data
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(date);
      } catch {
        return dateString;
      }
    };

    const getStatusLabel = (status: string) => {
      const statusMap: Record<string, string> = {
        pending: "در انتظار پرداخت",
        processing: "در حال پردازش",
        on_hold: "در انتظار",
        completed: "تکمیل شده",
        cancelled: "لغو شده",
        refunded: "بازگشت وجه",
        failed: "ناموفق",
      };
      return statusMap[status] || status;
    };

    // Format line items
    const items: OrderItem[] = (order.line_items || []).map(
      (item: {
        id: number;
        name: string;
        quantity: number;
        total: string;
        image?: { src: string };
      }) => ({
        id: item.id,
        name: item.name,
        image: item.image?.src || "/placeholder-product.svg",
        quantity: item.quantity,
        price: parseFloat(item.total || "0"),
      })
    );

    return {
      id: order.id,
      date: formatDate(order.date_created || order.date_created_gmt || ""),
      status: getStatusLabel(order.status || "pending"),
      total: parseFloat(order.total || "0"),
      shipping: parseFloat(order.shipping_total || "0"),
      discount: parseFloat(order.discount_total || "0"),
      items,
      shippingAddress: {
        name:
          `${order.shipping?.first_name || ""} ${
            order.shipping?.last_name || ""
          }`.trim() || "نامشخص",
        address: order.shipping?.address_1 || "",
        city: order.shipping?.city || "",
        postalCode: order.shipping?.postcode || "",
        phone: order.shipping?.phone || order.billing?.phone || "",
      },
      billingAddress: order.billing
        ? {
            name:
              `${order.billing.first_name || ""} ${
                order.billing.last_name || ""
              }`.trim() || "نامشخص",
            address: order.billing.address_1 || "",
            city: order.billing.city || "",
            postalCode: order.billing.postcode || "",
            phone: order.billing.phone || "",
            email: order.billing.email || "",
          }
        : undefined,
      trackingNumber: order.meta_data?.find(
        (m: { key: string; value: string }) => m.key === "_tracking_number"
      )?.value,
      paymentMethod: order.payment_method_title || order.payment_method || "",
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get cookies from headers for server-side fetch
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const order = await getOrderDetails(id, cookieHeader);

  if (!order) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowRight size={20} />
          <span>بازگشت به سفارش‌ها</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          جزئیات سفارش {order.id}
        </h1>
        <p className="text-gray-600">اطلاعات کامل سفارش شما</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              محصولات سفارش
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      تعداد: {item.quantity}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={24} />
              <span>آدرس ارسال</span>
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              {order.shippingAddress.address && (
                <p>{order.shippingAddress.address}</p>
              )}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.postalCode &&
                  `، کد پستی: ${order.shippingAddress.postalCode}`}
              </p>
              {order.shippingAddress.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={16} />
                  {order.shippingAddress.phone}
                </p>
              )}
            </div>
          </div>

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={24} />
                <span>آدرس صورتحساب</span>
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">{order.billingAddress.name}</p>
                {order.billingAddress.address && (
                  <p>{order.billingAddress.address}</p>
                )}
                <p>
                  {order.billingAddress.city}
                  {order.billingAddress.postalCode &&
                    `، کد پستی: ${order.billingAddress.postalCode}`}
                </p>
                {order.billingAddress.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={16} />
                    {order.billingAddress.phone}
                  </p>
                )}
                {order.billingAddress.email && (
                  <p className="text-sm text-gray-600">
                    {order.billingAddress.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={24} />
                <span>پیگیری ارسال</span>
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">کد پیگیری</p>
                <p className="font-mono text-lg font-bold text-blue-600">
                  {order.trackingNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              خلاصه سفارش
            </h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-gray-700">
                <span>تعداد محصولات:</span>
                <span className="font-semibold">{order.items.length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>تخفیف:</span>
                <span className="font-semibold text-green-600">
                  -{formatPrice(order.discount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>هزینه ارسال:</span>
                <span className="font-semibold">
                  {formatPrice(order.shipping)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">جمع کل:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>تاریخ سفارش: {order.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package size={16} />
                <span>وضعیت: {order.status}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>روش پرداخت: {order.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
