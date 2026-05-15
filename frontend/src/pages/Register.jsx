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
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-15">
              <div className="flex items-center gap-2">
                <Leaf className="text-green-700 w-8 h-8" />
                <div>
                  <h1 className="text-green-700 font-bold text-lg leading-tight">
                    Dê Hương Sơn
                  </h1>
                  <p className="text-xs text-green-600">Hà Tĩnh</p>
                </div>
              </div>

              <nav className="hidden md:flex gap-8">
                {[
                  "Trang chủ",
                  "Thực đơn",
                  "Đặt bàn",
                  "Khuyến mãi",
                  "Giới thiệu",
                  "Liên hệ",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-700 hover:text-green-700 transition font-medium"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="hidden md:flex gap-3">
                <button
                  type="button"
                  className="text-green-700 border border-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition font-medium flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </button>

                <button
                  type="button"
                  className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition font-medium"
                >
                  Đăng ký
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-green-700"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden pb-4 space-y-2">
                {[
                  "Trang chủ",
                  "Thực đơn",
                  "Đặt bàn",
                  "Khuyến mãi",
                  "Giới thiệu",
                  "Liên hệ",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-gray-700 hover:text-green-700 py-2"
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-end items-center min-h-[calc(100vh-120px)] lg:pr-0">
            {/* RIGHT */}
            <section className="w-full max-w-[520px]">
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 font-medium">{successMessage}</p>
                </div>
              )}

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/30">
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-extrabold text-green-800 uppercase tracking-wide">
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

                  <p className="text-gray-500 text-sm leading-relaxed">
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
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg transition duration-200"
                  >
                    Đăng ký
                  </button>
                </form>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-400 font-semibold">HOẶC</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="w-full border border-gray-300 hover:border-green-600 hover:bg-green-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span className="font-bold text-red-500">G</span>
                    Đăng ký với Google
                  </button>

                  <button
                    type="button"
                    className="w-full border border-gray-300 hover:border-green-600 hover:bg-green-50 text-gray-700 text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span className="font-bold text-blue-600 text-xl">f</span>
                    Đăng ký với Facebook
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
        {/* FOOTER */}
        <footer className="bg-green-900/95 backdrop-blur-md text-white">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Địa chỉ */}
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-white/90" />
                <p className="text-white/90 leading-relaxed">
                  Thị trấn Phố Châu, Hương Sơn, Hà Tĩnh
                </p>
              </div>

              {/* Số điện thoại */}
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-white/90" />
                <p className="text-white/90">
                  076 877 4619
                  <br />
                  038 713 6878
                </p>
              </div>

              {/* Giờ mở cửa */}
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-white/90" />
                <p className="text-white/90 leading-relaxed">
                  08:00 - 22:00
                  <br />
                  Tất cả các ngày trong tuần
                </p>
              </div>

              {/* Social */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-white/90">Kết nối với chúng tôi</span>

                <a
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <span className="font-bold text-white">f</span>
                </a>

                <a
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <span className="text-xs font-semibold text-white">Zalo</span>
                </a>

                <a
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/10 transition"
                >
                  <span className="text-sm font-bold text-white">♪</span>
                </a>
              </div>
            </div>
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
        className={`flex items-center gap-3 border rounded-md px-3 h-10 bg-white transition ${
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
        className={`flex items-center gap-3 border rounded-md px-3 h-10 bg-white transition ${
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
