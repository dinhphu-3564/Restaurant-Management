import { Link } from "react-router-dom";
import {
  Check,
  CalendarDays,
  Clock3,
  Users,
  UtensilsCrossed,
  Home,
  ClipboardList,
  Phone,
} from "lucide-react";

import XacNhanDatBan from "../assets/images/Booking/xac-nhan-dat-ban.png";

function BookingSuccessPage() {
  const booking = JSON.parse(localStorage.getItem("currentBooking")) || {};

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div
      className="min-h-screen overflow-hidden relative flex items-center justify-center px-4 py-10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${XacNhanDatBan})`,
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff,transparent_70%)]" />

      {/* Lá bay */}
      <div className="absolute inset-0 pointer-events-none"></div>

      <div className="relative z-20 max-w-4xl w-full -translate-y-12">
        {/* Check icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center shadow-xl border-[5px] border-white">
            <Check className="w-10 h-10 text-white" strokeWidth={3.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mt-6">
          <h1
            className="text-4xl md:text-6xl font-black text-green-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Đặt bàn thành công
          </h1>

          <p className="mt-4 text-gray-600 text-lg">
            Cảm ơn quý khách đã lựa chọn Dê Hương Sơn.
            <br />
            Chúng tôi rất hân hạnh được phục vụ bạn!
          </p>
        </div>

        {/* Booking info */}
        <div
          className="
  bg-white/95
  backdrop-blur
  mt-8
  rounded-3xl
  border
  border-[#eadfcd]
  shadow-xl
  w-full
  max-w-3xl
  px-10
  py-6
  mx-auto
"
        >
          <div className="grid gap-5">
            <InfoRow
              icon={<CalendarDays />}
              label="Ngày đặt"
              value={formatDate(booking.date)}
            />

            <InfoRow
              icon={<Clock3 />}
              label="Giờ đặt"
              value={booking.time || "Chưa có"}
            />

            <InfoRow
              icon={<Users />}
              label="Số khách"
              value={booking.guests ? `${booking.guests} người` : "Chưa có"}
            />

            <InfoRow
              icon={<UtensilsCrossed />}
              label="Khu vực"
              value={
                booking.selectedAreaTitle && booking.selectedTable
                  ? `${booking.selectedAreaTitle} • Bàn ${booking.selectedTable}`
                  : "Chưa chọn khu vực"
              }
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="grid grid-cols-2 gap-4">
            <Link
              to={`/profile/booking-detail/${booking.id}`}
              className="
    h-14 rounded-2xl bg-green-900 text-white font-bold
    flex items-center justify-center gap-2 hover:bg-green-950 transition
  "
            >
              <ClipboardList size={20} />
              XEM CHI TIẾT ĐẶT BÀN
            </Link>

            <Link
              to="/home"
              className="
      h-14
      rounded-2xl
      bg-[#d6a84f]
      text-white
      font-bold
      flex items-center justify-center gap-2
      hover:bg-[#c79a40]
    "
            >
              <Home size={20} />
              VỀ TRANG CHỦ
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <a
            href="tel:0387136878"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-900"
          >
            <Phone className="w-5 h-5 text-[#d6a84f]" />
            Cần hỗ trợ? Liên hệ ngay 038 713 6878
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="py-2.5 border-b border-[#eee] last:border-0">
      <div className="grid grid-cols-[40px_120px_220px] items-center gap-4 justify-center">
        <div className="text-green-800">{icon}</div>

        <span className="text-gray-600 font-medium">{label}</span>

        <span className="font-extrabold text-green-900 text-lg">{value}</span>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
