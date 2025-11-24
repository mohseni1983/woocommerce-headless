"use client";

import { useState } from "react";
import { Bell, Lock, Globe, Moon, Sun, Shield, Mail } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    darkMode: false,
    language: "fa",
    twoFactorAuth: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظیمات حساب کاربری</h1>
        <p className="text-gray-600">مدیریت تنظیمات و ترجیحات شما</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">اعلان‌ها</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">اعلان‌های ایمیل</p>
                <p className="text-sm text-gray-600">
                  دریافت اعلان‌ها از طریق ایمیل
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle("emailNotifications")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">اعلان‌های پیامکی</p>
                <p className="text-sm text-gray-600">
                  دریافت اعلان‌ها از طریق پیامک
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle("smsNotifications")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">به‌روزرسانی سفارش‌ها</p>
                <p className="text-sm text-gray-600">
                  اطلاع از تغییرات وضعیت سفارش
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.orderUpdates}
                  onChange={() => handleToggle("orderUpdates")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">پیشنهادات و تخفیف‌ها</p>
                <p className="text-sm text-gray-600">
                  دریافت پیشنهادات ویژه و کدهای تخفیف
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promotions}
                  onChange={() => handleToggle("promotions")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">امنیت</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">احراز هویت دو مرحله‌ای</p>
                <p className="text-sm text-gray-600">
                  افزایش امنیت حساب کاربری شما
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle("twoFactorAuth")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">تغییر رمز عبور</span>
              </div>
              <span className="text-blue-600">تغییر</span>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">ترجیحات</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                زبان
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.darkMode ? (
                  <Moon size={20} className="text-gray-600" />
                ) : (
                  <Sun size={20} className="text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">حالت تاریک</p>
                  <p className="text-sm text-gray-600">استفاده از تم تاریک</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() => handleToggle("darkMode")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">عضویت در خبرنامه</p>
                  <p className="text-sm text-gray-600">
                    دریافت آخرین اخبار و به‌روزرسانی‌ها
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={() => handleToggle("newsletter")}
                  className="sr-only peer"
                  dir="rtl"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            ذخیره تنظیمات
          </button>
        </div>
      </div>
    </div>
  );
}

