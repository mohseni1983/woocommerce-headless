"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Eye, Download, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  id: number;
  number: string;
  date_created: string;
  status: string;
  total: string;
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
  }>;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-orange-100 text-orange-800",
  "on_hold": "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  processing: "در حال پردازش",
  completed: "تکمیل شده",
  "on-hold": "در انتظار",
  "on_hold": "در انتظار",
  cancelled: "لغو شده",
  refunded: "بازگشت وجه",
  failed: "ناموفق",
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("[DEBUG] Fetching orders from /api/orders");
      
      const response = await fetch("/api/orders", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("[DEBUG] Orders API response status:", response.status);
      console.log("[DEBUG] Orders API response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("[DEBUG] Orders API response:", data);
        if (data.success) {
          const ordersData = data.data || [];
          console.log("[DEBUG] Orders data:", ordersData);
          setOrders(ordersData);
        } else {
          console.error("[DEBUG] Orders API error:", data.error, data.message);
          setOrders([]);
        }
      } else {
        const errorData = await response.json().catch(() => {
          const text = response.text().catch(() => "");
          return { message: `HTTP ${response.status}`, text };
        });
        console.error("[DEBUG] Orders API failed:", response.status, errorData);
        
        // Show user-friendly error message
        if (response.status === 401) {
          console.error("[DEBUG] User not authenticated");
        } else if (response.status === 404) {
          console.error("[DEBUG] User or customer not found");
        }
        
        setOrders([]);
      }
    } catch (error) {
      console.error("[DEBUG] Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("fa-IR").format(numPrice) + " تومان";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getTrackingNumber = (order: Order) => {
    const trackingMeta = order.meta_data?.find(
      (meta) => meta.key === "_tracking_number" || meta.key === "tracking_number"
    );
    return trackingMeta?.value;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سفارش‌های من</h1>
        <p className="text-gray-600">تاریخچه تمام سفارش‌های شما</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
        {[
          { value: "all", label: "همه" },
          { value: "pending", label: "در انتظار" },
          { value: "processing", label: "در حال پردازش" },
          { value: "completed", label: "تکمیل شده" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            سفارشی یافت نشد
          </h3>
          <p className="text-gray-600 mb-6">
            شما هنوز سفارشی ثبت نکرده‌اید
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Package size={20} className="text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        #{order.number || order.id}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>تاریخ: {formatDate(order.date_created)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={16} />
                      <span>{order.line_items?.length || 0} محصول</span>
                    </div>
                    {getTrackingNumber(order) && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>کد پیگیری: {getTrackingNumber(order)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                  <div className="text-left md:text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} />
                      <span>مشاهده جزئیات</span>
                    </Link>
                    {order.status === "completed" && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download size={16} />
                        <span>فاکتور</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

