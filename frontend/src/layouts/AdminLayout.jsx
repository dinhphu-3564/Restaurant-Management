import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { Download, Plus } from "lucide-react";
import AdminToast from "../components/admin/AdminToast";

function AdminLayout() {
  const location = useLocation();
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
  const isDealsPage = location.pathname === "/admin/deals";

  const pageAction = isOrdersPage ? (
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
  ) : isBookingsPage || isTablesPage ? (
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
  ) : isDealsPage ? (
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
    <div className="min-h-screen bg-[#f8faf8] flex">
      <AdminSidebar />

      <div className="flex-1 min-w-0">
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
        />

        <main className="px-3 sm:px-4 lg:px-5 py-4 min-h-[calc(100vh-76px)] overflow-x-hidden">
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
