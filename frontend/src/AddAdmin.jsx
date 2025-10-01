import React, { useState, useEffect } from "react";
import HomeLayout from "./HomeLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

// ตั้งค่า default headers
axios.defaults.headers.post["Content-Type"] = "application/json";

const AddAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    national_id: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    position_title: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin");
      setAdmins(response.data.admin);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // hash password ก่อนส่ง
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(form.password, salt);

      const payload = {
        national_id: form.national_id,
        username: form.username,
        password_hash,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        position_title: form.position_title,
      };

      const res = await axios.post(
        "http://localhost:5000/api/add-admin",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(res.data.message);

      // Reset form
      setForm({
        national_id: "",
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        position_title: "",
      });

      fetchAdmins();
    } catch (err) {
      console.error("Error details:", err);
      const errorMessage =
        err.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ดูแลระบบ";
      setMessage(errorMessage);
    }
    setLoading(false);
  };

  return (
    <HomeLayout roleTitle="(ผู้ดูแลระบบ)">
      <div
        style={{
          maxWidth: "700px",
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
          เพิ่มผู้ดูแลระบบ
        </h1>
        <form
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "18px 24px",
            marginBottom: "40px",
            alignItems: "center",
          }}
          onSubmit={handleSubmit}
        >
          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            เลขบัตรประชาชน:
          </label>
          <input
            type="text"
            name="national_id"
            value={form.national_id}
            onChange={handleChange}
            required
            maxLength="13"
            pattern="\d{13}"
            placeholder="กรอก 13 หลัก"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            Username:
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            รหัสผ่าน:
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            ชื่อจริง:
          </label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            นามสกุล:
          </label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            เบอร์โทรศัพท์:
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            pattern="\d{10}"
            maxLength="10"
            placeholder="กรอก 10 หลัก"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <label style={{ fontWeight: "bold", textAlign: "right" }}>
            ตำแหน่ง:
          </label>
          <input
            type="text"
            name="position_title"
            value={form.position_title}
            onChange={handleChange}
            required
            placeholder="เช่น Train Officer"
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />

          <div></div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#FF9D00",
              color: "#fff",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "60%",
              gridColumn: "1 / span 2",
              justifySelf: "center",
              marginTop: "10px",
            }}
          >
            {loading ? "กำลังเพิ่ม..." : "เพิ่มผู้ดูแลระบบ"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{
              background: "#1976d2",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "40%",
              gridColumn: "1 / span 2",
              justifySelf: "center",
              marginTop: "10px",
            }}
          >
            ย้อนกลับ
          </button>
          {message && (
            <div
              style={{
                gridColumn: "1 / span 2",
                color: message.includes("สำเร็จ") ? "green" : "red",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}
        </form>

        <h2
          style={{
            color: "#1976d2",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          รายชื่อผู้ดูแลระบบ
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
          }}
        >
          {admins.map((admin) => (
            <div
              key={admin.USERNAME}
              style={{
                background: "#f5f5f5",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  color: "#1976d2",
                }}
              >
                {admin.USERNAME}
              </span>
              <span style={{ color: "#333", marginTop: "6px" }}>
                {admin.FIRST_NAME} {admin.LAST_NAME}
              </span>
              <span
                style={{ color: "#666", fontSize: "0.95em", marginTop: "4px" }}
              >
                ตำแหน่ง: {admin.POSITION_TITLE}
              </span>
              <span
                style={{ color: "#888", fontSize: "0.9em", marginTop: "2px" }}
              >
                เบอร์: {admin.PHONE}
              </span>
              <span
                style={{ color: "#888", fontSize: "0.85em", marginTop: "2px" }}
              >
                บัตรปชช: {admin.NATIONAL_ID}
              </span>
            </div>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
};

export default AddAdmin;