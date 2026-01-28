import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Invoices from './pages/Invoices';
import './App.css';

const { Content, Sider } = Layout;

// Layout Wrapper for Private Routes
const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          // Can handle responsive state here if needed
        }}
        onCollapse={(collapsed, type) => {
          setCollapsed(collapsed);
        }}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
        className="desktop-only"
      >
        <Sidebar />
      </Sider>

      {/* Main Container */}
      <Layout style={{ marginLeft: collapsed ? 0 : 260 }} className="main-layout-wrapper">
        <Content style={{ minHeight: '100vh', background: '#0c120f' }}>
          {/* Mobile Header (Hidden on Laptop) */}
          <div className="mobile-only" style={styles.mobileHeader}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: '#fff' }} />}
              onClick={() => setMobileVisible(!mobileVisible)}
            />
            <div style={{ fontWeight: 'bold', color: '#fff' }}>PharmaPOS</div>
            <div style={{ width: '32px' }}></div> {/* Spacer */}
          </div>

          {/* Mobile Sidebar (Drawer-like overlay) */}
          {mobileVisible && (
            <div style={styles.mobileOverlay} onClick={() => setMobileVisible(false)}>
              <div style={styles.mobileMenu} onClick={e => e.stopPropagation()}>
                <Sidebar />
              </div>
            </div>
          )}

          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" />;

  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/pos" element={
          <PrivateRoute>
            <POS />
          </PrivateRoute>
        } />
        <Route path="/invoices" element={
          <PrivateRoute>
            <Invoices />
          </PrivateRoute>
        } />
        <Route path="/inventory" element={
          <PrivateRoute>
            <Inventory />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/pos" />} />
        <Route path="*" element={<Navigate to="/pos" />} />
      </Routes>
    </Router>
  );
}

const styles = {
  mobileHeader: {
    height: '60px',
    background: '#1a2a22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 2000,
  },
  mobileMenu: {
    width: '260px',
    height: '100%',
    background: '#0c120f',
  }
};

export default App;
