import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Lock } from "lucide-react";

import { loginUser } from "../../services/authService";
import { saveAuthSession } from "../../utils/auth";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại Admin");
      return;
    }

    if (!form.password.trim()) {
      setError("Vui lòng nhập mật khẩu Admin");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginUser({
        account: form.username.trim(),
        password: form.password,
      });

      if (!data.success) {
        setError(data.message || "Tài khoản hoặc mật khẩu không đúng");
        return;
      }

      if (data.user?.role !== "admin") {
        setError("Tài khoản này không có quyền truy cập Admin");
        return;
      }

      saveAuthSession({
        token: data.token,
        user: data.user,
        remember: true,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      setError("Không kết nối được backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7ed] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-green-800 text-white flex items-center justify-center">
            <ShieldCheck size={34} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-center text-green-900">
          Đăng nhập Admin
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-7">
          Quản trị hệ thống nhà hàng
        </p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold text-sm text-gray-700">
              Email hoặc số điện thoại
            </label>

            <div className="mt-2 flex items-center gap-3 border rounded-2xl px-4 py-3 focus-within:border-green-700">
              <User size={20} className="text-green-800" />

              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Ví dụ: admin@gmail.com"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-sm text-gray-700">Mật khẩu</label>

            <div className="mt-2 flex items-center gap-3 border rounded-2xl px-4 py-3 focus-within:border-green-700">
              <Lock size={20} className="text-green-800" />

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="w-full outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-2xl font-black transition ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-800 text-white hover:bg-green-900"
            }`}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Tài khoản admin: admin@gmail.com / Admin@123
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;
