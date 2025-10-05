// src/components/MainLayout.jsx
import { Link } from "react-router-dom";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-500 text-gray-800 dark:text-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-gray-800 dark:to-gray-700 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold text-white drop-shadow">
          🚐 Shuttle Bus System
        </div>
        <div className="space-x-4 text-sm text-white">
          
          <Link to="/login" className="hover:underline">
            ออกจากระบบ
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">{children}</main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
        © {new Date().getFullYear()} Shuttle Bus System | MUT 🚍
      </footer>
    </div>
  );
}
