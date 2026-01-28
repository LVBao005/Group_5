import React from 'react';
import { Menu, Avatar, Button } from 'antd';
import {
    ShoppingCartOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    DatabaseOutlined,
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/pos',
            icon: <ShoppingCartOutlined style={{ fontSize: '20px' }} />,
            label: 'Bán hàng',
        },
        {
            key: '/invoices',
            icon: <FileTextOutlined style={{ fontSize: '20px' }} />,
            label: 'Hóa đơn',
        },
        {
            key: '/dashboard',
            icon: <BellOutlined style={{ fontSize: '20px' }} />,
            label: 'Báo cáo',
        },
        {
            key: '/inventory',
            icon: <DatabaseOutlined style={{ fontSize: '20px' }} />,
            label: 'Kho thuốc',
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={styles.sidebarWrapper}>
            <div style={styles.logoContainer}>
                <div style={styles.logoIcon}>
                    <div style={{ fontSize: '18px', color: '#fff' }}>💊</div>
                </div>
                <div style={styles.logoText}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: '#fff', letterSpacing: '-0.5px' }}>PharmaPOS</div>
                    <div style={{ fontSize: '9px', color: '#00d56c', fontWeight: 'bold', letterSpacing: '1px' }}>DƯỢC SĨ: BẢO</div>
                </div>
            </div>

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                style={{ border: 'none', background: 'transparent' }}
            />

            <div style={styles.userSection}>
                <div style={styles.userInfo}>
                    <Avatar
                        size={40}
                        src="https://xsgames.co/randomusers/assets/avatars/male/74.jpg"
                        style={{ border: '2px solid #00d56c', boxShadow: '0 0 10px rgba(0,213,108,0.2)' }}
                    />
                    <div style={{ marginLeft: '12px', overflow: 'hidden' }}>
                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>Dược sĩ BẢO</div>
                        <div style={{ color: '#555', fontSize: '11px' }}>Quầy số 01</div>
                    </div>
                </div>
                <Button
                    type="text"
                    icon={<LogoutOutlined style={{ color: '#444' }} />}
                    onClick={handleLogout}
                    style={styles.logoutBtn}
                />
            </div>
        </div>
    );
};

const styles = {
    sidebarWrapper: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c120f',
    },
    logoContainer: {
        padding: '32px 24px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        background: '#00d56c',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12px',
        boxShadow: '0 0 15px rgba(0, 213, 108, 0.3)',
    },
    logoText: {
        display: 'flex',
        flexDirection: 'column',
    },
    userSection: {
        padding: '16px 20px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    logoutBtn: {
        width: '32px',
        height: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '8px',
    }
};

export default Sidebar;
