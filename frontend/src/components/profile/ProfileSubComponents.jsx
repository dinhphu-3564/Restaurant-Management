import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ShoppingCart,
  ReceiptText,
  CreditCard,
} from "lucide-react";

const API_URL = "http://localhost:5001";

const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

const handleAuthApiError = (data, navigate) => {
  if (
    data?.code === "ACCOUNT_LOCKED" ||
    data?.code === "ACCOUNT_INACTIVE" ||
    data?.message === "Bạn chưa đăng nhập."
  ) {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    navigate("/login");
    return true;
  }
  return false;
};

const getBookingStatusText = (status) => {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "serving":
      return "Đang phục vụ";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
    case "canceled":
      return "Đã hủy";
    default:
      return "Chờ xác nhận";
  }
};

const getBookingStatusStyle = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-blue-50 text-blue-600";
    case "serving":
      return "bg-indigo-50 text-indigo-600";
    case "completed":
      return "bg-green-50 text-green-700";
    case "cancelled":
    case "canceled":
      return "bg-red-50 text-red-600";
    default:
      return "bg-orange-50 text-orange-600";
  }
};

export function OrderHistoryContent() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [savedOrders, setSavedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMyOrders = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/orders/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (handleAuthApiError(data, navigate)) {
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể tải lịch sử đơn hàng.");
      }

      setSavedOrders(data.orders || []);
    } catch (err) {
      console.error("Lỗi tải lịch sử đơn hàng:", err);
      setError(err.message || "Không thể tải lịch sử đơn hàng.");
      setSavedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders();
    window.addEventListener("ordersUpdated", loadMyOrders);
    return () => {
      window.removeEventListener("ordersUpdated", loadMyOrders);
    };
  }, []);

  const orders = savedOrders;

  const serviceFilteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => {
          const type = order.serviceType || order.type;
          return type === activeFilter;
        });

  const parseDate = (dateString) => {
    if (!dateString) return new Date(0);
    if (String(dateString).includes("/")) {
      const [day, month, year] = dateString.split("/");
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateString);
  };

  const now = new Date();

  const filteredOrders = serviceFilteredOrders.filter((order) => {
    if (timeFilter === "all") return true;
    const orderDate = parseDate(order.createdAt || order.date);

    if (timeFilter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    if (timeFilter === "week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo && orderDate <= now;
    }

    return true;
  });

  return (
    <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6 text-left">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-green-900">
          Lịch sử đơn hàng
        </h2>

        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#eadfcd] px-4 outline-none text-sm font-bold text-green-900 bg-white"
        >
          <option value="all">Tất cả thời gian</option>
          <option value="month">Tháng này</option>
          <option value="week">Tuần này</option>
        </select>
      </div>

      <div className="flex gap-6 border-b border-[#eadfcd] mb-5 overflow-x-auto">
        {[
          { key: "all", label: "Tất cả đơn hàng" },
          { key: "delivery", label: "Giao tận nơi" },
          { key: "pickup", label: "Đến lấy tại quán" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`pb-3 text-sm font-black whitespace-nowrap transition ${
              activeFilter === tab.key
                ? "text-green-900 border-b-2 border-green-900"
                : "text-gray-500 hover:text-green-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="min-h-[220px] flex items-center justify-center text-green-800 font-black">
          Đang tải lịch sử đơn hàng...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 font-bold">
          {error}
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 ? (
        <div className="min-h-[260px] flex items-center justify-center text-gray-500 font-bold">
          Không có đơn hàng phù hợp.
        </div>
      ) : null}

      {!loading && !error && filteredOrders.length > 0 && (
        <div
          className={`space-y-3 ${
            filteredOrders.length > 5
              ? "max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#d6a84f] scrollbar-track-transparent"
              : ""
          }`}
        >
          {filteredOrders.map((order, index) => (
            <OrderCard key={`${order.id}-${index}`} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderCard({ order }) {
  const navigate = useNavigate();
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewedIds, setReviewedIds] = useState([]);
  const [isReviewListOpen, setIsReviewListOpen] = useState(false);

  const serviceLabel = {
    dinein: "Ăn tại quán",
    delivery: "Giao tận nơi",
    pickup: "Đến lấy tại quán",
  };

  const paymentLabel = {
    cash: "Tiền mặt",
    bank: "Ngân hàng",
    momo: "MoMo",
    pay_after_meal: "Thanh toán sau bữa ăn",
  };

  const getPaymentMethodText = (o) => {
    const method =
      o.paymentMethod ||
      o.payment_type ||
      o.paymentType ||
      o.payment ||
      "";
    if (paymentLabel[method]) return paymentLabel[method];
    if (method) return method;
    if (o.paymentContent) return "Ngân hàng";
    if (o.paymentStatus === "unpaid") return "Tiền mặt";
    return "Chưa xác định";
  };

  const formatTime = (value) => {
    if (!value) return "Chưa có giờ";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paymentStatusLabel = {
    pending_payment: "Chờ chọn thanh toán",
    unpaid: "Chưa thanh toán",
    pending: "Chờ thanh toán",
    paid_pending_confirm: "Đã thanh toán",
    paid: "Đã thanh toán",
  };

  const statusLabel = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    delivering: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    canceled: "Đã hủy",
  };

  const orderStatus =
    statusLabel[order.status] ||
    (order.status === "Chờ chọn phương thức thanh toán"
      ? "Chờ xác nhận"
      : order.status || "Chờ xác nhận");

  const paymentStatus =
    paymentStatusLabel[order.paymentStatus] ||
    order.paymentStatus ||
    (order.paymentMethod === "cash" ? "Chưa thanh toán" : "Chờ xác nhận");

  const statusClass =
    orderStatus === "Đã hủy"
      ? "bg-red-50 text-red-500"
      : orderStatus === "Đang giao"
        ? "bg-orange-50 text-orange-600"
        : orderStatus === "Đang chuẩn bị"
          ? "bg-purple-50 text-purple-600"
          : orderStatus === "Đã xác nhận"
            ? "bg-blue-50 text-blue-600"
            : orderStatus === "Chờ xác nhận"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-50 text-green-700";

  const paymentStatusClass =
    paymentStatus === "Đã thanh toán"
      ? "text-green-700"
      : paymentStatus === "Chưa thanh toán"
        ? "text-red-500"
        : "text-orange-500";

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (value) => {
    if (!value) return "Chưa có ngày";
    if (String(value).includes("/")) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  const itemImages =
    order.images ||
    order.cartItems?.map((item) => item.image).filter(Boolean) ||
    [];

  const totalQty =
    order.cartItems?.reduce((sum, item) => sum + Number(item.qty || 1), 0) ||
    order.qty ||
    0;

  const extraCount = Math.max(
    (order.cartItems?.length || itemImages.length) - 4,
    0,
  );

  const reviewItems = Array.isArray(order.cartItems) ? order.cartItems : [];
  const visibleReviewItems = reviewItems.slice(0, 4);
  const hiddenReviewCount = Math.max(
    reviewItems.length - visibleReviewItems.length,
    0,
  );

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser")) ||
    {};

  const canReviewOrder = orderStatus === "Hoàn thành";

  const submitFoodReview = async () => {
    if (!reviewItem) return;
    try {
      const res = await fetch(
        `http://localhost:5001/api/menu-items/${reviewItem.id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            userEmail: currentUser.email,
            userName: currentUser.name,
            rating: reviewRating,
            comment: reviewComment,
          }),
        },
      );
      const result = await res.json();

      if (!result.success) {
        alert(result.message || "Đánh giá thất bại");
        return;
      }

      alert("Đánh giá món ăn thành công");
      setReviewedIds((prev) => [...prev, reviewItem.id]);
      setReviewItem(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert("Không thể kết nối backend");
    }
  };

  return (
    <div className="border border-[#eadfcd] rounded-3xl bg-white p-4 md:p-5 hover:shadow-md transition text-left">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-[#f1e7d7]">
        <div>
          <p className="font-black text-green-900 text-lg">
            #{order.id || "Chưa có mã"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(order.createdAt)} - {formatTime(order.createdAt)} •{" "}
            {totalQty} món
          </p>
        </div>
        <span
          className={`w-fit px-4 py-2 rounded-full text-sm font-black ${statusClass}`}
        >
          {orderStatus}
        </span>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr_210px_auto] gap-5 items-center pt-4">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {itemImages.length > 0 ? (
              itemImages
                .slice(0, 4)
                .map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white"
                  />
                ))
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#fbf0dc] text-[#b88935] flex items-center justify-center border-2 border-white">
                <ReceiptText size={24} />
              </div>
            )}
          </div>

          {extraCount > 0 && (
            <span className="ml-3 w-10 h-10 rounded-full bg-[#fbf0dc] text-[#b88935] flex items-center justify-center text-sm font-black">
              +{extraCount}
            </span>
          )}
        </div>

        <div>
          <p className="font-black text-green-900 text-lg">
            {serviceLabel[order.serviceType] || "Chưa xác định"}
          </p>

          {order.serviceType === "dinein" && (
            <p className="text-sm text-gray-500 mt-1">
              {order.table || "Nhà hàng sắp xếp"} •{" "}
              {order.guests || "Chưa cập nhật"} người
            </p>
          )}

          {order.serviceType === "delivery" && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {order.address || "Chưa có địa chỉ giao hàng"}
            </p>
          )}

          {order.serviceType === "pickup" && (
            <p className="text-sm text-gray-500 mt-1">
              Người nhận: {order.receiver || order.name || "Chưa cập nhật"}
            </p>
          )}

          <p className="mt-2 inline-flex items-center gap-2 text-xs font-black text-green-800 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
            <CreditCard size={14} />
            {getPaymentMethodText(order)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-bold">Tổng tiền</p>
          <p className="text-2xl font-black text-green-900">
            {formatPrice(order.total)}
          </p>
          <p className={`text-sm font-black mt-1 ${paymentStatusClass}`}>
            {paymentStatus}
          </p>

          {order.paymentContent && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              CK: <b>{order.paymentContent}</b>
            </p>
          )}
        </div>

        <button
          onClick={() => navigate(`/profile/order-detail/${order.id}`)}
          className="h-11 px-5 rounded-xl border border-[#eadfcd] font-black text-green-900 hover:bg-green-50 whitespace-nowrap"
        >
          Chi tiết →
        </button>
      </div>

      {canReviewOrder && reviewItems.length > 0 && (
        <button
          type="button"
          onClick={() => setIsReviewListOpen(true)}
          className="mt-4 w-full rounded-2xl border border-[#eadfcd] bg-[#fffdf8] px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-green-50/40 hover:border-green-100 transition text-left"
        >
          <div>
            <p className="font-black text-green-900">
              Đánh giá món trong đơn hàng
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Nhấn để chọn món bạn muốn đánh giá.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {visibleReviewItems.map((item, index) => (
                <img
                  key={`${item.id || item.name}-${index}`}
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                />
              ))}
            </div>
            {hiddenReviewCount > 0 && (
              <span className="w-10 h-10 rounded-full bg-[#fbf0dc] text-[#b88935] flex items-center justify-center text-sm font-black">
                +{hiddenReviewCount}
              </span>
            )}
          </div>
        </button>
      )}

      {isReviewListOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center px-4"
          onClick={() => setIsReviewListOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#eadfcd] flex items-center justify-between gap-4 text-left">
              <div>
                <h3 className="text-2xl font-black text-green-900">
                  Chọn món để đánh giá
                </h3>
                <p className="text-sm text-gray-500 font-bold mt-1">
                  Đơn hàng #{order.id}
                </p>
              </div>
              <button
                onClick={() => setIsReviewListOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
              >
                ×
              </button>
            </div>

            <div className="p-5 max-h-[65vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-3">
                {reviewItems.map((item, index) => {
                  const itemId = item.id || item.code || item.name;
                  const reviewed = reviewedIds.includes(itemId);

                  return (
                    <div
                      key={`${itemId}-${index}`}
                      className="rounded-2xl border border-[#eadfcd] p-3 flex items-center gap-3 bg-white hover:bg-[#fffaf0] transition text-left"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-green-900 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Số lượng: {item.qty || 1}
                        </p>
                      </div>
                      <button
                        disabled={reviewed}
                        onClick={() => {
                          setReviewItem({
                            id: item.id || item.code,
                            name: item.name,
                            image: item.image,
                          });
                          setReviewRating(5);
                          setReviewComment("");
                          setIsReviewListOpen(false);
                        }}
                        className={`h-10 px-4 rounded-xl text-sm font-black whitespace-nowrap ${
                          reviewed
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#d6a84f] text-green-955 hover:bg-[#c99a45]"
                        }`}
                      >
                        {reviewed ? "Đã đánh giá" : "Đánh giá"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 text-left">
            <div className="flex items-center justify-between gap-4 border-b border-[#eadfcd] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={reviewItem.image}
                  alt={reviewItem.name}
                  className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                />
                <div>
                  <h3 className="text-2xl font-black text-green-900">
                    Đánh giá món ăn
                  </h3>
                  <p className="text-sm text-gray-500 font-bold mt-1">
                    {reviewItem.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewItem(null)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
              >
                ×
              </button>
            </div>

            <div className="py-5 space-y-4">
              <div>
                <p className="font-black text-green-900 mb-2">Số sao</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl ${
                        star <= reviewRating ? "text-[#d6a84f]" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="font-black text-green-900">Nhận xét</span>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Món ăn như thế nào?"
                  className="mt-2 w-full h-28 rounded-xl border border-[#eadfcd] px-4 py-3 outline-none resize-none bg-white"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#eadfcd] pt-4">
              <button
                onClick={() => setReviewItem(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black"
              >
                Hủy
              </button>
              <button
                onClick={submitFoodReview}
                className="h-11 px-6 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BookingHistoryContent() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMyBookings = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/bookings/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (handleAuthApiError(data, navigate)) {
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Không thể tải lịch đặt bàn.");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Lỗi tải lịch đặt bàn:", err);
      setError(err.message || "Không thể tải lịch đặt bàn.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyBookings();
    window.addEventListener("bookingsUpdated", loadMyBookings);
    return () => {
      window.removeEventListener("bookingsUpdated", loadMyBookings);
    };
  }, []);

  const formatBookingDate = (value) => {
    if (!value) return "Chưa có ngày";
    if (String(value).includes("/")) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  const formatBookingTime = (value) => {
    if (!value) return "Chưa có giờ";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6 text-left">
      <h2 className="text-2xl md:text-3xl font-black text-green-900">
        Lịch đặt bàn
      </h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Theo dõi các bàn bạn đã đặt tại Dê Hương Sơn.
      </p>

      {loading && (
        <div className="min-h-[260px] flex items-center justify-center text-green-800 font-black">
          Đang tải lịch đặt bàn...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 font-bold">
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 ? (
        <div className="min-h-[330px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#fbf0dc] flex items-center justify-center mb-4">
            <CalendarDays className="w-10 h-10 text-[#c99a45]" />
          </div>
          <h3 className="text-xl font-black text-green-900">
            Chưa có lịch đặt bàn
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Khi bạn đặt bàn, thông tin sẽ hiển thị tại đây.
          </p>
        </div>
      ) : null}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-[#eadfcd] rounded-2xl p-4 grid md:grid-cols-[1fr_180px_130px] gap-4 items-center text-left"
            >
              <div>
                <p className="font-black text-green-900">
                  Bàn {booking.selectedTable || "chưa chọn"} -{" "}
                  {booking.selectedAreaTitle || "Nhà hàng sắp xếp"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatBookingDate(booking.date)} -{" "}
                  {formatBookingTime(booking.time)}
                </p>
                <p className="text-sm text-gray-500">
                  Số khách: {booking.guests || booking.people || "Chưa cập nhật"}
                </p>
              </div>

              <span
                className={`w-fit px-4 py-2 rounded-full font-black text-sm ${getBookingStatusStyle(
                  booking.status,
                )}`}
              >
                {getBookingStatusText(booking.status)}
              </span>

              <button
                onClick={() => navigate(`/profile/booking-detail/${booking.id}`)}
                className="h-11 rounded-xl border border-[#eadfcd] font-black text-green-900 hover:bg-green-50"
              >
                Chi tiết →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CartContent() {
  const navigate = useNavigate();
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6 text-left">
      <div className="grid lg:grid-cols-[1fr_260px_auto] gap-4 items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-green-900">
            Giỏ hàng của tôi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Hiện có {totalQty} món trong giỏ hàng.
          </p>
        </div>

        <div className="bg-[#fbf7ec] border border-[#eadfcd] rounded-2xl px-5 py-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-[0.18em] font-bold">
            Tổng tiền
          </p>
          <p className="text-2xl font-black text-[#c99a45] mt-1">
            {totalPrice.toLocaleString("vi-VN")}đ
          </p>
        </div>

        <button
          onClick={() => navigate("/cart")}
          className="h-12 px-7 rounded-2xl bg-[#d6a84f] hover:bg-[#c99a45] text-green-955 font-black transition whitespace-nowrap"
        >
          Xem chi tiết
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <ShoppingCart className="w-16 h-16 text-[#c99a45]" />
          <h3 className="mt-4 text-xl font-black text-green-900">
            Giỏ hàng đang trống
          </h3>
          <p className="text-gray-500 mt-2">
            Hãy thêm món ăn yêu thích vào giỏ hàng.
          </p>
        </div>
      ) : (
        <div
          className={`space-y-4 ${
            cartItems.length > 5 ? "max-h-[480px] overflow-y-auto pr-2" : ""
          }`}
        >
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="border border-[#eadfcd] rounded-2xl p-4 flex items-center gap-4 text-left"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-black text-green-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mt-1">SL: {item.qty}</p>
              </div>
              <p className="font-black text-[#c99a45]">
                {(item.price * item.qty).toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
