import { Table } from 'antd'


const columns = [
{ title: 'Mã thuốc', dataIndex: 'code' },
{ title: 'Tên thuốc', dataIndex: 'name' },
{ title: 'Thành phần', dataIndex: 'ingredient' },
{ title: 'Đơn vị', dataIndex: 'unit' },
{ title: 'Giá bán lẻ', dataIndex: 'price' }
]


const data = [
{ key: 1, code: 'MED001', name: 'Paracetamol', ingredient: 'Acetaminophen', unit: 'Viên', price: 2000 }
]


export default function MedicineTable() {
return <Table columns={columns} dataSource={data} pagination={false} />
}