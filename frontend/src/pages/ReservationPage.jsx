import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  User,
  ShieldCheck,
  Leaf,
  ShoppingCart,
  UserRound,
  ClipboardList,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  MapPin,
  Headset,
  ChefHat,
} from "lucide-react";

function ReservationPage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const cartIconRef = useRef(null);

  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const totalCartQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  const selectedDish = location.state?.selectedDish;
  const bookingCartItems = location.state?.cartItems || [];

  const subtotal = bookingCartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const totalBookingQty = bookingCartItems.reduce(
    (sum, item) => sum + item.qty,
    0,
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedArea, setSelectedArea] = useState("floor1");
  const [selectedTable, setSelectedTable] = useState(101);

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  //dữ liệu khu vực/bàn
  const areas = [
    {
      id: "floor1",
      title: "Khu vực tầng 1",
      text: "Không gian rộng rãi, thoáng mát",
      tables: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
    },
    {
      id: "floor2",
      title: "Khu vực tầng 2",
      text: "Không gian riêng tư, yên tĩnh",
      tables: [201, 202, 203, 204, 205, 206, 207, 208],
    },
    {
      id: "vip",
      title: "Phòng VIP",
      text: "Sang trọng, riêng tư",
      tables: [301, 302, 303, 304],
    },
  ];

  const currentArea = areas.find((area) => area.id === selectedArea);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!form.date) newErrors.date = "Vui lòng chọn ngày";
    if (!form.time) newErrors.time = "Vui lòng chọn giờ";
    if (!form.guests) newErrors.guests = "Vui lòng nhập số khách";

    if (form.date && form.time) {
      const selectedDateTime = new Date(`${form.date}T${form.time}`);
      const now = new Date();

      const selectedDateOnly = new Date(`${form.date}T00:00`);
      const todayOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      if (selectedDateOnly < todayOnly) {
        newErrors.date = "Ngày đặt bàn không được nhỏ hơn hôm nay";
      } else if (selectedDateTime <= now) {
        newErrors.time = "Giờ đặt bàn phải lớn hơn thời gian hiện tại";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!validateForm()) return;

    // yêu cầu đăng nhập trc khi đặt bàn
    const newBooking = {
      id: Date.now(),
      source: "reservation_page",
      type: "table_only",
      customerName: form.name,
      phone: form.phone,
      date: form.date,
      time: form.time,
      guests: form.guests,
      note: form.note,
      selectedDish: selectedDish
        ? {
            id: selectedDish.id,
            name: selectedDish.name,
            price: selectedDish.price,
          }
        : null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const oldBookings = JSON.parse(localStorage.getItem("bookings")) || [];

    localStorage.setItem(
      "bookings",
      JSON.stringify([newBooking, ...oldBookings]),
    );

    localStorage.setItem("currentBooking", JSON.stringify(newBooking));

    navigate("/booking-success");
  };

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
          <Link
            to="/home"
            onClick={scrollToTop}
            className="flex items-center gap-2"
          >
            <Leaf className="w-8 h-8 text-green-800" />
            <div>
              <h1 className="font-bold text-green-800 leading-4">
                Dê Hương Sơn
              </h1>
              <p className="text-xs text-green-700 font-medium">HÀ TĨNH</p>
            </div>
          </Link>

          <nav className="hidden lg:flex gap-8 text-sm font-semibold">
            <Link to="/home">Trang chủ</Link>
            <Link to="/menu">Thực đơn</Link>
            <Link
              to="/reservation"
              className="text-green-800 border-b-2 border-green-800 pb-2"
            >
              Đặt bàn
            </Link>
            <Link to="/deals">Khuyến mãi</Link>
            <Link to="/about">Giới thiệu</Link>
            <Link to="/contact">Liên hệ</Link>
          </nav>

          <div className="hidden md:flex gap-3">
            {isLoggedIn ? (
              <div
                ref={profileMenuRef}
                className="relative flex items-center gap-3"
              >
                <Link
                  ref={cartIconRef}
                  to="/cart"
                  className="relative text-green-900"
                >
                  <ShoppingCart className="w-5 h-5" />

                  {totalCartQty > 0 && (
                    <span className="absolute -top-5 -right-4 min-w-[22px] h-[22px] px-1.5 bg-red-600 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                      {totalCartQty}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-11 h-11 rounded-full bg-green-50 text-green-800 flex items-center justify-center border border-green-700 hover:bg-green-100 transition"
                >
                  <User className="w-6 h-6" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999]">
                    <Link
                      to="/profile"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <UserRound className="w-5 h-5" />
                      Thông tin tài khoản
                    </Link>

                    <Link
                      to="/order-history"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <ClipboardList className="w-5 h-5" />
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      to="/my-booking"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      Đặt bàn của tôi
                    </Link>

                    <button
                      onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        setIsLoggedIn(false);
                        setIsProfileOpen(false);
                        setIsMenuOpen(false);
                        navigate("/home");
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 text-red-600 font-medium border-t"
                    >
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border border-green-800 text-green-800 px-5 py-2 rounded-lg font-semibold hover:bg-green-50"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="bg-green-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-green-900"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg border border-green-800 text-green-800 flex items-center justify-center"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-md">
            <nav className="px-5 py-4 flex flex-col gap-4 text-sm font-semibold text-green-950">
              <Link to="/home">Trang chủ</Link>
              <Link to="/menu">Thực đơn</Link>
              <Link to="/reservation" className="text-green-800 font-black">
                Đặt bàn
              </Link>
              <Link to="/deals">Khuyến mãi</Link>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/contact">Liên hệ</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-[1500px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-green-900">
            Đặt bàn tại Dê Hương Sơn
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Link to="/home" className="hover:text-green-800">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-green-900 font-medium">Đặt bàn</span>
          </div>
        </div>
        <div className="bg-[#f5f3e8] border border-[#eadfcd] rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
          <CalendarDays className="w-6 h-6 text-green-800" />
          <p className="text-sm font-semibold text-green-950">
            Đặt bàn trước để được phục vụ tốt nhất. Nhà hàng sẽ chuẩn bị không
            gian phù hợp khi bạn đến.
          </p>
        </div>
        {/* thông tin món ăn đã chọn nếu có */}
        {bookingCartItems.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl text-green-900">
                Thông tin món ăn đã chọn
              </h3>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {bookingCartItems.map((item) => (
                <div
                  key={item.id}
                  className="w-[135px] shrink-0 bg-white rounded-2xl p-2 border border-green-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-xl"
                  />

                  <p className="font-bold text-green-900 mt-2 text-sm line-clamp-2 h-10">
                    {item.name}
                  </p>

                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-xs text-gray-600">SL: {item.qty}</p>

                    <p className="font-bold text-[#b88935] text-base mt-1">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* tạm tính tổng tiền món ăn đã chọn */}
            <div className="border-t border-green-200 mt-5 pt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Tạm tính</p>
                <p className="text-sm font-bold text-green-800 mt-1">
                  {bookingCartItems.length} món • Tổng số lượng:{" "}
                  {totalBookingQty}
                </p>
              </div>

              <span className="font-black text-2xl text-green-900">
                {subtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        )}
        <section className="grid lg:grid-cols-[1fr_520px] gap-6 items-start">
          {/* LEFT FORM */}
          <div className="bg-white border border-[#eadfcd] rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-black text-green-950 mb-6">
              1. THÔNG TIN ĐẶT BÀN
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Ngày đặt bàn"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                icon={<CalendarDays />}
                error={errors.date}
              />

              <Input
                label="Giờ đến"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                icon={<Clock />}
                error={errors.time}
              />

              <Input
                label="Số lượng khách"
                name="guests"
                type="number"
                value={form.guests}
                onChange={handleChange}
                placeholder="Ví dụ: 6"
                icon={<Users />}
                error={errors.guests}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <Input
                label="Họ và tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                icon={<User />}
                error={errors.name}
              />

              <Input
                label="Số điện thoại"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ví dụ: 0901234567"
                icon={<Phone />}
                error={errors.phone}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <Input
                label="Email (tùy chọn)"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="Ví dụ: nguyenvana@gmail.com"
              />

              <label className="block">
                <p className="font-bold text-sm mb-2">
                  Ghi chú / Yêu cầu đặc biệt
                </p>

                <div className="border border-[#eadfcd] rounded-xl p-4 bg-white">
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder="Ví dụ: Trang trí sinh nhật, yêu cầu không gian yên tĩnh..."
                    className="w-full h-16 outline-none resize-none text-sm bg-transparent"
                  />
                  <p className="text-right text-xs text-gray-400">
                    {form.note.length}/200
                  </p>
                </div>
              </label>
            </div>

            <h2 className="text-lg font-black text-green-950 mt-8 mb-5">
              2. CHỌN KHU VỰC / BÀN
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {areas.map((area) => (
                <AreaCard
                  key={area.id}
                  active={selectedArea === area.id}
                  title={area.title}
                  text={area.text}
                  onClick={() => {
                    setSelectedArea(area.id);
                    setSelectedTable(area.tables[0]);
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT TABLE SELECT */}
          <aside className="bg-white border border-[#eadfcd] rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-black text-green-950 mb-4">
              3. CHỌN BÀN
            </h2>

            <div className="flex items-center gap-6 text-sm mb-5">
              <Legend color="bg-green-800" text="Bàn trống" />
              <Legend color="bg-[#f7dca4]" text="Đang giữ" />
              <Legend color="bg-gray-200" text="Đã đặt" />
            </div>

            <p className="font-black text-green-950 mb-4">
              {currentArea.title}
            </p>

            <div className="grid grid-cols-5 gap-3">
              {currentArea.tables.map((table) => {
                const holding = [103, 108, 114].includes(table);
                const booked = [105, 110].includes(table);
                const active = table === selectedTable;

                return (
                  <button
                    key={table}
                    disabled={booked}
                    onClick={() => setSelectedTable(table)}
                    className={`relative h-16 rounded-xl border font-black transition ${
                      active
                        ? "border-green-800 bg-green-50 text-green-900"
                        : holding
                          ? "border-[#f7dca4] bg-[#fff6e6] text-[#c28b2c]"
                          : booked
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-[#eadfcd] bg-white text-green-950 hover:border-green-700"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-800 text-white text-xs flex items-center justify-center">
                        ✓
                      </span>
                    )}
                    {table}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 bg-[#f5f3e8] rounded-2xl p-4 flex gap-4">
              <div className="w-28 h-24 rounded-xl bg-amber-100 flex items-center justify-center text-xs text-green-800 font-bold shrink-0">
                Ảnh bàn
              </div>

              <div>
                <h3 className="font-black text-green-900">
                  Bàn {selectedTable} - {currentArea.title}
                </h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>✓ Sức chứa: 6 - 8 người</li>
                  <li>✓ Vị trí đẹp, gần cửa sổ</li>
                  <li>✓ Phục vụ tốt nhất cho nhóm của bạn</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-[#f5f3e8] rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-green-900">
              <ShieldCheck className="w-5 h-5" />
              <span>
                Thông tin của bạn được bảo mật và chỉ sử dụng để xác nhận đặt
                bàn.
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 w-full h-12 rounded-xl bg-green-900 hover:bg-green-950 text-white font-black"
            >
              <CalendarDays className="w-5 h-5 inline mr-2" />
              XÁC NHẬN ĐẶT BÀN
            </button>
          </aside>
        </section>
        <section className="mt-8 bg-[#fff8ea] rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ServiceItem
            icon={<Leaf className="w-6 h-6" />}
            title="Nguyên liệu tươi ngon"
            text="Dê núi Hương Sơn tuyển chọn mỗi ngày"
          />
          <ServiceItem
            icon={<ChefHat className="w-6 h-6" />}
            title="Phục vụ tận tâm"
            text="Đội ngũ nhân viên chuyên nghiệp"
          />
          <ServiceItem
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Không chất bảo quản"
            text="An toàn cho sức khỏe"
          />
          <ServiceItem
            icon={<Headset className="w-6 h-6" />}
            title="Hỗ trợ 24/7"
            text="Hotline: 038 713 6878 / 076 877 4619"
          />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-green-950 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-7 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div>
            <Link
              to="/home"
              onClick={scrollToTop}
              className="flex items-center gap-2 mb-3"
            >
              <Leaf className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold leading-5">Dê Hương Sơn</h3>
                <p className="text-sm text-white/70">Hà Tĩnh</p>
              </div>
            </Link>

            <p className="text-white/75 text-sm leading-relaxed mb-2 md:mb-5 max-w-xs">
              Dê núi Hương Sơn – đậm đà bản sắc, tươi ngon, bổ dưỡng.
            </p>
          </div>

          <div className="pl-2">
            <h3 className="font-bold text-lg mb-3 md:mb-5">
              Thông tin liên hệ
            </h3>

            <div className="space-y-2 text-white/75 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-1 text-white shrink-0" />
                <p>
                  Thị trấn Phố Châu, <br />
                  Hương Sơn, Hà Tĩnh
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 mt-1 text-white shrink-0" />
                <p>
                  038 713 6878
                  <br />
                  076 877 4619
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-white">
                  ✉
                </span>
                <p>dehuongson.ht@gmail.com</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3 md:mb-5">Giờ mở cửa</h3>

            <div className="flex items-center gap-3 text-white/75 text-sm leading-7">
              <Clock className="w-5 h-5 text-white shrink-0" />
              <div>
                <p>08:00 - 22:00</p>
                <p>Tất cả các ngày trong tuần</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-5">Kết nối với chúng tôi</h3>

            <div className="flex gap-4 items-center justify-center">
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/1280px-2021_Facebook_icon.svg.png"
                  alt="facebook"
                  className="w-5 h-5"
                />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                  alt="zalo"
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-5">Bản đồ</h3>
            <div className="h-40 bg-white/15 rounded-2xl flex items-center justify-center text-white/80 text-sm">
              Khu vực bản đồ
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 text-center py-3 text-xs md:text-sm text-white/60">
          © 2026 Dê Hương Sơn Hà Tĩnh. All rights reserved.
        </div>
      </footer>
      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => navigate("/login")}
        />
      )}
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  error,
}) {
  return (
    <label className="block">
      <p className="font-bold text-sm mb-2">{label}</p>

      <div
        className={`h-12 rounded-xl px-4 flex items-center gap-2 bg-white border ${
          error ? "border-red-500" : "border-[#eadfcd]"
        }`}
      >
        <span className="text-green-900/60">{icon}</span>

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-green-950 placeholder:text-[#8b978f]"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </label>
  );
}

function Info({ title, text }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <p className="font-bold text-white">{title}</p>
      <p className="text-white/70 mt-1">{text}</p>
    </div>
  );
}
function AreaCard({ active, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-[95px] rounded-xl border p-4 text-left transition ${
        active
          ? "border-green-800 bg-green-50"
          : "border-[#eadfcd] bg-white hover:bg-[#fbf7ec]"
      }`}
    >
      {active && (
        <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-green-800 text-white text-xs flex items-center justify-center">
          ✓
        </span>
      )}

      <div className="pt-5">
        <p className="font-black text-green-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{text}</p>
      </div>
    </button>
  );
}

function Legend({ color, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded ${color}`}></span>
      <span>{text}</span>
    </div>
  );
}

function ServiceItem({ icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eadfcd] flex items-center gap-4 hover:shadow-md transition">
      <div className="w-12 h-12 rounded-full bg-[#fff8ea] flex items-center justify-center text-[#b88935]">
        {icon}
      </div>

      <div>
        <p className="font-black text-green-900 text-sm">{title}</p>

        <p className="text-xs text-gray-600 mt-1">{text}</p>
      </div>
    </div>
  );
}
function LoginRequiredModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 py-8 text-center relative">
        <div className="w-28 h-28 rounded-full bg-[#fbf3df] mx-auto flex items-center justify-center relative">
          <div className="w-16 h-16 rounded-2xl border-4 border-green-800 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-4 border-green-800"></div>
          </div>

          <div className="absolute right-4 bottom-5 w-12 h-12 rounded-xl bg-[#d6a84f] flex items-center justify-center text-white text-xl">
            🔒
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-black text-green-950 leading-tight">
          Vui lòng đăng nhập
          <br />
          để đặt món và đặt bàn
        </h2>

        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-20 h-px bg-[#d6a84f]"></div>
          <span className="text-[#b88935]">🐐</span>
          <div className="w-20 h-px bg-[#d6a84f]"></div>
        </div>

        <p className="text-sm text-gray-500 mt-5 leading-relaxed">
          Đăng nhập để lưu thông tin, theo dõi đơn hàng
          <br />
          và nhận nhiều ưu đãi hấp dẫn từ Dê Hương Sơn.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={onClose}
            className="
      h-14 rounded-2xl
      border-2 border-[#e7d8bb]
      text-gray-700
      font-bold
      hover:bg-[#faf7ef]
      transition
    "
          >
            Bỏ qua
          </button>

          <button
            onClick={onLogin}
            className="
      h-14 rounded-2xl
      bg-green-900
      text-white
      font-bold
      hover:bg-green-950
      transition
      shadow-lg
    "
          >
            Đăng nhập / Đăng ký
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-gray-500">
          <p>Không đặt món, đặt bàn</p>
          <p>Tiếp tục đặt món, đặt bàn</p>
        </div>
      </div>
    </div>
  );
}

export default ReservationPage;
