import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Gift,
  Cake,
  ShoppingCart,
  CalendarDays,
  CheckCircle,
  ArrowLeft,
  Utensils,
  Users,
  PhoneCall,
  Copy,
} from "lucide-react";

import chiTietSN from "../assets/images/Deals/chi-tiet-SN.png";
import chiTietFML from "../assets/images/Deals/chi-tiet-FML.png";
import chiTietOL from "../assets/images/Deals/chi-tiet-OL.png";

function DealDetailPage() {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const deals = {
    "family-combo": {
      icon: <Users />,
      image: chiTietFML,
      label: "Ưu đãi nổi bật tháng này",
      title: "Combo gia đình",
      discount: "Giảm 20%",
      code: "FAMILY20",
      minOrder: "Áp dụng cho hóa đơn từ 2.000.000đ",
      desc: "Ưu đãi đặc biệt dành cho những bữa ăn sum vầy cùng gia đình và người thân.",
      time: "Áp dụng trong tháng này",
      condition: [
        "Áp dụng cho hóa đơn từ 2.000.000đ",
        "Áp dụng khi dùng tại nhà hàng hoặc mang về",
        "Không áp dụng kèm các ưu đãi khác",
        "Không áp dụng vào ngày lễ, Tết",
      ],
      route: "/menu",
      button: "Đặt món ngay",
    },

    birthday: {
      icon: <Cake />,
      image: chiTietSN,
      label: "Ưu đãi sinh nhật",
      title: "Sinh nhật vui vẻ",
      discount: "Giảm 15%",
      code: "BIRTHDAY15",
      minOrder: "Áp dụng khi đặt bàn sinh nhật",
      desc: "Giảm ngay 15% tổng hóa đơn cho khách đặt bàn tổ chức sinh nhật tại nhà hàng.",
      time: "Áp dụng quanh năm",
      condition: [
        "Áp dụng khi đặt bàn trước",
        "Xuất trình giấy tờ tùy thân để xác nhận sinh nhật",
        "Áp dụng cho bàn tiệc từ 4 người trở lên",
        "Không áp dụng kèm các ưu đãi khác",
      ],
      route: "/reservation",
      button: "Đặt bàn sinh nhật",
    },

    "online-order": {
      icon: <PhoneCall />,
      image: chiTietOL,
      label: "Ưu đãi đặt online",
      title: "Đặt món online",
      discount: "Giảm 10%",
      code: "ONLINE10",
      minOrder: "Áp dụng cho đơn hàng từ 1.000.000đ",
      desc: "Tiện lợi, nhanh chóng và nhận ưu đãi hấp dẫn khi đặt món trực tiếp qua website.",
      time: "Áp dụng trong tháng này",
      condition: [
        "Áp dụng khi đặt món qua website",
        "Áp dụng cho đơn hàng từ 1.000.000đ",
        "Ưu đãi được tính tại giỏ hàng",
        "Không áp dụng kèm các ưu đãi khác",
      ],
      route: "/menu",
      button: "Đặt món online",
    },

    "booking-special": {
      icon: <CalendarDays />,
      label: "Ưu đãi đặt bàn",
      title: "Đặt bàn trước",
      discount: "Ưu đãi đặc biệt",
      desc: "Đặt bàn trước để được ưu tiên vị trí đẹp và nhận nhiều ưu đãi hấp dẫn.",
      time: "Áp dụng mỗi ngày",
      condition: [
        "Áp dụng cho nhóm từ 6 người trở lên",
        "Đặt bàn trước tối thiểu 2 giờ",
        "Ưu tiên giữ bàn vào giờ cao điểm",
        "Không áp dụng kèm các ưu đãi khác",
      ],
      route: "/reservation",
      button: "Đặt bàn ngay",
    },
  };

  const deal = deals[dealId];

  const handleCopyCoupon = () => {
    if (!deal?.code) return;

    navigator.clipboard.writeText(deal.code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!deal) {
    return (
      <div className="min-h-screen bg-[#fbf7ec] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-md">
          <h1 className="text-2xl font-black text-green-900">
            Không tìm thấy khuyến mãi
          </h1>
          <Link
            to="/deals"
            className="inline-block mt-5 bg-green-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            Quay lại khuyến mãi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950 pt-[25px]">
      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
        <button
          onClick={() => navigate("/deals")}
          className="flex items-center gap-2 text-green-900 font-bold mb-5 hover:text-[#b88935]"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại khuyến mãi
        </button>

        <section
          className="relative overflow-hidden rounded-3xl shadow-xl bg-green-950 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: deal.image
              ? `url(${deal.image})`
              : "linear-gradient(to right, #022c22, #065f46)",
          }}
        >
          {/* Lớp mờ chỉ nằm nửa bên trái sau chữ */}
          {deal.image && (
            <div
              className="absolute inset-y-0 left-0 w-[68%] z-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(20, 14, 5, 0.72) 0%, rgba(45, 30, 8, 0.55) 55%, rgba(45, 30, 8, 0.18) 82%, rgba(45, 30, 8, 0) 100%)",
              }}
            />
          )}

          <div className="relative z-10 p-6 md:p-10 text-white max-w-3xl">
            <div>
              <span className="inline-flex items-center gap-2 border border-[#d6a84f] text-[#f6d47a] px-4 py-2 rounded-lg text-xs font-black uppercase">
                <Gift className="w-4 h-4" />
                {deal.label}
              </span>

              <h1 className="text-4xl md:text-6xl font-black mt-7">
                {deal.title}
              </h1>

              <h2 className="text-5xl md:text-7xl font-black text-[#f6d47a] mt-4">
                {deal.discount}
              </h2>

              <p className="text-white/80 leading-relaxed mt-6 max-w-2xl">
                {deal.desc}
              </p>

              <div className="flex items-center gap-3 mt-6 text-white/80">
                <CalendarDays className="w-5 h-5 text-[#f6d47a]" />
                <span>{deal.time}</span>
              </div>
              {/* mã khuyến mãi */}
              {deal.code && (
                <div className="mt-6 max-w-md bg-white/10 border border-white/20 rounded-2xl p-4">
                  <p className="text-sm text-white/70 font-bold mb-2">
                    Mã khuyến mãi
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white text-green-950 rounded-xl px-4 py-3 font-black tracking-widest text-lg">
                      {deal.code}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCoupon}
                      className="h-[52px] px-4 rounded-xl bg-[#f6c441] text-green-950 font-black hover:bg-[#d6a84f] transition flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? "Đã copy" : "Copy"}
                    </button>
                  </div>

                  <p className="text-xs text-white/60 mt-2">{deal.minOrder}</p>
                </div>
              )}

              <button
                onClick={() => navigate(deal.route)}
                className="mt-8 bg-[#f6c441] text-green-950 px-7 py-3 rounded-xl font-black hover:bg-[#d6a84f]"
              >
                {deal.button} →
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#eadfcd] shadow-sm p-6 md:p-8 mt-8">
          <h2 className="text-2xl font-black text-green-900 mb-5">
            Điều kiện áp dụng
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {deal.condition.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 bg-[#fbf7ec] rounded-2xl p-4"
              >
                <CheckCircle className="w-5 h-5 text-[#d6a84f] shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid md:grid-cols-2 gap-5">
          <button
            onClick={() => navigate("/menu")}
            className="bg-white border border-[#eadfcd] rounded-3xl p-6 text-left hover:shadow-md transition"
          >
            <Utensils className="w-8 h-8 text-[#c99a45]" />
            <h3 className="text-xl font-black text-green-900 mt-3">
              Xem thực đơn
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Chọn món ngon và áp dụng ưu đãi vào đơn hàng.
            </p>
          </button>

          <button
            onClick={() => navigate("/reservation")}
            className="bg-white border border-[#eadfcd] rounded-3xl p-6 text-left hover:shadow-md transition"
          >
            <CalendarDays className="w-8 h-8 text-[#c99a45]" />
            <h3 className="text-xl font-black text-green-900 mt-3">
              Đặt bàn trước
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Giữ chỗ trước và nhận ưu đãi khi dùng bữa tại nhà hàng.
            </p>
          </button>
        </section>
      </main>
    </div>
  );
}

export default DealDetailPage;
