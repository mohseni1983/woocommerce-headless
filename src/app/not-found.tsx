import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          صفحه مورد نظر یافت نشد
        </h2>
        <p className="text-gray-600 mb-8">
          متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 space-x-reverse bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
        >
          <Home size={20} />
          <span>بازگشت به خانه</span>
        </Link>
      </div>
    </div>
  );
}


