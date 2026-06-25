import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Lock } from "lucide-react";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      setError("Vui lòng nhập tài khoản Admin");
      return;
    }

    if (!form.password.trim()) {
      setError("Vui lòng nhập mật khẩu Admin");
      return;
    }

    if (form.username === "admin" && form.password === "123456") {
      localStorage.setItem("adminToken", "admin-login-success");
      navigate("/admin/dashboard");
    } else {
      setError("Tài khoản hoặc mật khẩu không đúng");
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
            <label className="font-bold text-sm text-gray-700">Tài khoản</label>

            <div className="mt-2 flex items-center gap-3 border rounded-2xl px-4 py-3 focus-within:border-green-700">
              <User size={20} className="text-green-800" />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tài khoản"
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
            className="w-full bg-green-800 text-white py-3 rounded-2xl font-black hover:bg-green-900 transition"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Tài khoản test: admin / 123456
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;
