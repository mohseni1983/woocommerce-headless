"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface WooCommerceAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface AddressFormData {
  title: string;
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email?: string;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [billingAddress, setBillingAddress] =
    useState<WooCommerceAddress | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<WooCommerceAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingType, setEditingType] = useState<"billing" | "shipping" | null>(
    null
  );
  const [formData, setFormData] = useState<AddressFormData>({
    title: "",
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IR",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch addresses from API
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/addresses", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBillingAddress(data.data.billing);
          setShippingAddress(data.data.shipping);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setError("خطا در دریافت آدرس‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: "billing" | "shipping") => {
    const address = type === "billing" ? billingAddress : shippingAddress;
    if (address) {
      setFormData({
        title: type === "billing" ? "آدرس صورتحساب" : "آدرس ارسال",
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        company: address.company || "",
        address_1: address.address_1 || "",
        address_2: address.address_2 || "",
        city: address.city || "",
        state: address.state || "",
        postcode: address.postcode || "",
        country: address.country || "IR",
        phone: address.phone || "",
        email: address.email || user?.email || "",
      });
      setEditingType(type);
      setIsAdding(false);
    }
  };

  const handleAdd = (type: "billing" | "shipping") => {
    setFormData({
      title: type === "billing" ? "آدرس صورتحساب" : "آدرس ارسال",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "IR",
      phone: "",
      email: user?.email || "",
    });
    setEditingType(type);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!editingType) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: editingType,
          address: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            company: formData.company,
            address_1: formData.address_1,
            address_2: formData.address_2,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
            phone: formData.phone,
            email: formData.email,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("آدرس با موفقیت ذخیره شد");
        setBillingAddress(data.data.billing);
        setShippingAddress(data.data.shipping);
        setIsAdding(false);
        setEditingType(null);
        setFormData({
          title: "",
          first_name: "",
          last_name: "",
          company: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "IR",
          phone: "",
          email: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "خطا در ذخیره آدرس");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError("خطا در ذخیره آدرس");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingType(null);
    setFormData({
      title: "",
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "IR",
      phone: "",
      email: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">آدرس‌های من</h1>
        <p className="text-gray-600">مدیریت آدرس‌های صورتحساب و ارسال</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingType) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-blue-50 rounded-xl border-2 border-blue-200 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isAdding
                ? `افزودن ${
                    editingType === "billing" ? "آدرس صورتحساب" : "آدرس ارسال"
                  }`
                : `ویرایش ${
                    editingType === "billing" ? "آدرس صورتحساب" : "آدرس ارسال"
                  }`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="نام"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="نام خانوادگی"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="نام شرکت (اختیاری)"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="آدرس خیابان"
                value={formData.address_1}
                onChange={(e) =>
                  setFormData({ ...formData, address_1: e.target.value })
                }
                rows={2}
                className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="آدرس تکمیلی (اختیاری)"
                value={formData.address_2}
                onChange={(e) =>
                  setFormData({ ...formData, address_2: e.target.value })
                }
                rows={2}
                className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="شهر"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="استان"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="کد پستی"
                value={formData.postcode}
                onChange={(e) =>
                  setFormData({ ...formData, postcode: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="کشور"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="شماره تماس"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {editingType === "billing" && (
                <input
                  type="email"
                  placeholder="ایمیل"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={18} />}
                <span>ذخیره آدرس</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Addresses Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 rounded-xl p-6 ${
            billingAddress
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={24} className="text-blue-600" />
              آدرس صورتحساب
            </h3>
            {!isAdding && editingType !== "billing" && (
              <button
                onClick={() =>
                  billingAddress ? handleEdit("billing") : handleAdd("billing")
                }
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                {billingAddress ? <Edit2 size={16} /> : <Plus size={16} />}
                <span>{billingAddress ? "ویرایش" : "افزودن"}</span>
              </button>
            )}
          </div>

          {billingAddress ? (
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>
                  {billingAddress.first_name} {billingAddress.last_name}
                </strong>
              </p>
              {billingAddress.company && <p>{billingAddress.company}</p>}
              <p>{billingAddress.address_1}</p>
              {billingAddress.address_2 && <p>{billingAddress.address_2}</p>}
              <p>
                {billingAddress.city}
                {billingAddress.state && `، ${billingAddress.state}`}
                {billingAddress.postcode &&
                  `، کد پستی: ${billingAddress.postcode}`}
              </p>
              <p>{billingAddress.country}</p>
              {billingAddress.phone && <p>تلفن: {billingAddress.phone}</p>}
              {billingAddress.email && <p>ایمیل: {billingAddress.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500">آدرس صورتحساب ثبت نشده است</p>
          )}
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 rounded-xl p-6 ${
            shippingAddress
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={24} className="text-green-600" />
              آدرس ارسال
            </h3>
            {!isAdding && editingType !== "shipping" && (
              <button
                onClick={() =>
                  shippingAddress
                    ? handleEdit("shipping")
                    : handleAdd("shipping")
                }
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
              >
                {shippingAddress ? <Edit2 size={16} /> : <Plus size={16} />}
                <span>{shippingAddress ? "ویرایش" : "افزودن"}</span>
              </button>
            )}
          </div>

          {shippingAddress ? (
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>
                  {shippingAddress.first_name} {shippingAddress.last_name}
                </strong>
              </p>
              {shippingAddress.company && <p>{shippingAddress.company}</p>}
              <p>{shippingAddress.address_1}</p>
              {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
              <p>
                {shippingAddress.city}
                {shippingAddress.state && `، ${shippingAddress.state}`}
                {shippingAddress.postcode &&
                  `، کد پستی: ${shippingAddress.postcode}`}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p>تلفن: {shippingAddress.phone}</p>}
            </div>
          ) : (
            <p className="text-gray-500">آدرس ارسال ثبت نشده است</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
