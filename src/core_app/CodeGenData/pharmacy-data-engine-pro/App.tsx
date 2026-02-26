
import React, { useState } from 'react';
import { 
  Database, FileSpreadsheet, Download, Loader2, Package, 
  History, Info, Play, ShieldCheck, Zap, CheckCircle2, UserCheck, ListTree,
  Store, Tags, Users, ShoppingCart, ClipboardList, Layers, Box, TrendingUp, AlertCircle
} from 'lucide-react';
import { PharmacyDataGenerator } from './services/generator';
import ExcelJS from 'https://esm.sh/exceljs@4.4.0';

const App: React.FC = () => {
  const [invoiceCount, setInvoiceCount] = useState(4000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputData, setOutputData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setLogs([]);
    const gen = new PharmacyDataGenerator();
    
    try {
      setLogs(["🚀 POS Engine V11.0: Đang nạp cấu hình 50 thuốc thực tế..."]);
      await new Promise(r => setTimeout(r, 200));
      setProgress(20);
      setLogs(p => [...p, "📦 Phân tách đơn vị Hộp/Viên & Đóng gói master data..."]);
      await new Promise(r => setTimeout(r, 300));
      setProgress(40);
      setLogs(p => [...p, "🔄 Khởi tạo LÔ TRỐNG (Global Batch) cho 50 loại thuốc..."]);
      await new Promise(r => setTimeout(r, 300));
      setProgress(60);
      setLogs(p => [...p, "🔄 Đồng bộ tồn kho: Mỗi chi nhánh sở hữu 1 lô cho TẤT CẢ các thuốc..."]);
      await new Promise(r => setTimeout(r, 300));
      setProgress(80);
      setLogs(p => [...p, "🔄 Kích hoạt nghiệp vụ HẾT HẠN cho 3 loại thuốc mẫu..."]);
      await new Promise(r => setTimeout(r, 300));
      setLogs(p => [...p, `🔄 Đang mô phỏng ${invoiceCount.toLocaleString()} giao dịch thực tế...`]);
      
      const data = gen.generateAll(invoiceCount);
      setProgress(100);
      setOutputData(data);
      setLogs(p => [...p, "✅ Hoàn tất! Hệ thống Inventory & Batch V11.0 đã sẵn sàng."]);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadExcel = async () => {
    if (!outputData) return;
    const wb = new ExcelJS.Workbook();
    
    const sheets = [
      { name: 'Invoices', data: outputData.invoices },
      { name: 'Invoice_Details', data: outputData.invoiceDetails },
      { name: 'Categories', data: outputData.categories },
      { name: 'Customers', data: outputData.customers },
      { name: 'Medicines', data: outputData.medicines },
      { name: 'Inventory', data: outputData.inventory },
      { name: 'Batches', data: outputData.batches },
      { name: 'Branches', data: outputData.branches },
      { name: 'Pharmacists', data: outputData.pharmacists }
    ];

    sheets.forEach(s => {
      const ws = wb.addWorksheet(s.name);
      if (s.data.length > 0) {
        const columns = Object.keys(s.data[0]);
        ws.columns = columns.map(k => ({ header: k.toUpperCase(), key: k, width: 22 }));
        s.data.forEach(row => ws.addRow(row));
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      }
    });

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Pharmacy_Lab211_V11_Full.xlsx`;
    a.click();
  };

  const downloadSQL = () => {
    if (!outputData) return;
    const gen = new PharmacyDataGenerator();
    Object.assign(gen, outputData);
    const sql = gen.toSQL();
    const blob = new Blob([sql], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Pharmacy_Lab211_V11_Full.sql';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        <header className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-200/60 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-xl">
                <ShieldCheck size={36} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Pharmacy <span className="text-blue-600">Inventory Pro</span></h1>
            </div>
            <p className="text-slate-500 max-w-2xl text-lg font-medium leading-relaxed">
              Trình tạo dữ liệu <b>Hệ V11.0</b>. 
              Mô phỏng đầy đủ vòng đời lô hàng: <b>Kho tổng -> Chi nhánh -> Hết hạn -> Bán lẻ.</b>
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-blue-50 text-blue-700 px-6 py-4 rounded-3xl text-xs font-black border border-blue-100 flex items-center gap-2 uppercase tracking-widest shadow-sm">
              <Layers size={16} />
              Full Table Stats
            </div>
             <div className="bg-amber-50 text-amber-700 px-6 py-4 rounded-3xl text-xs font-black border border-amber-100 flex items-center gap-2 uppercase tracking-widest shadow-sm">
              <AlertCircle size={16} />
              Batch Rules
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200/60 space-y-8 h-fit">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Database className="text-blue-600" size={28} />
                Quy tắc V11.0
              </h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest italic tracking-tight">Quy chuẩn dữ liệu</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ListTree size={14} /> Danh sách ràng buộc
                </h3>
                <ul className="space-y-3">
                  <RuleItem text="50 Thuốc thật phổ biến" />
                  <RuleItem text="Đơn vị: Chỉ Hộp & Viên" color="blue" />
                  <RuleItem text="Mỗi thuốc có 1 lô TRỐNG (Global) chưa phân phối" color="emerald" />
                  <RuleItem text="Mỗi chi nhánh có ít nhất 1 lô cho TẤT CẢ các thuốc" color="emerald" />
                  <RuleItem text="3 Thuốc có lô SẮP HẾT HẠN (1-3 tháng)" color="amber" />
                  <RuleItem text="Tồn kho quy đổi: 1 Hộp = n Viên" />
                  <RuleItem text="Logic: Sản xuất < Nhập < Bán < Hạn dùng" />
                </ul>
              </div>

              <div className="pt-2 space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 italic">Số lượng hóa đơn</label>
                <input 
                  type="number" 
                  value={invoiceCount}
                  onChange={(e) => setInvoiceCount(parseInt(e.target.value) || 0)}
                  className="w-full px-8 py-6 rounded-3xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-all font-mono text-2xl font-black text-slate-700 bg-slate-50 shadow-inner"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-slate-900 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-7 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 text-xl tracking-tighter active:scale-95"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} fill="currentColor" />}
                RE-GENERATE DATA
              </button>
            </div>
          </section>

          <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200/60 flex flex-col min-h-[600px] space-y-10">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Download className="text-emerald-500" size={28} />
                Trung tâm xuất bản
              </h2>
              {outputData && <span className="bg-emerald-500 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">9 TABLES VALIDATED</span>}
            </div>

            {!outputData && !isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                <Layers size={80} className="text-slate-300" />
                <p className="text-slate-500 font-black text-xl italic tracking-tight">Sẵn sàng khởi tạo toàn bộ 9 bảng dữ liệu...</p>
              </div>
            ) : outputData ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DownloadCard 
                    title="Excel Full" 
                    desc="Xuất 9 bảng (XLSX)"
                    icon={<FileSpreadsheet size={32} />}
                    color="text-emerald-600 bg-emerald-50"
                    onClick={downloadExcel}
                  />
                  <DownloadCard 
                    title="MySQL Script" 
                    desc="Cấu trúc & Dữ liệu (SQL)"
                    icon={<Database size={32} />}
                    color="text-blue-600 bg-blue-50"
                    onClick={downloadSQL}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 ml-2">
                    <ListTree size={20} className="text-slate-400" />
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] italic">Thống kê hệ thống (Đầy đủ 9 bảng)</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Stat label="Branches" value={outputData.branches.length} icon={<Store size={14}/>} color="text-slate-900 bg-slate-100" />
                    <Stat label="Categories" value={outputData.categories.length} icon={<Tags size={14}/>} color="text-slate-900 bg-slate-100" />
                    <Stat label="Medicines" value={outputData.medicines.length} icon={<Package size={14}/>} color="text-blue-600 bg-blue-50" />
                    <Stat label="Pharmacists" value={outputData.pharmacists.length} icon={<Users size={14}/>} color="text-slate-900 bg-slate-100" />
                    <Stat label="Customers" value={outputData.customers.length} icon={<UserCheck size={14}/>} color="text-emerald-600 bg-emerald-50" />
                    <Stat label="Batches" value={outputData.batches.length} icon={<Layers size={14}/>} color="text-slate-900 bg-slate-100" />
                    <Stat label="Inventory" value={outputData.inventory.length} icon={<Box size={14}/>} color="text-indigo-600 bg-indigo-50" />
                    <Stat label="Invoices" value={outputData.invoices.length} icon={<ShoppingCart size={14}/>} color="text-amber-600 bg-amber-50" />
                    <Stat label="Invoice Items" value={outputData.invoiceDetails.length} icon={<ClipboardList size={14}/>} color="text-purple-600 bg-purple-50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Nhật ký xử lý</div>
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl font-mono text-[11px] space-y-2 overflow-hidden">
                    {logs.map((log, idx) => (
                      <div key={idx} className="text-emerald-400 flex gap-3">
                        <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                        <span className="font-bold tracking-tight">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-8">
                <Loader2 className="animate-spin text-blue-600" size={80} strokeWidth={3} />
                <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-xs animate-pulse">Processing Master Data...</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const RuleItem: React.FC<{ text: string; color?: string }> = ({ text, color = "slate" }) => {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600"
  };
  return (
    <li className="flex gap-4 items-start group">
      <div className={`p-1 mt-0.5 rounded-full shrink-0 ${colorMap[color]}`}><CheckCircle2 size={12}/></div>
      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{text}</span>
    </li>
  );
};

const DownloadCard: React.FC<{ title: string; desc: string; icon: any; color: string; onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
  <button onClick={onClick} className="p-10 bg-white border border-slate-200/60 rounded-[2.5rem] hover:border-blue-600 hover:shadow-2xl transition-all text-left flex items-start gap-8 group">
    <div className={`p-6 rounded-3xl ${color} group-hover:scale-110 transition-transform shadow-sm`}>{icon}</div>
    <div className="space-y-2">
      <div className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors tracking-tighter italic">{title}</div>
      <div className="text-sm text-slate-400 font-bold leading-relaxed">{desc}</div>
    </div>
  </button>
);

const Stat: React.FC<{ label: string; value: number; icon: any; color: string }> = ({ label, value, icon, color }) => (
  <div className={`p-6 rounded-3xl border border-slate-100 flex flex-col gap-2 ${color} transition-all hover:scale-[1.02] shadow-sm`}>
    <div className="flex items-center justify-between opacity-60">
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-black font-mono tracking-tighter">
      {value.toLocaleString()}
    </div>
  </div>
);

export default App;
