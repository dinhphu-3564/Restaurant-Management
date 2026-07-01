import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { showAdminToast } from "../../components/admin/AdminToast";
import {
  ShieldCheck,
  Crown,
  BriefcaseBusiness,
  UserCog,
  Search,
  Lock,
  Plus,
  CheckCircle,
  XCircle,
  ArrowRight,
  Eye,
  X,
  Phone,
  Mail,
  CalendarDays,
  UserRound,
  Clock3,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import { getCurrentUser } from "../../utils/auth";
import {
  getRoleUsers,
  updateUserRole,
  getUserActivities,
  getAdminRoleActivities,
} from "../../services/roleService";
import { updateUserStatus } from "../../services/userService";

const ROLE_TEXT = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  staff: "Nhân viên",
  user: "Khách hàng",
};

const ROLE_BADGE = {
  admin: "bg-red-100 text-red-700 border border-red-200",
  manager: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  staff: "bg-blue-100 text-blue-700 border border-blue-200",
  user: "bg-gray-100 text-gray-700 border border-gray-200",
};

const STATUS_TEXT = {
  active: "Đang hoạt động",
  locked: "Đã khóa",
  deleted: "Đã xóa",
};

const STATUS_BADGE = {
  active: "bg-green-100 text-green-700 border border-green-200",
  locked: "bg-red-100 text-red-700 border border-red-200",
  deleted: "bg-gray-200 text-gray-700 border border-gray-300",
};

