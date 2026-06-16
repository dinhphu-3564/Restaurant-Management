import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Landmark,
  Wallet,
  Banknote,
  ArrowLeft,
  ShieldCheck,
  Copy,
  ReceiptText,
  Home,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5001";

function PaymentQRPage() {
  const navigate = useNavigate();
  const order = JSON.parse(localStorage.getItem("currentOrder")) || {};

  const [currentOrder, setCurrentOrder] = useState(order);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [copyToast, setCopyToast] = useState({
    show: false,
    message: "",
  });
  const [paymentMethod, setPaymentMethod] = useState(
    currentOrder.paymentMethod || "bank",
  );

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("vi-VN") + "đ";
  };

  const isMomo = paymentMethod === "momo";
  const isBank = paymentMethod === "bank";
  const isCash = paymentMethod === "cash";

  const bankInfo = {
    bankName: "BIDV",
    bankCode: "BIDV",
    accountName: "NHA HANG DE HUONG SON",
    accountNumber: "SBSEPAYYQMNFSKB9F1C",
  };

  const momoInfo = {
    phone: "0387136878",
    accountName: "NHA HANG DE HUONG SON",
  };

  const paymentContent =
    currentOrder.paymentContent ||
    (currentOrder.id
      ? `DH${String(currentOrder.id).replace(/\D/g, "")}`
      : "DH1001");

  const sepayQRUrl = `https://qr.sepay.vn/img?bank=${
    bankInfo.bankCode
  }&acc=${bankInfo.accountNumber}&template=compact&amount=${Math.round(
    Number(currentOrder.total || 0),
  )}&des=${encodeURIComponent(paymentContent)}`;

  // hàm đổi phương thức thanh toán
  const changePaymentMethod = (method) => {
    setPaymentMethod(method);

    const updatedOrder = {
      ...currentOrder,
      paymentMethod: method,
      status:
        method === "cash" ? "Chờ thanh toán khi nhận món" : "Chờ xác nhận",
      paymentStatus: method === "cash" ? "unpaid" : "pending",
    };

    setCurrentOrder(updatedOrder);
    localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text));

      setCopiedText(String(text));
      setCopyToast({
        show: true,
        message: `Đã sao chép: ${text}`,
      });

      setTimeout(() => {
        setCopiedText("");
      }, 900);

      setTimeout(() => {
        setCopyToast({
          show: false,
          message: "",
        });
      }, 2200);
    } catch {
      setCopyToast({
        show: true,
        message: "Không thể sao chép. Vui lòng thử lại.",
      });
    }
  };

  const checkPaymentStatus = async ({ silent = false } = {}) => {
    if (!currentOrder.id) return;

    if (!silent) setIsChecking(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/${currentOrder.id}`);
      const data = await res.json();

      if (!data.success) {
        if (!silent) alert("Chưa tìm thấy đơn hàng trên hệ thống.");
        return;
      }

      const updatedOrder = {
        ...currentOrder,
        ...data.order,

        total: data.order.total ?? currentOrder.total,
        subtotal: data.order.subtotal ?? currentOrder.subtotal,
        shippingFee: data.order.shippingFee ?? currentOrder.shippingFee,
        discountTotal: data.order.discountTotal ?? currentOrder.discountTotal,

        serviceType: data.order.serviceType ?? currentOrder.serviceType,
        paymentMethod: data.order.paymentMethod ?? currentOrder.paymentMethod,
        paymentContent:
          data.order.paymentContent ?? currentOrder.paymentContent,
      };

      setCurrentOrder(updatedOrder);
      localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));

      if (data.order.paymentStatus === "paid") {
        localStorage.removeItem("cartItems");
        localStorage.removeItem("checkoutSummary");
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("checkoutForm");

        window.dispatchEvent(new Event("cartUpdated"));

        navigate("/order-success");
        return;
      }

      if (!silent) {
        alert(
          "Chưa ghi nhận thanh toán. Vui lòng mô phỏng giao dịch trên SePay rồi thử lại.",
        );
      }
    } catch (error) {
      console.error(error);
      if (!silent) alert("Không kết nối được backend port 5001.");
    } finally {
      if (!silent) setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!currentOrder.id) return;
    if (isMomo || isCash) return;

    const interval = setInterval(() => {
      checkPaymentStatus({ silent: true });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrder.id, isMomo, isCash, navigate]);

  if (!currentOrder.id) {
    return (
      <div className="min-h-screen bg-[#fbf7ec] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-[#eadfcd] shadow-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-black text-green-900">
            Không có đơn hàng
          </h1>

          <p className="text-gray-500 mt-3">
            Vui lòng quay lại giỏ hàng và tạo đơn trước khi thanh toán.
          </p>

          <Link
            to="/cart"
            className="mt-6 h-12 rounded-xl bg-green-900 text-white font-black flex items-center justify-center"
          >
            Về giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  const paymentStatusText = {
    pending_payment: "Chờ chọn thanh toán",
    unpaid: "Chưa thanh toán",
    pending: "Chờ thanh toán",
    paid_pending_confirm: "Đã thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-green-950">
      <div className="max-w-[1500px] mx-auto">
        <button
          onClick={() => navigate("/checkout")}
          className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-green-800"
        >
          <ArrowLeft size={18} />
          Quay lại giỏ hàng
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-800 text-white flex items-center justify-center shadow-md">
            {isCash ? (
              <Banknote size={34} />
            ) : isMomo ? (
              <Wallet size={34} />
            ) : (
              <Landmark size={34} />
            )}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
              {isCash
                ? "Thanh toán tiền mặt"
                : isMomo
                  ? "Thanh toán MoMo"
                  : "Thanh toán ngân hàng"}
            </h1>

            <p className="text-slate-500 font-semibold mt-1">
              {isCash
                ? "Xác nhận đơn hàng và thanh toán khi nhận món."
                : "Quét QR, mô phỏng giao dịch SePay, hệ thống sẽ tự xác nhận."}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_460px] gap-6 items-start">
          {/* LEFT */}
          <section className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
            {/* CHỌN PHƯƠNG THỨC */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-5">
                1. Chọn phương thức thanh toán
              </h2>

              <div className="grid md:grid-cols-3 gap-5">
                <PaymentMethodCard
                  active={paymentMethod === "cash"}
                  icon={<Banknote />}
                  title="Tiền mặt"
                  desc="Thanh toán khi nhận món / đến lấy"
                  onClick={() => changePaymentMethod("cash")}
                />

                <PaymentMethodCard
                  active={paymentMethod === "bank"}
                  icon={<Landmark />}
                  title="Ngân hàng"
                  desc="Quét mã QR chuyển khoản"
                  onClick={() => changePaymentMethod("bank")}
                />

                <PaymentMethodCard
                  active={paymentMethod === "momo"}
                  icon={<Wallet />}
                  title="MoMo"
                  desc="Quét mã ví MoMo"
                  onClick={() => changePaymentMethod("momo")}
                />
              </div>
            </div>

            {/* NỘI DUNG THANH TOÁN */}
            <div className="p-6">
              {isCash ? (
                <div className="min-h-[360px] flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full bg-green-50 text-green-800 flex items-center justify-center">
                    <Banknote className="w-12 h-12" />
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 mt-6">
                    Thanh toán tiền mặt
                  </h2>

                  <p className="text-slate-500 font-semibold mt-3 max-w-md">
                    Đơn hàng sẽ được thanh toán khi bạn nhận món hoặc đến lấy
                    tại quán.
                  </p>

                  <button
                    onClick={() => {
                      localStorage.removeItem("cartItems");
                      localStorage.removeItem("checkoutSummary");
                      localStorage.removeItem("appliedCoupon");
                      localStorage.removeItem("checkoutForm");
                      window.dispatchEvent(new Event("cartUpdated"));
                      navigate("/order-success");
                    }}
                    className="mt-8 h-14 px-10 rounded-2xl bg-green-800 text-white font-black hover:bg-green-900 transition"
                  >
                    Xác nhận đặt món
                  </button>
                </div>
              ) : (
                <div className="grid xl:grid-cols-[390px_1fr] gap-6 items-stretch">
                  {/* QR */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center">
                    <div className="w-[310px] h-[310px] rounded-2xl bg-[#fffaf0] flex items-center justify-center">
                      {isMomo ? (
                        <div className="text-center">
                          <Wallet className="w-16 h-16 text-[#b88935] mx-auto" />
                          <p className="font-black text-green-900 text-xl mt-4">
                            QR MOMO DEMO
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            Demo MoMo chưa kết nối ví thật.
                          </p>
                        </div>
                      ) : (
                        <img
                          src={sepayQRUrl}
                          alt="QR thanh toán SePay"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {!isMomo && (
                      <div className="mt-5 w-full rounded-2xl bg-red-50 text-red-500 px-4 py-4 text-sm font-black leading-relaxed">
                        Giữ nguyên nội dung chuyển khoản để webhook SePay xác
                        thực tự động.
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="bg-green-50/60 border border-green-100 rounded-3xl p-6">
                    <h2 className="text-2xl font-black text-green-900 flex items-center gap-3 mb-5">
                      <ReceiptText />
                      Thông tin chuyển khoản
                    </h2>

                    {isMomo ? (
                      <>
                        <InfoAction
                          label="Số MoMo"
                          value={momoInfo.phone}
                          copiedValue={momoInfo.phone}
                          copiedText={copiedText}
                          onCopy={() => copyText(momoInfo.phone)}
                        />

                        <InfoAction
                          label="Tên tài khoản"
                          value={momoInfo.accountName}
                        />
                      </>
                    ) : (
                      <>
                        <InfoAction
                          label="Ngân hàng"
                          value={bankInfo.bankName}
                        />

                        <InfoAction
                          label="Số tài khoản"
                          value={bankInfo.accountNumber}
                          copiedValue={bankInfo.accountNumber}
                          copiedText={copiedText}
                          onCopy={() => copyText(bankInfo.accountNumber)}
                        />

                        <InfoAction
                          label="Chủ tài khoản"
                          value={bankInfo.accountName}
                        />
                      </>
                    )}

                    <InfoAction
                      label="Số tiền"
                      value={formatPrice(currentOrder.total)}
                      copiedValue={Math.round(Number(currentOrder.total || 0))}
                      highlight
                      copiedText={copiedText}
                      onCopy={() =>
                        copyText(Math.round(Number(currentOrder.total || 0)))
                      }
                    />

                    <InfoAction
                      label="Nội dung"
                      value={paymentContent}
                      copiedValue={paymentContent}
                      strong
                      copiedText={copiedText}
                      onCopy={() => copyText(paymentContent)}
                    />

                    <div className="mt-6 rounded-2xl bg-white border border-green-100 p-4 flex gap-3">
                      <ShieldCheck className="w-6 h-6 text-green-800 shrink-0" />
                      <p className="text-sm text-green-900 font-bold leading-relaxed">
                        Sau khi mô phỏng giao dịch trên SePay, hệ thống sẽ tự
                        nhận webhook và chuyển sang trang thành công.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT */}
          <aside className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 lg:sticky lg:top-24">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              Thông tin đơn hàng
            </h2>

            <div className="space-y-4">
              <Info
                label="Mã đơn"
                value={`#${currentOrder.id || "Chưa có"}`}
                strong
              />

              <Info
                label="Hình thức"
                value={
                  currentOrder.serviceType === "delivery"
                    ? "Giao tận nơi"
                    : "Đến lấy tại quán"
                }
              />

              <Info
                label="Thanh toán"
                value={isCash ? "Tiền mặt" : isMomo ? "MoMo" : "Ngân hàng"}
              />

              <Info
                label="Trạng thái"
                value={
                  paymentStatusText[currentOrder.paymentStatus] ||
                  "Chờ thanh toán"
                }
                status={currentOrder.paymentStatus !== "paid"}
                paid={currentOrder.paymentStatus === "paid"}
              />

              <div className="border-t border-dashed border-slate-200 pt-5">
                <Info
                  label="Tổng tiền"
                  value={formatPrice(currentOrder.total)}
                  highlight
                />
              </div>
            </div>

            {!isCash && (
              <button
                onClick={() => checkPaymentStatus()}
                disabled={isChecking || isMomo}
                className="mt-8 w-full h-14 rounded-2xl bg-green-800 text-white font-black hover:bg-green-900 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isChecking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {isChecking ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
              </button>
            )}

            <Link
              to="/home"
              className="mt-4 w-full h-12 rounded-2xl border border-slate-200 text-green-900 font-black flex items-center justify-center gap-2 hover:bg-green-50"
            >
              <Home size={18} />
              Về trang chủ
            </Link>
          </aside>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 font-semibold flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Nhà hàng Dê Hương Sơn cam kết bảo mật thông tin và mang đến trải
          nghiệm tốt nhất cho bạn.
        </p>
      </div>
      {/* toast hiển thị sao chép */}
      {copyToast.show && (
        <div className="fixed top-6 right-6 z-[9999]">
          <div className="bg-white border border-green-100 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[280px]">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-800 flex items-center justify-center">
              <Copy className="w-5 h-5" />
            </div>

            <div>
              <p className="font-black text-green-900">Sao chép thành công</p>
              <p className="text-sm text-gray-500">{copyToast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  highlight = false,
  strong = false,
  status = false,
  paid = false,
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#eadfcd] last:border-b-0 pb-3">
      <span className="text-gray-500 font-bold">{label}</span>

      <span
        className={`font-black text-right break-all ${
          highlight
            ? "text-[#b88935] text-xl"
            : paid
              ? "text-green-700"
              : status
                ? "text-orange-500"
                : strong
                  ? "text-green-900"
                  : "text-green-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InfoAction({
  label,
  value,
  copiedValue,
  highlight = false,
  strong = false,
  copiedText = "",
  onCopy,
}) {
  const copied = String(copiedValue ?? value) === String(copiedText);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#eadfcd] last:border-b-0 py-3">
      <span className="text-gray-500 font-bold">{label}</span>

      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`font-black text-right break-all ${
            highlight
              ? "text-[#b88935] text-xl"
              : strong
                ? "text-green-900"
                : "text-green-800"
          }`}
        >
          {value}
        </span>

        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 ${
              copied
                ? "bg-green-800 text-white border-green-800 scale-105"
                : "bg-white text-green-900 border-[#eadfcd] hover:bg-green-50"
            }`}
            title="Sao chép"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentMethodCard({ active, icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        active
          ? "border-green-800 bg-green-50 shadow-sm"
          : "border-[#eadfcd] bg-white hover:bg-[#fffaf0]"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
          active ? "bg-green-900 text-white" : "bg-[#fbf0dc] text-[#b88935]"
        }`}
      >
        {icon}
      </div>

      <h3 className="font-black text-green-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>

      {active && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-800 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-white"></span>
        </span>
      )}
    </button>
  );
}

export default PaymentQRPage;
