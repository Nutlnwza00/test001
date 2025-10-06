import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  if (!user) return <div className="p-6">กำลังโหลด...</div>;

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">สวัสดีคุณ {user.fullname}</h1>
        <p className="mb-4">สถานะ: {user.role}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card title="จองรถ" icon="🚌" onClick={() => navigate("/booking")} />
          <Card
            title="ตารางเดินรถ"
            icon="📅"
            onClick={() => navigate("/schedule")}
          />
          <Card
            title="เช็คอิน"
            icon="✅"
            onClick={() => navigate("/checkin")}
          />
          <Card
            title="ข้อมูลผู้ใช้"
            icon="👤"
            onClick={() => navigate("/profile")}
          />
          {user.role?.toLowerCase() === "admin" && (
            <>
              <Card
                title="จัดการรอบรถ"
                icon="🕘"
                onClick={() => navigate("/rounds")}
              />
              <Card
                title="รายงาน"
                icon="📊"
                onClick={() => navigate("/reports")}
              />
              <Card
                title="จัดการสิทธิ์ผู้ใช้"
                icon="🔐"
                onClick={() => navigate("/admin/permissions")}
              />
              <Card
                title="จัดการพนักงาน"
                icon="👥"
                onClick={() => navigate("/admin/employees")}
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function Card({ title, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 text-white py-6 rounded-lg shadow hover:bg-indigo-700 flex flex-col items-center justify-center"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div>{title}</div>
    </button>
  );
}
