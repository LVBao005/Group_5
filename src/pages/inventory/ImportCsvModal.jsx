import { Modal, Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'


export default function ImportCsvModal({ open, onClose }) {
return (
<Modal title="Import Legacy Data (CSV)" open={open} onCancel={onClose} footer={null}>
<Upload.Dragger
name="file"
accept=".csv"
beforeUpload={() => false}
onChange={() => message.success('Upload thành công – gửi lên Backend để xử lý Migration')}
>
<p className="ant-upload-drag-icon"><InboxOutlined /></p>
<p>Kéo thả file CSV (10.000 dòng) vào đây</p>
</Upload.Dragger>
</Modal>
)
}