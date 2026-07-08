import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken, getCurrentUser } from "../../utils/auth";
import {
  ShoppingBag,
  CalendarCheck,
  Users,
  Wallet,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Clock3,
  CheckCircle,
  XCircle,
  Truck,
  Utensils,
  Crown,
  Star,
} from "lucide-react";

const API_URL = "http://localhost:5001/api/admin/dashboard/stats";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isStaff = currentUser?.role === "staff";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc cho doanh thu và danh mục
  const [revenueRange, setRevenueRange] = useState("7");
  const [categoryRange, setCategoryRange] = useState("week");

  const fetchStats = async (revRange = revenueRange, catRange = categoryRange) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}?revenueRange=${revRange}&categoryRange=${catRange}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || "Không thể tải dữ liệu thống kê.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối máy chủ backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(revenueRange, categoryRange);
  }, [revenueRange, categoryRange]);

  // Quản lý giá trị scale hoạt họa cho cột biểu đồ và biểu đồ hình tròn (0 → 1)
  const [chartProgress, setChartProgress] = useState(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!loading && stats) {
      // Chạy animation mượt trong 2 giây bằng requestAnimationFrame
      const DURATION = 2000;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const raw = Math.min(elapsed / DURATION, 1);
        // easeOutCubic cho cảm giác tự nhiên: nhanh lúc đầu, chậm dần cuối
        const eased = 1 - Math.pow(1 - raw, 3);
        setChartProgress(eased);
        if (raw < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }
  }, [loading, stats]);

  // Quản lý index danh mục đang được hover chuột để hiển thị số tiền ở giữa hình tròn
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "Chưa có";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  const {
    totalUsers = 0,
    totalOrders = 0,
    totalBookings = 0,
    totalRevenue = 0,
    totalBookingGuests = 0,
    activeMenuItems = 0,
    orderStatusBreakdown = {},
    latestOrders = [],
    latestBookings = [],
    bestFoods = [],
    categoryRevenue = [],
    dailyLabels = [],
    dailyRevenues = [],
    dailyProfits = [],
    growths = {},
  } = stats || {};

  const orderStatusPending = orderStatusBreakdown.pending || 0;
  const orderStatusPreparing = orderStatusBreakdown.preparing || 0;
  const orderStatusDelivering = orderStatusBreakdown.delivering || 0;
  const orderStatusCompleted = orderStatusBreakdown.completed || 0;
  const orderStatusCancelled = orderStatusBreakdown.cancelled || 0;

  const getOrderStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "cancelled":
      case "canceled":
        return "Đã hủy";
      case "delivering":
        return "Đang giao";
      case "preparing":
        return "Đang chuẩn bị";
      case "pending":
        return "Chờ xác nhận";
      default:
        return status || "Chờ xác nhận";
    }
  };

  const getOrderStatusStyle = (status) => {
    const text = getOrderStatusText(status);

    if (text.includes("Hoàn thành")) return "bg-green-50 text-green-700";
    if (text.includes("hủy")) return "bg-red-50 text-red-600";
    if (text.includes("giao")) return "bg-emerald-50 text-emerald-700";
    if (text.includes("chuẩn bị")) return "bg-blue-50 text-blue-700";

    return "bg-yellow-50 text-yellow-700";
  };

  const getBookingStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "pending":
      default:
        return "Sắp tới";
    }
  };

  const getBookingStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "bg-green-50 text-green-700";
      case "cancelled":
        return "bg-red-50 text-red-600";
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-sm font-bold text-gray-500">Đang tải số liệu thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-center space-y-3 max-w-md mx-auto my-20">
        <p className="font-black text-red-700 text-lg">Đã xảy ra lỗi</p>
        <p className="text-sm text-red-600 font-semibold">{error}</p>
        <button
          onClick={fetchStats}
          className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Tính chiều cao cột tương đối theo phần trăm của giá trị doanh thu lớn nhất trong 7 ngày
  const maxDailyValue = Math.max(...dailyRevenues, 1000000); 

  // Tính tổng doanh thu từ orders thời gian thực (để tính % chính xác cho từng danh mục)
  const totalOrdersRevenue = categoryRevenue.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

  // Lấy ra thông tin hiển thị ở trung tâm hình tròn (mặc định là tổng doanh thu hoặc doanh thu của danh mục đang hover)
  const centerPrice = hoveredCategory !== null 
    ? categoryRevenue[hoveredCategory]?.revenue || 0
    : totalRevenue;

  const centerTitle = hoveredCategory !== null
    ? categoryRevenue[hoveredCategory]?.name
    : "Tổng doanh thu";

  if (isStaff) {
    return (
      <div className="space-y-5">
        {/* TOP STATS FOR STAFF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 delay-kpi">
          <DashboardCard
            icon={<ShoppingBag />}
            title="Đơn hàng"
            value={totalOrders}
            percent={growths.orders || "0.0%"}
            bg="bg-blue-50"
            color="text-blue-600"
            to="/admin/orders"
          />

          <DashboardCard
            icon={<CalendarCheck />}
            title="Đặt bàn"
            value={totalBookings}
            percent={growths.bookings || "0.0%"}
            bg="bg-purple-50"
            color="text-purple-600"
            to="/admin/bookings"
          />

          <DashboardCard
            icon={<Users />}
            title="Khách hàng mới"
            value={totalUsers}
            percent={growths.users || "0.0%"}
            bg="bg-orange-50"
            color="text-orange-600"
            to="/admin/users"
          />
        </div>

        {/* MIDDLE SECTION FOR STAFF */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 delay-chart">
          {/* Order status */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-primary">
                Trạng thái đơn hàng
              </h3>
              <Link to="/admin/orders" className="text-primary font-black text-xs hover:text-primary-light flex items-center gap-1 transition-colors">
                Xem tất cả &gt;
              </Link>
            </div>

            <div className="space-y-4">
              <StatusLine
                icon={<Clock3 />}
                title="Chờ xác nhận"
                value={orderStatusPending}
                bg="bg-yellow-50"
                color="text-yellow-600"
                total={totalOrders}
                chartProgress={chartProgress}
                to="/admin/orders?status=pending"
              />

              <StatusLine
                icon={<ShoppingBag />}
                title="Đang chuẩn bị"
                value={orderStatusPreparing}
                bg="bg-blue-50"
                color="text-blue-600"
                total={totalOrders}
                chartProgress={chartProgress}
                to="/admin/orders?status=preparing"
              />

              <StatusLine
                icon={<Truck />}
                title="Đang giao"
                value={orderStatusDelivering}
                bg="bg-emerald-50"
                color="text-emerald-600"
                total={totalOrders}
                chartProgress={chartProgress}
                to="/admin/orders?status=delivering"
              />

              <StatusLine
                icon={<CheckCircle />}
                title="Hoàn thành"
                value={orderStatusCompleted}
                bg="bg-green-50"
                color="text-green-600"
                total={totalOrders}
                chartProgress={chartProgress}
                to="/admin/orders?status=completed"
              />

              <StatusLine
                icon={<XCircle />}
                title="Đã hủy"
                value={orderStatusCancelled}
                bg="bg-red-50"
                color="text-red-500"
                total={totalOrders}
                chartProgress={chartProgress}
                to="/admin/orders?status=cancelled"
              />
            </div>
          </section>

          {/* Best selling */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
            <PanelHeader title="Món ăn bán chạy" to="/admin/menu" />

            <div className="p-4 space-y-3.5 max-h-[340px] overflow-y-auto">
              {bestFoods.length > 0 ? (
                bestFoods.map((food, index) => (
                  <Link
                    key={food.name}
                    to={`/admin/menu?view=${food.id}`}
                    className="flex items-center gap-3.5 hover:bg-gray-50/20 p-1.5 rounded-2xl transition-colors block hover:no-underline"
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100 shadow-sm"
                    />

                    <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center font-black text-[10px] text-gray-400 shrink-0 border border-gray-100">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-primary text-xs truncate">
                        {food.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">
                        Đã bán {food.qty}
                      </p>
                    </div>

                    <p className="font-black text-gray-700 text-xs shrink-0">{formatPrice(food.price)}</p>
                  </Link>
                ))
              ) : (
                <div className="py-14 text-center text-gray-400 font-bold">
                  Chưa có dữ liệu món bán chạy
                </div>
              )}
            </div>
          </section>
        </div>

        {/* BOTTOM SECTION FOR STAFF */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 delay-table">
          {/* Latest orders */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
            <PanelHeader title="Đơn hàng gần đây" to="/admin/orders" />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-gray-400 font-extrabold bg-gray-50/50 uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Mã đơn</th>
                    <th className="px-5 py-3">Khách hàng</th>
                    <th className="px-5 py-3">Trạng thái</th>
                    <th className="px-5 py-3">Thời gian</th>
                  </tr>
                </thead>

                <tbody>
                  {latestOrders.length > 0 ? (
                    latestOrders.map((order, index) => (
                      <tr
                        key={order.id || index}
                        onClick={() => navigate(`/admin/orders?search=${order.orderCode || order.id}&view=${order.id}`)}
                        className="border-t border-gray-50 hover:bg-gray-50/20 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4 font-black text-green-700">
                          #{order.id}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-black text-gray-700">
                            {order.customerName ||
                              order.fullName ||
                              order.name ||
                              "Khách hàng"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getOrderStatusStyle(
                              order.status,
                            )}`}
                          >
                            {getOrderStatusText(order.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-500 font-bold">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-5 py-8 text-center text-gray-400 font-bold"
                      >
                        Chưa có đơn hàng mới
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Latest bookings */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
            <PanelHeader title="Lịch đặt bàn gần đây" to="/admin/bookings" />

            <div className="divide-y divide-gray-50 max-h-[340px] overflow-y-auto">
              {latestBookings.length > 0 ? (
                latestBookings.map((booking, index) => (
                  <Link
                    key={booking.id || index}
                    to={`/admin/bookings?search=${booking.bookingCode || booking.phone || booking.id}&view=${booking.id}`}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/10 transition-colors block hover:no-underline"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-primary text-xs truncate">
                          {booking.customerName || booking.name || "Khách đặt bàn"}
                        </p>
                        <span className="text-[10px] font-bold text-gray-400 shrink-0">
                          ({booking.guests || 0} khách)
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-400 font-bold mt-1">
                        Ngày đặt: {formatDate(booking.date)} | Giờ: {booking.time}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${getBookingStatusStyle(
                        booking.status,
                      )}`}
                    >
                      {getBookingStatusText(booking.status)}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-14 text-center text-gray-400 font-bold">
                  Chưa có lịch đặt bàn
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* TOP STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 delay-kpi">
        <DashboardCard
          icon={<Wallet />}
          title="Tổng doanh thu"
          value={totalRevenue}
          isCurrency={true}
          percent={growths.revenue || "0.0%"}
          bg="bg-green-50"
          color="text-green-700"
          to="/admin/revenue"
        />

        <DashboardCard
          icon={<ShoppingBag />}
          title="Đơn hàng"
          value={totalOrders}
          percent={growths.orders || "0.0%"}
          bg="bg-blue-50"
          color="text-blue-600"
          to="/admin/orders"
        />

        <DashboardCard
          icon={<CalendarCheck />}
          title="Đặt bàn"
          value={totalBookings}
          percent={growths.bookings || "0.0%"}
          bg="bg-purple-50"
          color="text-purple-600"
          to="/admin/bookings"
        />

        <DashboardCard
          icon={<Users />}
          title="Khách hàng mới"
          value={totalUsers}
          percent={growths.users || "0.0%"}
          bg="bg-orange-50"
          color="text-orange-600"
          to="/admin/users"
        />
        <DashboardCard
          icon={<Wallet />}
          title="Lợi nhuận"
          value={totalRevenue * 0.38}
          isCurrency={true}
          percent={growths.profit || "0.0%"}
          bg="bg-red-50"
          color="text-red-500"
          to="/admin/revenue"
        />
      </div>

      {/* CHART + STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] xl:grid-cols-[1.35fr_1.05fr_.8fr] gap-4 delay-chart">
        {/* Revenue chart */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-primary">Doanh thu</h3>

            <select 
              value={revenueRange}
              onChange={(e) => setRevenueRange(e.target.value)}
              className="h-10 px-4 rounded-xl border border-gray-100 text-sm font-bold outline-none bg-white cursor-pointer"
            >
              <option value="7">7 ngày qua</option>
              <option value="30">30 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>

          <div className="flex items-center gap-6 mb-5 text-sm font-bold text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              Doanh thu
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Lợi nhuận
            </div>
          </div>

          <div className="h-[210px] flex items-end gap-4 border-b border-l border-gray-100 px-4 pt-5">
            {dailyRevenues.map((rev, index) => {
              // Nhân với chartProgress để cột tăng dần từ 0% lên revPercent%
              const revPercent = (((rev / maxDailyValue) * 85) * chartProgress).toFixed(0);
              const profitPercent = ((((dailyProfits[index] / maxDailyValue) * 85)) * chartProgress).toFixed(0);
              return (
                <div key={index} className="flex-1 flex items-end gap-1.5 h-full">
                  {/* Cột Doanh thu - màu xanh đậm, chỉ hiển thị tooltip khi hover chính nó */}
                  <div
                    className="w-full rounded-t-xl bg-primary hover:bg-primary-light cursor-pointer relative group"
                    style={{ height: `${revPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-primary-light text-white text-[10px] py-1.5 px-2 rounded-lg font-black pointer-events-none transition duration-150 whitespace-nowrap z-50 shadow-lg">
                      Doanh thu: {formatPrice(rev)}
                    </div>
                  </div>

                  {/* Cột Lợi nhuận - màu vàng đậm/amber, chỉ hiển thị tooltip khi hover chính nó */}
                  <div
                    className="w-full rounded-t-xl bg-amber-500 hover:bg-amber-600 cursor-pointer relative group"
                    style={{ height: `${profitPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-amber-950 text-white text-[10px] py-1.5 px-2 rounded-lg font-black pointer-events-none transition duration-150 whitespace-nowrap z-50 shadow-lg">
                      Lợi nhuận: {formatPrice(dailyProfits[index])}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-bold mt-2">
            {dailyLabels.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </section>

        {/* Category revenue */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-primary">
              Doanh thu theo danh mục
            </h3>

            <select
              value={categoryRange}
              onChange={(e) => setCategoryRange(e.target.value)}
              className="h-10 px-4 rounded-xl border border-gray-100 text-sm font-bold outline-none bg-white cursor-pointer"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>

          <div className="grid md:grid-cols-[210px_1fr] gap-4 items-center">
            {/* Vòng tròn doanh thu - màu chạy dần theo dữ liệu API từng danh mục */}
            {(() => {
              const hexColors = ["#16a34a", "#f59e0b", "#3b82f6", "#8b5cf6", "#9ca3af"];
              // Tính % từng danh mục từ API thực tế
              const slices = categoryRevenue.slice(0, 5).map((cat, idx) => ({
                color: hexColors[idx % hexColors.length],
                pct: totalOrdersRevenue > 0 ? (cat.revenue / totalOrdersRevenue) * 100 : 0,
              }));
              // Tổng % để đảm bảo phần còn lại là xám
              const totalPct = slices.reduce((s, x) => s + x.pct, 0);

              // Xây conic-gradient: mỗi dải màu loang dần theo chartProgress
              let cursor = 0;
              const stops = [];
              slices.forEach(({ color, pct }) => {
                const start = cursor * chartProgress;
                const end = (cursor + pct) * chartProgress;
                stops.push(`${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`);
                cursor += pct;
              });
              // Phần xám còn lại (chưa có dữ liệu)
              const grayEnd = totalPct * chartProgress;
              stops.push(`#f3f4f6 ${grayEnd.toFixed(2)}% 100%`);

              const gradient = slices.length > 0
                ? `conic-gradient(${stops.join(", ")})`
                : "conic-gradient(#f3f4f6 0 100%)";

              return (
                <div
                  className="relative w-[210px] h-[210px] rounded-full mx-auto"
                  style={{ background: gradient }}
                >
                  <div className="absolute inset-10 bg-white rounded-full flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <div className="w-[120px] overflow-hidden truncate font-black text-primary text-base leading-tight">
                      {formatPrice(centerPrice)}
                    </div>
                    <div className="w-[125px] overflow-hidden truncate text-[10px] text-gray-400 font-bold mt-1">
                      {centerTitle}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              {categoryRevenue.length > 0 ? (
                categoryRevenue.slice(0, 5).map((cat, idx) => {
                  const colors = ["bg-green-600", "bg-yellow-500", "bg-blue-500", "bg-purple-500", "bg-gray-400"];
                  const pct = totalOrdersRevenue > 0 ? ((cat.revenue / totalOrdersRevenue) * 100).toFixed(1) + "%" : "0%";
                  return (
                    <div 
                      key={cat.name}
                      onMouseEnter={() => setHoveredCategory(idx)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className="cursor-pointer"
                    >
                      <CategoryLine
                        color={colors[idx % colors.length]}
                        name={cat.name}
                        value={pct}
                        chartProgress={chartProgress}
                      />
                    </div>
                  );
                })
              ) : (
                <>
                  <CategoryLine
                    color="bg-green-600"
                    name="Dê tươi"
                    value="0%"
                    chartProgress={chartProgress}
                  />
                  <CategoryLine
                    color="bg-yellow-500"
                    name="Lẩu"
                    value="0%"
                    chartProgress={chartProgress}
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Order status */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-primary">
              Trạng thái đơn hàng
            </h3>

            <Link to="/admin/orders" className="text-primary font-black text-xs hover:text-primary-light flex items-center gap-1 transition-colors">
              Xem tất cả &gt;
            </Link>
          </div>

          <div className="space-y-4">
            <StatusLine
              icon={<Clock3 />}
              title="Chờ xác nhận"
              value={orderStatusPending}
              bg="bg-yellow-50"
              color="text-yellow-600"
              total={totalOrders}
              chartProgress={chartProgress}
              to="/admin/orders?status=pending"
            />

            <StatusLine
              icon={<ShoppingBag />}
              title="Đang chuẩn bị"
              value={orderStatusPreparing}
              bg="bg-blue-50"
              color="text-blue-600"
              total={totalOrders}
              chartProgress={chartProgress}
              to="/admin/orders?status=preparing"
            />

            <StatusLine
              icon={<Truck />}
              title="Đang giao"
              value={orderStatusDelivering}
              bg="bg-emerald-50"
              color="text-emerald-600"
              total={totalOrders}
              chartProgress={chartProgress}
              to="/admin/orders?status=delivering"
            />

            <StatusLine
              icon={<CheckCircle />}
              title="Hoàn thành"
              value={orderStatusCompleted}
              bg="bg-green-50"
              color="text-green-600"
              total={totalOrders}
              chartProgress={chartProgress}
              to="/admin/orders?status=completed"
            />

            <StatusLine
              icon={<XCircle />}
              title="Đã hủy"
              value={orderStatusCancelled}
              bg="bg-red-50"
              color="text-red-500"
              total={totalOrders}
              chartProgress={chartProgress}
              to="/admin/orders?status=cancelled"
            />
          </div>
        </section>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] xl:grid-cols-[1.25fr_.95fr_.75fr] gap-4 delay-table">
        {/* Latest orders */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <PanelHeader title="Đơn hàng gần đây" to="/admin/orders" />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 font-extrabold bg-gray-50/50 uppercase text-[10px]">
                <tr>
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Tổng tiền</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {latestOrders.length > 0 ? (
                  latestOrders.map((order, index) => (
                      <tr
                        key={order.id || index}
                        onClick={() => navigate(`/admin/orders?search=${order.orderCode || order.id}&view=${order.id}`)}
                        className="border-t border-gray-50 hover:bg-gray-50/20 transition-colors cursor-pointer"
                      >
                      <td className="px-5 py-4 font-black text-green-700">
                        #{order.id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-black text-gray-700">
                          {order.customerName ||
                            order.fullName ||
                            order.name ||
                            "Khách hàng"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-black text-primary">
                        {formatPrice(order.total || order.totalPrice)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black ${getOrderStatusStyle(
                            order.status,
                          )}`}
                        >
                          {getOrderStatusText(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-400 font-bold">
                        {order.createdAt ? order.createdAt.slice(11, 16) : "--:--"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan="5" text="Chưa có đơn hàng nào" />
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Today bookings */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300 animate-scale-in">
          <PanelHeader title="Đặt bàn gần đây" to="/admin/bookings" />

          <div className="divide-y divide-gray-50">
            {latestBookings.length > 0 ? (
              latestBookings.map((booking, index) => (
                  <Link
                    key={booking.id || index}
                    to={`/admin/bookings?search=${booking.bookingCode || booking.phone || booking.id}&view=${booking.id}`}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/20 transition-colors block hover:no-underline"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-10 rounded-xl bg-green-50 text-green-700 flex flex-col items-center justify-center font-black text-[10px] p-1 border border-green-100/50 shrink-0">
                        <span className="font-extrabold text-[9px] text-green-600 uppercase">Hôm nay</span>
                        <span>{booking.time ? booking.time.slice(0, 5) : "--:--"}</span>
                      </div>

                      <div>
                        <p className="font-black text-primary text-xs">
                          {booking.customerName ||
                            booking.fullName ||
                            booking.name ||
                            "Khách hàng"}
                        </p>

                        <p className="text-[10px] text-gray-400 font-bold">
                          {booking.phone || "Chưa có SĐT"}
                        </p>

                        <p className="text-[10px] text-gray-500 font-extrabold mt-0.5">
                          {booking.selectedAreaTitle ||
                            booking.area ||
                            "Nhà hàng sắp xếp"}{" "}
                          - Bàn {booking.selectedTable || "Đang xếp"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black ${getBookingStatusStyle(
                        booking.status,
                      )}`}
                    >
                      {getBookingStatusText(booking.status)}
                    </span>
                  </Link>
              ))
            ) : (
              <div className="px-5 py-14 text-center text-gray-400 font-bold">
                Chưa có lịch đặt bàn
              </div>
            )}
          </div>
        </section>

        {/* Best selling */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] transition-all duration-300">
          <PanelHeader title="Món ăn bán chạy" to="/admin/menu" />

          <div className="p-4 space-y-3.5">
            {bestFoods.length > 0 ? (
              bestFoods.map((food, index) => (
                <Link
                  key={food.name}
                  to={`/admin/menu?view=${food.id}`}
                  className="flex items-center gap-3.5 hover:bg-gray-50/20 p-1.5 rounded-2xl transition-colors block hover:no-underline"
                >
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100 shadow-sm"
                  />

                  <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center font-black text-[10px] text-gray-400 shrink-0 border border-gray-100">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-primary text-xs truncate">
                      {food.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-extrabold mt-0.5">
                      Đã bán {food.qty}
                    </p>
                  </div>

                  <p className="font-black text-gray-700 text-xs shrink-0">{formatPrice(food.price)}</p>
                </Link>
              ))
            ) : (
              <div className="py-14 text-center text-gray-400 font-bold">
                Chưa có dữ liệu món bán chạy
              </div>
            )}
          </div>
        </section>
      </div>

      {/* BOTTOM STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <SmallStat
          icon={<Users />}
          title="Tổng khách hàng"
          value={totalUsers}
          change="8.2%"
        />

        <SmallStat
          icon={<Crown />}
          title="Khách hàng thân thiết"
          value={Math.round(totalUsers * 0.2)}
          change="6.1%"
          orange
        />

        <SmallStat
          icon={<Utensils />}
          title="Tổng khách đặt bàn"
          value={totalBookingGuests}
          change="3"
        />

        <SmallStat icon={<Users />} title="Nhân viên" value="24" change="2" />

        <SmallStat icon={<Star />} title="Đánh giá trung bình" value="4.8/5" />
      </div>
    </div>
  );
}

function AnimatedNumber({ value, isCurrency = false, isDecimal = false, duration = 2000 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) {
      setCurrent(0);
      return;
    }

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad animation progress function
      const easeProgress = progress * (2 - progress);

      const nextVal = start + (end - start) * easeProgress;
      setCurrent(nextVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  if (isCurrency) {
    return <span>{Math.round(current).toLocaleString("vi-VN")}đ</span>;
  }
  if (isDecimal) {
    return <span>{current.toFixed(1)}/5</span>;
  }
  return <span>{Math.round(current).toLocaleString("vi-VN")}</span>;
}

function DashboardCard({ icon, title, value, percent, bg, color, to, isCurrency = false }) {
  const CardWrapper = to ? Link : "div";
  const isNegative = String(percent).startsWith("-");
  const PctIcon = isNegative ? ArrowDown : ArrowUp;
  const pctColor = isNegative ? "text-red-500" : "text-green-600";

  return (
    <CardWrapper
      to={to}
      className="block bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 hover-card-effect"
    >
      <div className="space-y-2 min-w-0">
        {/* Title + icon nhỏ cùng hàng */}
        <div className="flex items-center gap-2">
          <p className="text-green-900 font-extrabold text-xs uppercase tracking-wider flex-1">{title}</p>
          <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
            {React.cloneElement(icon, { size: 16 })}
          </div>
        </div>

        {/* h-9 cố định chiều cao để card không bị resize khi số đếm */}
        <h3 className="h-9 flex items-center text-2xl font-black text-primary tracking-tight tabular-nums overflow-hidden">
          <AnimatedNumber value={value} isCurrency={isCurrency} />
        </h3>

        <p className={`flex items-center gap-1 text-xs font-black ${pctColor}`}>
          <PctIcon size={12} className="stroke-[3px]" />
          {percent}
          <span className="text-gray-400 font-bold text-[10px] normal-case ml-1">
            so với tuần trước
          </span>
        </p>
      </div>
    </CardWrapper>
  );
}

function CategoryLine({ color, name, value, chartProgress }) {
  const parsedVal = parseFloat(value) || 0;
  const displayPct = (parsedVal * chartProgress).toFixed(1);

  return (
    <div className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 px-2 rounded-xl transition-all">
      <div className="flex items-center gap-2.5 font-bold text-gray-500 flex-1 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`}></span>
        <span className="truncate">{name}</span>
      </div>
      {/* Container cố định rộng — số chạy bên trong không làm rung layout */}
      <span className="w-14 text-right font-black text-xs text-gray-500 tabular-nums shrink-0">
        {displayPct}%
      </span>
    </div>
  );
}

function StatusLine({ icon, title, value, bg, color, total = 100, chartProgress, to }) {
  const targetPercentage = total > 0 ? ((value / total) * 100) : 0;
  const currentPercentage = (targetPercentage * chartProgress).toFixed(1);
  const currentValue = Math.round(value * chartProgress);

  const content = (
    <div className="space-y-1.5 pb-3 border-b border-gray-50 last:border-0 last:pb-0 group/status cursor-pointer">
      <div className="flex items-center text-xs">
        <div className="flex-1">
          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${bg} ${color} group-hover/status:brightness-95 transition-all`}>
            {title}
          </span>
        </div>
        {/* Container cố định — số chạy không đẩy layout */}
        <span className="w-6 text-right font-black text-gray-900 tabular-nums shrink-0">{currentValue}</span>
        <span className="w-14 text-right font-bold text-gray-400 tabular-nums shrink-0 ml-2">{currentPercentage}%</span>
      </div>
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all group-hover/status:brightness-90 ${
            title.includes("Hoàn thành") ? "bg-green-600" :
            title.includes("giao") ? "bg-emerald-500" :
            title.includes("chuẩn bị") ? "bg-blue-500" :
            title.includes("hủy") ? "bg-red-500" : "bg-yellow-500"
          }`}
          style={{ width: `${currentPercentage}%` }}
        />
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block hover:no-underline">
      {content}
    </Link>
  ) : content;
}

function PanelHeader({ title, to }) {
  return (
    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
      <h3 className="text-lg font-black text-primary">{title}</h3>

      {to && (
        <Link to={to} className="text-primary font-black text-xs hover:text-primary-light flex items-center gap-1 transition-colors">
          Xem tất cả &gt;
        </Link>
      )}
    </div>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-12 text-center text-gray-400 font-bold"
      >
        {text}
      </td>
    </tr>
  );
}

function SmallStat({ icon, title, value, change, orange = false }) {
  const isDecimal = title.includes("Đánh giá");
  const isNumber = !isNaN(parseFloat(value));

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-4 flex items-center gap-4 hover-card-effect animate-scale-in">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
          orange ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-700"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-gray-400 font-extrabold text-[11px] uppercase tracking-wider truncate">{title}</p>

        <div className="flex items-center gap-2 mt-0.5">
          <h3 className="text-lg font-black text-primary truncate">
            {isNumber ? (
              <AnimatedNumber value={value} isDecimal={isDecimal} />
            ) : (
              value
            )}
          </h3>

          {change && (
            <span className="text-green-600 text-[11px] font-black flex items-center gap-0.5 shrink-0">
              <ArrowUp size={11} className="stroke-[3px]" />
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
