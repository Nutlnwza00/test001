import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import UserHome from "./UserHome.jsx";
import AdminHome from "./AdminHome.jsx";
import SuperadminHome from "./SuperadminHome.jsx";
import AddEmployee from "./Addusers.jsx";
import ManageUsers from "./ManageUsers.jsx"; // เพิ่มบรรทัดนี้
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddAdmin from "./addadmin.jsx";
import ManageAdmin from "./Manageadmin.jsx";



function App() {
  const [role, setRole] = useState(localStorage.getItem("userRole"));

  // ฟังก์ชันนี้จะใช้ในการตรวจสอบและนำทางผู้ใช้ไปยังหน้า Home ที่ถูกต้อง
  const determineHomeRoute = () => {
    const currentRole = localStorage.getItem("userRole");

    switch (currentRole) {
      case "users":
        return <UserHome />;
      case "admin":
        return <AdminHome />;
      case "superadmin":
        return <SuperadminHome />;
      default:
        // หากไม่มี Role ให้นำไปหน้า Login
        return <Navigate to="/" replace />;
    }
  };

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Login setRole={setRole} />} />
        {/* เส้นทาง /home จะเรียก determineHomeRoute เพื่อตัดสินใจว่าจะแสดง Home ของ Role ใด */}
        <Route path="/home/*" element={determineHomeRoute()} />
        <Route
          path="/Addusers"
          element={
            role === "superadmin" || role === "admin" ? (
              <AddEmployee />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route
          path="/ManageUsers"
          element={
            role === "superadmin" || role === "admin" ? (
              <ManageUsers />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />{" "}
        <Route
          path="/AddAdmin"
          element={
            role === "superadmin" ? (
              <AddAdmin />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        <Route
          path="/ManageAdmin"
          element={
            role === "superadmin" ? (
              <ManageAdmin />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />  

        
      
      
  

      </Routes>
        
     
    


          
    </BrowserRouter>
  );
}

export default App;