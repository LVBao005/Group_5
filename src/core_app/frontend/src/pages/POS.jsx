import React, { useState, useEffect } from 'react';
import {
    Input, Row, Col, Button, Table, Badge,
    Avatar, Space, Divider, Select, message
} from 'antd';
import {
    SearchOutlined,
    HistoryOutlined,
    SettingOutlined,
    DeleteOutlined,
    PlusOutlined,
    MinusOutlined,
    UserAddOutlined,
    WalletOutlined,
    SwapOutlined,
    CreditCardOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import { MOCK_DRUGS } from '../mockData';

const POS = () => {
    const [searchText, setSearchText] = useState('');
    const [cart, setCart] = useState([]);
    const [cashReceived, setCashReceived] = useState(200000);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const addToCart = (drug) => {
        const existing = cart.find(item => item.id === drug.id);
        if (existing) {
            setCart(cart.map(item => item.id === drug.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...drug, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const changeAmount = cashReceived - totalAmount;

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 50,
            render: (text, record, index) => <span style={{ color: '#666' }}>{String(index + 1).padStart(2, '0')}</span>,
        },
        {
            title: 'TÊN THUỐC',
            dataIndex: 'name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: '500', color: '#fff' }}>{text}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Mã: SP{record.id.toString().padStart(5, '0')} - Kho: {record.stock}</div>
                </div>
            ),
        },
        {
            title: 'ĐƠN GIÁ',
            dataIndex: 'price',
            align: 'right',
            render: (price) => <span style={{ fontWeight: '500' }}>{price.toLocaleString()}</span>,
        },
        {
            title: 'SỐ LƯỢNG',
            dataIndex: 'quantity',
            align: 'center',
            render: (val, record) => (
                <Space style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px 8px' }}>
                    <Button type="text" size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(record.id, -1)} />
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{val}</span>
                    <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(record.id, 1)} />
                </Space>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(record.id)} />
            ),
        }
    ];

    return (
        <div style={styles.container}>
            {/* Top Header Row */}
            <div style={styles.header}>
                <div style={styles.searchWrapper}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#666' }} />}
                        placeholder="Tìm thuốc (Tên, mã vạch...)"
                        style={styles.searchInput}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <div style={styles.searchResults}>
                            {MOCK_DRUGS.filter(d => d.name.toLowerCase().includes(searchText.toLowerCase())).map(drug => (
                                <div key={drug.id} style={styles.searchItem} onClick={() => { addToCart(drug); setSearchText(''); }}>
                                    <div style={styles.searchItemInfo}>
                                        <div style={{ fontWeight: '600' }}>{drug.name}</div>
                                        <div style={{ fontSize: '11px', color: '#888' }}>Thành phần: Paracelamol, Caffeine...</div>
                                    </div>
                                    <div style={styles.searchItemPrice}>
                                        <div style={{ color: '#00d56c', fontWeight: 'bold' }}>{drug.price.toLocaleString()}đ</div>
                                        <div style={{ fontSize: '11px', color: '#666' }}>Tồn: {drug.stock} {drug.unit}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Space size="middle">
                    <Button icon={<HistoryOutlined />} style={styles.iconBtn} />
                    <Button icon={<SettingOutlined />} style={styles.iconBtn} />
                    <div style={styles.timeDisplay}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{currentTime.toLocaleTimeString([], { hour12: false })}</div>
                        <div style={{ fontSize: '10px', color: '#666' }}>{currentTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    </div>
                </Space>
            </div>

            <Row gutter={24} style={{ flex: 1, padding: '24px' }}>
                {/* Left Side - Cart Table */}
                <Col span={16}>
                    <div style={styles.tableCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>GIỎ HÀNG</h3>
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setCart([])}>XÓA TOÀN BỘ</Button>
                        </div>
                        <Table
                            dataSource={cart}
                            columns={columns}
                            pagination={false}
                            rowKey="id"
                            scroll={{ y: 'calc(100vh - 350px)' }}
                            locale={{ emptyText: <div style={{ padding: '50px', color: '#444' }}>Chưa có sản phẩm nào</div> }}
                        />
                        <div style={styles.footerInfo}>
                            <Space size="large">
                                <span style={{ fontSize: '12px', color: '#00d56c' }}>● SẴN SÀNG BÁN HÀNG (FIFO)</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>F8 Thêm mã giảm</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>F9 Chọn khách</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>F12 Thanh toán</span>
                            </Space>
                        </div>
                    </div>
                </Col>

                {/* Right Side - Payment Panel */}
                <Col span={8}>
                    <div style={styles.paymentPanel}>
                        {/* Customer Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>KHÁCH HÀNG</span>
                                <a style={{ color: '#00d56c', fontSize: '12px' }}>Thêm mới</a>
                            </div>
                            <Input
                                prefix={<SearchOutlined style={{ color: '#666' }} />}
                                suffix={<UserAddOutlined style={{ color: '#666' }} />}
                                placeholder="Nhập SĐT khách hàng..."
                                style={styles.panelInput}
                            />
                            <div style={styles.customerSummary}>
                                <div>
                                    <div style={{ fontSize: '13px' }}>Khách lẻ / Khách quen</div>
                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                        Điểm tích lũy: <span style={{ color: '#00d56c', fontWeight: 'bold' }}>1.250</span>
                                    </div>
                                </div>
                                <Button size="small" style={styles.loyaltyBtn}>LOYALTY</Button>
                            </div>
                        </div>

                        <Divider style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />

                        {/* Price Details */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>CHI TIẾT THANH TOÁN</div>
                            <div style={styles.summaryRow}>
                                <span>Tổng tiền hàng</span>
                                <span>{totalAmount.toLocaleString()} đ</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Chiết khấu / Voucher</span>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <Input size="small" value="0" style={{ width: '60px', textAlign: 'right', background: 'transparent', border: 'none', color: '#fff' }} />
                                    <span>đ</span>
                                </span>
                            </div>
                            <div style={{ ...styles.summaryRow, marginTop: '16px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Cần thanh toán</span>
                                <span style={{ color: '#00d56c', fontWeight: 'bold', fontSize: '24px' }}>{totalAmount.toLocaleString()} đ</span>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>TIỀN KHÁCH ĐƯA</div>
                            <Input
                                prefix={<span style={{ color: '#666' }}>VNĐ</span>}
                                value={cashReceived.toLocaleString()}
                                onChange={e => setCashReceived(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                                style={styles.cashInput}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <Button style={styles.quickCashBtn} onClick={() => setCashReceived(totalAmount)}>ĐÚNG SỐ TIỀN</Button>
                                <Button style={styles.quickCashBtn} onClick={() => setCashReceived(v => v + 50000)}>+50.000</Button>
                                <Button style={styles.quickCashBtn} onClick={() => setCashReceived(v => v + 100000)}>+100.000</Button>
                            </div>
                        </div>

                        <div style={styles.changeBox}>
                            <span style={{ color: '#888', fontSize: '13px' }}>TIỀN THỪA TRẢ KHÁCH</span>
                            <span style={{ color: '#00d56c', fontSize: '20px', fontWeight: 'bold' }}>{changeAmount < 0 ? 0 : changeAmount.toLocaleString()} đ</span>
                        </div>

                        {/* Payment Methods */}
                        <Row gutter={8} style={{ marginTop: '20px' }}>
                            <Col span={8}>
                                <div style={{ ...styles.methodCard, border: '1px solid #00d56c', background: 'rgba(0, 213, 108, 0.05)' }}>
                                    <WalletOutlined style={{ fontSize: '20px', color: '#00d56c', marginBottom: '4px' }} />
                                    <div style={{ fontSize: '10px', color: '#00d56c' }}>TIỀN MẶT</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={styles.methodCard}>
                                    <SwapOutlined style={{ fontSize: '20px', color: '#666', marginBottom: '4px' }} />
                                    <div style={{ fontSize: '10px', color: '#666' }}>CHUYỂN KHOẢN</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={styles.methodCard}>
                                    <CreditCardOutlined style={{ fontSize: '20px', color: '#666', marginBottom: '4px' }} />
                                    <div style={{ fontSize: '10px', color: '#666' }}>THẺ / POS</div>
                                </div>
                            </Col>
                        </Row>

                        <Button
                            type="primary"
                            block
                            size="large"
                            icon={<PrinterOutlined />}
                            style={styles.submitBtn}
                            onClick={() => message.success('Thanh toán thành công!')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>THANH TOÁN & IN HÓA ĐƠN</span>
                                <span style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '1px' }}>XỬ LÝ KHO FIFO - [F12]</span>
                            </div>
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0c120f',
    },
    header: {
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    searchWrapper: {
        width: '400px',
        position: 'relative',
    },
    searchInput: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        height: '40px',
    },
    searchResults: {
        position: 'absolute',
        top: '45px',
        left: 0,
        right: 0,
        background: '#1a2a22',
        borderRadius: '10px',
        zIndex: 1000,
        border: '1px solid rgba(0, 213, 108, 0.2)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        padding: '8px 0',
    },
    searchItem: {
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    searchItemPrice: {
        textAlign: 'right',
    },
    iconBtn: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeDisplay: {
        textAlign: 'center',
        minWidth: '80px',
    },
    tableCard: {
        background: 'rgba(20, 31, 26, 0.4)',
        padding: '20px',
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    footerInfo: {
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    },
    paymentPanel: {
        background: 'rgba(20, 31, 26, 0.8)',
        padding: '24px',
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255, 255, 255, 0.03)',
    },
    panelInput: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
    },
    customerSummary: {
        marginTop: '12px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loyaltyBtn: {
        background: 'rgba(0, 213, 108, 0.1)',
        color: '#00d56c',
        border: '1px solid rgba(0, 213, 108, 0.2)',
        fontSize: '10px',
        fontWeight: 'bold',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '14px',
    },
    cashInput: {
        height: '50px',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'right',
        background: 'rgba(0,0,0,0.2)',
        border: 'none',
        color: '#fff',
    },
    quickCashBtn: {
        flex: 1,
        fontSize: '10px',
        background: 'rgba(255,255,255,0.05)',
        color: '#888',
        border: 'none',
    },
    changeBox: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
    },
    methodCard: {
        height: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '10px',
        cursor: 'pointer',
    },
    submitBtn: {
        marginTop: 'auto',
        height: '80px',
        borderRadius: '12px',
    }
};

export default POS;
