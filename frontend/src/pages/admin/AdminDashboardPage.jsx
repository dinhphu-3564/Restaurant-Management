import { Link } from "react-router-dom";
import {
  ShoppingBag,
  CalendarCheck,
  Users,
  Wallet,
  ArrowUp,
  MoreVertical,
  Clock3,
  CheckCircle,
  XCircle,
  Truck,
  Utensils,
  Crown,
  Star,
} from "lucide-react";

function AdminDashboardPage() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];

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

  const orderRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || order.totalPrice || 0),
    0,
  );

  const bookingRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.total || 0),
    0,
  );

  const totalRevenue = orderRevenue + bookingRevenue;

  const totalBookingGuests = bookings.reduce(
    (sum, item) => sum + Number(item.guests || item.people || 0),
    0,
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Chờ xử lý" ||
      order.status === "Chờ xác nhận" ||
      order.status === "pending" ||
      !order.status,
  );

  const preparingOrders = orders.filter(
    (order) =>
      order.status === "Đang chuẩn bị" ||
      order.status === "preparing" ||
      order.status === "Chờ chọn phương thức thanh toán",
  );

  const deliveringOrders = orders.filter(
    (order) => order.status === "Đang giao" || order.status === "delivering",
  );

  const completedOrders = orders.filter(
    (order) =>
      order.status === "Hoàn thành" ||
      order.status === "Đã hoàn thành" ||
      order.status === "completed",
  );

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "Đã hủy" ||
      order.status === "cancelled" ||
      order.status === "canceled",
  );

  const latestOrders = [...orders].slice(0, 5);
  const latestBookings = [...bookings].slice(0, 4);

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

  const foodMap = {};

  [...orders, ...bookings].forEach((item) => {
    const cartItems = item.cartItems || item.items || [];

    cartItems.forEach((food) => {
      if (!foodMap[food.name]) {
        foodMap[food.name] = {
          name: food.name,
          image: food.image,
          qty: 0,
        };
      }

      foodMap[food.name].qty += Number(food.qty || 1);
    });
  });

  const bestFoods = Object.values(foodMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const fakeRevenueChart = [32, 68, 55, 57, 36, 60, 51, 69, 53];
  const fakeProfitChart = [14, 31, 22, 28, 17, 31, 22, 38, 29];

  return (
    <div className="space-y-4">
      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <DashboardCard
          icon={<Wallet />}
          title="Tổng doanh thu"
          value={formatPrice(totalRevenue)}
          percent="18.6%"
          bg="bg-green-50"
          color="text-green-700"
          to="/admin/revenue"
        />

        <DashboardCard
          icon={<ShoppingBag />}
          title="Đơn hàng"
          value={orders.length}
          percent="12.4%"
          bg="bg-blue-50"
          color="text-blue-600"
          to="/admin/orders"
        />

        <DashboardCard
          icon={<CalendarCheck />}
          title="Đặt bàn"
          value={bookings.length}
          percent="8.7%"
          bg="bg-purple-50"
          color="text-purple-600"
          to="/admin/bookings"
        />

        <DashboardCard
          icon={<Users />}
          title="Khách hàng mới"
          value={users.length}
          percent="15.3%"
          bg="bg-orange-50"
          color="text-orange-600"
          to="/admin/users"
        />
        <DashboardCard
          icon={<Wallet />}
          title="Lợi nhuận"
          value={formatPrice(totalRevenue * 0.38)}
          percent="20.1%"
          bg="bg-red-50"
          color="text-red-500"
          to="/admin/revenue"
        />
      </div>

      {/* CHART + STATUS */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1.05fr_.8fr] gap-4">
        {/* Revenue chart */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-green-950">Doanh thu</h3>

            <select className="h-10 px-4 rounded-xl border border-gray-100 text-sm font-bold outline-none">
              <option>7 ngày qua</option>
            </select>
          </div>

          <div className="flex items-center gap-6 mb-5 text-sm font-bold text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              Doanh thu
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              Lợi nhuận
            </div>
          </div>

          <div className="h-[210px] flex items-end gap-4 border-b border-l border-gray-100 px-4 pt-5">
            {fakeRevenueChart.map((item, index) => (
              <div key={index} className="flex-1 flex items-end gap-1 h-full">
                <div
                  className="w-full rounded-t-xl bg-green-500/25"
                  style={{ height: `${item}%` }}
                ></div>

                <div
                  className="w-full rounded-t-xl bg-yellow-400/35"
                  style={{ height: `${fakeProfitChart[index]}%` }}
                ></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 text-xs text-gray-400 font-bold mt-2">
            {[
              "18/05",
              "19/05",
              "20/05",
              "21/05",
              "22/05",
              "23/05",
              "24/05",
            ].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </section>

        {/* Category revenue */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-green-950">
              Doanh thu theo danh mục
            </h3>

            <select className="h-10 px-4 rounded-xl border border-gray-100 text-sm font-bold outline-none">
              <option>Tuần này</option>
            </select>
          </div>

          <div className="grid md:grid-cols-[210px_1fr] gap-4 items-center">
            <div className="relative w-[210px] h-[210px] rounded-full bg-[conic-gradient(#16a34a_0_45%,#f59e0b_45%_72%,#3b82f6_72%_88%,#8b5cf6_88%_97%,#9ca3af_97%_100%)] mx-auto">
              <div className="absolute inset-10 bg-white rounded-full flex flex-col items-center justify-center text-center">
                <p className="font-black text-green-950 text-xl">
                  {formatPrice(totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 font-bold">
                  Tổng doanh thu
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <CategoryLine
                color="bg-green-600"
                name="Dê tươi"
                value="45.2%"
                price={formatPrice(totalRevenue * 0.452)}
              />
              <CategoryLine
                color="bg-yellow-500"
                name="Lẩu"
                value="25.8%"
                price={formatPrice(totalRevenue * 0.258)}
              />
              <CategoryLine
                color="bg-blue-500"
                name="Món nướng"
                value="18.7%"
                price={formatPrice(totalRevenue * 0.187)}
              />
              <CategoryLine
                color="bg-purple-500"
                name="Combo"
                value="7.1%"
                price={formatPrice(totalRevenue * 0.071)}
              />
              <CategoryLine
                color="bg-gray-400"
                name="Khác"
                value="3.2%"
                price={formatPrice(totalRevenue * 0.032)}
              />
            </div>
          </div>
        </section>

        {/* Order status */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-green-950">
              Trạng thái đơn hàng
            </h3>

            <MoreVertical size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            <StatusLine
              icon={<Clock3 />}
              title="Chờ xác nhận"
              value={pendingOrders.length}
              bg="bg-yellow-50"
              color="text-yellow-600"
            />

            <StatusLine
              icon={<ShoppingBag />}
              title="Đang chuẩn bị"
              value={preparingOrders.length}
              bg="bg-blue-50"
              color="text-blue-600"
            />

            <StatusLine
              icon={<Truck />}
              title="Đang giao"
              value={deliveringOrders.length}
              bg="bg-emerald-50"
              color="text-emerald-600"
            />

            <StatusLine
              icon={<CheckCircle />}
              title="Hoàn thành"
              value={completedOrders.length}
              bg="bg-green-50"
              color="text-green-600"
            />

            <StatusLine
              icon={<XCircle />}
              title="Đã hủy"
              value={cancelledOrders.length}
              bg="bg-red-50"
              color="text-red-500"
            />
          </div>
        </section>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_.95fr_.75fr] gap-4">
        {/* Latest orders */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <PanelHeader title="Đơn hàng mới nhất" to="/admin/orders" />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 font-black">
                <tr>
                  <th className="px-5 py-4">Mã đơn</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {latestOrders.length > 0 ? (
                  latestOrders.map((order, index) => (
                    <tr key={order.id || index} className="border-t">
                      <td className="px-5 py-4 font-black text-green-950">
                        #{order.id || index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-black text-gray-700">
                          {order.customerName ||
                            order.fullName ||
                            order.name ||
                            "Khách hàng"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.phone || "Chưa có SĐT"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-black text-green-950">
                        {formatPrice(order.total || order.totalPrice)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black ${getOrderStatusStyle(
                            order.status,
                          )}`}
                        >
                          {getOrderStatusText(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-500 font-semibold">
                        {formatDateTime(order.createdAt)}
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
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <PanelHeader title="Đặt bàn hôm nay" to="/admin/bookings" />

          <div className="divide-y">
            {latestBookings.length > 0 ? (
              latestBookings.map((booking, index) => (
                <div
                  key={booking.id || index}
                  className="px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-10 rounded-xl bg-gray-50 flex items-center justify-center gap-1 font-black text-green-950">
                      <CalendarCheck size={15} />
                      {booking.time || "--:--"}
                    </div>

                    <div>
                      <p className="font-black text-green-950">
                        {booking.customerName ||
                          booking.fullName ||
                          booking.name ||
                          "Khách hàng"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {booking.phone || "Chưa có SĐT"}
                      </p>

                      <p className="text-sm text-gray-600 font-semibold">
                        {booking.selectedAreaTitle ||
                          booking.area ||
                          "Nhà hàng sắp xếp"}{" "}
                        - Bàn {booking.selectedTable || "Đang xếp"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-black ${getBookingStatusStyle(
                      booking.status,
                    )}`}
                  >
                    {getBookingStatusText(booking.status)}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-14 text-center text-gray-400 font-bold">
                Chưa có lịch đặt bàn
              </div>
            )}
          </div>
        </section>

        {/* Best selling */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <PanelHeader title="Món ăn bán chạy" to="/admin/menu" />

          <div className="p-4 space-y-4">
            {bestFoods.length > 0 ? (
              bestFoods.map((food, index) => (
                <div key={food.name} className="flex items-center gap-4">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                  />

                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-500">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-green-950 truncate">
                      {food.name}
                    </p>
                  </div>

                  <p className="font-black text-gray-600">{food.qty} phần</p>
                </div>
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
          value={users.length}
          change="8.2%"
        />

        <SmallStat
          icon={<Crown />}
          title="Khách hàng thân thiết"
          value={Math.round(users.length * 0.2)}
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

function DashboardCard({ icon, title, value, percent, bg, color, to }) {
  const CardWrapper = to ? Link : "div";

  return (
    <CardWrapper
      to={to}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[110px] hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}
        >
          {icon}
        </div>

        <div>
          <p className="text-gray-500 font-bold text-sm">{title}</p>
          <h3 className="text-xl font-black text-green-950 mt-1">{value}</h3>

          <p className="flex items-center gap-1 text-green-600 text-sm font-black mt-2">
            <ArrowUp size={14} />
            {percent}
            <span className="text-gray-400 font-semibold">
              so với tuần trước
            </span>
          </p>
        </div>
      </div>
    </CardWrapper>
  );
}

function CategoryLine({ color, name, value, price }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 font-bold text-gray-600">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        {name}
      </div>

      <div className="font-black text-gray-700">
        {value} ({price})
      </div>
    </div>
  );
}

function StatusLine({ icon, title, value, bg, color }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b last:border-0 pb-4 last:pb-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}
        >
          {icon}
        </div>

        <p className="font-bold text-gray-700">{title}</p>
      </div>

      <span
        className={`px-3 py-1 rounded-lg text-xs font-black ${bg} ${color}`}
      >
        {value}
      </span>
    </div>
  );
}

function PanelHeader({ title, to }) {
  return (
    <div className="px-5 py-4 border-b flex items-center justify-between">
      <h3 className="text-xl font-black text-green-950">{title}</h3>

      {to && (
        <Link to={to} className="text-green-700 font-black text-sm">
          Xem tất cả
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
        className="px-5 py-12 text-center text-gray-400 font-bold"
      >
        {text}
      </td>
    </tr>
  );
}

function SmallStat({ icon, title, value, change, orange = false }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          orange ? "bg-orange-50 text-orange-500" : "bg-green-50 text-green-700"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-gray-500 font-bold">{title}</p>

        <div className="flex items-center gap-4 mt-1">
          <h3 className="text-xl font-black text-green-950">{value}</h3>

          {change && (
            <span className="text-green-600 text-sm font-black flex items-center gap-1">
              <ArrowUp size={14} />
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
