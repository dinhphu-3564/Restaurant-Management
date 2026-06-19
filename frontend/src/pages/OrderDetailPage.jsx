import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ReceiptText,
  CreditCard,
  Truck,
  Store,
  Utensils,
  Clock,
  User,
} from "lucide-react";

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("vi-VN");
  };

  //hàm cập nhật trạng thái thời gian
  const formatDateTime = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa có";

    return `${date.toLocaleDateString("vi-VN")} - ${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  //hàm cập nhật trạng thái đơn hàng
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Vừa xong";

    const now = new Date();
    const date = new Date(dateString);

    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Vừa xong";

    const minutes = Math.floor(diff / 60);

    if (minutes < 60) {
      return `${minutes} phút trước`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} giờ trước`;
    }

    const days = Math.floor(hours / 24);

    return `${days} ngày trước`;
  };

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

  const getPaymentMethodText = (order) => {
    const method =
      order.paymentMethod ||
      order.payment_type ||
      order.paymentType ||
      order.payment ||
      "";

    if (paymentLabel[method]) return paymentLabel[method];

    if (method) return method;

    if (order.paymentContent) return "Ngân hàng";

    if (order.paymentStatus === "unpaid") return "Tiền mặt";

    return "Chưa xác định";
  };

  const paymentStatusLabel = {
    unpaid: "Chưa thanh toán",
    pending: "Chờ thanh toán",
    paid_pending_confirm: "Đã thanh toán",
    paid: "Đã xác nhận",
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf7ec] flex items-center justify-center">
        <p className="font-black text-green-900">Đang tải đơn hàng...</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen bg-[#fbf7ec] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-[#eadfcd] p-8 text-center shadow-xl">
          <h1 className="text-2xl font-black text-green-900">
            Không tìm thấy đơn hàng
          </h1>

          <button
            onClick={() =>
              navigate("/profile", { state: { activeTab: "history" } })
            }
            className="mt-5 h-12 px-6 rounded-xl bg-green-900 text-white font-black"
          >
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  const cartItems = order.cartItems || [];
  const subtotal =
    order.subtotal ||
    cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0,
    );

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị";
      case "delivering":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
      case "canceled":
        return "Đã hủy";
      default:
        return status || "Chờ xác nhận";
    }
  };

  // đổi màu trạng thái
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "preparing":
        return "bg-purple-100 text-purple-700";

      case "delivering":
        return "bg-yellow-100 text-yellow-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7ec] px-4 py-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-[30px] border border-[#eadfcd] shadow-xl overflow-hidden">
          {/* HEADER */}
          <div className="bg-green-700 px-6 md:px-8 py-4 text-white">
            <div className="flex items-center gap-3 text-white/85 font-black mb-3">
              <button
                onClick={() =>
                  navigate("/profile", { state: { activeTab: "history" } })
                }
                className="inline-flex items-center gap-2 hover:text-white transition"
              >
                <ArrowLeft size={20} />
                Quay lại danh sách đơn hàng
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 text-[#d6a84f] flex items-center justify-center">
                  <ReceiptText className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-white/75 font-bold">Mã đơn hàng</p>
                  <h1 className="text-2xl md:text-3xl font-black mt-1">
                    #{order.id}
                  </h1>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <span
                  className={`px-5 py-2.5 rounded-full font-black ${getStatusStyle(
                    order.status,
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>

                <div className="text-white/85 font-black text-sm leading-6 text-right">
                  <p className="flex items-center justify-end gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(order.createdAt)}
                  </p>

                  <p className="text-white/60">
                    Cập nhật: {getTimeAgo(order.updatedAt || order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-4 grid lg:grid-cols-[1.25fr_0.62fr_0.45fr] gap-4">
            {/* LEFT */}
            <section className="bg-white border border-[#eadfcd] rounded-[24px] p-4 md:p-5">
              <h2 className="text-lg font-black text-green-900 mb-5 flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center">
                  <Utensils className="w-6 h-6" />
                </span>
                Món ăn trong đơn ({cartItems.length} món)
              </h2>

              {cartItems.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500 font-bold">
                  Đơn hàng chưa có dữ liệu món ăn.
                </div>
              ) : (
                <div className="pr-2 max-h-[500px] overflow-y-auto relative">
                  <div className="sticky top-0 z-10 grid grid-cols-[64px_1fr_90px_70px_110px] gap-3 items-center px-4 py-4 mb-3 bg-[#f4faf5] rounded-2xl border border-[#edf5ef] shadow-sm">
                    <div></div>

                    <div className="text-center text-green-700 text-sm font-black uppercase tracking-wider">
                      Món ăn
                    </div>

                    <div className="text-right text-slate-400 text-sm font-black uppercase tracking-wider">
                      Đơn giá
                    </div>

                    <div className="text-center text-slate-400 text-sm font-black uppercase tracking-wider">
                      SL
                    </div>

                    <div className="text-right text-slate-400 text-sm font-black uppercase tracking-wider">
                      Thành tiền
                    </div>
                  </div>

                  <div className="space-y-0 divide-y divide-[#f1e7d7]">
                    {cartItems.map((item, index) => {
                      const qty = Number(item.qty || 1);
                      const price = Number(item.price || 0);

                      return (
                        <div
                          key={item.id || index}
                          className="grid grid-cols-[64px_1fr_90px_70px_110px] gap-3 items-center px-4 py-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />

                          <div className="min-w-0">
                            <h3 className="font-black text-green-900 text-base line-clamp-1">
                              {item.name}
                            </h3>

                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                              {item.desc || "Món ăn nhà hàng"}
                            </p>
                          </div>

                          <div className="text-right font-black text-[#c99a45]">
                            {formatPrice(price)}
                          </div>

                          <div className="text-center">
                            <span className="inline-flex items-center justify-center min-w-9 h-8 px-3 rounded-full bg-[#eef8f0] text-green-700 text-sm font-black">
                              {qty}
                            </span>
                          </div>

                          <div className="text-right font-black text-green-900">
                            {formatPrice(price * qty)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* RIGHT */}
            <section className="bg-white border border-[#eadfcd] rounded-[24px] p-4 shadow-sm">
              <div className="space-y-4">
                <InfoBox title="Thông tin khách hàng" icon={<User />}>
                  <InfoLine
                    label="Khách hàng"
                    value={order.name || "Chưa có"}
                  />
                  <InfoLine
                    label="Số điện thoại"
                    value={order.phone || "Chưa có"}
                  />

                  {order.address && (
                    <InfoLine label="Địa chỉ" value={order.address} />
                  )}
                </InfoBox>

                <InfoBox
                  title={
                    order.serviceType === "delivery"
                      ? "Thông tin giao hàng"
                      : order.serviceType === "pickup"
                        ? "Thông tin lấy hàng"
                        : "Thông tin đặt bàn"
                  }
                  icon={
                    order.serviceType === "delivery" ? (
                      <Truck />
                    ) : order.serviceType === "pickup" ? (
                      <Store />
                    ) : (
                      <Utensils />
                    )
                  }
                >
                  <InfoLine
                    label="Hình thức"
                    value={serviceLabel[order.serviceType] || "Chưa xác định"}
                  />

                  <InfoLine
                    label={
                      order.serviceType === "delivery"
                        ? "Ngày giao"
                        : order.serviceType === "pickup"
                          ? "Ngày lấy"
                          : "Ngày đặt"
                    }
                    value={formatDate(order.date || order.createdAt)}
                  />

                  {order.time && (
                    <InfoLine
                      label={
                        order.serviceType === "delivery"
                          ? "Giờ giao"
                          : order.serviceType === "pickup"
                            ? "Giờ lấy"
                            : "Giờ đến"
                      }
                      value={order.time}
                    />
                  )}
                </InfoBox>

                <InfoBox title="Thông tin thanh toán" icon={<CreditCard />}>
                  <InfoLine
                    label="Thanh toán"
                    value={getPaymentMethodText(order)}
                  />

                  {order.paymentContent && (
                    <InfoLine
                      label="Nội dung CK"
                      value={order.paymentContent}
                    />
                  )}
                </InfoBox>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-[24px] p-5 text-green-900">
                <div className="space-y-4">
                  <PriceRow label="Tạm tính" value={formatPrice(subtotal)} />

                  <PriceRow
                    label="Giảm giá"
                    value={`- ${formatPrice(order.discountTotal || 0)}`}
                  />

                  <PriceRow
                    label="Phí giao hàng"
                    value={formatPrice(order.shippingFee || 0)}
                  />
                </div>

                <div className="border-t border-green-100 mt-5 pt-5">
                  <p className="font-black text-xl text-green-900">Tổng cộng</p>

                  <p className="text-[11px] text-green-700 mt-1">
                    Đã bao gồm thuế và phí
                  </p>

                  <div className="flex justify-end mt-4">
                    <span className="font-black text-4xl text-green-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-green-900 font-bold text-sm">
                Đơn hàng sẽ được xác nhận sau khi nhà hàng kiểm tra thông tin.
              </div>

              <div className="rounded-2xl bg-[#fff7e8] border border-[#f4dfb8] p-4 text-[#9a6a18] font-bold text-sm">
                Nếu có thắc mắc, vui lòng liên hệ hỗ trợ để được giải đáp.
              </div>

              <button
                onClick={() => navigate("/contact")}
                className="w-full h-12 rounded-xl border border-green-200 text-green-900 font-black hover:bg-green-50"
              >
                Liên hệ hỗ trợ
              </button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
function InfoBox({ title, icon, children }) {
  return (
    <div>
      <h3 className="text-base font-black text-green-900 mb-3 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-green-100 text-green-800 flex items-center justify-center">
          <div className="w-5 h-5">{icon}</div>
        </span>
        {title}
      </h3>

      <div className="space-y-0 divide-y divide-[#f1e7d7]">{children}</div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="text-gray-500 font-bold">{label}</span>
      <span className="font-black text-green-900 text-right break-words">
        {value}
      </span>
    </div>
  );
}
function PriceRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-green-800 font-bold">{label}</span>
      <span className="font-black text-green-900">{value}</span>
    </div>
  );
}

export default OrderDetailPage;
