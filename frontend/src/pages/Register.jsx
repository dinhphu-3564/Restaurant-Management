import Header from "../components/Header";
import Footer from "../components/Footer";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Phone,
  Mail,
  User,
  Lock,
} from "lucide-react";

import backgroundImage from "../assets/images/Register_Login.png";
import goatIcon from "../assets/images/Icon_De.png";

function Register() {
  const navigate = useNavigate();
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage("");
      return;
    }

    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const existed = users.find(
      (u) => u.email.toLowerCase() === formData.email.toLowerCase(),
    );

    if (existed) {
      setErrors({
        email: "Email này đã được đăng ký",
      });
      setSuccessMessage("");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: "customer",
    };

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify([...users, newUser]),
    );

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
      navigate("/login");
    }, 1500);
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
        <Header currentPage="" />
        <div className="h-16"></div>

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
                  <Link
                    to="/login"
                    className="text-green-700 font-bold hover:underline"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
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
