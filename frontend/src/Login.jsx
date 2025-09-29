import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// *** รับ setRole เข้ามาใน props ***
export default function Login({ setRole }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", { 
        username, 
        password 
      });
      
      if (res.data.success) {
        // *** ⚠️ จัดเก็บเฉพาะ Role (ไม่มี Token) ***
        localStorage.setItem('userRole', res.data.role); 
        
        // อัพเดท State และนำทาง
        setRole(res.data.role); 
        navigate("/home");

      } else {
        setMessage("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ หรือมีข้อผิดพลาด");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #FF9D00 0%, #FF9D00 100%)"
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: "#fff",
          padding: "2.5rem 2rem",
          borderRadius: "18px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          minWidth: 320,
          maxWidth: 350,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem"
        }}
      >
        <h2 style={{
          textAlign: "center",
          color: "#000000",
          fontWeight: 700,
          fontSize: "1.7rem",
          margin: 0,
          marginBottom: "1.2rem"
        }}>เข้าสู่ระบบ</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#f8faff", borderRadius: 8, border: "1px solid #d1d5db", padding: 0, margin: 0 }}>
          <input
            type="text"
            placeholder="ชื่อผู้ใช้"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "0.85rem 0.5rem 0.85rem 0.85rem",
              fontSize: "1rem",
              borderRadius: 8
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#f8faff", borderRadius: 8, border: "1px solid #d1d5db", padding: 0, margin: 0 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่าน"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "0.85rem 0.5rem 0.85rem 0.85rem",
              fontSize: "1rem",
              borderRadius: 8
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              background: "none",
              border: "none",
              color: "#696969",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              padding: "0 14px 0 6px",
              height: 40,
              borderRadius: 8
            }}
            tabIndex={-1}
          >
            {showPassword ? "ซ่อน" : "แสดง"}
          </button>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(90deg, #696969 0%, #696969 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
            transition: "background 0.2s"
          }}
        >
          เข้าสู่ระบบ
        </button>
        {message && <div style={{
          color: "#e53e3e",
          background: "#fff5f5",
          padding: "0.7rem",
          borderRadius: 7,
          fontSize: "1rem",
          textAlign: "center"
        }}>{message}</div>}
      </form>
    </div>
  );
}