import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api.get("/api/admin/summary").then((res) => setSummary(res.data));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 สรุปภาพรวมระบบ Shuttle Bus</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-indigo-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">จำนวนการจองวันนี้</h2>
          <p className="text-2xl">{summary.todayBookings}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">จำนวน No Show วันนี้</h2>
          <p className="text-2xl">{summary.todayNoShow}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">รอบที่เต็มแล้ว</h2>
          <p className="text-2xl">{summary.fullRounds}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">จำนวนผู้ใช้ทั้งหมด</h2>
          <p className="text-2xl">{summary.totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
