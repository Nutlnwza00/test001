import { useEffect, useState } from "react";
import axios from "axios";

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/schedules")
      .then((res) => {
        console.log("Schedule response:", res.data); // ✅ ตรวจว่าเป็น array
        setSchedules(res.data); // เพราะ res.data คือ result.rows
      })
      .catch((err) => {
        console.error("โหลดข้อมูลล้มเหลว:", err);
        setSchedules([]); // fallback
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">กำลังโหลดตารางเดินรถ...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📅 ตารางเดินรถ</h1>
      {Array.isArray(schedules) && schedules.length > 0 ? (
        <ul className="space-y-2">
          {schedules.map((s, i) => (
            <li key={i} className="p-3 bg-white rounded shadow">
              <div>📍 เส้นทาง: {s.ROUTE_NAME}</div>
              <div>🕘 เวลา: {s.TRIP_TIME}</div>
              <div>📅 วันที่: {s.TRIP_DATE}</div>
              <div>🚐 รถ: {s.VEHICLE_ID}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">ไม่มีข้อมูลตารางเดินรถ</p>
      )}
    </div>
  );
}
