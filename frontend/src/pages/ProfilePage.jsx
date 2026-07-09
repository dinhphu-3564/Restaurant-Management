import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

import { clearAuthSession } from "../utils/auth";
import { getMe, updateMe } from "../services/userService";
import {
  OrderHistoryContent,
  BookingHistoryContent,
  CartContent
} from "../components/profile/ProfileSubComponents";

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
    clearAuthSession();
    navigate("/login");
    return true;
  }

  return false;
};

function ProfilePage() {
  const navigate = useNavigate();

  const location = useLocation();

  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(false);
  const [errors, setErrors] = useState({});
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || null);
  const [showResetAvatar, setShowResetAvatar] = useState(false);

  const [tempAvatar, setTempAvatar] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

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
    const loadProfile = async () => {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const data = await getMe();
        const currentUser = data.user;

        setUser(currentUser);
        setForm({
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          address: currentUser.address || "",
        });

        setAvatar(currentUser.avatar || null);
        setTempAvatar(null);
        setAvatarChanged(false);

        if (localStorage.getItem("currentUser")) {
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
        } else {
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        }

        if (currentUser.avatar) {
          localStorage.setItem("avatar", currentUser.avatar);
        } else {
          localStorage.removeItem("avatar");
        }

        window.dispatchEvent(new Event("loginStatusChanged"));
        window.dispatchEvent(new Event("avatarUpdated"));
      } catch (error) {
        console.error(error);
        clearAuthSession();
        navigate("/login");
      }
    };

    loadProfile();
  }, [navigate]);

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

  const handleChange = (e) => {
    const val = e.target.name === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value;
    setForm({ ...form, [e.target.name]: val });
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
        setAvatarChanged(true);
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    }

    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        fullName: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (avatarChanged) {
        payload.avatar = tempAvatar || null;
      }

      const data = await updateMe(payload);
      const updatedUser = data.user;

      if (localStorage.getItem("currentUser")) {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }

      if (updatedUser.avatar) {
        localStorage.setItem("avatar", updatedUser.avatar);
      } else {
        localStorage.removeItem("avatar");
      }

      setUser(updatedUser);
      setAvatar(updatedUser.avatar || null);
      setTempAvatar(null);
      setAvatarChanged(false);
      setErrors({});

      setToast(true);

      window.dispatchEvent(new Event("loginStatusChanged"));
      window.dispatchEvent(new Event("avatarUpdated"));

      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error(error);

      alert(error.message || "Không thể cập nhật thông tin.");
    }
  };

  const handleLogout = () => {
    clearAuthSession();
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
                          setAvatar(null);
                          setTempAvatar(null);
                          setAvatarChanged(true);
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
                      Thành viên từ{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "chưa rõ"}
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
                      className="hidden md:block h-11 px-7 rounded-xl bg-secondary hover:bg-secondary-light text-white font-black shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:scale-95"
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
                        onClick={() => navigate("/booking")}
                        className="h-12 px-8 rounded-full bg-secondary hover:bg-secondary-light text-white font-black shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
                      >
                        <CalendarDays className="w-5 h-5 inline mr-2" />
                        Đặt bàn ngay
                      </button>

                      <button
                        onClick={() => navigate("/menu")}
                        className="h-12 px-8 rounded-full border-2 border-secondary text-secondary font-black hover:bg-secondary hover:text-white transition-all shadow-sm hover:-translate-y-1 hover:shadow-lg active:scale-95"
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

export default ProfilePage;
