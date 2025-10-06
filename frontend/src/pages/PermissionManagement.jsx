import { useState, useEffect } from "react";
import api from "../services/api";

export default function PermissionManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleMap, setRoleMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, roleRes] = await Promise.all([
          api.get("/api/users"),
          api.get("/api/roles"),
        ]);

        const userList = Array.isArray(userRes.data) ? userRes.data : [];
        const roleList = Array.isArray(roleRes.data) ? roleRes.data : [];
        console.log("👥 Users loaded:", userList);
        console.log("📦 Roles loaded:", roleList);
        console.log("🔍 Role lookup result:", roleRes);
        


        setUsers(userList);
        setRoles(roleList);

        const initialMap = {};
        userList.forEach((user) => {
          initialMap[user.id] = user.role;
        });
        setRoleMap(initialMap);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
function handleRoleChange(userId, newRole) {
  return api.put(`/api/users/${userId}/role`, { role: newRole }).then(() => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setRoleMap((prev) => ({ ...prev, [userId]: newRole }));
  });
}

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">จัดการสิทธิ์ผู้ใช้</h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">ชื่อผู้ใช้</th>
            <th className="p-2">สิทธิ์ปัจจุบัน</th>
            <th className="p-2">เปลี่ยนสิทธิ์</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={`user-${user.id}`} className="border-t">
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <select
                  value={roleMap[user.id] || ""}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded px-2 py-1 bg-white"
                >
                  {roles.map((role) => (
                    <option key={`role-${role.ROLE_ID}`} value={role.ROLE_NAME}>
                      {role.ROLE_NAME}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
