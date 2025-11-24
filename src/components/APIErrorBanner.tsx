"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function APIErrorBanner() {
  return (
    <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 mb-6 rounded-lg">
      <div className="flex items-start space-x-3 space-x-reverse">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            خطا در اتصال به WooCommerce
          </h3>
          <p className="text-sm text-yellow-700 mb-2">
            متأسفانه نمی‌توانیم به فروشگاه متصل شویم. لطفاً تنظیمات API را بررسی کنید.
          </p>
          <div className="text-xs text-yellow-600 space-y-1">
            <p>• بررسی کنید که کلیدهای API دارای مجوز "Read" باشند</p>
            <p>• به WordPress Admin → WooCommerce → Settings → Advanced → REST API بروید</p>
            <p>
              • برای راهنمای کامل، فایل{" "}
              <Link href="/" className="underline font-semibold">
                FIX_API_401.md
              </Link>{" "}
              را مطالعه کنید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


