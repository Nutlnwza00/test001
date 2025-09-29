import React from 'react';
import HomeLayout, { menuBtnStyle } from './HomeLayout';

const UserHome = () => {
    return (
        <HomeLayout roleTitle="(ผู้ใช้)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="car-reservation">🚗</span> การจองรถ
                </button>
                <button style={menuBtnStyle}>
                    <span role="img" aria-label="status-check">🔍</span> การดูสถานะการ
                </button>
            </div>
        </HomeLayout>
    );
};

export default UserHome;