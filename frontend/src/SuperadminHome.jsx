import React from 'react';
import HomeLayout, { menuBtnStyle } from './HomeLayout';
import { Link } from 'react-router-dom';

const SuperadminHome = () => {
    return (
        <HomeLayout roleTitle="(ซุปเปอร์แอดมิน)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <Link to={'/Addusers'}>
                    <button style={menuBtnStyle}>
                        <span role="img" aria-label="add-user">📝</span> เพิ่มผู้ใช้
                    </button>
                </Link>
                <Link to={'/ManageUsers'}>
                    <button style={menuBtnStyle}>
                        <span role="img" aria-label="manage-user">⚙️</span> จัดการผู้ใช้
                    </button>
                </Link>
                <hr style={{width: '100%', border: '1px solid #eee', margin: '0.5rem 0'}} />
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="add-employee">👨‍💼</span> เพิ่มพนักงาน
                </button>
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="manage-employee">🛠️</span> จัดการพนักงาน
                </button>
                <hr style={{width: '100%', border: '1px solid #eee', margin: '0.5rem 0'}} />
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="add-route">🛣️</span> เพิ่มเส้นทาง
                </button>
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="manage-route">🧭</span> จัดการเส้นทาง
                </button>
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="schedule">📅</span> จัดรอบรถ
                </button>
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="report">📈</span> ดูรายงาน
                </button>
            </div>
        </HomeLayout>
    );
};

export default SuperadminHome;