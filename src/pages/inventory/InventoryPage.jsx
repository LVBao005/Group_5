import { Card, Button, Row, Col } from 'antd'
import MedicineTable from './MedicineTable'
import BatchTable from './BatchTable'
import ImportCsvModal from './ImportCsvModal'
import { useState } from 'react'


export default function InventoryPage() {
const [open, setOpen] = useState(false)


return (
<>
<Row gutter={16}>
<Col span={24}>
<Card
title="Danh mục thuốc (Master Data)"
extra={<Button type="primary" onClick={() => setOpen(true)}>Import Legacy Data</Button>}
>
<MedicineTable />
</Card>
</Col>


<Col span={24} style={{ marginTop: 16 }}>
<Card title="Quản lý Lô hàng (Batch Tracking)">
<BatchTable />
</Card>
</Col>
</Row>


<ImportCsvModal open={open} onClose={() => setOpen(false)} />
</>
)
}