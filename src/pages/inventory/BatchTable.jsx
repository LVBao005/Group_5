import { Table, Tag } from 'antd'
import { getBatchStatus } from '../../utils/dateUtils'


const columns = [
{ title: 'Mã lô', dataIndex: 'batchCode' },
{ title: 'Ngày nhập', dataIndex: 'importDate' },
{ title: 'Hạn sử dụng', dataIndex: 'expiryDate' },
{ title: 'Tồn kho', dataIndex: 'quantity' },
{
title: 'Trạng thái',
render: (_, record) => {
const status = getBatchStatus(record.expiryDate)
return <Tag color={status.color}>{status.label}</Tag>
}
}
]


const data = [
{
key: 1,
batchCode: 'BATCH001',
importDate: '2025-01-01',
expiryDate: '2025-02-10',
quantity: 120
}
]


export default function BatchTable() {
return <Table columns={columns} dataSource={data} />
}