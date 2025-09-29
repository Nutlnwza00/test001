import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    // เพิ่ม Google Fonts สำหรับ emoji และภาษาไทย
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700&family=Noto+Color+Emoji&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ce4343ff 0%, #185a9d 100%)',
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
          <span role="img" aria-label="school-bus">🚌</span>
        </div>
        <h1 style={{
          color: '#185a9d',
          fontWeight: 700,
          fontSize: '2.1rem',
          margin: 0,
          fontFamily: 'inherit'
        }}>
          ระบบรับ-ส่งนักเรียน
        </h1>
        <p style={{ color: '#444', fontSize: '1.1rem', margin: 0, fontFamily: 'inherit' }}>
          ยินดีต้อนรับ! เลือกเมนูเพื่อเริ่มต้นใช้งานแอปรับส่งนักเรียนของคุณ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <button style={menuBtnStyle}>
            <span role="img" aria-label="register">📝</span> ลงทะเบียนรับ-ส่งนักเรียน
          </button>
          <button style={menuBtnStyle}>
            <span role="img" aria-label="status">🔍</span> ตรวจสอบสถานะนักเรียน
          </button>
          <button style={menuBtnStyle}>
            <span role="img" aria-label="history">📊</span> ประวัติการรับ-ส่ง
          </button>
        </div>
      </div>
    </div>
  );
};

const menuBtnStyle = {
  width: '100%',
  padding: '0.9rem',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '1.08rem',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(67,206,162,0.08)',
  transition: 'background 0.2s, transform 0.1s',
  outline: 'none',
  margin: 0
};

export default Home;