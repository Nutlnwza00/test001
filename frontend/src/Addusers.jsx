import React, { useState, useEffect } from "react";
import HomeLayout from "./HomeLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

// ตั้งค่า default headers
axios.defaults.headers.post["Content-Type"] = "application/json";

const Addusers = () => {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    // ✅ ลบ user_id ออก
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setEmployees(response.data.users);
    } catch (error) {
      console.error("Error fetching employees:", error);
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

      // ✅ ไม่ส่ง user_id ไปแล้ว
      const payload = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password_hash,
        phone: form.phone,
      };

      const res = await axios.post(
        "http://localhost:5000/api/add-users",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(res.data.message);

      // ✅ Reset form (ไม่มี user_id)
      setForm({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
      });

      fetchEmployees();
    } catch (err) {
      console.error("Error details:", err);
      const errorMessage =
        err.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน";
      setMessage(errorMessage);
    }
    setLoading(false);
  };

  return (
    <HomeLayout roleTitle="(ผู้ใช้งาน)">
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
          เพิ่มผู้ใช้งาน
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
          {/* ✅ ลบส่วนรหัสผู้ใช้ออกทั้งหมด */}

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
            อีเมล:
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
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
            เบอร์โทรศัพท์:
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
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
            {loading ? "กำลังเพิ่ม..." : "เพิ่มพนักงาน"}
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
          รายชื่อผู้ใช้งาน
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          {employees.map((employee) => (
            <div
              key={employee.USERNAME}
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
                {employee.USERNAME}
              </span>
              <span style={{ color: "#333", marginTop: "6px" }}>
                {employee.FIRST_NAME} {employee.LAST_NAME}
              </span>
              <span
                style={{ color: "#888", fontSize: "0.95em", marginTop: "2px" }}
              >
                {employee.EMAIL}
              </span>
              <span
                style={{ color: "#888", fontSize: "0.95em", marginTop: "2px" }}
              >
                {employee.PHONE}
              </span>
            </div>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
};

export default Addusers;
