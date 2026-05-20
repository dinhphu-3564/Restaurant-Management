import { useState } from "react";
import {
  Eye,
  EyeOff,
  Menu,
  X,
  Check,
  AlertCircle,
  Leaf,
  LogIn,
  Phone,
  MapPin,
  Clock,
  User,
  Mail,
  Lock,
} from "lucide-react";
import backgroundImage from "../assets/images/Register_Login.png";
import goatIcon from "../assets/images/Icon_De.png";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    const phoneOnlyNumber = formData.phone.replace(/\D/g, "");

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10,11}$/.test(phoneOnlyNumber)) {
      newErrors.phone = "Số điện thoại phải từ 10-11 chữ số";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Vui lòng đồng ý với điều khoản";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setSuccessMessage(
        "Đăng ký tài khoản thành công! Chào mừng bạn đến với Dê Hương Sơn",
      );

      setFormData({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });

      setErrors({});

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } else {
      setErrors(newErrors);
      setSuccessMessage("");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
          <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-green-800" />
              <div>
                <h1 className="font-bold text-green-800 leading-4">
                  Dê Hương Sơn
                </h1>
                <p className="text-xs text-green-700 font-medium">HÀ TĨNH</p>
              </div>
            </div>

            <nav className="hidden lg:flex gap-8 text-sm font-semibold">
              <a
                className="text-green-800 border-b-2 border-green-800 pb-2"
                href="#"
              >
                Trang chủ
              </a>
              <a href="#">Thực đơn</a>
              <a href="#">Đặt bàn</a>
              <a href="#">Khuyến mãi</a>
              <a href="#">Giới thiệu</a>
              <a href="#">Liên hệ</a>
            </nav>

            <div className="hidden md:flex gap-3">
              <button className="border border-green-800 text-green-800 px-5 py-2 rounded-lg font-semibold hover:bg-green-50">
                Đăng nhập
              </button>
              <button className="bg-green-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-green-900">
                Đăng ký
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-lg border border-green-800 text-green-800 flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100 shadow-md">
              <nav className="px-5 py-4 flex flex-col gap-4 text-sm font-semibold text-green-950">
                <a href="#">Trang chủ</a>
                <a href="#">Thực đơn</a>
                <a href="#">Đặt bàn</a>
                <a href="#">Khuyến mãi</a>
                <a href="#">Giới thiệu</a>
                <a href="#">Liên hệ</a>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button className="flex-1 border border-green-800 text-green-800 px-4 py-2 rounded-lg font-semibold">
                    Đăng nhập
                  </button>
                  <button className="flex-1 bg-green-800 text-white px-4 py-2 rounded-lg font-semibold">
                    Đăng ký
                  </button>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* MAIN */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 md:py-8">
          <div className="flex justify-center lg:justify-end items-center min-h-[calc(100vh-96px)] lg:pr-0">
            {/* RIGHT */}
            <section className="w-full max-w-[430px] md:max-w-[520px]">
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 font-medium">{successMessage}</p>
                </div>
              )}

              <div className="bg-white/92 backdrop-blur-xl rounded-3xl shadow-2xl p-4 md:p-6 border border-white/40">
                <div className="text-center mb-2">
                  <h2 className="text-xl md:text-2xl font-extrabold text-green-800 uppercase tracking-wide">
                    Đăng ký tài khoản
                  </h2>

                  <div className="flex items-center justify-center gap-3 mt-2 mb-3">
                    <div className="w-20 h-[1px] bg-green-300"></div>
                    {/* // Icon Dê */}
                    <img
                      src={goatIcon}
                      alt="Goat Icon"
                      className="w-9 h-9 object-contain"
                    />
                    <div className="w-20 h-[1px] bg-green-300"></div>
                  </div>

                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                    Tạo tài khoản để đặt món nhanh hơn
                    <br />
                    và nhận nhiều ưu đãi hấp dẫn!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Họ và tên"
                    error={errors.fullName}
                  />

                  <InputField
                    icon={<Phone className="w-4 h-4" />}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Số điện thoại"
                    error={errors.phone}
                  />

                  <InputField
                    icon={<Mail className="w-4 h-4" />}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    error={errors.email}
                  />

                  <PasswordField
                    icon={<Lock className="w-4 h-4" />}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mật khẩu"
                    error={errors.password}
                    show={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />

                  <PasswordField
                    icon={<Lock className="w-4 h-4" />}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Xác nhận mật khẩu"
                    error={errors.confirmPassword}
                    show={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="w-5 h-5 accent-green-600 rounded"
                      />

                      <span className="text-gray-700 text-sm sm:text-base">
                        Tôi đồng ý với{" "}
                        <a
                          href="#"
                          className="text-green-700 font-semibold hover:underline"
                        >
                          điều khoản sử dụng
                        </a>
                      </span>
                    </label>

                    {errors.agreeTerms && (
                      <ErrorText message={errors.agreeTerms} />
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition duration-200 shadow-md"
                  >
                    Đăng ký
                  </button>
                </form>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-400 font-semibold">HOẶC</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="w-full h-11 border border-gray-300 hover:border-green-600 hover:bg-green-50 text-gray-700 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/3840px-Google_Chrome_icon_%28February_2022%29.svg.png"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    <span className="hidden sm:inline">Google</span>
                  </button>

                  <button
                    type="button"
                    className="w-full h-11 border border-gray-300 hover:border-green-600 hover:bg-green-50 text-gray-700 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/960px-2021_Facebook_icon.svg.png"
                      alt="Facebook"
                      className="w-5 h-5"
                    />
                    <span className="hidden sm:inline">Facebook</span>
                  </button>
                </div>

                <p className="text-center text-gray-600 mt-2.5">
                  Đã có tài khoản?{" "}
                  <a
                    href="#"
                    className="text-green-700 font-bold hover:underline"
                  >
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-green-950 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-5 py-7 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold leading-5">Dê Hương Sơn</h3>
                  <p className="text-sm text-white/70">Hà Tĩnh</p>
                </div>
              </div>

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
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-white shrink-0" />
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
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-green-800 mb-1">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function InputField({ icon, type, name, value, onChange, placeholder, error }) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 border rounded-xl px-3 h-10 md:h-11 bg-white transition ${
          error
            ? "border-red-500"
            : "border-gray-300 focus-within:border-green-700"
        }`}
      >
        <span className="text-green-700 flex-shrink-0">{icon}</span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-full outline-none text-sm text-gray-700 placeholder:text-gray-500 bg-transparent"
        />
      </div>

      {error && <ErrorText message={error} />}
    </div>
  );
}

function PasswordField({
  icon,
  name,
  value,
  onChange,
  placeholder,
  error,
  show,
  onToggle,
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 border rounded-xl px-3 h-10 md:h-11 bg-white transition ${
          error
            ? "border-red-500"
            : "border-gray-300 focus-within:border-green-700"
        }`}
      >
        <span className="text-green-700 flex-shrink-0">{icon}</span>

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-full outline-none text-sm text-gray-700 placeholder:text-gray-500 bg-transparent"
        />

        <button
          type="button"
          onClick={onToggle}
          className="text-gray-500 hover:text-green-700"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <ErrorText message={error} />}
    </div>
  );
}

function ErrorText({ message }) {
  return (
    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {message}
    </p>
  );
}

export default Register;
