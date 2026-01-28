import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../mockData';

const Login = () => {
    const navigate = useNavigate();

    const onFinish = (values) => {
        const { username, password } = values;
        const user = MOCK_USERS.find(u => u.username === username && u.password === password);

        if (user) {
            message.success('Đăng nhập thành công!');
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } else {
            message.error('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginCard}>
                <div style={styles.header}>
                    <div style={styles.logoCircle}>
                        <div style={styles.pillIcon}>
                            <div style={{ fontSize: '24px', color: '#00d56c' }}>💊</div>
                        </div>
                    </div>
                    <h1 style={styles.title}>Đăng nhập hệ thống</h1>
                    <p style={styles.subtitle}>
                        Vui lòng nhập thông tin để truy cập quản trị chuỗi nhà thuốc.
                    </p>
                </div>

                <Form
                    name="login_form"
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ remember: true }}
                >
                    <Form.Item
                        label={<span style={{ color: '#aaa' }}>Tên đăng nhập</span>}
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#666' }} />}
                            placeholder="Nhập tên đăng nhập"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: '#aaa' }}>Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#666' }} />}
                            placeholder="Nhập mật khẩu"
                        />
                    </Form.Item>

                    <div style={styles.flexRow}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox style={{ color: '#aaa' }}>Ghi nhớ đăng nhập</Checkbox>
                        </Form.Item>
                        <a href="#" style={{ color: '#00d56c' }}>Quên mật khẩu?</a>
                    </div>

                    <Form.Item style={{ marginTop: '24px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            icon={<LoginOutlined />}
                            style={styles.loginBtn}
                        >
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>
                </Form>

                <div style={styles.footer}>
                    <div style={styles.securityTag}>
                        <SafetyCertificateOutlined style={{ marginRight: '8px' }} />
                        KẾT NỐI BẢO MẬT 256-BIT
                    </div>
                    <div style={styles.copyright}>
                        PHARMACY MANAGEMENT SYSTEM V4.2.0<br />
                        © 2024 BẢN QUYỀN THUỘC VỀ PHARMACHAIN INC.
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0c120f',
    },
    loginCard: {
        width: '400px',
        padding: '40px',
        background: 'rgba(20, 31, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logoCircle: {
        width: '64px',
        height: '64px',
        background: 'rgba(0, 213, 108, 0.1)',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 0 20px rgba(0, 213, 108, 0.2)',
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#fff',
        margin: '0 0 8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#aaa',
        margin: 0,
        lineHeight: '1.6',
    },
    flexRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
    },
    loginBtn: {
        height: '48px',
        fontSize: '16px',
        letterSpacing: '1px',
        boxShadow: '0 4px 15px rgba(0, 213, 108, 0.3)',
    },
    footer: {
        marginTop: '32px',
        textAlign: 'center',
    },
    securityTag: {
        color: '#00d56c',
        fontSize: '11px',
        letterSpacing: '1px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16px',
        opacity: 0.8,
    },
    copyright: {
        color: '#444',
        fontSize: '10px',
        lineHeight: '1.5',
    }
};

export default Login;
