import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

import goatIcon from "../assets/images/Icon_De.png";
import {
  CalendarDays,
  Clock3,
  Users,
  MapPin,
  UtensilsCrossed,
  ClipboardList,
  ArrowLeft,
  ReceiptText,
  StickyNote,
  Headphones,
  Info,
} from "lucide-react";

const API_URL = "http://localhost:5001";

const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

const clearUserSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("avatar");

  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("avatar");

  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("loginStatusChanged"));
  window.dispatchEvent(new Event("avatarUpdated"));
};

function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewedIds, setReviewedIds] = useState([]);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    const loadBookingDetail = async () => {
      const token = getAuthToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/bookings/me/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (
          data.code === "ACCOUNT_LOCKED" ||
          data.code === "ACCOUNT_INACTIVE"
        ) {
          clearUserSession();
          navigate("/login");
          return;
        }

        if (res.status === 401) {
          clearUserSession();
          navigate("/login");
          return;
        }

        if (res.status === 403) {
          setBooking(null);
          setErrorMessage(
            data.message || "Bạn không có quyền xem đặt bàn này.",
          );
          return;
        }

        if (res.status === 404) {
          setBooking(null);
          setErrorMessage(data.message || "Không tìm thấy đặt bàn.");
          return;
        }

        if (!res.ok || !data.success) {
          setBooking(null);
          setErrorMessage(data.message || "Không thể tải chi tiết đặt bàn.");
          return;
        }

        setBooking(data.booking);
        
        // Fetch reviewed IDs for this booking
        if (data.booking) {
          const items = data.booking.cartItems || data.booking.items || [];
          const bCode = data.booking.bookingCode || `DB${data.booking.id}`;
          const reviewed = [];
          for (const item of items) {
            const itemCode = item.id || item.code || item.name;
            try {
              const revRes = await fetch(`${API_URL}/api/menu-items/${itemCode}/reviews`);
              const revData = await revRes.json();
              if (revData.success && Array.isArray(revData.data)) {
                const hasReviewed = revData.data.some(r => String(r.order_id) === String(bCode));
                if (hasReviewed) {
                  reviewed.push(itemCode);
                }
              }
            } catch (e) {
              console.error(e);
            }
          }
          setReviewedIds(reviewed);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết đặt bàn:", error);
        setBooking(null);
        setErrorMessage("Không thể kết nối backend. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetail();

    const handleBookingUpdate = (updatedBooking) => {
      if (!updatedBooking || 
          String(updatedBooking.id) === String(id) || 
          String(updatedBooking.booking_code) === String(id)) {
        loadBookingDetail();
      }
    };

    socket.on("booking_updated", handleBookingUpdate);

    return () => {
      socket.off("booking_updated", handleBookingUpdate);
    };
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";

    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";

    const now = new Date();
    const created = new Date(dateString);

    const diffMinutes = Math.floor((now - created) / 1000 / 60);

    if (diffMinutes < 1) return "Vừa xong";

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} ngày trước`;
  };

  //hàm lấy màu trạng thái
  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "serving":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";

      case "completed":
        return "bg-green-100 text-green-700 border-green-200";

      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  //hàm mô tả trạng thái
  const getStatusDesc = (status) => {
    switch (status) {
      case "confirmed":
        return "Nhà hàng đã xác nhận đặt bàn";

      case "serving":
        return "Bàn của bạn đang được phục vụ tại nhà hàng";

      case "completed":
        return "Lịch đặt bàn đã hoàn thành";

      case "cancelled":
      case "canceled":
        return "Lịch đặt bàn đã bị hủy";

      default:
        return "Đang chờ nhà hàng xác nhận";
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const submitFoodReview = async () => {
    if (!reviewItem) return;
    const token = getAuthToken();
    if (!token) return;
    const bCode = booking.bookingCode || `DB${booking.id}`;
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || JSON.parse(sessionStorage.getItem("currentUser")) || {};
    try {
      const res = await fetch(`${API_URL}/api/menu-items/${reviewItem.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: bCode,
          userEmail: currentUser.email,
          userName: currentUser.name,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
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

  const getStatusText = (status) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf7ec] flex items-center justify-center">
        <p className="font-black text-green-900">Đang tải đặt bàn...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#fbf7ec] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-[#eadfcd] p-8 text-center max-w-md">
          <h1 className="text-2xl font-black text-green-900">
            Không tìm thấy đặt bàn
          </h1>

          <p className="text-gray-500 mt-3">
            {errorMessage || "Mã đặt bàn không tồn tại hoặc đã bị xóa."}
          </p>

          <button
            onClick={() =>
              navigate("/profile", {
                state: { activeTab: "bookings" },
              })
            }
            className="mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-green-900 text-white font-bold"
          >
            Quay lại đặt bàn của tôi
          </button>
        </div>
      </div>
    );
  }

  const cartItems = booking.cartItems || booking.items || [];

  const totalFood = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0,
  );

  return (
    <div className="min-h-screen bg-[#fbf7ec] px-4 py-6">
      <div className="max-w-[1520px] mx-auto">
        <button
          onClick={() =>
            navigate("/profile", {
              state: { activeTab: "bookings" },
            })
          }
          className="inline-flex items-center gap-2 text-green-900 font-black mb-5"
        >
          <ArrowLeft size={20} />
          Quay lại đặt bàn của tôi
        </button>

        <div className="bg-white rounded-[28px] border border-[#eadfcd] shadow-xl overflow-hidden">
          <div className="bg-green-900 px-6 md:px-8 py-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-[#d6a84f] flex items-center justify-center">
                <CalendarDays className="w-8 h-8" />
              </div>

              <div>
                <p className="text-white/70 font-bold">Mã đặt bàn</p>
                <h1 className="text-3xl font-black">
                  {booking.bookingCode || `DB${booking.id}`}
                </h1>
              </div>
            </div>
            {/* trạng thái trong header */}
            <div className="text-left md:text-right">
              <p className="text-xs text-white/60 font-bold uppercase mb-2">
                Trạng thái đặt bàn
              </p>

              <span
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-black border shadow-sm ${getStatusStyle(
                  booking.status,
                )}`}
              >
                <Clock3 className="w-4 h-4" />
                {getStatusText(booking.status)}
              </span>

              <p className="text-sm text-white/80 mt-2 font-semibold">
                {getStatusDesc(booking.status)}
              </p>

              <p className="text-xs text-white/60 mt-1">
                Cập nhật: {getTimeAgo(booking.updatedAt || booking.createdAt)}
              </p>
            </div>
          </div>

          <div className="p-5 md:p-6 grid lg:grid-cols-[1fr_360px] gap-6">
            <section>
              <h2 className="text-2xl font-black text-green-900 mb-5 flex items-center gap-3">
                <ClipboardList />
                Chi tiết đặt bàn
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <InfoBox
                  icon={<CalendarDays />}
                  label="Ngày đặt"
                  value={formatDate(booking.date)}
                />

                <InfoBox
                  icon={<Clock3 />}
                  label="Giờ đặt"
                  value={booking.time || "Chưa có"}
                />

                <InfoBox
                  icon={<Users />}
                  label="Số khách"
                  value={booking.guests ? `${booking.guests} người` : "Chưa có"}
                />

                <InfoBox
                  icon={<UtensilsCrossed />}
                  label="Khu vực"
                  value={
                    booking.selectedAreaTitle ||
                    booking.area ||
                    "Chưa chọn khu vực"
                  }
                />

                <InfoBox
                  icon={<MapPin />}
                  label="Bàn"
                  value={
                    booking.selectedTable || booking.table || "Chưa chọn bàn"
                  }
                />

                <InfoBox
                  icon={<StickyNote />}
                  label="Ghi chú"
                  value={booking.note || "Không có"}
                />
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-black text-green-900 mb-3">
                  Thông tin khách hàng
                </h3>

                <div className="bg-[#fffaf0] rounded-2xl border border-[#eadfcd] p-4 space-y-2 text-green-950">
                  <p>
                    <b>Họ tên:</b>{" "}
                    {booking.customerName || booking.name || "Chưa có"}
                  </p>

                  <p>
                    <b>Số điện thoại:</b> {booking.phone || "Chưa có"}
                  </p>

                  <p>
                    <b>Email:</b> {booking.email || "Chưa có"}
                  </p>
                </div>
              </div>

              {cartItems.length > 0 ? (
                <div className="mt-8 border-t border-[#eadfcd] pt-6">
                  <h3 className="text-xl font-black text-green-900 mb-4 flex items-center gap-2">
                    <ReceiptText />
                    Món ăn đã đặt
                  </h3>

                  <div className="space-y-3">
                    {cartItems.map((item, index) => {
                      const qty = Number(item.qty || 1);
                      const price = Number(item.price || 0);
                      const lineTotal = price * qty;

                      return (
                        <div
                          key={item.id || index}
                          className="grid grid-cols-[76px_1fr_120px_140px] gap-4 items-center border border-[#eadfcd] rounded-2xl p-3 bg-white"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-[76px] h-[76px] rounded-xl object-cover"
                          />

                          <div>
                            <p className="font-black text-green-900 text-lg">
                              {item.name}
                            </p>

                            <div className="flex items-center gap-3 mt-2">
                              <span className="inline-flex px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm font-black">
                                SL: {qty}
                              </span>

                              {booking.status === "completed" && (
                                <button
                                  type="button"
                                  disabled={reviewedIds.includes(item.id || item.code || item.name)}
                                  onClick={() => {
                                    setReviewItem({
                                      id: item.id || item.code || item.name,
                                      name: item.name,
                                      image: item.image,
                                    });
                                    setReviewRating(5);
                                    setReviewComment("");
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-black transition ${
                                    reviewedIds.includes(item.id || item.code || item.name)
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-[#d6a84f] text-green-955 hover:bg-[#c99a45]"
                                  }`}
                                >
                                  {reviewedIds.includes(item.id || item.code || item.name) ? "Đã đánh giá" : "Đánh giá"}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-right font-black text-[#b88935]">
                            {formatPrice(price)}
                          </div>

                          <div className="text-right font-black text-green-900 text-lg">
                            {formatPrice(lineTotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl bg-green-900 px-5 py-4 flex justify-between items-center">
                    <span className="font-black text-lg text-white">
                      Tổng tiền món ăn
                    </span>

                    <span className="font-black text-3xl text-[#d6a84f]">
                      {formatPrice(
                        booking.total || booking.subtotal || totalFood,
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-8 border-t border-[#eadfcd] pt-6">
                  <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-500">
                    <Info className="w-5 h-5 inline mr-2" />
                    Đặt bàn này chưa kèm món ăn.
                  </div>
                </div>
              )}
            </section>

            <aside className="bg-[#fffaf0] border border-[#eadfcd] rounded-[24px] p-6 flex flex-col items-center justify-center text-center">
              <div className="w-full flex items-center justify-center mb-6">
                <img
                  src={goatIcon}
                  alt="Dê Hương Sơn"
                  className="w-44 h-44 object-contain opacity-90"
                />
              </div>

              <h3 className="text-2xl font-black text-green-900">
                Cần hỗ trợ?
              </h3>

              <p className="text-gray-500 font-bold mt-3">
                Nhà hàng luôn sẵn sàng hỗ trợ bạn.
              </p>

              <button
                onClick={() => navigate("/contact")}
                className="mt-8 w-full h-14 rounded-2xl border border-green-300 text-green-900 font-black hover:bg-green-50 flex items-center justify-center gap-2"
              >
                <Headphones className="w-5 h-5" />
                Liên hệ hỗ trợ
              </button>
            </aside>
          </div>
        </div>
      </div>
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

function InfoBox({ icon, label, value }) {
  return (
    <div className="relative border border-[#eadfcd] rounded-2xl px-5 py-4 bg-white min-h-[82px]">
      {/* Label nằm trên viền */}
      <span className="absolute -top-3 left-5 bg-white px-2 text-xs uppercase tracking-wider font-black text-[#b88935]">
        {label}
      </span>

      <div className="flex items-center gap-4 h-full">
        <div className="text-green-800 shrink-0">{icon}</div>

        <p className="font-bold text-green-900 text-[20px] truncate">{value}</p>
      </div>
    </div>
  );
}

export default BookingDetailPage;
