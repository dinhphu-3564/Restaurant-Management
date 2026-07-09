import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { Download, Plus } from "lucide-react";
import AdminToast from "../components/admin/AdminToast";
import { getCurrentUser, getAuthToken } from "../utils/auth";
import { canUseAction } from "../utils/permissions";
import { socket } from "../utils/socket";

function AdminLayout() {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const [exportExcelHandler, setExportExcelHandler] = useState(null);
  const [headerAction, setHeaderAction] = useState(null);
  // tìm kiếm
  const [globalSearch, setGlobalSearch] = useState("");

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [dateMode, setDateMode] = useState("range");
  const [dateLabel, setDateLabel] = useState("");
  
  // Thông báo
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const res = await fetch("http://localhost:5001/api/admin/dashboard/notifications", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds

    // Nghe sự kiện cập nhật để fetch ngay lập tức
    const handleUpdate = () => fetchNotifications();
    window.addEventListener("bookingsUpdated", handleUpdate);
    window.addEventListener("ordersUpdated", handleUpdate);

    // Nghe socket realtime: đơn hàng mới và đặt bàn mới
    socket.on("new_order", handleUpdate);
    socket.on("table_updated", handleUpdate);
    socket.on("order_updated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("bookingsUpdated", handleUpdate);
      window.removeEventListener("ordersUpdated", handleUpdate);
      socket.off("new_order", handleUpdate);
      socket.off("table_updated", handleUpdate);
      socket.off("order_updated", handleUpdate);
    };
  }, []);
  //
  const pageInfo = {
    "/admin/dashboard": {
      title: "Tổng quan",
      subtitle: "Thống kê hoạt động nhà hàng",
    },
    "/admin/orders": {
      title: "Quản lý đơn hàng",
      subtitle: "Theo dõi và xử lý đơn hàng",
    },
    "/admin/bookings": {
      title: "Quản lý đặt bàn",
      subtitle: "Quản lý lịch đặt bàn",
    },
    "/admin/menu": {
      title: "Quản lý thực đơn",
      subtitle: "Thêm, sửa và cập nhật món ăn",
    },
    "/admin/tables": {
      title: "Bàn & Khu vực",
      subtitle: "Quản lý khu vực và bàn ăn",
    },
    "/admin/spaces": {
      title: "Không gian nhà hàng",
      subtitle: "Quản lý các khu vực và không gian",
    },
    "/admin/users": {
      title: "Khách hàng",
      subtitle: "Thông tin khách hàng",
    },
    "/admin/deals": {
      title: "Khuyến mãi",
      subtitle: "Quản lý ưu đãi và mã giảm giá",
    },
    "/admin/revenue": {
      title: "Doanh thu",
      subtitle: "Theo dõi doanh thu nhà hàng",
    },
    "/admin/reports": {
      title: "Báo cáo chi tiết",
      subtitle: "Phân tích dữ liệu hoạt động",
    },
    "/admin/settings": {
      title: "Cài đặt",
      subtitle: "Cấu hình hệ thống",
    },
    "/admin/roles": {
      title: "Vai trò",
      subtitle: "Phân quyền quản trị",
    },
  };

  const currentPage = pageInfo[location.pathname] || {
    title: "Trang quản trị",
    subtitle: "Quản lý hệ thống",
  };

  const isOrdersPage = location.pathname === "/admin/orders";
  const isMenuPage = location.pathname === "/admin/menu";
  const isBookingsPage = location.pathname === "/admin/bookings";
  const isTablesPage = location.pathname === "/admin/tables";
  const isSpacesPage = location.pathname === "/admin/spaces";
  const isDealsPage = location.pathname === "/admin/deals";

  const pageAction = isOrdersPage && canUseAction(currentUser, "reports:export") ? (
    <button
      onClick={() => exportExcelHandler && exportExcelHandler()}
      disabled={!exportExcelHandler}
      className="
      h-11 px-4 rounded-2xl bg-green-800 text-white text-sm font-black
      inline-flex items-center justify-center gap-2 hover:bg-green-900
      transition disabled:opacity-50 disabled:cursor-not-allowed
      whitespace-nowrap shrink-0
    "
    >
      <Download size={18} />
      Xuất Excel
    </button>
  ) : isMenuPage && headerAction ? (
    <button
      onClick={headerAction.onClick}
      className="
      h-11 px-4 rounded-2xl bg-green-800 text-white text-sm font-black
      inline-flex items-center justify-center gap-2 hover:bg-green-900
      transition whitespace-nowrap shrink-0
    "
    >
      <Plus size={18} />
      {headerAction.label}
    </button>
  ) : (isBookingsPage || isTablesPage) && canUseAction(currentUser, "bookings:create") ? (
    <button
      onClick={() => window.dispatchEvent(new Event("openAddBookingModal"))}
      className="
      h-11 px-4 rounded-2xl bg-green-800 text-white text-sm font-black
      inline-flex items-center justify-center gap-2 hover:bg-green-900
      transition whitespace-nowrap shrink-0
    "
    >
      <Plus size={18} />
      Thêm đặt bàn
    </button>
  ) : isSpacesPage && canUseAction(currentUser, "tables:create") ? (
    <button
      onClick={() => window.dispatchEvent(new Event("openAddSpaceModal"))}
      className="
      h-11 px-4 rounded-2xl bg-green-800 text-white text-sm font-black
      inline-flex items-center justify-center gap-2 hover:bg-green-900
      transition whitespace-nowrap shrink-0
    "
    >
      <Plus size={18} />
      Thêm không gian
    </button>
  ) : isDealsPage && canUseAction(currentUser, "promotions:create") ? (
    <button
      onClick={() => window.dispatchEvent(new Event("openAddDealModal"))}
      className="
      h-11 px-4 rounded-2xl bg-green-800 text-white text-sm font-black
      inline-flex items-center justify-center gap-2 hover:bg-green-900
      transition whitespace-nowrap shrink-0
    "
    >
      <Plus size={18} />
      Thêm khuyến mãi
    </button>
  ) : null;

  return (
    <div className="h-screen bg-[#f8faf8] flex overflow-hidden">
      <AdminSidebar notifications={notifications} />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <AdminHeader
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          action={pageAction}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          dateRange={dateRange}
          setDateRange={setDateRange}
          dateMode={dateMode}
          setDateMode={setDateMode}
          dateLabel={dateLabel}
          setDateLabel={setDateLabel}
          hideDatePicker={isMenuPage}
          middleAction={
            isMenuPage ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("openCategoryManagementModal"))}
                className="h-11 px-4 rounded-2xl border border-green-800 text-green-800 bg-white shadow-sm text-sm font-black flex items-center justify-center gap-2 hover:bg-green-50 transition whitespace-nowrap shrink-0"
              >
                Quản lý danh mục
              </button>
            ) : null
          }
          notifications={notifications}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 lg:px-5 py-4">
          <Outlet
            context={{
              setExportExcelHandler,
              setHeaderAction,
              globalSearch,
              dateRange,
              dateMode,
              dateLabel,
            }}
          />
          <AdminToast />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
