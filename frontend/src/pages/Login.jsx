import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/api/users/login", { username, password });
      const { token, user } = res.data;

      console.log("✅ Login success:", res.data);
      console.log("USER FROM BACKEND:", user);
      console.log("user =", user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log(
        "🔀 Redirecting to:",
        user.permissions?.includes("VIEW_ADMIN_DASHBOARD")
          ? "admin-dashboard"
          : "dashboard"
      );

      if (user.permissions?.includes("VIEW_ADMIN_DASHBOARD")) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err);
      setError(err.response?.data?.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-500">
      <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 dark:text-white mb-6 tracking-wide">
          🚐 Shuttle Bus Login
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition transform hover:scale-105"
          >
            เข้าสู่ระบบ
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Shuttle Bus System | MUT 🚍
        </p>
      </div>
    </div>
  );
}
