import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-500">
      <div className="text-center animate-fade-in-up px-6 max-w-xl">
        <h1 className="text-5xl font-extrabold text-indigo-700 dark:text-white mb-4 drop-shadow-lg">
          🚐 Shuttle Bus System
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          ระบบจองรถรับส่งสำหรับนักศึกษาและเจ้าหน้าที่ MUT
          <br />
          สะดวก รวดเร็ว ปลอดภัย พร้อม QR Check-in
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition transform hover:scale-105"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg shadow hover:bg-indigo-50 transition transform hover:scale-105"
          >
            สมัครสมาชิก
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Shuttle Bus System | MUT 🚍
        </p>
      </div>
    </div>
  );
}
