import React, { useState, useEffect } from 'react';
import HomeLayout from './HomeLayout';
import axios from 'axios';
import { toast } from "react-toastify";
import bcrypt from "bcryptjs";

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin");
      setAdmins(response.data.admin);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ดูแล");
    }
    setLoading(false);
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`ต้องการลบผู้ดูแล ${username} ใช่หรือไม่?`)) return;
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/admin/${username}`);
      toast.success("✅ ลบผู้ดูแลสำเร็จ");
      fetchAdmins();
    } catch (err) {
      toast.error("❌ เกิดข้อผิดพลาดในการลบผู้ดูแล");
    }
    setLoading(false);
  };

  const handleEdit = (admin) => {
    setEditAdmin({ ...admin, PASSWORD: "" });
  };

  const handleEditChange = (e) => {
    setEditAdmin({ ...editAdmin, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let password_hash = undefined;
      if (editAdmin.PASSWORD && editAdmin.PASSWORD !== "") {
        const salt = await bcrypt.genSalt(10);
        password_hash = await bcrypt.hash(editAdmin.PASSWORD, salt);
      }

      await axios.post(`http://localhost:5000/api/admin/${editAdmin.USERNAME}`, {
        first_name: editAdmin.FIRST_NAME,
        last_name: editAdmin.LAST_NAME,
        phone: editAdmin.PHONE,
        position_title: editAdmin.POSITION_TITLE,
        password_hash,
      });

      toast.success("✅ แก้ไขข้อมูลผู้ดูแลเรียบร้อยแล้ว!");
      setEditAdmin(null);
      fetchAdmins();
    } catch (err) {
      toast.error("❌ เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
    setLoading(false);
  };

  return (
    <HomeLayout roleTitle="(จัดการผู้ดูแลระบบ)">
      <div style={{ maxWidth: "800px", margin: "30px auto", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "40px" }}>
        <h1 style={{ textAlign: "center", color: "#1976d2", marginBottom: "32px" }}>จัดการผู้ดูแลระบบ</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {admins.map((admin) => (
            <div key={admin.USERNAME} style={{ background: "#f5f5f5", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.07)", padding: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#1976d2" }}>{admin.USERNAME}</span>
              <span>{admin.FIRST_NAME} {admin.LAST_NAME}</span>
              <span style={{ color: "#555", fontSize: "0.95em" }}>📞 {admin.PHONE}</span>
              <span style={{ color: "#555", fontSize: "0.95em" }}>🆔 {admin.NATIONAL_ID}</span>
              <span style={{ color: "#555", fontSize: "0.95em" }}>🧭 {admin.POSITION_TITLE}</span>
              <button onClick={() => handleEdit(admin)} style={buttonStyle("#1976d2")} disabled={loading}>แก้ไข</button>
              <button onClick={() => handleDelete(admin.USERNAME)} style={buttonStyle("#e53935")} disabled={loading}>ลบผู้ดูแล</button>
            </div>
          ))}
        </div>

        {editAdmin && (
          <div style={modalOverlayStyle}>
            <form onSubmit={handleEditSubmit} style={modalFormStyle}>
              <h2 style={{ color: "#1976d2", textAlign: "center" }}>แก้ไขข้อมูลผู้ดูแล</h2>
              <input type="text" name="USERNAME" value={editAdmin.USERNAME} disabled style={inputStyle} />
              <input type="text" name="FIRST_NAME" value={editAdmin.FIRST_NAME} onChange={handleEditChange} placeholder="ชื่อจริง" style={inputStyle} />
              <input type="text" name="LAST_NAME" value={editAdmin.LAST_NAME} onChange={handleEditChange} placeholder="นามสกุล" style={inputStyle} />
              <input type="text" name="PHONE" value={editAdmin.PHONE} onChange={handleEditChange} placeholder="เบอร์โทรศัพท์" style={inputStyle} />
              <input type="text" name="POSITION_TITLE" value={editAdmin.POSITION_TITLE} onChange={handleEditChange} placeholder="ตำแหน่งงาน" style={inputStyle} />
              <input type="password" name="PASSWORD" value={editAdmin.PASSWORD || ""} onChange={handleEditChange} placeholder="รหัสผ่านใหม่ (ถ้าเปลี่ยน)" style={inputStyle} />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
                <button type="submit" style={buttonStyle("#1976d2")}>บันทึก</button>
                <button type="button" onClick={() => setEditAdmin(null)} style={buttonStyle("#888")}>ยกเลิก</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

// 🎨 Styles
const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = (bgColor) => ({
  background: bgColor,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
  alignSelf: "center",
});

const modalOverlayStyle = {
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
};

const modalFormStyle = {
  background: "#fff",
  padding: "32px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  minWidth: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

export default ManageAdmin;