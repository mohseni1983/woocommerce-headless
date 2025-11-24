"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  MapPin,
  CreditCard,
  Plus,
  Check,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface ShippingMethod {
  id: string;
  title: string;
  description: string;
  cost: number;
  zone_id: number;
  zone_name: string;
}

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface Country {
  code: string;
  name: string;
  states: Array<{ code: string; name: string }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, loading: cartLoading } = useCart();
  const { user, customer } = useAuth();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Countries and states
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("IR");
  const [selectedState, setSelectedState] = useState<string>("");
  const [availableStates, setAvailableStates] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Address management
  const [addresses, setAddresses] = useState<{
    billing: any;
    shipping: any;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<
    "billing" | "shipping" | "new" | null
  >(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Form data - Initialize with user data
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || user?.first_name || "",
    last_name: customer?.last_name || user?.last_name || "",
    email: customer?.email || user?.email || "",
    phone: customer?.billing?.phone || "",
    address_1:
      customer?.billing?.address_1 || customer?.shipping?.address_1 || "",
    address_2:
      customer?.billing?.address_2 || customer?.shipping?.address_2 || "",
    city: customer?.billing?.city || customer?.shipping?.city || "",
    state: customer?.billing?.state || customer?.shipping?.state || "",
    postcode: customer?.billing?.postcode || customer?.shipping?.postcode || "",
    country: customer?.billing?.country || customer?.shipping?.country || "IR",
  });

  // Update form data when user/customer changes
  useEffect(() => {
    if (user || customer) {
      setFormData({
        first_name: customer?.first_name || user?.first_name || "",
        last_name: customer?.last_name || user?.last_name || "",
        email: customer?.email || user?.email || "",
        phone: customer?.billing?.phone || "",
        address_1:
          customer?.billing?.address_1 || customer?.shipping?.address_1 || "",
        address_2:
          customer?.billing?.address_2 || customer?.shipping?.address_2 || "",
        city: customer?.billing?.city || customer?.shipping?.city || "",
        state: customer?.billing?.state || customer?.shipping?.state || "",
        postcode:
          customer?.billing?.postcode || customer?.shipping?.postcode || "",
        country:
          customer?.billing?.country || customer?.shipping?.country || "IR",
      });
    }
  }, [user, customer]);

  useEffect(() => {
    if (items.length === 0 && !cartLoading) {
      router.push("/cart");
      return;
    }

    fetchCountries();
    fetchPaymentMethods();
    if (user) {
      fetchAddresses();
    }
  }, [items, cartLoading, user]);

  // Fetch shipping methods when country/state changes
  useEffect(() => {
    if (selectedCountry) {
      fetchShippingMethods(selectedCountry, selectedState);
    }
  }, [selectedCountry, selectedState]);

  // Update available states when country changes
  useEffect(() => {
    const country = countries.find((c) => c.code === selectedCountry);
    if (country) {
      setAvailableStates(country.states || []);
      // Reset state if current state is not available in new country
      if (
        selectedState &&
        country.states.length > 0 &&
        !country.states.find((s) => s.code === selectedState)
      ) {
        setSelectedState("");
        setFormData((prev) => ({ ...prev, state: "" }));
      }
    }
  }, [selectedCountry, countries, selectedState]);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await fetch("/api/countries", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setCountries(data.data);
          // Set default country
          const defaultCountry =
            data.data.find((c: Country) => c.code === "IR") || data.data[0];
          if (defaultCountry) {
            setSelectedCountry(defaultCountry.code);
            setAvailableStates(defaultCountry.states || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoadingCountries(false);
      setLoading(false);
    }
  };

  const fetchShippingMethods = async (country?: string, state?: string) => {
    try {
      const params = new URLSearchParams();
      if (country) params.append("country", country);
      if (state) params.append("state", state);

      const response = await fetch(
        `/api/shipping-methods?${params.toString()}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setShippingMethods(data.data);
          setSelectedShipping(data.data[0].id);
        } else {
          setShippingMethods([]);
          setSelectedShipping("");
        }
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment-methods", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setPaymentMethods(data.data);
          setSelectedPayment(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await fetch("/api/addresses", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAddresses(data.data);
          // Auto-select billing address if available
          if (data.data.billing && data.data.billing.address_1) {
            setSelectedAddress("billing");
            applyAddressToForm(data.data.billing, "billing");
          } else if (data.data.shipping && data.data.shipping.address_1) {
            setSelectedAddress("shipping");
            applyAddressToForm(data.data.shipping, "shipping");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const applyAddressToForm = (address: any, type: "billing" | "shipping") => {
    const countryCode = address.country || "IR";
    const stateCode = address.state || "";

    setSelectedCountry(countryCode);
    setSelectedState(stateCode);

    setFormData({
      first_name:
        address.first_name ||
        formData.first_name ||
        customer?.first_name ||
        user?.first_name ||
        "",
      last_name:
        address.last_name ||
        formData.last_name ||
        customer?.last_name ||
        user?.last_name ||
        "",
      email:
        address.email || formData.email || customer?.email || user?.email || "",
      phone: address.phone || formData.phone || "",
      address_1: address.address_1 || "",
      address_2: address.address_2 || "",
      city: address.city || "",
      state: stateCode,
      postcode: address.postcode || "",
      country: countryCode,
    });
  };

  const handleSelectAddress = (type: "billing" | "shipping") => {
    setSelectedAddress(type);
    setShowNewAddressForm(false);
    if (addresses && addresses[type]) {
      applyAddressToForm(addresses[type], type);
    }
  };

  const handleNewAddress = () => {
    setSelectedAddress("new");
    setShowNewAddressForm(true);
    // Reset form to user defaults but keep name fields
    setFormData({
      ...formData,
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      phone: "",
    });
  };

  const getShippingCost = (): number => {
    const method = shippingMethods.find((m) => m.id === selectedShipping);
    return method?.cost || 0;
  };

  const getTotalWithShipping = (): number => {
    return getTotal() + getShippingCost();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation
    if (!formData.first_name || !formData.last_name) {
      setError("نام و نام خانوادگی الزامی است");
      setSubmitting(false);
      return;
    }

    if (!formData.phone) {
      setError("شماره تماس الزامی است");
      setSubmitting(false);
      return;
    }

    if (!formData.address_1 || !formData.city) {
      setError("آدرس و شهر الزامی است");
      setSubmitting(false);
      return;
    }

    if (!selectedShipping) {
      setError("لطفا روش ارسال را انتخاب کنید");
      setSubmitting(false);
      return;
    }

    if (!selectedPayment) {
      setError("لطفا روش پرداخت را انتخاب کنید");
      setSubmitting(false);
      return;
    }

    try {
      // Create order
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          line_items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          shipping: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            address_1: formData.address_1,
            address_2: formData.address_2,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
          },
          billing: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            address_1: formData.address_1,
            address_2: formData.address_2,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
          },
          shipping_method: selectedShipping,
          payment_method: selectedPayment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to order confirmation or payment
        if (selectedPayment === "cod") {
          router.push(`/account/orders/${data.data.id}`);
        } else {
          // Redirect to payment gateway
          router.push(`/payment/${data.data.id}`);
        }
      } else {
        setError(data.message || "خطا در ثبت سفارش");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("خطا در ثبت سفارش. لطفا دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">تکمیل خرید</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Selection */}
              {user && addresses && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin size={24} className="text-blue-600" />
                    انتخاب آدرس
                  </h2>

                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={24}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Billing Address */}
                      {addresses.billing && addresses.billing.address_1 && (
                        <button
                          type="button"
                          onClick={() => handleSelectAddress("billing")}
                          className={`w-full text-right p-4 border-2 rounded-xl transition-colors ${
                            selectedAddress === "billing"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">
                                  آدرس صورتحساب
                                </span>
                                {selectedAddress === "billing" && (
                                  <Check size={18} className="text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {addresses.billing.first_name}{" "}
                                {addresses.billing.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addresses.billing.address_1}
                                {addresses.billing.address_2 &&
                                  `، ${addresses.billing.address_2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addresses.billing.city}
                                {addresses.billing.state &&
                                  `، ${addresses.billing.state}`}
                                {addresses.billing.postcode &&
                                  ` - ${addresses.billing.postcode}`}
                              </p>
                              {addresses.billing.phone && (
                                <p className="text-sm text-gray-600 mt-1">
                                  تلفن: {addresses.billing.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Shipping Address */}
                      {addresses.shipping && addresses.shipping.address_1 && (
                        <button
                          type="button"
                          onClick={() => handleSelectAddress("shipping")}
                          className={`w-full text-right p-4 border-2 rounded-xl transition-colors ${
                            selectedAddress === "shipping"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">
                                  آدرس ارسال
                                </span>
                                {selectedAddress === "shipping" && (
                                  <Check size={18} className="text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {addresses.shipping.first_name}{" "}
                                {addresses.shipping.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addresses.shipping.address_1}
                                {addresses.shipping.address_2 &&
                                  `، ${addresses.shipping.address_2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addresses.shipping.city}
                                {addresses.shipping.state &&
                                  `، ${addresses.shipping.state}`}
                                {addresses.shipping.postcode &&
                                  ` - ${addresses.shipping.postcode}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Add New Address Button */}
                      <button
                        type="button"
                        onClick={handleNewAddress}
                        className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${
                          selectedAddress === "new"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        <Plus size={20} className="text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          افزودن آدرس جدید
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping Information Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin size={24} className="text-blue-600" />
                  {showNewAddressForm || !selectedAddress || !user
                    ? "اطلاعات ارسال"
                    : "اطلاعات ارسال (ویرایش)"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        نام <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="نام"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        نام خانوادگی <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="نام خانوادگی"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        شماره تماس <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="09123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ایمیل
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      آدرس <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.address_1}
                      onChange={(e) =>
                        setFormData({ ...formData, address_1: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="آدرس کامل پستی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      آدرس تکمیلی
                    </label>
                    <input
                      type="text"
                      value={formData.address_2}
                      onChange={(e) =>
                        setFormData({ ...formData, address_2: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="واحد، طبقه، پلاک"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        کشور <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setFormData({ ...formData, country: e.target.value });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {availableStates.length > 0 ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          استان <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setFormData({ ...formData, state: e.target.value });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">انتخاب استان</option>
                          {availableStates.map((state) => (
                            <option key={state.code} value={state.code}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          استان
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="تهران"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        شهر <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="تهران"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      کد پستی
                    </label>
                    <input
                      type="text"
                      value={formData.postcode}
                      onChange={(e) =>
                        setFormData({ ...formData, postcode: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin size={24} className="text-blue-600" />
                  روش ارسال
                </h2>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedShipping === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="mt-1 ml-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{method.title}</span>
                          <span className="font-bold text-blue-600">
                            {method.cost === 0
                              ? "رایگان"
                              : formatPrice(method.cost)}
                          </span>
                        </div>
                        {method.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {method.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard size={24} className="text-blue-600" />
                  روش پرداخت
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedPayment === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="mt-1 ml-3"
                      />
                      <div className="flex-1">
                        <span className="font-semibold">{method.title}</span>
                        {method.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {method.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6">خلاصه سفارش</h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder-product.svg"}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} ×{" "}
                          {formatPrice(
                            parseFloat(item.sale_price || item.price)
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">جمع کل</span>
                    <span className="font-semibold">
                      {formatPrice(getTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">هزینه ارسال</span>
                    <span className="font-semibold">
                      {formatPrice(getShippingCost())}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-lg font-bold">مجموع</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(getTotalWithShipping())}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>در حال پردازش...</span>
                    </>
                  ) : (
                    <>
                      <span>تایید و پرداخت</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                <Link
                  href="/cart"
                  className="block text-center text-blue-600 hover:text-blue-700 mt-4 font-semibold"
                >
                  بازگشت به سبد خرید
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
