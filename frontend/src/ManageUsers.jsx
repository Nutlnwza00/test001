import React, { useState, useEffect } from 'react';
import HomeLayout from './HomeLayout';
import axios from 'axios';
import { toast } from "react-toastify";

import bcrypt from "bcryptjs";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setUsers(response.data.users);
    } catch (error) {
      setMessage("เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
    setLoading(false);
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`ต้องการลบผู้ใช้ ${username} ใช่หรือไม่?`)) return;
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/delete-user", { username });
      setMessage("ลบผู้ใช้งานสำเร็จ");
      fetchUsers();
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditUser({ ...user, PASSWORD: "" }); // เพิ่มฟิลด์ PASSWORD เพื่อให้กรอกใหม่ได้
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let password_hash = editUser.PASSWORD_HASH;
      if (editUser.PASSWORD && editUser.PASSWORD !== "") {
        const salt = await bcrypt.genSalt(10);
        password_hash = await bcrypt.hash(editUser.PASSWORD, salt);
      }

      await axios.post("http://localhost:5000/api/update-user", {
        user_id: editUser.USER_ID,
        username: editUser.USERNAME,
        password_hash,
        firstname: editUser.FIRST_NAME,
        lastname: editUser.LAST_NAME,
        email: editUser.EMAIL,
        phone: editUser.PHONE,
      });

      toast.success("✅ แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว!");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("❌ เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
    setLoading(false);
  };

  return (
    <HomeLayout roleTitle="(จัดการผู้ใช้งาน)">
      <div
        style={{
          maxWidth: "800px",
          margin: "30px auto",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          padding: "40px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1976d2",
            marginBottom: "32px",
          }}
        >
          จัดการผู้ใช้งาน
        </h1>
        {message && (
          <div
            style={{
              color: message.includes("สำเร็จ") ? "green" : "red",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {users.map((user) => (
            <div
              key={user.USERNAME}
              style={{
                background: "#f5f5f5",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  color: "#1976d2",
                }}
              >
                {user.USERNAME}
              </span>
              <span style={{ color: "#333", marginTop: "6px" }}>
                {user.FIRST_NAME} {user.LAST_NAME}
              </span>
              <span
                style={{ color: "#888", fontSize: "0.95em", marginTop: "2px" }}
              >
                {user.EMAIL}
              </span>
              <span
                style={{ color: "#888", fontSize: "0.95em", marginTop: "2px" }}
              >
                {user.PHONE}
              </span>
              <button
                onClick={() => handleEdit(user)}
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "10px",
                  alignSelf: "center",
                }}
                disabled={loading}
              >
                แก้ไข
              </button>
              <button
                onClick={() => handleDelete(user.USERNAME)}
                style={{
                  background: "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "6px",
                  alignSelf: "center",
                }}
                disabled={loading}
              >
                ลบผู้ใช้งาน
              </button>
            </div>
          ))}
        </div>

        {/* Modal สำหรับแก้ไขข้อมูล */}
        {editUser && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
            }}
          >
            <form
              onSubmit={handleEditSubmit}
              style={{
                background: "#fff",
                padding: "32px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                minWidth: "320px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <h2 style={{ color: "#1976d2", textAlign: "center" }}>
                แก้ไขข้อมูลผู้ใช้งาน
              </h2>
              <input
                type="text"
                name="USERNAME"
                value={editUser.USERNAME}
                disabled
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                name="FIRST_NAME"
                value={editUser.FIRST_NAME}
                onChange={handleEditChange}
                placeholder="ชื่อจริง"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                name="LAST_NAME"
                value={editUser.LAST_NAME}
                onChange={handleEditChange}
                placeholder="นามสกุล"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="email"
                name="EMAIL"
                value={editUser.EMAIL}
                onChange={handleEditChange}
                placeholder="อีเมล"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                name="PHONE"
                value={editUser.PHONE}
                onChange={handleEditChange}
                placeholder="เบอร์โทรศัพท์"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="password"
                name="PASSWORD"
                value={editUser.PASSWORD || ""}
                onChange={handleEditChange}
                placeholder="รหัสผ่านใหม่ (ถ้าเปลี่ยน)"
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <button
                  type="submit"
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  style={{
                    background: "#888",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default ManageUsers;