import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken, getCurrentUser } from "../../utils/auth";
import { DashboardCard, StatusLine, PanelHeader, EmptyRow, SmallStat, CategoryLine, AnimatedNumber } from "../../components/admin/AdminDashboardComponents";
import { ShoppingBag, CalendarCheck, Users, Wallet, ArrowUp, ArrowDown, MoreVertical, Clock3, CheckCircle, XCircle, Truck, Utensils, Crown, Star } from "lucide-react";
import { formatPriceDashboard, formatDateTimeDashboard, formatDateDashboard, getOrderStatusStyle, getOrderStatusText, getBookingStatusStyle, getBookingStatusText } from "../../utils/dashboardHelpers";

const API_URL = "http://localhost:5001/api/admin/dashboard/stats";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isStaff = currentUser?.role === "staff";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueRange, setRevenueRange] = useState("7");
  const [categoryRange, setCategoryRange] = useState("week");
  const [chartProgress, setChartProgress] = useState(0);
  const animFrameRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const fetchStats = async (revRange = revenueRange, catRange = categoryRange) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?revenueRange=${revRange}&categoryRange=${catRange}`, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      const data = await res.json();
      if (data.success) setStats(data.stats); else setError(data.message || "Không thể tải dữ liệu thống kê.");
    } catch (err) { setError("Lỗi kết nối máy chủ backend."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(revenueRange, categoryRange); }, [revenueRange, categoryRange]);

  useEffect(() => {
    if (!loading && stats) {
      const DURATION = 2000; const startTime = performance.now();
      const tick = (now) => {
        const elapsed = now - startTime; const raw = Math.min(elapsed / DURATION, 1);
        const eased = 1 - Math.pow(1 - raw, 3);
        setChartProgress(eased);
        if (raw < 1) animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
      return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }
  }, [loading, stats]);

  const { totalUsers = 0, totalOrders = 0, totalBookings = 0, totalRevenue = 0, totalProfit = 0, totalBookingGuests = 0, activeMenuItems = 0, orderStatusBreakdown = {}, latestOrders = [], latestBookings = [], bestFoods = [], categoryRevenue = [], dailyLabels = [], dailyRevenues = [], dailyProfits = [], growths = {} } = stats || {};

  const orderStatusPending = orderStatusBreakdown.pending || 0;
  const orderStatusPreparing = orderStatusBreakdown.preparing || 0;
  const orderStatusDelivering = orderStatusBreakdown.delivering || 0;
  const orderStatusCompleted = orderStatusBreakdown.completed || 0;
  const orderStatusCancelled = orderStatusBreakdown.cancelled || 0;

  if (loading) return (<div className="flex flex-col items-center justify-center py-32 space-y-4"><div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div><p className="text-sm font-bold text-gray-500">Đang tải số liệu thống kê...</p></div>);
  if (error) return (<div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3 max-w-md mx-auto my-20"><p className="font-black text-red-700 text-lg">Đã xảy ra lỗi</p><p className="text-sm text-red-600 font-semibold">{error}</p><button onClick={() => fetchStats()} className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition">Thử lại</button></div>);

  const maxDailyValue = Math.max(...dailyRevenues, 1000000);
  const totalOrdersRevenue = categoryRevenue.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  const centerPrice = hoveredCategory !== null ? categoryRevenue[hoveredCategory]?.revenue || 0 : totalRevenue;
  const centerTitle = hoveredCategory !== null ? categoryRevenue[hoveredCategory]?.name : "Tổng doanh thu";

  const renderOrderStatusSection = () => (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-black text-primary">Trạng thái đơn hàng</h3>
        <Link to="/admin/orders" className="text-primary font-black text-xs hover:text-primary-light flex items-center gap-1 transition-colors">Xem tất cả &gt;</Link>
      </div>
      <div className="space-y-4">
        <StatusLine icon={<Clock3 />} title="Chờ xác nhận" value={orderStatusPending} bg="bg-yellow-50" color="text-yellow-600" total={totalOrders} chartProgress={chartProgress} to="/admin/orders?status=pending" />
        <StatusLine icon={<ShoppingBag />} title="Đang chuẩn bị" value={orderStatusPreparing} bg="bg-blue-50" color="text-blue-600" total={totalOrders} chartProgress={chartProgress} to="/admin/orders?status=preparing" />
        <StatusLine icon={<Truck />} title="Đang giao" value={orderStatusDelivering} bg="bg-emerald-50" color="text-emerald-600" total={totalOrders} chartProgress={chartProgress} to="/admin/orders?status=delivering" />
        <StatusLine icon={<CheckCircle />} title="Hoàn thành" value={orderStatusCompleted} bg="bg-green-50" color="text-green-600" total={totalOrders} chartProgress={chartProgress} to="/admin/orders?status=completed" />
        <StatusLine icon={<XCircle />} title="Đã hủy" value={orderStatusCancelled} bg="bg-red-50" color="text-red-500" total={totalOrders} chartProgress={chartProgress} to="/admin/orders?status=cancelled" />
      </div>
    </section>
  );

  const renderBestFoodsSection = () => (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
      <PanelHeader title="Món ăn bán chạy" to="/admin/menu" />
      <div className="p-4 space-y-3.5 max-h-[340px] overflow-y-auto">
        {bestFoods.length > 0 ? (
          bestFoods.map((food, index) => (
            <Link key={food.name} to={`/admin/menu?view=${food.id}`} className="flex items-center gap-3.5 hover:bg-gray-50/20 p-1.5 rounded-2xl transition-colors block hover:no-underline">
              <img src={food.image} alt={food.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100 shadow-sm" />
              <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center font-black text-[10px] text-gray-400 shrink-0 border border-gray-100">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-primary text-xs truncate">{food.name}</p>
                <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">Đã bán {food.qty}</p>
              </div>
              <p className="font-black text-gray-700 text-xs shrink-0">{formatPriceDashboard(food.price)}</p>
            </Link>
          ))
        ) : (<div className="py-14 text-center text-gray-400 font-bold">Chưa có dữ liệu món bán chạy</div>)}
      </div>
    </section>
  );

  const renderLatestOrdersSection = (forStaff = false) => (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
      <PanelHeader title="Đơn hàng gần đây" to="/admin/orders" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-gray-400 font-extrabold bg-gray-50/50 uppercase text-[10px]">
            <tr>
              <th className="pl-6 pr-2 py-3">Mã đơn</th>
              <th className="px-3 py-3">Khách hàng</th>
              {!forStaff && <th className="px-3 py-3">Tổng tiền</th>}
              <th className="px-3 py-3">Trạng thái</th>
              <th className="pl-2 pr-6 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {latestOrders.length > 0 ? (
              latestOrders.map((order, index) => (
                <tr key={order.id || index} onClick={() => navigate(`/admin/orders?search=${order.orderCode || order.id}&view=${order.id}`)} className="border-t border-gray-50 hover:bg-gray-50/20 transition-colors cursor-pointer">
                  <td className="pl-6 pr-2 py-4 font-black text-green-700 whitespace-nowrap">#{order.id}</td>
                  <td className="px-3 py-4"><p className="font-black text-gray-700 truncate max-w-[100px]">{order.customerName || order.fullName || order.name || "Khách hàng"}</p></td>
                  {!forStaff && <td className="px-3 py-4 font-black text-primary whitespace-nowrap">{formatPriceDashboard(order.total || order.totalPrice)}</td>}
                  <td className="px-3 py-4"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${getOrderStatusStyle(order.status)}`}>{getOrderStatusText(order.status)}</span></td>
                  <td className="pl-2 pr-6 py-4 text-gray-500 font-bold whitespace-nowrap">{forStaff ? formatDateTimeDashboard(order.createdAt) : (order.createdAt ? order.createdAt.slice(11, 16) : "--:--")}</td>
                </tr>
              ))
            ) : (<EmptyRow colSpan={forStaff ? "4" : "5"} text="Chưa có đơn hàng mới" />)}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderLatestBookingsSection = (forStaff = false) => (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
      <PanelHeader title="Lịch đặt bàn gần đây" to="/admin/bookings" />
      <div className="divide-y divide-gray-50 max-h-[340px] overflow-y-auto">
        {latestBookings.length > 0 ? (
          latestBookings.map((booking, index) => (
            <Link key={booking.id || index} to={`/admin/bookings?search=${booking.bookingCode || booking.phone || booking.id}&view=${booking.id}`} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/10 transition-colors block hover:no-underline">
              {forStaff ? (
                <>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><p className="font-black text-primary text-xs truncate">{booking.customerName || booking.name || "Khách đặt bàn"}</p><span className="text-[10px] font-bold text-gray-400 shrink-0">({booking.guests || 0} khách)</span></div>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Ngày đặt: {formatDateDashboard(booking.date)} | Giờ: {booking.time}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${getBookingStatusStyle(booking.status)}`}>{getBookingStatusText(booking.status)}</span>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="w-14 h-10 rounded-xl bg-green-50 text-green-700 flex flex-col items-center justify-center font-black text-[10px] p-1 border border-green-100/50 shrink-0"><span className="font-extrabold text-[9px] text-green-600 uppercase">Hôm nay</span><span>{booking.time ? booking.time.slice(0, 5) : "--:--"}</span></div>
                    <div>
                      <p className="font-black text-primary text-xs">{booking.customerName || booking.fullName || booking.name || "Khách hàng"}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{booking.phone || "Chưa có SĐT"}</p>
                      <p className="text-[10px] text-gray-500 font-extrabold mt-0.5">{booking.selectedAreaTitle || booking.area || "Nhà hàng sắp xếp"} - Bàn {booking.selectedTable || "Đang xếp"}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${getBookingStatusStyle(booking.status)}`}>{getBookingStatusText(booking.status)}</span>
                </>
              )}
            </Link>
          ))
        ) : (<div className="px-5 py-14 text-center text-gray-400 font-bold">Chưa có lịch đặt bàn</div>)}
      </div>
    </section>
  );

  if (isStaff) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 delay-kpi">
          <DashboardCard icon={<ShoppingBag />} title="Đơn hàng" value={totalOrders} percent={growths.orders || "0.0%"} bg="bg-blue-50" color="text-blue-600" to="/admin/orders" />
          <DashboardCard icon={<CalendarCheck />} title="Đặt bàn" value={totalBookings} percent={growths.bookings || "0.0%"} bg="bg-purple-50" color="text-purple-600" to="/admin/bookings" />
          <DashboardCard icon={<Users />} title="Khách hàng mới" value={totalUsers} percent={growths.users || "0.0%"} bg="bg-orange-50" color="text-orange-600" to="/admin/users" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 delay-chart">
          {renderOrderStatusSection()}
          {renderBestFoodsSection()}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 delay-table">
          {renderLatestOrdersSection(true)}
          {renderLatestBookingsSection(true)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 delay-kpi">
        <DashboardCard icon={<Wallet />} title="Tổng doanh thu" value={totalRevenue} isCurrency={true} percent={growths.revenue || "0.0%"} bg="bg-green-50" color="text-green-700" to="/admin/revenue" />
        <DashboardCard icon={<ShoppingBag />} title="Đơn hàng" value={totalOrders} percent={growths.orders || "0.0%"} bg="bg-blue-50" color="text-blue-600" to="/admin/orders" />
        <DashboardCard icon={<CalendarCheck />} title="Đặt bàn" value={totalBookings} percent={growths.bookings || "0.0%"} bg="bg-purple-50" color="text-purple-600" to="/admin/bookings" />
        <DashboardCard icon={<Users />} title="Khách hàng mới" value={totalUsers} percent={growths.users || "0.0%"} bg="bg-orange-50" color="text-orange-600" to="/admin/users" />
        <DashboardCard icon={<Wallet />} title="Lợi nhuận" value={totalProfit} isCurrency={true} percent={growths.profit || "0.0%"} bg="bg-red-50" color="text-red-500" to="/admin/revenue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] xl:grid-cols-[1.35fr_1.05fr_.8fr] gap-4 delay-chart">
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-primary">Doanh thu</h3>
            <select value={revenueRange} onChange={(e) => setRevenueRange(e.target.value)} className="h-10 px-4 rounded-xl border border-gray-100 text-sm font-bold outline-none bg-white cursor-pointer">
              <option value="7">7 ngày qua</option><option value="30">30 ngày qua</option><option value="month">Tháng này</option><option value="year">Năm nay</option>
            </select>
          </div>
          <div className="flex items-center gap-6 mb-5 text-sm font-bold text-gray-600">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600"></span>Doanh thu</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span>Lợi nhuận</div>
          </div>
          <div className="h-[210px] flex items-end gap-4 border-b border-l border-gray-100 px-4 pt-5">
            {dailyRevenues.map((rev, index) => {
              const revPercent = (((rev / maxDailyValue) * 85) * chartProgress).toFixed(0);
              const profitPercent = ((((dailyProfits[index] / maxDailyValue) * 85)) * chartProgress).toFixed(0);
              return (
                <div key={index} className="flex-1 flex items-end gap-1.5 h-full">
                  <div className="w-full rounded-t-xl bg-primary hover:bg-primary-light cursor-pointer relative group" style={{ height: `${revPercent}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-primary-light text-white text-[10px] py-1.5 px-2 rounded-lg font-black pointer-events-none transition duration-150 whitespace-nowrap z-50 shadow-lg">Doanh thu: {formatPriceDashboard(rev)}</div>
                  </div>
                  <div className="w-full rounded-t-xl bg-amber-500 hover:bg-amber-600 cursor-pointer relative group" style={{ height: `${profitPercent}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-amber-950 text-white text-[10px] py-1.5 px-2 rounded-lg font-black pointer-events-none transition duration-150 whitespace-nowrap z-50 shadow-lg">Lợi nhuận: {formatPriceDashboard(dailyProfits[index])}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-bold mt-2">{dailyLabels.map((day) => (<span key={day}>{day}</span>))}</div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-primary">Doanh thu theo danh mục</h3>
            <select value={categoryRange} onChange={(e) => setCategoryRange(e.target.value)} className="h-10 px-4 rounded-xl border border-gray-100 text-sm font-bold outline-none bg-white cursor-pointer">
              <option value="today">Hôm nay</option><option value="week">Tuần này</option><option value="month">Tháng này</option><option value="year">Năm nay</option>
            </select>
          </div>
          <div className="grid md:grid-cols-[210px_1fr] gap-4 items-center">
            {(() => {
              const hexColors = ["#16a34a", "#f59e0b", "#3b82f6", "#8b5cf6", "#9ca3af"];
              const slices = categoryRevenue.slice(0, 5).map((cat, idx) => ({ color: hexColors[idx % hexColors.length], pct: totalOrdersRevenue > 0 ? (cat.revenue / totalOrdersRevenue) * 100 : 0 }));
              const totalPct = slices.reduce((s, x) => s + x.pct, 0);
              let cursor = 0; const stops = [];
              slices.forEach(({ color, pct }) => {
                const start = cursor * chartProgress; const end = (cursor + pct) * chartProgress;
                stops.push(`${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
                cursor += pct;
              });
              const grayEnd = totalPct * chartProgress; stops.push(`#f3f4f6 ${grayEnd.toFixed(2)}% 100%`);
              const gradient = slices.length > 0 ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#f3f4f6 0 100%)";
              return (
                <div className="relative w-[210px] h-[210px] rounded-full mx-auto" style={{ background: gradient }}>
                  <div className="absolute inset-10 bg-white rounded-full flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <div className="w-[120px] overflow-hidden truncate font-black text-primary text-base leading-tight">{formatPriceDashboard(centerPrice)}</div>
                    <div className="w-[125px] overflow-hidden truncate text-[10px] text-gray-400 font-bold mt-1">{centerTitle}</div>
                  </div>
                </div>
              );
            })()}
            <div className="space-y-4">
              {categoryRevenue.length > 0 ? (
                categoryRevenue.slice(0, 5).map((cat, idx) => {
                  const colors = ["bg-green-600", "bg-yellow-500", "bg-blue-500", "bg-purple-500", "bg-gray-400"];
                  const pct = totalOrdersRevenue > 0 ? ((cat.revenue / totalOrdersRevenue) * 100).toFixed(1) + "%" : "0%";
                  return (<div key={`${cat.name}-${idx}`} onMouseEnter={() => setHoveredCategory(idx)} onMouseLeave={() => setHoveredCategory(null)} className="cursor-pointer"><CategoryLine color={colors[idx % colors.length]} name={cat.name} value={pct} chartProgress={chartProgress} /></div>);
                })
              ) : (<><CategoryLine color="bg-green-600" name="Dê tươi" value="0%" chartProgress={chartProgress} /><CategoryLine color="bg-yellow-500" name="Lẩu" value="0%" chartProgress={chartProgress} /></>)}
            </div>
          </div>
        </section>

        {renderOrderStatusSection()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 delay-table">
        {renderLatestOrdersSection(false)}
        {renderLatestBookingsSection(false)}
        {renderBestFoodsSection()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <SmallStat icon={<Users />} title="Tổng khách hàng" value={totalUsers} change="8.2%" />
        <SmallStat icon={<Crown />} title="Khách hàng thân thiết" value={Math.round(totalUsers * 0.2)} change="6.1%" orange />
        <SmallStat icon={<Utensils />} title="Tổng khách đặt bàn" value={totalBookingGuests} change="3" />
        <SmallStat icon={<Users />} title="Nhân viên" value="24" change="2" />
        <SmallStat icon={<Star />} title="Đánh giá trung bình" value="4.8/5" />
      </div>
    </div>
  );
}

export default AdminDashboardPage;
