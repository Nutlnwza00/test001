import { useState } from "react";
import toast from "react-hot-toast";

function RoleEditor({ user, roles, onConfirm }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleClick = async () => {
    setStatus("loading");
    try {
      await onConfirm(user.id, selectedRole);
      setStatus("success");
      toast.success(`เปลี่ยนสิทธิ์ของ ${user.username} เป็น ${selectedRole} แล้ว`);
    } catch (err) {
      setStatus("error");
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์");
    } finally {
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {roles.map((role) => (
          <option key={role.ROLE_ID} value={role.ROLE_NAME}>
            {role.ROLE_NAME}
          </option>
        ))}
      </select>

      <button
        onClick={handleClick}
        disabled={selectedRole === user.role || status === "loading"}
        className={`px-3 py-1 rounded text-white transition ${
          selectedRole === user.role || status === "loading"
            ? "bg-gray-400 cursor-not-allowed"
            : status === "success"
            ? "bg-green-600"
            : status === "error"
            ? "bg-red-600"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {status === "loading"
          ? "⏳ กำลังเปลี่ยน..."
          : status === "success"
          ? "✅ สำเร็จ"
          : status === "error"
          ? "❌ ล้มเหลว"
          : "ตกลง"}
      </button>
    </div>
  );
}