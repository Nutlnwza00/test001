import { useState, useEffect } from "react";
import api from "../services/api";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await api.get("/api/employees");
        const list = Array.isArray(res.data) ? res.data : [];
        console.log("📦 Raw response:", res.data);
        console.log("👥 Employees list:", list);
        setEmployees(list);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลพนักงาน");
        } else if (err.response?.status === 401) {
          setError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        } else {
          setError("ไม่สามารถโหลดข้อมูลพนักงานได้");
        }
        console.error("❌ Error loading employees:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">จัดการพนักงาน</h1>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ชื่อผู้ใช้</th>
            <th className="p-2 text-left">ตำแหน่ง</th>
            <th className="p-2 text-left">สถานะ</th>
            <th className="p-2 text-left">การจัดการ</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp, index) => {
            console.log("🔍 Rendering employee:", emp);
            return (
              <tr key={`emp-${emp.id ?? index}`} className="border-t">
                <td className="p-2">{emp.username ?? "ไม่ระบุ"}</td>
                <td className="p-2">{emp.position ?? "ไม่ระบุ"}</td>
                <td className="p-2">
                  {emp.status?.toLowerCase() === "active" || emp.active === 1
                    ? "✅ Active"
                    : "❌ Inactive"}
                </td>
                <td className="p-2">
                  <button className="text-blue-600 hover:underline">
                    แก้ไขข้อมูล
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Debug UI */}
      <pre className="text-xs bg-gray-100 p-2 rounded mt-6">
        {JSON.stringify(employees, null, 2)}
      </pre>
    </div>
  );
}
