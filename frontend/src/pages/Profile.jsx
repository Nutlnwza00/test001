import { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/api/users/profile").then((res) => setUser(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-200 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-white mb-6">
          👤 ข้อมูลผู้ใช้
        </h1>
        {user ? (
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              <strong>ชื่อ:</strong> {user.FULL_NAME}
            </p>
            <p>
              <strong>ชื่อผู้ใช้:</strong> {user.USERNAME}
            </p>
            <p>
              <strong>เบอร์โทร:</strong> {user.PHONE_NUMBER}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        )}
      </div>
    </div>
  );
}
