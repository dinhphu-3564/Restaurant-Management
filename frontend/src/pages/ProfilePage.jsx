import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  LogOut,
  CalendarDays,
  ShoppingCart,
  MapPin,
  Camera,
  ClipboardList,
  BookOpen,
  ReceiptText,
  CreditCard,
} from "lucide-react";

import goatIcon from "../assets/images/Icon_De.png";
import hero3 from "../assets/images/Home/hero-3.png";
import gtMonAn from "../assets/images/Contact/gt-mon-an.png";

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
  const [showResetAvatar, setShowResetAvatar] = useState(false);

  const [tempAvatar, setTempAvatar] = useState(null);

  const [activePage, setActivePage] = useState(
    location.state?.activeTab || "profile",
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    setActivePage(location.state?.activeTab || "profile");
  }, [location.state]);

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true" ||
      sessionStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn || !currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    setForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      address: currentUser.address || "",
    });
  }, [navigate]);

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };
  //Thêm hàm upload + crop vuông + giới hạn 2MB
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh đại diện không được vượt quá 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);

        canvas.width = 400;
        canvas.height = 400;

        const ctx = canvas.getContext("2d");

        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);

        const croppedImage = canvas.toDataURL("image/jpeg", 0.85);

        setTempAvatar(croppedImage);
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!form.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedUser = { ...user, ...form };

    if (localStorage.getItem("currentUser")) {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    if (tempAvatar) {
      localStorage.setItem("avatar", tempAvatar);
      setAvatar(tempAvatar);
      setTempAvatar(null);

      window.dispatchEvent(new Event("avatarUpdated"));
    }
    setUser(updatedUser);
    setToast(true);
    window.dispatchEvent(new Event("loginStatusChanged"));

    setTimeout(() => setToast(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {toast && (
        <div className="fixed top-20 right-5 z-[9999] bg-white border border-[#eadfcd] shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 w-[330px]">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <Save className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p className="font-black text-green-900">Cập nhật thành công</p>
            <p className="text-sm text-gray-600">Thông tin đã được lưu.</p>
          </div>
        </div>
      )}

      <main className="max-w-[1350px] mx-auto px-4 md:px-6 py-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">
          <aside className="lg:sticky lg:top-24 bg-green-950 rounded-[28px] overflow-hidden min-h-[680px] text-white shadow-xl relative">
            <div className="p-5 text-center border-b border-white/10">
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-20 h-20 object-contain mx-auto"
              />
              <h2 className="mt-2 text-[#d6a84f] font-black uppercase">
                Dê Hương Sơn
              </h2>
              <p className="text-xs text-[#d6a84f]/80 tracking-[0.25em]">
                NHÀ HÀNG
              </p>
            </div>

            <nav className="p-4 space-y-3">
              <SideItem
                active={activePage === "profile"}
                icon={<User />}
                text="Thông tin tài khoản"
                onClick={() => setActivePage("profile")}
              />

              <SideItem
                active={activePage === "cart"}
                icon={<ShoppingCart />}
                text="Giỏ hàng của tôi"
                onClick={() => setActivePage("cart")}
              />

              <SideItem
                active={activePage === "bookings"}
                icon={<CalendarDays />}
                text="Đặt bàn của tôi"
                onClick={() => setActivePage("bookings")}
              />

              <SideItem
                active={activePage === "history"}
                icon={<ClipboardList />}
                text="Lịch sử đơn hàng"
                onClick={() => setActivePage("history")}
              />
              <SideItem
                icon={<LogOut />}
                text="Đăng xuất"
                onClick={handleLogout}
              />
            </nav>

            <div className="absolute bottom-0 left-0 right-0 h-40 opacity-25 border-t border-[#d6a84f]/30 flex items-end justify-center pb-8">
              <p className="text-[#d6a84f] text-sm font-bold">
                Hương vị núi rừng
              </p>
            </div>
          </aside>

          <section className="space-y-4">
            {/* HERO */}
            <div
              className="relative rounded-[28px] overflow-hidden min-h-[185px] bg-cover bg-center shadow-lg"
              style={{
                backgroundImage: `
        linear-gradient(90deg, rgba(0,45,24,.95), rgba(0,45,24,.75), rgba(0,0,0,.2)),
        url(${hero3})
      `,
              }}
            >
              <div className="p-6 md:p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-black">
                  Xin chào, {user.name} 👋
                </h1>
                <p className="mt-3 text-white/85 leading-7 max-w-md">
                  Quản lý thông tin cá nhân, đơn hàng và lịch đặt bàn của bạn.
                </p>
                <div className="w-16 h-1 bg-[#d6a84f] rounded-full mt-5"></div>
              </div>
            </div>

            {activePage === "profile" && (
              <>
                {/* PROFILE CARD */}
                <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6 grid lg:grid-cols-[170px_1fr_240px] gap-5 items-center">
                  <div
                    className="relative w-32 h-32 mx-auto group"
                    onMouseEnter={() => setShowResetAvatar(true)}
                    onMouseLeave={() => setShowResetAvatar(false)}
                  >
                    <div className="w-32 h-32 rounded-full bg-green-100 overflow-hidden border-4 border-[#f4ead6] flex items-center justify-center">
                      {tempAvatar || avatar ? (
                        <img
                          src={tempAvatar || avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-green-900" />
                      )}
                    </div>

                    {/* Quay về avata mặc định */}
                    {avatar && (
                      <button
                        onClick={() => {
                          localStorage.removeItem("avatar");
                          setAvatar(null);
                          setTempAvatar(null);

                          window.dispatchEvent(new Event("avatarUpdated"));
                        }}
                        className={`absolute inset-0 rounded-full bg-black/45 text-white flex items-center justify-center text-xs font-bold transition-all duration-300 ${showResetAvatar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                      >
                        Quay về mặc định
                      </button>
                    )}

                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                    <label
                      htmlFor="avatar-upload"
                      className="absolute right-0 bottom-2 w-10 h-10 rounded-full bg-white border border-[#d6a84f] text-green-900 flex items-center justify-center shadow-md cursor-pointer hover:bg-[#fbf7ec] transition"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-green-950">
                      {user.name}
                    </h2>

                    <p className="text-[#c99a45] font-black mt-1">
                      Thành viên từ 06/2026
                    </p>

                    <div className="mt-4 space-y-2 text-gray-600">
                      <p className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-green-800" />
                        {user.email}
                      </p>

                      <p className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-800" />
                        {form.phone || "Chưa cập nhật số điện thoại"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-black text-green-900 mb-2">Vai trò</p>

                    <div className="h-12 rounded-xl bg-[#fbf7ec] border border-[#eadfcd] flex items-center gap-3 px-4 text-green-900">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-bold">
                        {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PERSONAL INFO */}
                <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <h2 className="text-2xl font-black text-green-950">
                      Thông tin cá nhân
                    </h2>

                    <button
                      onClick={handleSave}
                      className="hidden md:block h-11 px-7 rounded-xl bg-[#d6a84f] hover:bg-[#c99a45] text-green-950 font-black shadow-sm transition"
                    >
                      Cập nhật thông tin
                    </button>
                  </div>

                  <div className="border-t border-[#eadfcd] pt-5 grid md:grid-cols-2 gap-x-8 gap-y-4">
                    <ProfileInput
                      icon={<User />}
                      label="Họ và tên"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={errors.name}
                    />

                    <ProfileInput
                      icon={<Phone />}
                      label="Số điện thoại"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="0901234567"
                    />

                    <ProfileInput
                      icon={<Mail />}
                      label="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                    />

                    <ProfileInput
                      icon={<MapPin />}
                      label="Địa chỉ"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                {/* QUICK ACCESS */}
                <div>
                  <h2 className="text-2xl font-black text-green-950 mb-3">
                    Truy cập nhanh
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <QuickCard
                      icon={<ShoppingCart />}
                      title="Giỏ hàng của tôi"
                      text="Xem các món ăn đang có trong giỏ hàng"
                      button="Xem giỏ hàng"
                      onClick={() => navigate("/cart")}
                    />

                    <QuickCard
                      icon={<CalendarDays />}
                      title="Đặt bàn của tôi"
                      text="Theo dõi các bàn đã đặt"
                      button="Xem lịch"
                      onClick={() => setActivePage("bookings")}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div
                  className="rounded-[26px] overflow-hidden bg-cover bg-center shadow-lg"
                  style={{
                    backgroundImage: `
            linear-gradient(90deg, rgba(0,45,24,.96), rgba(0,45,24,.82), rgba(0,0,0,.25)),
            url(${gtMonAn})
          `,
                  }}
                >
                  <div className="p-5 md:p-6">
                    <h2 className="text-2xl md:text-3xl font-black text-[#d6a84f]">
                      Cảm ơn bạn đã đồng hành cùng Dê Hương Sơn ❤️
                    </h2>

                    <p className="text-white/85 mt-2">
                      Hương vị núi rừng trong từng món ăn!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <button
                        onClick={() => navigate("/reservation")}
                        className="h-11 px-7 rounded-xl bg-[#d6a84f] text-green-950 font-black"
                      >
                        <CalendarDays className="w-5 h-5 inline mr-2" />
                        Đặt bàn ngay
                      </button>

                      <button
                        onClick={() => navigate("/menu")}
                        className="h-11 px-7 rounded-xl border border-[#d6a84f] text-[#d6a84f] font-black hover:bg-[#d6a84f] hover:text-green-950 transition"
                      >
                        <BookOpen className="w-5 h-5 inline mr-2" />
                        Xem thực đơn
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePage === "cart" && <CartContent />}

            {activePage === "bookings" && <BookingHistoryContent />}

            {activePage === "history" && <OrderHistoryContent />}
          </section>
        </div>
      </main>
    </div>
  );
}

function SideItem({ icon, text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-[52px] rounded-xl px-4 flex items-center gap-4 font-bold transition ${
        active
          ? "bg-white text-green-900 shadow-md"
          : "text-white/85 hover:bg-white/10"
      }`}
    >
      <span className={active ? "text-green-900" : "text-[#d6a84f]"}>
        {icon}
      </span>
      {text}
    </button>
  );
}

function ProfileInput({
  icon,
  label,
  name,
  value,
  onChange,
  error,
  placeholder = "",
}) {
  return (
    <div>
      <div className="grid grid-cols-[28px_115px_1fr] gap-3 items-center">
        <span className="text-green-800">{icon}</span>

        <p className="font-black text-green-950 text-sm">{label}</p>

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-10 rounded-xl px-3 outline-none bg-[#fbf7ec] border text-sm text-gray-600 ${
            error
              ? "border-red-500"
              : "border-transparent focus:border-[#d6a84f]"
          }`}
        />
      </div>

      {error && <p className="ml-[156px] text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function QuickCard({ icon, title, text, button, onClick }) {
  return (
    <div className="bg-white border border-[#eadfcd] rounded-[22px] p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition">
      <div className="w-20 h-20 rounded-3xl bg-[#fbf0dc] text-[#c99a45] flex items-center justify-center shrink-0">
        <div className="w-10 h-10">{icon}</div>
      </div>

      <div>
        <h3 className="text-xl font-black text-green-950">{title}</h3>
        <p className="text-gray-500 mt-1 leading-6">{text}</p>

        <button
          onClick={onClick}
          className="mt-3 h-10 px-5 rounded-xl border border-[#d6a84f] text-[#b88935] font-black hover:bg-[#d6a84f] hover:text-green-950 transition"
        >
          {button} →
        </button>
      </div>
    </div>
  );
}

function OrderHistoryContent() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const [savedOrders, setSavedOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSavedOrders(data.orders);
        }
      });
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
    <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6">
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
          { key: "dinein", label: "Ăn tại quán" },
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

      {filteredOrders.length === 0 ? (
        <div className="min-h-[260px] flex items-center justify-center text-gray-500 font-bold">
          Không có đơn hàng phù hợp.
        </div>
      ) : (
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

function OrderCard({ order }) {
  const navigate = useNavigate();
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

  //hàm phương thức thanh toán
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

  return (
    <div className="border border-[#eadfcd] rounded-3xl bg-white p-4 md:p-5 hover:shadow-md transition">
      {/* TOP */}
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

      {/* BODY */}
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
    </div>
  );
}
const getBookingStatusText = (status) => {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";

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

    case "completed":
      return "bg-green-50 text-green-700";

    case "cancelled":
    case "canceled":
      return "bg-red-50 text-red-600";

    default:
      return "bg-orange-50 text-orange-600";
  }
};
function BookingHistoryContent() {
  const navigate = useNavigate();
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  return (
    <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6">
      <h2 className="text-2xl md:text-3xl font-black text-green-900">
        Lịch đặt bàn
      </h2>

      <p className="text-sm text-gray-500 mt-1 mb-6">
        Theo dõi các bàn bạn đã đặt tại Dê Hương Sơn.
      </p>

      {bookings.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-[#eadfcd] rounded-2xl p-4 grid md:grid-cols-[1fr_180px_130px] gap-4 items-center"
            >
              <div>
                <p className="font-black text-green-900">
                  Bàn {booking.selectedTable || "chưa chọn"} -{" "}
                  {booking.selectedAreaTitle || "Nhà hàng sắp xếp"}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  {booking.date || "Chưa có ngày"} -{" "}
                  {booking.time || "Chưa có giờ"}
                </p>

                <p className="text-sm text-gray-500">
                  Số khách: {booking.guests || "Chưa cập nhật"}
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
                onClick={() =>
                  navigate(`/profile/booking-detail/${booking.id}`)
                }
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

function CartContent() {
  const navigate = useNavigate();
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return (
    <div className="bg-white border border-[#eadfcd] rounded-[26px] shadow-sm p-5 md:p-6">
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
          className="h-12 px-7 rounded-2xl bg-[#d6a84f] hover:bg-[#c99a45] text-green-950 font-black transition whitespace-nowrap"
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
              className="border border-[#eadfcd] rounded-2xl p-4 flex items-center gap-4"
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
export default ProfilePage;
