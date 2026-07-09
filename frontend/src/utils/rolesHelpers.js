export const ROLE_TEXT = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  staff: "Nhân viên",
  user: "Khách hàng",
};

export const ROLE_BADGE = {
  admin: "bg-red-100 text-red-700 border border-red-200",
  manager: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  staff: "bg-blue-100 text-blue-700 border border-blue-200",
  user: "bg-gray-100 text-gray-700 border border-gray-200",
};

export const STATUS_TEXT = {
  active: "Đang hoạt động",
  locked: "Đã khóa",
  deleted: "Đã xóa",
};

export const STATUS_BADGE = {
  active: "bg-green-100 text-green-700 border border-green-200",
  locked: "bg-red-100 text-red-700 border border-red-200",
  deleted: "bg-gray-200 text-gray-700 border border-gray-300",
};

export const ROLE_THEME = {
  admin: {
    box: "bg-red-50 text-red-700 border-red-200",
    text: "text-red-700",
    check: "text-red-600",
    iconBg: "bg-red-50 text-red-700",
    hover: "hover:bg-red-50/40 hover:border-red-100",
  },
  manager: {
    box: "bg-yellow-50 text-yellow-800 border-yellow-200",
    text: "text-yellow-800",
    check: "text-yellow-700",
    iconBg: "bg-yellow-50 text-yellow-700",
    hover: "hover:bg-yellow-50/50 hover:border-yellow-100",
  },
  staff: {
    box: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-700",
    check: "text-blue-600",
    iconBg: "bg-blue-50 text-blue-700",
    hover: "hover:bg-blue-50/40 hover:border-blue-100",
  },
  user: {
    box: "bg-gray-50 text-gray-700 border-gray-200",
    text: "text-gray-700",
    check: "text-gray-500",
    iconBg: "bg-gray-50 text-gray-700",
    hover: "hover:bg-gray-50 hover:border-gray-200",
  },
};

export const roleCards = [
  {
    key: "admin",
    title: "Quản trị viên",
    description: "Toàn quyền hệ thống",
    color: "bg-red-50 text-red-600",
    permissions: ["Toàn quyền quản lý hệ thống", "Phân quyền và quản lý vai trò", "Quản lý dữ liệu và sao lưu", "Cài đặt hệ thống"],
  },
  {
    key: "manager",
    title: "Quản lý",
    description: "Quản lý hoạt động nhà hàng",
    color: "bg-yellow-50 text-yellow-700",
    permissions: ["Quản lý đơn hàng", "Quản lý đặt bàn", "Quản lý bàn & khu vực", "Xem báo cáo doanh thu", "Quản lý thực đơn, khuyến mãi"],
  },
  {
    key: "staff",
    title: "Nhân viên",
    description: "Thực hiện nghiệp vụ cơ bản",
    color: "bg-blue-50 text-blue-700",
    permissions: ["Tạo và xử lý đơn hàng", "Check-in đặt bàn", "Xem thông tin bàn", "Hỗ trợ khách hàng"],
  },
];

export const ROLE_PERMISSIONS = {
  admin: {
    allowed: ["Bảng điều khiển (Tất cả số liệu)", "Đơn hàng (Tạo, Sửa, Xóa, Cập nhật TT, Hoàn tiền)", "Đặt bàn (Tạo, Sửa, Xóa, Xếp bàn)", "Quản lý bàn & Khu vực (Tạo, Sửa, Xóa)", "Khách hàng & Thành viên (Tất cả)", "Thực đơn & Danh mục (Tất cả)", "Khuyến mãi (Tất cả)", "Doanh thu & Báo cáo (Tất cả)", "Phân quyền & Tài khoản (Tất cả)", "Lịch sử hoạt động (Toàn hệ thống)"],
    restricted: [],
  },
  manager: {
    allowed: ["Bảng điều khiển (Trừ lợi nhuận)", "Đơn hàng (Tạo, Sửa, Cập nhật TT)", "Đặt bàn (Tạo, Sửa, Xếp bàn)", "Quản lý bàn & Khu vực (Thêm, Sửa, Xem)", "Khách hàng & Thành viên (Xem, Sửa)", "Thực đơn & Danh mục (Thêm, Sửa, Xem)", "Khuyến mãi (Xem, Tạo mới)", "Doanh thu & Báo cáo (Theo ca/Ngày)"],
    restricted: ["Đơn hàng (Xóa, Hoàn tiền)", "Phân quyền & Tài khoản", "Lịch sử hoạt động (Chỉ xem của mình)", "Báo cáo lợi nhuận, lương"],
  },
  staff: {
    allowed: ["Đơn hàng (Tạo, Cập nhật TT)", "Đặt bàn (Check-in, Cập nhật TT)", "Quản lý bàn (Xem trạng thái)", "Khách hàng (Xem TT cơ bản)", "Thực đơn (Chỉ xem)"],
    restricted: ["Bảng điều khiển", "Doanh thu & Báo cáo", "Khuyến mãi (Quản lý)", "Thực đơn (Thêm/Sửa/Xóa)", "Phân quyền & Tài khoản", "Lịch sử hoạt động"],
  },
};
