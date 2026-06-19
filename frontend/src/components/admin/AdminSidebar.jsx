import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarCheck,
  Utensils,
  Gift,
  Users,
  BarChart3,
  Store,
  Settings,
  ShieldCheck,
  ClipboardList,
  LogOut,
} from "lucide-react";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const menus = [
    {
      group: "",
      items: [
        {
          name: "Tổng quan",
          path: "/admin/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: "QUẢN LÝ",
      items: [
        { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart },
        { name: "Đặt bàn", path: "/admin/bookings", icon: CalendarCheck },
        { name: "Thực đơn", path: "/admin/menu", icon: Utensils },
        { name: "Bàn & Khu vực", path: "/admin/tables", icon: Store },
        { name: "Khách hàng", path: "/admin/users", icon: Users },
        { name: "Khuyến mãi", path: "/admin/deals", icon: Gift },
      ],
    },
    {
      group: "BÁO CÁO",
      items: [
        { name: "Doanh thu", path: "/admin/revenue", icon: BarChart3 },
        {
          name: "Báo cáo chi tiết",
          path: "/admin/reports",
          icon: ClipboardList,
        },
      ],
    },
    {
      group: "HỆ THỐNG",
      items: [
        { name: "Cài đặt", path: "/admin/settings", icon: Settings },
        { name: "Vai trò", path: "/admin/roles", icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside className="w-[250px] shrink-0 min-h-screen bg-gradient-to-b from-green-950 to-emerald-950 text-white px-3 py-5 flex flex-col">
      <div className="px-3 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
            🐐
          </div>

          <div>
            <h2 className="text-lg font-black leading-tight">Dê Hương Sơn</h2>
            <p className="text-xs text-white/60 mt-1">
              Nhà hàng đặc sản Hà Tĩnh
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-5 flex-1">
        {menus.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.group && (
              <p className="px-4 mb-2 text-[11px] font-black tracking-wider text-white/45">
                {group.group}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition
                      ${
                        isActive
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }
                    `
                    }
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4 px-2">
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center font-black shrink-0">
              A
            </div>

            <div className="min-w-0">
              <p className="font-black text-sm">Admin</p>
              <p className="text-xs text-white/50">Quản trị viên</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500 transition flex items-center justify-center shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