const ROLE_THEME = {
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

const ROLE_ICON = {
  admin: <Crown size={22} />,
  manager: <BriefcaseBusiness size={22} />,
  staff: <UserCog size={22} />,
};

const roleCards = [
  {
    key: "admin",
    title: "Quản trị viên",
    description: "Toàn quyền hệ thống",
    color: "bg-red-50 text-red-600",
    permissions: [
      "Toàn quyền quản lý hệ thống",
      "Phân quyền và quản lý vai trò",
      "Quản lý dữ liệu và sao lưu",
      "Cài đặt hệ thống",
    ],
  },
  {
    key: "manager",
    title: "Quản lý",
    description: "Quản lý hoạt động nhà hàng",
    color: "bg-yellow-50 text-yellow-700",
    permissions: [
      "Quản lý đơn hàng",
      "Quản lý đặt bàn",
      "Quản lý bàn & khu vực",
      "Xem báo cáo doanh thu",
      "Quản lý thực đơn, khuyến mãi",
    ],
  },
  {
    key: "staff",
    title: "Nhân viên",
    description: "Thực hiện nghiệp vụ cơ bản",
    color: "bg-blue-50 text-blue-700",
    permissions: [
      "Tạo và xử lý đơn hàng",
      "Check-in đặt bàn",
      "Xem thông tin bàn",
      "Hỗ trợ khách hàng",
    ],
  },
];

//chi tiết bảng quyền theo vai trò
const ROLE_PERMISSIONS = {
  admin: {
    allowed: [
      "Toàn quyền quản lý hệ thống",
      "Phân quyền tài khoản",
      "Quản lý dữ liệu",
      "Cài đặt hệ thống",
      "Xem báo cáo doanh thu",
    ],
    denied: [],
  },
  manager: {
    allowed: [
      "Quản lý đơn hàng",
      "Quản lý đặt bàn",
      "Quản lý bàn & khu vực",
      "Quản lý thực đơn",
      "Xem báo cáo doanh thu",
    ],
    denied: ["Phân quyền tài khoản", "Cài đặt hệ thống"],
  },
  staff: {
    allowed: [
      "Xem đơn hàng",
      "Xử lý đơn hàng",
      "Quản lý đặt bàn",
      "Hỗ trợ khách hàng",
    ],
    denied: ["Quản lý doanh thu", "Phân quyền tài khoản"],
  },
};

function AdminRolesPage() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [actionUser, setActionUser] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [adminActivities, setAdminActivities] = useState([]);
  const [adminActivitiesLoading, setAdminActivitiesLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRoleUsers({
        search,
        role: roleFilter,
      });

      const roleUsers = (data.users || []).filter((user) =>
        ["admin", "manager", "staff"].includes(user.role),
      );

      setUsers(roleUsers);
    } catch (error) {
      console.error(error);
      setError(error.message || "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadAdminActivities();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  const formatDateOnly = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("vi-VN");
  };

  const formatTimeOnly = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isThisMonth = (value) => {
    if (!value) return false;

    const date = new Date(value);
    const now = new Date();

    if (Number.isNaN(date.getTime())) return false;

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.trim().toLowerCase();

      const name = String(user.name || user.fullName || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const phone = String(user.phone || "");

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword);

      const matchStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      managers: users.filter((user) => user.role === "manager").length,
      staffs: users.filter((user) => user.role === "staff").length,
      locked: users.filter((user) => user.status === "locked").length,
      active: users.filter((user) => user.status !== "locked").length,
      newThisMonth: users.filter((user) => isThisMonth(user.createdAt)).length,
    };
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const startItem =
    filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(currentPage * pageSize, filteredUsers.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectedAccount?.id) {
      setActivityLogs([]);
      return;
    }

    loadAccountActivities(selectedAccount.id);
  }, [selectedAccount?.id]);

  const handleSearch = () => {
    loadUsers();
  };

  //hàm gọi API lịch sử
  const loadAccountActivities = async (userId) => {
    if (!userId) {
      setActivityLogs([]);
      return;
    }

    setActivityLoading(true);

    try {
      const data = await getUserActivities(userId);
      setActivityLogs(data.activities || []);
    } catch (error) {
      console.error(error);
      setActivityLogs([]);
    } finally {
      setActivityLoading(false);
    }
  };

  //hàm load lịch sử hoạt động admin
  const loadAdminActivities = async () => {
    setAdminActivitiesLoading(true);

    try {
      const data = await getAdminRoleActivities();
      setAdminActivities(data.activities || []);
    } catch (error) {
      console.error(error);
      setAdminActivities([]);
    } finally {
      setAdminActivitiesLoading(false);
    }
  };

  //hàm xóa bộ lọc
  const resetFilter = async () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);

    setLoading(true);
    setError("");

    try {
      const data = await getRoleUsers({
        search: "",
        role: "all",
      });

      const roleUsers = (data.users || []).filter((user) =>
        ["admin", "manager", "staff"].includes(user.role),
      );

      setUsers(roleUsers);
    } catch (error) {
      console.error(error);
      setError(error.message || "Không thể tải lại danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (user, nextRole) => {
    if (String(user.id) === String(currentUser.id)) {
      alert("Không thể tự thay đổi vai trò của tài khoản đang đăng nhập.");
      return;
    }

    try {
      const data = await updateUserRole(user.id, nextRole);
      await loadUsers();
      await loadAdminActivities();

      setActionUser(null);

      if (nextRole === "user") {
        setSelectedAccount(null);
        setActivityLogs([]);
      } else {
        const updatedUser = data.user || {
          ...user,
          role: nextRole,
          updatedAt: new Date().toISOString(),
        };

        setSelectedAccount((prev) =>
          prev && String(prev.id) === String(user.id) ? updatedUser : prev,
        );

        await loadAccountActivities(user.id);
      }

      showAdminToast({
        title: "Cập nhật vai trò thành công",
        message: `Đã chuyển tài khoản ${
          user.name || user.fullName || user.email
        } sang vai trò "${ROLE_TEXT[nextRole]}".`,
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể cập nhật vai trò.");
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "locked" ? "active" : "locked";

    try {
      const data = await updateUserStatus(user.id, nextStatus);
      await loadUsers();
      await loadAdminActivities();

      setActionUser(null);

      const updatedUser = data.user || {
        ...user,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };

      setSelectedAccount((prev) =>
        prev && String(prev.id) === String(user.id) ? updatedUser : prev,
      );

      await loadAccountActivities(user.id);

      showAdminToast({
        title: "Cập nhật trạng thái tài khoản thành công",
        message:
          nextStatus === "locked"
            ? `Đã khóa tài khoản ${user.name || user.fullName || user.email}.`
            : `Đã mở khóa tài khoản ${user.name || user.fullName || user.email}.`,
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể cập nhật trạng thái.");
    }
  };

  if (currentUser?.role !== "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 font-bold">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-green-700 font-bold">
          Đang tải danh sách tài khoản...
        </div>
      )}

      <div className="overflow-x-auto xl:overflow-visible pb-1">
        <div className="grid grid-flow-col auto-cols-[158px] sm:auto-cols-[165px] md:auto-cols-[172px] xl:grid-flow-row xl:grid-cols-6 xl:auto-cols-auto gap-2 min-w-max xl:min-w-0">
          <TopStatCard
            icon={<ShieldCheck size={18} />}
            title="Tổng tài khoản"
            value={summary.total}
            note={`${summary.newThisMonth} tài khoản mới tháng này`}
            bg="bg-green-50"
            color="text-green-700"
            hover="hover:bg-green-100 hover:border-green-200"
          />

          <TopStatCard
            icon={<Crown size={18} />}
            title="Quản trị viên"
            value={summary.admins}
            note="Toàn quyền hệ thống"
            bg="bg-yellow-50"
            color="text-yellow-600"
            hover="hover:bg-yellow-100 hover:border-yellow-200"
          />

          <TopStatCard
            icon={<BriefcaseBusiness size={18} />}
            title="Quản lý"
            value={summary.managers}
            note="Theo dõi vận hành"
            bg="bg-blue-50"
            color="text-blue-600"
            hover="hover:bg-blue-100 hover:border-blue-200"
          />

          <TopStatCard
            icon={<UserCog size={18} />}
            title="Nhân viên"
            value={summary.staffs}
            note="Tài khoản nghiệp vụ"
            bg="bg-green-50"
            color="text-green-700"
            hover="hover:bg-green-100 hover:border-green-200"
          />

          <TopStatCard
            icon={<Lock size={18} />}
            title="Đã khóa"
            value={summary.locked}
            note="Tài khoản bị khóa"
            bg="bg-red-50"
            color="text-red-600"
            hover="hover:bg-red-100 hover:border-red-200"
          />

          <TopStatCard
            icon={<CheckCircle size={18} />}
            title="Đang hoạt động"
            value={summary.active}
            note={`${
              summary.total
                ? Math.round((summary.active / summary.total) * 100)
                : 0
            }% tổng tài khoản`}
            bg="bg-emerald-50"
            color="text-emerald-700"
            hover="hover:bg-emerald-100 hover:border-emerald-200"
          />
        </div>
      </div>

      <div className="space-y-4 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {roleCards.map((role) => (
            <RolePermissionCard
              key={role.key}
              role={role}
              count={
                role.key === "admin"
                  ? summary.admins
                  : role.key === "manager"
                    ? summary.managers
                    : summary.staffs
              }
            />
          ))}

          <AdminTipsCard />
        </div>

        <div
          className={`grid grid-cols-1 gap-4 items-start ${
            selectedAccount ? "xl:grid-cols-[minmax(0,1fr)_390px]" : ""
          }`}
        >
          <div className="space-y-4 min-w-0">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
              <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-green-950">
                      Quản lý vai trò tài khoản
                    </h2>
                    <p className="text-sm text-gray-500">
                      Chỉ hiển thị tài khoản đã được cấp quyền quản trị.
                    </p>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-2 w-full ${
                    selectedAccount
                      ? "xl:grid-cols-[minmax(150px,1fr)_118px_132px_70px_104px]"
                      : "xl:grid-cols-[minmax(220px,1fr)_150px_170px_90px_130px]"
                  }`}
                >
                  <div
                    className={`rounded-xl border border-gray-100 bg-white flex items-center gap-2 shadow-sm min-w-0 ${
                      selectedAccount ? "h-10 px-2" : "h-11 px-3"
                    }`}
                  >
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      placeholder={
                        selectedAccount ? "Tìm..." : "Tìm tên, email, SĐT..."
                      }
                      className={`outline-none w-full min-w-0 ${
                        selectedAccount ? "text-xs" : "text-sm"
                      }`}
                    />

                    <button type="button" onClick={handleSearch}>
                      <Search
                        size={selectedAccount ? 15 : 18}
                        className="text-gray-400"
                      />
                    </button>
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`rounded-xl border border-gray-100 font-bold text-gray-700 outline-none ${
                      selectedAccount
                        ? "h-10 px-2 text-xs"
                        : "h-11 px-3 text-sm"
                    }`}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="staff">Nhân viên</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`rounded-xl border border-gray-100 font-bold text-gray-700 outline-none ${
                      selectedAccount
                        ? "h-10 px-2 text-xs"
                        : "h-11 px-3 text-sm"
                    }`}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="locked">Đã khóa</option>
                  </select>

                  <button
                    type="button"
                    onClick={resetFilter}
                    className={`rounded-xl border border-gray-100 bg-white text-gray-600 font-black hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition flex items-center justify-center whitespace-nowrap ${
                      selectedAccount
                        ? "h-10 px-2 text-xs gap-1"
                        : "h-11 px-3 text-sm gap-2"
                    }`}
                  >
                    <RotateCcw size={selectedAccount ? 13 : 15} />
                    Xóa
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className={`rounded-xl bg-green-800 text-white font-black hover:bg-green-950 hover:shadow-lg transition flex items-center justify-center whitespace-nowrap ${
                      selectedAccount
                        ? "h-10 px-2 text-xs gap-1"
                        : "h-11 px-4 text-sm gap-2"
                    }`}
                  >
                    <Plus size={selectedAccount ? 14 : 17} />
                    Cấp quyền
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-w-full">
                <table className="min-w-[1080px] w-full table-fixed text-left text-[13px]">
                  <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3 w-[70px]">Avatar</th>
                      <th className="px-4 py-3 w-[110px]">Mã TK</th>
                      <th className="px-4 py-3 w-[180px]">Họ tên</th>
                      <th className="px-4 py-3 w-[260px]">Email</th>
                      <th className="px-4 py-3 w-[140px]">SĐT</th>
                      <th className="px-4 py-3 w-[130px] text-center">
                        Vai trò
                      </th>
                      <th className="px-4 py-3 w-[130px] text-center">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 w-[150px]">Ngày tạo</th>
                      <th className="px-4 py-3 w-[120px] text-center sticky right-0 bg-[#fbfcfb] z-20 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedAccount(user)}
                          className={`border-t border-gray-100 cursor-pointer hover:bg-green-50/30 ${
                            String(selectedAccount?.id) === String(user.id)
                              ? "bg-green-50/50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 w-[70px]">
                            <Avatar user={user} />
                          </td>

                          <td className="px-4 py-3 w-[110px] font-black text-green-700 whitespace-nowrap">
                            TK{String(user.id).padStart(5, "0")}
                          </td>

                          <td className="px-4 py-3 w-[180px]">
                            <p
                              title={user.name || user.fullName || "Chưa có"}
                              className="font-bold text-gray-700 truncate"
                            >
                              {user.name || user.fullName || "Chưa có"}
                            </p>
                          </td>

                          <td className="px-4 py-3 w-[260px]">
                            <p
                              title={user.email || "Chưa có"}
                              className="text-gray-600 font-semibold truncate"
                            >
                              {user.email || "Chưa có"}
                            </p>
                          </td>

                          <td className="px-4 py-3 w-[140px]">
                            <p
                              title={user.phone || "Chưa có"}
                              className="text-gray-600 font-semibold truncate"
                            >
                              {user.phone || "Chưa có"}
                            </p>
                          </td>

                          <td className="px-4 py-3 w-[130px] text-center">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${
                                ROLE_BADGE[user.role] ||
                                "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {ROLE_TEXT[user.role] || user.role}
                            </span>
                          </td>

                          <td className="px-4 py-3 w-[130px] text-center">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${
                                user.status === "locked"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {user.status === "locked"
                                ? "Đã khóa"
                                : "Hoạt động"}
                            </span>
                          </td>

                          <td className="px-4 py-3 w-[150px]">
                            <p
                              title={formatDateTime(user.createdAt)}
                              className="text-gray-600 font-semibold truncate"
                            >
                              {formatDateTime(user.createdAt)}
                            </p>
                          </td>

                          <td
                            className={`px-4 py-3 w-[120px] text-center sticky right-0 z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)] ${
                              String(selectedAccount?.id) === String(user.id)
                                ? "bg-green-50"
                                : "bg-white"
                            }`}
                          >
                            <div className="relative flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAccount(user);
                                }}
                                className="w-9 h-9 rounded-xl border border-green-100 bg-green-50 text-green-700 hover:bg-green-100 transition inline-flex items-center justify-center"
                                title="Xem chi tiết"
                              >
                                <Eye size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-5 py-14 text-center text-gray-400 font-bold"
                        >
                          Chưa có tài khoản phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-sm font-semibold text-gray-500">
                  Hiển thị {startItem} - {endItem} trong tổng số{" "}
                  {filteredUsers.length} tài khoản
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg border font-black transition ${
                        currentPage === page
                          ? "bg-green-700 text-white border-green-700"
                          : "border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            </section>
            <RecentActivityPanel
              activities={adminActivities}
              loading={adminActivitiesLoading}
              formatDateTime={formatDateTime}
            />
          </div>

          {selectedAccount && (
            <AccountDetailPanel
              user={selectedAccount}
              activities={activityLogs}
              activityLoading={activityLoading}
              onClose={() => setSelectedAccount(null)}
              onChangeRole={handleChangeRole}
              onToggleStatus={handleToggleStatus}
              formatDateTime={formatDateTime}
              formatDateOnly={formatDateOnly}
              formatTimeOnly={formatTimeOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TopStatCard({ icon, title, value, note, bg, color, hover }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 h-[106px] flex flex-col cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition min-w-0 ${
        hover || "hover:bg-green-50 hover:border-green-100"
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-black text-gray-500 leading-4 line-clamp-1">
            {title}
          </p>

          <h3 className="text-[28px] font-black text-green-950 leading-none mt-1">
            {value}
          </h3>
        </div>
      </div>

      <p className="mt-auto text-[11px] font-bold text-gray-500 leading-4 line-clamp-1">
        {note}
      </p>
    </div>
  );
}

function RolePermissionCard({ role, count }) {
  const theme = ROLE_THEME[role.key] || ROLE_THEME.staff;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 min-h-[178px] min-w-0 hover:shadow-md transition ${theme.hover}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0`}
          >
            {ROLE_ICON[role.key]}
          </div>

          <div className="min-w-0">
            <h3 className={`text-lg font-black leading-6 ${theme.text}`}>
              {role.title}
            </h3>

            <p className="text-xs text-gray-500 font-bold mt-0.5 leading-5">
              {role.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 2xl:grid-cols-2 gap-x-4 gap-y-2">
        {role.permissions.map((permission) => (
          <p
            key={permission}
            className="text-xs text-gray-600 font-bold flex items-start gap-2 leading-5"
          >
            <span className={`${theme.check} font-black shrink-0 leading-5`}>
              ✓
            </span>
            <span className="break-words">{permission}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function AdminTipsCard() {
  return (
    <div className="bg-yellow-50 rounded-2xl border border-yellow-100 shadow-sm p-4 min-h-[178px] min-w-0 hover:bg-yellow-100 hover:border-yellow-200 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} />
        </div>

        <div>
          <h3 className="text-lg font-black text-green-950 leading-6">
            Gợi ý quản trị
          </h3>

          <p className="text-xs text-gray-500 font-bold mt-0.5 leading-5">
            Kiểm soát quyền tài khoản
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-gray-600 font-bold flex items-start gap-2 leading-5">
          <span className="text-yellow-700 font-black shrink-0">•</span>
          <span>Nên phân quyền đúng vị trí công việc.</span>
        </p>

        <p className="text-xs text-gray-600 font-bold flex items-start gap-2 leading-5">
          <span className="text-yellow-700 font-black shrink-0">•</span>
          <span>Kiểm tra quyền định kỳ.</span>
        </p>

        <p className="text-xs text-gray-600 font-bold flex items-start gap-2 leading-5">
          <span className="text-yellow-700 font-black shrink-0">•</span>
          <span>Khóa tài khoản khi nhân viên nghỉ việc.</span>
        </p>
      </div>
    </div>
  );
}

function RoleBadgeText({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black mx-1 ${
        ROLE_BADGE[role] || "bg-gray-100 text-gray-700 border border-gray-200"
      }`}
    >
      {ROLE_TEXT[role] || role || "Không rõ"}
    </span>
  );
}

function StatusBadgeText({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black mx-1 ${
        STATUS_BADGE[status] ||
        "bg-gray-100 text-gray-700 border border-gray-200"
      }`}
    >
      {STATUS_TEXT[status] || status || "Không rõ"}
    </span>
  );
}

function ActivityMessage({ activity }) {
  if (activity.action === "role_changed") {
    return (
      <p className="font-black text-green-950 leading-7">
        Đổi vai trò từ
        <RoleBadgeText role={activity.oldValue} />
        sang
        <RoleBadgeText role={activity.newValue} />
      </p>
    );
  }

  if (activity.action === "status_changed") {
    return (
      <p className="font-black text-green-950 leading-7">
        Cập nhật trạng thái tài khoản thành
        <StatusBadgeText status={activity.newValue} />
      </p>
    );
  }

  if (activity.action === "deleted" || activity.action === "account_deleted") {
    return (
      <p className="font-black text-green-950 leading-7">
        Tài khoản đã được
        <StatusBadgeText status="deleted" />
      </p>
    );
  }

  return (
    <p className="font-black text-green-950 leading-5">
      {activity.message || "Có thay đổi tài khoản"}
    </p>
  );
}

function RecentActivityPanel({ activities, loading, formatDateTime }) {
  const [showAll, setShowAll] = useState(false);

  const visibleActivities = showAll ? activities : activities.slice(0, 5);
  const hasMore = activities.length > 5;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-black text-green-950">
            Nhật ký hoạt động gần đây
          </h3>

          <p className="text-sm text-gray-500 font-semibold mt-1">
            Lịch sử thao tác thay đổi vai trò và trạng thái tài khoản của admin.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[#fbfcfb] text-gray-600 text-xs uppercase font-black">
            <tr>
              <th className="px-4 py-3 w-[190px]">Thời gian</th>
              <th className="px-4 py-3">Hoạt động thay đổi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="2"
                  className="px-4 py-8 text-center text-gray-400 font-bold"
                >
                  Đang tải nhật ký hoạt động...
                </td>
              </tr>
            ) : visibleActivities.length > 0 ? (
              visibleActivities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-t border-gray-100 hover:bg-green-50/30"
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-black text-gray-700">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <ActivityMessage activity={activity} />

                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      Tài khoản tác động:{" "}
                      <span className="text-gray-700">
                        {activity.targetName}
                      </span>
                    </p>

                    {activity.targetEmail && (
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        Email: {activity.targetEmail}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="px-4 py-8 text-center text-gray-400 font-bold"
                >
                  Chưa có lịch sử hoạt động.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="h-10 px-5 rounded-xl bg-green-50 text-green-700 text-sm font-black hover:bg-green-100 transition flex items-center justify-center gap-2"
          >
            {showAll
              ? "Thu gọn nhật ký"
              : `Xem thêm ${activities.length - 5} hoạt động`}

            <ChevronDown
              size={17}
              className={`transition ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}

function AccountDetailPanel({
  user,
  activities = [],
  activityLoading = false,
  onClose,
  onChangeRole,
  onToggleStatus,
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
}) {
  const role = user.role || "staff";
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.staff;
  const roleTheme = ROLE_THEME[role] || ROLE_THEME.staff;
  const isLocked = user.status === "locked";

  const displayName = user.name || user.fullName || "Tài khoản";
  const [showAllActivities, setShowAllActivities] = useState(false);

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, 3);
  useEffect(() => {
    setShowAllActivities(false);
  }, [user.id]);

  const hasMoreActivities = activities.length > 3;

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden xl:sticky xl:top-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-green-950">
          Chi tiết tài khoản
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-red-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="large" />

          <div className="min-w-0">
            <h2 className="text-xl font-black text-green-950 truncate">
              {displayName}
            </h2>

            <p className="text-sm text-gray-500 font-semibold">
              TK{String(user.id).padStart(5, "0")}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-black ${
                  ROLE_BADGE[role] || "bg-gray-50 text-gray-600"
                }`}
              >
                {ROLE_TEXT[role] || role}
              </span>

              <span
                className={`px-3 py-1 rounded-lg text-xs font-black ${
                  STATUS_BADGE[user.status] || STATUS_BADGE.active
                }`}
              >
                {STATUS_TEXT[user.status] || "Đang hoạt động"}
              </span>
            </div>
          </div>
        </div>

        <DetailBox icon={<UserRound size={18} />} title="Thông tin cơ bản">
          <DetailLine
            icon={<Mail size={15} />}
            label="Email"
            value={user.email}
          />
          <DetailLine
            icon={<Phone size={15} />}
            label="SĐT"
            value={user.phone}
          />
          <DetailLine
            icon={<CalendarDays size={15} />}
            label="Ngày tạo"
            value={formatDateTime(user.createdAt)}
          />
          <DetailLine
            icon={<UserRound size={15} />}
            label="Người tạo"
            value="Admin"
          />
        </DetailBox>

        <DetailBox
          icon={<ShieldCheck size={18} />}
          title="Vai trò & phân quyền"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm text-gray-500 font-bold">
              Vai trò hiện tại
            </span>

            <select
              value={role}
              disabled={String(user.id) === String(getCurrentUser()?.id)}
              onChange={(e) => onChangeRole(user, e.target.value)}
              className={`h-10 rounded-xl border px-3 text-sm font-black outline-none disabled:opacity-60 disabled:cursor-not-allowed ${roleTheme.box}`}
            >
              <option value="admin">Quản trị viên</option>
              <option value="manager">Quản lý</option>
              <option value="staff">Nhân viên</option>
              <option value="user">Khách hàng</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className={`text-sm font-black ${roleTheme.text}`}>
              Quyền đã có
            </p>

            {permissions.allowed.map((item) => (
              <PermissionLine
                key={item}
                type="allow"
                text={item}
                colorClass={roleTheme.check}
              />
            ))}
          </div>
        </DetailBox>

        <DetailBox
          icon={<ShieldCheck size={18} />}
          title="Trạng thái tài khoản"
        >
          <DetailLine
            icon={isLocked ? <Lock size={15} /> : <CheckCircle size={15} />}
            label="Trạng thái"
            value={isLocked ? "Đã khóa" : "Hoạt động"}
          />

          <DetailLine
            icon={<Clock3 size={15} />}
            label="Cập nhật gần nhất"
            value={formatDateTime(user.updatedAt || user.createdAt)}
          />

          <DetailLine
            icon={<Mail size={15} />}
            label="Xác thực email"
            value={user.emailVerified ? "Đã xác thực" : "Chưa có dữ liệu"}
          />
        </DetailBox>

        <DetailBox
          icon={<Clock3 size={18} />}
          title="Lịch sử hoạt động gần đây"
        >
          {activityLoading ? (
            <p className="text-sm text-gray-400 font-bold">
              Đang tải lịch sử hoạt động...
            </p>
          ) : activities.length > 0 ? (
            <>
              <div className="space-y-3">
                {visibleActivities.map((activity) => (
                  <TimelineLine
                    key={activity.id}
                    date={formatDateOnly(activity.createdAt)}
                    time={formatTimeOnly(activity.createdAt)}
                    text={activity.message}
                    subText={
                      activity.actorName
                        ? `Thực hiện bởi ${activity.actorName}`
                        : "Hệ thống"
                    }
                  />
                ))}
              </div>

              {hasMoreActivities && (
                <button
                  type="button"
                  onClick={() => setShowAllActivities((prev) => !prev)}
                  className="mt-3 w-full h-10 rounded-xl bg-green-50 text-green-700 text-sm font-black hover:bg-green-100 transition flex items-center justify-center gap-2"
                >
                  {showAllActivities
                    ? "Thu gọn"
                    : `Xem thêm ${activities.length - 3} hoạt động`}

                  <ChevronDown
                    size={16}
                    className={`transition ${
                      showAllActivities ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 font-bold">
              Chưa có lịch sử hoạt động.
            </p>
          )}
        </DetailBox>

        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 font-black hover:bg-gray-100"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(user)}
            className={`h-11 rounded-xl border font-black ${
              isLocked
                ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
            }`}
          >
            {isLocked ? "Mở khóa" : "Khóa tài khoản"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function DetailBox({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
          {icon}
        </div>

        <h4 className="font-black text-green-950">{title}</h4>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailLine({ icon, label, value }) {
  return (
    <div className="grid grid-cols-[22px_110px_1fr] gap-2 text-sm items-start">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-black break-all">
        {value || "Chưa có"}
      </span>
    </div>
  );
}

function PermissionLine({ type, text, colorClass = "text-green-600" }) {
  const isAllow = type === "allow";

  return (
    <div className="flex items-start gap-2 text-sm">
      <span className={`mt-0.5 ${isAllow ? colorClass : "text-gray-400"}`}>
        {isAllow ? <CheckCircle size={16} /> : <XCircle size={16} />}
      </span>

      <span
        className={`font-semibold ${
          isAllow ? "text-gray-700" : "text-gray-400"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

function TimelineLine({ date, time, text, subText }) {
  return (
    <div className="grid grid-cols-[14px_92px_1fr] gap-3 text-sm items-start">
      <div className="pt-1.5 flex justify-center">
        <span className="w-2 h-2 rounded-full bg-green-600" />
      </div>

      <div className="font-bold leading-5">
        <p className="text-gray-600">{date}</p>
        {time && <p className="text-xs text-gray-400 mt-0.5">{time}</p>}
      </div>

      <div className="min-w-0">
        <p className="text-gray-700 font-black leading-5">{text}</p>

        {subText && (
          <p className="text-xs text-gray-400 font-bold mt-1 leading-4">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}

function Avatar({ user, size = "normal" }) {
  const displayName = user.name || user.fullName || user.email || "A";
  const sizeClass =
    size === "large" ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm";

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={displayName}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-green-50 text-green-800 flex items-center justify-center font-black shrink-0`}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}

export default AdminRolesPage;
