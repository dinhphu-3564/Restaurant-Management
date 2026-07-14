import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  ShoppingBag, Tag, Wallet, QrCode, Bike, Armchair, 
  TrendingUp, TrendingDown, Search, Calendar, Bell, 
  FileSpreadsheet, Activity
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { AnimatedNumber } from "../../components/admin/AdminDashboardComponents";
import GlobalPagination from "../../components/admin/GlobalPagination";
import { getAdvancedDashboardData } from "../../services/revenueService";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

function StatCard({ title, value, growth, icon: Icon, isCurrency = false, subtitle = "" }) {
  const isUp = growth >= 0;
  return (
    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
      <div>
        <p className="text-[13px] font-bold text-gray-500 mb-1">{title}</p>
        <h3 className="text-[22px] font-black text-primary">
          <AnimatedNumber value={value} isCurrency={isCurrency} duration={2000} />
        </h3>
        {subtitle ? (
          <p className="text-xs font-semibold text-gray-400 mt-1">{subtitle}</p>
        ) : (
          <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span><AnimatedNumber value={Math.abs(growth)} isDecimal duration={2000} />% so với kỳ trước</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-50 text-primary flex items-center justify-center">
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  );
}

export default function AdminRevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animateBars, setAnimateBars] = useState(false);
  const { setExportExcelHandler } = useOutletContext();
  
  const [filters, setFilters] = useState({
    timeRange: "7days",
    orderType: "all",
    payment: "all",
    space: "all"
  });

  const [page, setPage] = useState(1);
  const limit = 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdvancedDashboardData(filters);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadData();
  }, [filters]);

  useEffect(() => {
    if (data) {
      setAnimateBars(false);
      const timer = setTimeout(() => setAnimateBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleExportExcel = () => {
    if (!data) return;
    const ws_data = [
      ["BÁO CÁO DOANH THU CHI TIẾT"],
      [],
      ["1. TỔNG QUAN"],
      ["Tổng doanh thu", data.overview.totalRevenue.value],
      ["Số đơn hàng", data.overview.orders.value],
      ["AOV (Giá trị TB/Đơn)", data.overview.aov.value],
      ["Tổng giảm giá", data.overview.discount.value],
      [],
      ["2. GIAO DỊCH GẦN ĐÂY"],
      ["Mã đơn", "Khách hàng", "Loại đơn", "Khu vực", "Tổng tiền", "Giảm giá", "Thanh toán", "Thời gian"]
    ];

    data.recentTransactions.forEach(t => {
      ws_data.push([
        t.orderId, t.customerName, t.orderType, t.area,
        t.total, t.discount, t.paymentMethod, new Date(t.time).toLocaleString('vi-VN')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doanh Thu");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "BaoCaoDoanhThu.xlsx");
  };

  useEffect(() => {
    setExportExcelHandler(() => handleExportExcel);
    return () => setExportExcelHandler(null);
  }, [data]);

  if (!data && loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      <p className="text-sm font-bold text-gray-500">Đang tải số liệu thống kê...</p>
    </div>
  );
  if (!data) return <div className="p-6 text-red-500">Lỗi tải dữ liệu</div>;

  const PIE_COLORS = ["#22c55e", "#3b82f6"];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-10">

      <div className="px-6 mt-6 max-w-[1600px] mx-auto">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
              {['today', '7days', 'thismonth'].map(t => {
                const labels = { today: 'Hôm nay', '7days': '7 ngày', 'thismonth': 'Tháng này' };
                return (
                  <button key={t} 
                    onClick={() => setFilters(f => ({ ...f, timeRange: t }))}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${filters.timeRange === t ? 'bg-white text-green-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>
            
            <select 
              value={filters.orderType} onChange={e => setFilters(f => ({...f, orderType: e.target.value}))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:border-gray-300 cursor-pointer shadow-sm">
              <option value="all">Loại đơn: Tất cả</option>
              <option value="online">Online</option>
              <option value="table">Tại bàn</option>
            </select>
            
            <select 
              value={filters.payment} onChange={e => setFilters(f => ({...f, payment: e.target.value}))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:border-gray-300 cursor-pointer shadow-sm">
              <option value="all">Thanh toán: Tất cả</option>
              <option value="cash">Tiền mặt</option>
              <option value="transfer">Chuyển khoản</option>
            </select>

            <select 
              value={filters.space} onChange={e => setFilters(f => ({...f, space: e.target.value}))}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:border-gray-300 cursor-pointer shadow-sm">
              <option value="all">Khu vực: Tất cả</option>
              <option value="Tầng 1">Tầng 1</option>
              <option value="Tầng 2">Tầng 2</option>
              <option value="Tầng 3">Tầng 3</option>
              <option value="Phòng VIP">Phòng VIP</option>
            </select>
          </div>
        </div>

        {/* 8 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Tổng doanh thu" value={data.overview.totalRevenue.value} growth={data.overview.totalRevenue.growth} isCurrency icon={ShoppingBag} />
          <StatCard title="Số đơn hàng" value={data.overview.orders.value} growth={data.overview.orders.growth} icon={ShoppingBag} />
          <StatCard title="AOV" value={data.overview.aov.value} growth={data.overview.aov.growth} isCurrency icon={TrendingUp} />
          <StatCard title="Tổng giảm giá" value={data.overview.discount.value} growth={data.overview.discount.growth} isCurrency icon={Tag} />
          
          <StatCard title="Doanh thu tiền mặt" value={data.overview.totalRevenue.value > 0 ? data.paymentSplit.cash.value : 0} isCurrency icon={Wallet} subtitle={<><AnimatedNumber value={data.paymentSplit.cash.pct} isDecimal duration={2000} />% tổng doanh thu</>} />
          <StatCard title="Doanh thu chuyển khoản" value={data.overview.totalRevenue.value > 0 ? data.paymentSplit.transfer.value : 0} isCurrency icon={QrCode} subtitle={<><AnimatedNumber value={data.paymentSplit.transfer.pct} isDecimal duration={2000} />% tổng doanh thu</>} />
          <StatCard title="Đơn online" value={data.overview.orders.value > 0 ? data.orderTypeSplit.online.value : 0} icon={Bike} subtitle={<><AnimatedNumber value={data.orderTypeSplit.online.pct} isDecimal duration={2000} />% tổng đơn hàng</>} />
          <StatCard title="Hóa đơn tại bàn" value={data.overview.orders.value > 0 ? data.orderTypeSplit.table.value : 0} icon={Armchair} subtitle={<><AnimatedNumber value={data.orderTypeSplit.table.pct} isDecimal duration={2000} />% tổng đơn hàng</>} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-1">
            <h3 className="text-base font-black text-primary mb-6">Biểu đồ doanh thu</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={v => v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontWeight: 'bold' }} formatter={(val) => [val.toLocaleString('vi-VN')+'đ', 'Doanh thu']} />
                  <Bar dataKey="revenue" fill="#15803d" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Donut */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-black text-primary mb-2">Phương thức thanh toán</h3>
            <div className="h-[200px] relative mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                      { name: "Tiền mặt", value: data.paymentSplit.cash.value },
                      { name: "VietQR", value: data.paymentSplit.transfer.value }
                    ]} 
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                    {PIE_COLORS.map((color, i) => <Cell key={`cell-${i}`} fill={color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontWeight: 'bold' }} formatter={(val) => val.toLocaleString('vi-VN')+'đ'}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-primary">
                  <AnimatedNumber value={data.overview.totalRevenue.value} isCurrency duration={2000} />
                </span>
                <span className="text-[10px] font-bold text-gray-400">Tổng doanh thu</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-bold text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>Tiền mặt</div>
                <div className="text-right"><div className="font-black text-primary"><AnimatedNumber value={data.paymentSplit.cash.value} isCurrency duration={2000} /></div><div className="text-[11px] font-bold text-gray-400"><AnimatedNumber value={data.paymentSplit.cash.pct} isDecimal duration={2000} />%</div></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-bold text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>VietQR</div>
                <div className="text-right"><div className="font-black text-primary"><AnimatedNumber value={data.paymentSplit.transfer.value} isCurrency duration={2000} /></div><div className="text-[11px] font-bold text-gray-400"><AnimatedNumber value={data.paymentSplit.transfer.pct} isDecimal duration={2000} />%</div></div>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-black text-primary mb-4">Top món bán chạy</h3>
            <div className="space-y-4 mt-6">
              {data.topItems.map((item, idx) => {
                const maxQty = Math.max(...data.topItems.map(i => i.quantity), 1);
                const w = (item.quantity / maxQty) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 truncate text-[13px] font-bold text-gray-700">{item.name}</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#15803d] rounded-full transition-all duration-1000 ease-out" style={{ width: `${animateBars ? w : 0}%` }}></div>
                    </div>
                    <div className="w-8 text-right text-[13px] font-black text-primary">
                      <AnimatedNumber value={item.quantity} duration={2000} />
                    </div>
                  </div>
                );
              })}
              {data.topItems.length === 0 && <div className="text-sm text-gray-400 text-center py-4 font-bold">Chưa có dữ liệu</div>}
            </div>
            {data.topItems.length > 0 && <div className="text-center text-xs font-bold text-gray-400 mt-5">Số lượng bán</div>}
          </div>

          {/* Revenue By Space */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-black text-primary mb-4">Doanh thu theo khu vực</h3>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">
                <span>Khu vực</span>
                <div className="flex items-center gap-8 text-right"><span className="w-20">Doanh thu</span><span className="w-10">Tỷ lệ</span></div>
              </div>
              <div className="space-y-3">
                {data.spaceRevenue.map((sp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[13px]">
                    <span className="font-bold text-gray-700">{sp.name}</span>
                    <div className="flex items-center gap-8 text-right">
                      <span className="w-20 font-black text-primary"><AnimatedNumber value={sp.revenue} isCurrency duration={2000} /></span>
                      <span className="w-10 font-bold text-gray-500"><AnimatedNumber value={sp.pct} isDecimal duration={2000} />%</span>
                    </div>
                  </div>
                ))}
                {data.spaceRevenue.length === 0 && <div className="text-sm text-gray-400 text-center py-4 font-bold">Chưa có dữ liệu</div>}
              </div>
              {data.spaceRevenue.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 bg-[#f0fdf4] -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                  <span className="font-black text-green-800 text-[13px]">Tổng</span>
                  <div className="flex items-center gap-8 text-right">
                    <span className="w-20 font-black text-green-700 text-[13px]"><AnimatedNumber value={data.overview.totalRevenue.value} isCurrency duration={2000} /></span>
                    <span className="w-10 font-black text-green-700 text-[13px]"><AnimatedNumber value={100} duration={2000} />%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-base font-black text-primary">Giao dịch gần đây</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Mã đơn</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Khách hàng</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Loại đơn</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Khu vực / Bàn</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Tổng tiền</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Giảm giá</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">Thanh toán</th>
                  <th className="py-3 px-5 text-[12px] font-bold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentTransactions.slice((page - 1) * limit, page * limit).map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 text-[13px] font-bold text-gray-700 whitespace-nowrap">{tx.orderId}</td>
                    <td className="py-3 px-5 text-[13px] font-bold text-gray-600 whitespace-nowrap">{tx.customerName}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-black ${tx.orderType === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {tx.orderType}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[13px] font-bold text-gray-600 whitespace-nowrap">{tx.area}</td>
                    <td className="py-3 px-5 text-[13px] font-black text-primary text-right whitespace-nowrap">{tx.total.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-5 text-[13px] font-bold text-gray-500 text-right whitespace-nowrap">{tx.discount > 0 ? tx.discount.toLocaleString('vi-VN') + 'đ' : '0đ'}</td>
                    <td className="py-3 px-5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-black ${tx.paymentMethod === 'Tiền mặt' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[13px] font-bold text-gray-500 text-right whitespace-nowrap">{new Date(tx.time).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
                  </tr>
                ))}
                {data.recentTransactions.length === 0 && (
                  <tr><td colSpan="8" className="py-8 text-center text-sm font-bold text-gray-400">Không có giao dịch nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data.recentTransactions.length > 0 && (
            <div className="border-t border-gray-100 p-4">
              <GlobalPagination
                total={data.recentTransactions.length}
                page={page}
                limit={limit}
                onPageChange={setPage}
                limitOptions={[5]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
