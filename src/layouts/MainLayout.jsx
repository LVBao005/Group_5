import { Layout, Menu } from 'antd'


const { Header, Content } = Layout


export default function MainLayout({ children }) {
return (
<Layout style={{ minHeight: '100vh' }}>
<Header style={{ color: '#fff', fontSize: 18 }}>
Pharmacy Inventory System
</Header>
<Content style={{ padding: 24 }}>
{children}
</Content>
</Layout>
)
}