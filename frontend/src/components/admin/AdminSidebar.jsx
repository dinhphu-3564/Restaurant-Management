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
  Image,
} from "lucide-react";

import { clearAuthSession, getCurrentUser } from "../../utils/auth";
import { canAccessAdminRoute } from "../../utils/permissions";
import goatIcon from "../../assets/images/Icon_De.png";

const ROLE_TEXT = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  staff: "Nhân viên",
  user: "Khách hàng",
};

function AdminSidebar({ notifications = [] }) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const currentRole = currentUser?.role || "staff";

  const handleLogout = () => {
    clearAuthSession();
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
          roles: ["admin", "manager", "staff"],
        },
      ],
    },
    {
      group: "QUẢN LÝ",
      items: [
        {
          name: "Đơn hàng",
          path: "/admin/orders",
          icon: ShoppingCart,
          roles: ["admin", "manager", "staff"],
        },
        {
          name: "Đặt bàn",
          path: "/admin/bookings",
          icon: CalendarCheck,
          roles: ["admin", "manager", "staff"],
        },
        {
          name: "Thực đơn",
          path: "/admin/menu",
          icon: Utensils,
          roles: ["admin", "manager", "staff"],
        },
        {
          name: "Bàn & Khu vực",
          path: "/admin/tables",
          icon: Store,
          roles: ["admin", "manager", "staff"],
        },
        {
          name: "Không gian",
          path: "/admin/spaces",
          icon: Image,
          roles: ["admin", "manager"],
        },
        {
          name: "Khách hàng",
          path: "/admin/users",
          icon: Users,
          roles: ["admin", "manager"],
        },
        {
          name: "Khuyến mãi",
          path: "/admin/deals",
          icon: Gift,
          roles: ["admin", "manager"],
        },
      ],
    },
    {
      group: "BÁO CÁO",
      items: [
        {
          name: "Doanh thu",
          path: "/admin/revenue",
          icon: BarChart3,
          roles: ["admin", "manager"],
        },
        {
          name: "Báo cáo chi tiết",
          path: "/admin/reports",
          icon: ClipboardList,
          roles: ["admin", "manager"],
        },
      ],
    },
    {
      group: "HỆ THỐNG",
      items: [
        {
          name: "Cài đặt",
          path: "/admin/settings",
          icon: Settings,
          roles: ["admin"],
        },
        {
          name: "Vai trò",
          path: "/admin/roles",
          icon: ShieldCheck,
          roles: ["admin"],
        },
        {
          name: "Nhật ký",
          path: "/admin/logs",
          icon: ClipboardList,
          roles: ["admin"],
        },
      ],
    },
  ];

  const visibleMenus = menus
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessAdminRoute(currentUser, item.path)),
    }))
    .filter((group) => group.items.length > 0);

  const displayName = currentUser?.name || currentUser?.fullName || "Admin";
  const displayRole = ROLE_TEXT[currentRole] || "Nhân viên";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-[250px] shrink-0 h-screen overflow-y-auto bg-primary text-white px-3 py-5 flex flex-col shadow-xl">
      <div className="px-3 mb-7">
        <div className="flex items-center gap-3">
          <img src={goatIcon} alt="Logo" className="w-10 h-10 object-contain brightness-0 invert drop-shadow-md" />

          <div>
            <h2 className="text-lg font-black leading-tight">Dê Hương Sơn</h2>
            <p className="text-xs text-white/60 mt-1">
              Nhà hàng đặc sản Hà Tĩnh
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-5 flex-1">
        {visibleMenus.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.group && (
              <p className="px-4 mb-2 text-[11px] font-black tracking-wider text-white/45">
                {group.group}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const count = item.path === "/admin/orders"
                  ? notifications.filter(n => n.type === "order").length
                  : item.path === "/admin/bookings"
                    ? notifications.filter(n => n.type === "booking").length
                    : 0;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition
                      ${isActive
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                      }
                    `
                    }
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.name}</span>
                    {count > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                        {count}
                      </span>
                    )}
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
              {avatarLetter}
            </div>

            <div className="min-w-0">
              <p className="font-black text-sm truncate">{displayName}</p>
              <p className="text-xs text-white/50">{displayRole}</p>
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
