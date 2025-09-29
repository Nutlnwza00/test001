import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// สไตล์ปุ่มเมนู
export const menuBtnStyle = {
  width: '100%',
  padding: '0.9rem',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(90deg, #edd093ff 0%, #FF9D00 100%)',
  color: '#000000ff',
  fontWeight: 600,
  fontSize: '1.08rem',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(67,206,162,0.08)',
  transition: 'background 0.2s, transform 0.1s',
  outline: 'none',
  margin: 0
};

// คอมโพเนนต์ Layout หลักที่ใช้ร่วมกัน
const HomeLayout = ({ children, roleTitle }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // เพิ่ม Google Fonts สำหรับ emoji และภาษาไทย
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700&family=Noto+Color+Emoji&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => { document.head.removeChild(link); };
    }, []);

    const handleLogout = () => {
        // ลบข้อมูล Role ก่อนนำทางไปหน้า Login
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #FF9D00 0%, #FF9D00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Noto Sans Thai, Segoe UI, Noto Color Emoji, sans-serif'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                padding: '2.5rem 2.5rem 2rem 2.5rem',
                minWidth: 350,
                maxWidth: 420,
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                fontFamily: 'inherit'
            }}>
                <div style={{ fontSize: 60, marginBottom: 0, fontFamily: 'Noto Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif' }}>
                    <span role="img" aria-label="shuttle-bus">🚌</span>
                </div>
                <h1 style={{
                    color: '#000000ff',
                    fontWeight: 700,
                    fontSize: '2.1rem',
                    margin: 0,
                    fontFamily: 'inherit'
                }}>
                    ระบบ SHUTTLE BUS SYSTEM
                </h1>
                <p style={{ color: '#444', fontSize: '1.1rem', margin: 0, fontFamily: 'inherit' }}>
                    ยินดีต้อนรับ! {roleTitle}
                </p>
                
                {children}

                <div style={{ width: '100%', marginTop: '0.5rem' }}>
                    <button onClick={handleLogout} style={{ ...menuBtnStyle, background: '#e53e3e' }}>
                        <span role="img" aria-label="logout">🚪</span> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeLayout;