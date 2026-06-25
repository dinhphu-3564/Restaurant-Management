import { useMemo, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  ShoppingBag,
  CalendarCheck,
  Wallet,
  Search,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Phone,
  Mail,
  CalendarDays,
  MapPin,
  Lock,
  Unlock,
} from "lucide-react";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const pageSize = 10;

  useEffect(() => {
    const loadData = () => {
      const registeredUsers =
        JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
      const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];

      const mergedUsers = [...registeredUsers, ...savedUsers];

      const uniqueUsers = mergedUsers.filter(
        (user, index, self) =>
          index ===
          self.findIndex(
            (item) =>
              String(item.email || "").toLowerCase() ===
              String(user.email || "").toLowerCase(),
          ),
      );

      setUsers(uniqueUsers);
      setOrders(savedOrders);
      setBookings(savedBookings);
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("usersUpdated", loadData);
    window.addEventListener("bookingsUpdated", loadData);
    window.addEventListener("ordersUpdated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("usersUpdated", loadData);
      window.removeEventListener("bookingsUpdated", loadData);
      window.removeEventListener("ordersUpdated", loadData);
    };
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + "đ";

  const formatDate = (value) => {
    if (!value) return "Chưa có";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };
  // giá trị TB
  const formatShortMoney = (value) => {
    const amount = Number(value || 0);

    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}tr`;
    }

    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }

    return amount.toString();
  };

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      { hour: "2-digit", minute: "2-digit" },
    )}`;
  };

  const getUserOrders = (user) => {
    return orders.filter((order) => {
      const matchEmail =
        user.email &&
        order.email &&
        String(order.email).toLowerCase() === String(user.email).toLowerCase();

      const matchUserId =
        user.id && order.userId && String(order.userId) === String(user.id);

      return matchEmail || matchUserId;
    });
  };

  const getUserBookings = (user) => {
    return bookings.filter(
      (booking) =>
        user.email &&
        String(booking.email || "").toLowerCase() ===
          String(user.email || "").toLowerCase(),
    );
  };
  const getUserTotalSpent = (user) => {
    const userOrders = getUserOrders(user);
    const userBookings = getUserBookings(user);

    const orderTotal = userOrders.reduce(
      (sum, order) => sum + Number(order.total || order.totalPrice || 0),
      0,
    );

    const bookingTotal = userBookings.reduce(
      (sum, booking) => sum + Number(booking.total || 0),
      0,
    );

    return orderTotal + bookingTotal;
  };

  const getUserStatus = (user) => {
    return user.status || "active";
  };

  const getUserGroup = (user) => {
    const totalSpent = getUserTotalSpent(user);
    const totalOrders = getUserOrders(user).length;
    const totalBookings = getUserBookings(user).length;

    if (totalSpent >= 15000000 || totalOrders + totalBookings >= 20) {
      return "vip";
    }

    if (totalSpent >= 3000000 || totalOrders + totalBookings >= 5) {
      return "regular";
    }

    return "new";
  };

  const getGroupText = (group) => {
    if (group === "vip") return "VIP";
    if (group === "regular") return "Thân thiết";
    return "Khách mới";
  };

  const getStatusText = (status) => {
    if (status === "locked") return "Đã khóa";
    return "Hoạt động";
  };

  const getStatusStyle = (status) => {
    if (status === "locked") return "bg-red-50 text-red-600";
    return "bg-green-50 text-green-700";
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase().trim();

      const name = String(user.name || user.fullName || "").toLowerCase();
      const phone = String(user.phone || "");
      const email = String(user.email || "").toLowerCase();

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        phone.includes(keyword) ||
        email.includes(keyword);

      const matchStatus =
        statusFilter === "all" || getUserStatus(user) === statusFilter;

      const matchGroup =
        groupFilter === "all" || getUserGroup(user) === groupFilter;

      return matchSearch && matchStatus && matchGroup;
    });
  }, [users, search, statusFilter, groupFilter, orders, bookings]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalSpentAll = users.reduce(
    (sum, user) => sum + getUserTotalSpent(user),
    0,
  );

  const newUsersThisMonth = users.filter((user) => {
    if (!user.createdAt && !user.id) return false;

    const createdDate = new Date(user.createdAt || Number(user.id));
    const now = new Date();

    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalOrders = orders.length;
  const totalBookings = bookings.length;

  const toggleUserStatus = (user) => {
    const newStatus = getUserStatus(user) === "locked" ? "active" : "locked";

    const updatedUsers = users.map((item) =>
      String(item.id) === String(user.id)
        ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
        : item,
    );

    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    setSelectedUser((prev) =>
      prev && String(prev.id) === String(user.id)
        ? { ...prev, status: newStatus }
        : prev,
    );
  };

  const deleteUser = (user) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khách hàng ${user.name}?`)) {
      return;
    }

    const updatedUsers = users.filter(
      (item) => String(item.id) !== String(user.id),
    );

    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

    if (String(selectedUser?.id) === String(user.id)) {
      setSelectedUser(null);
    }
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("all");
    setGroupFilter("all");
  };

  const currentPageIds = paginatedUsers.map((user) => String(user.id));

  const isAllChecked =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllChecked) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const toggleSelectOne = (userId) => {
    const id = String(userId);

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const bulkDeleteUsers = () => {
    if (selectedIds.length === 0) return;

    if (
      !window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} khách hàng?`)
    ) {
      return;
    }

    const updatedUsers = users.filter(
      (user) => !selectedIds.includes(String(user.id)),
    );

    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    setSelectedIds([]);
    setSelectedUser(null);
  };

  const bulkUpdateStatus = (status) => {
    if (selectedIds.length === 0) return;

    const updatedUsers = users.map((user) =>
      selectedIds.includes(String(user.id))
        ? {
            ...user,
            status,
            updatedAt: new Date().toISOString(),
          }
        : user,
    );

    setUsers(updatedUsers);
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <UserStatCard
          icon={<Users />}
          title="Tổng khách hàng"
          value={users.length}
          bg="bg-green-50"
          color="text-green-700"
        />
        <UserStatCard
          icon={<UserPlus />}
          title="Khách mới tháng này"
          value={newUsersThisMonth}
          bg="bg-blue-50"
          color="text-blue-600"
        />
        <UserStatCard
          icon={<ShoppingBag />}
          title="Tổng đơn hàng"
          value={totalOrders}
          bg="bg-purple-50"
          color="text-purple-600"
        />
        <UserStatCard
          icon={<CalendarCheck />}
          title="Tổng lượt đặt bàn"
          value={totalBookings}
          bg="bg-red-50"
          color="text-red-600"
        />
        <UserStatCard
          icon={<Wallet />}
          title="Tổng chi tiêu"
          value={formatPrice(totalSpentAll)}
          bg="bg-emerald-50"
          color="text-emerald-700"
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 items-start ${
          selectedUser ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""
        }`}
      >
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
                selectedUser
                  ? "xl:grid-cols-[1fr_160px_160px_90px]"
                  : "xl:grid-cols-[1fr_190px_190px_100px]"
              }`}
            >
              <div className="h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm khách hàng, SĐT, email..."
                  className="w-full outline-none text-sm"
                />
                <Search size={18} className="text-gray-400" />
              </div>

              <SelectBox
                label="Nhóm khách"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="new">Khách mới</option>
                <option value="regular">Thân thiết</option>
                <option value="vip">VIP</option>
              </SelectBox>

              <SelectBox
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Đã khóa</option>
              </SelectBox>

              <button
                onClick={resetFilter}
                className="h-12 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition"
              >
                <RotateCcw size={16} />
                Xóa
              </button>
            </div>
          </div>

          <div className="px-5 py-3 text-sm font-bold text-gray-500">
            Tổng {filteredUsers.length} khách hàng
          </div>

          {selectedIds.length > 0 && (
            <div className="mx-5 mb-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-black text-green-800">
                Đã chọn {selectedIds.length} khách hàng
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => bulkUpdateStatus("active")}
                  className="h-9 px-4 rounded-lg bg-white text-green-700 border border-green-200 font-black hover:bg-green-100"
                >
                  Mở khóa
                </button>

                <button
                  onClick={() => bulkUpdateStatus("locked")}
                  className="h-9 px-4 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 font-black hover:bg-orange-100"
                >
                  Khóa
                </button>

                <button
                  onClick={bulkDeleteUsers}
                  className="h-9 px-4 rounded-lg bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-100"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1300px] w-full text-left text-sm">
              <thead className="bg-[#fbfcfb] text-gray-500 font-bold text-sm whitespace-nowrap">
                <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={isAllChecked}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-green-700"
                      />
                    </th>
                    <th className="px-4 py-3">Mã KH</th>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">SĐT</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Đơn hàng</th>
                    <th className="px-4 py-3">Đặt bàn</th>
                    <th className="px-4 py-3">Tổng chi tiêu</th>
                    <th className="px-4 py-3 text-center">Nhóm</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => {
                      const userOrders = getUserOrders(user);
                      const userBookings = getUserBookings(user);
                      const totalSpent = getUserTotalSpent(user);
                      const status = getUserStatus(user);
                      const group = getUserGroup(user);

                      return (
                        <tr
                          key={user.id || index}
                          onClick={() => setSelectedUser(user)}
                          className={`border-t border-gray-100 hover:bg-green-50/30 cursor-pointer ${
                            String(selectedUser?.id) === String(user.id)
                              ? "bg-green-50/50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(String(user.id))}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectOne(user.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 accent-green-700"
                            />
                          </td>

                          <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap">
                            KH{String(user.id || index + 1).slice(-5)}
                          </td>

                          <td className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap">
                            {user.name || user.fullName || "Khách hàng"}
                          </td>

                          <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                            {user.phone || "Chưa có"}
                          </td>

                          <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                            {user.email || "Chưa có"}
                          </td>

                          <td className="px-4 py-3 font-black text-center">
                            {userOrders.length}
                          </td>

                          <td className="px-4 py-3 font-black text-center">
                            {userBookings.length}
                          </td>

                          <td className="px-4 py-3 font-black text-green-950 text-center whitespace-nowrap">
                            {formatPrice(totalSpent)}
                          </td>

                          <td className="px-4 py-3">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 whitespace-nowrap">
                              {getGroupText(group)}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(
                                status,
                              )}`}
                            >
                              {getStatusText(status)}
                            </span>
                          </td>

                          <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                            <div className="flex items-center justify-center gap-1.5">
                              <IconButton
                                icon={<Eye size={16} />}
                                color="green"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                }}
                              />
                              <IconButton
                                icon={
                                  status === "locked" ? (
                                    <Unlock size={16} />
                                  ) : (
                                    <Lock size={16} />
                                  )
                                }
                                color="orange"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleUserStatus(user);
                                }}
                              />
                              <IconButton
                                icon={<Trash2 size={16} />}
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteUser(user);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="11"
                        className="px-5 py-14 text-center text-gray-400 font-bold"
                      >
                        Chưa có khách hàng phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </thead>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-gray-600 font-bold">
              Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredUsers.length)} trong
              tổng số {filteredUsers.length} khách hàng
            </p>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg border font-black ${
                      currentPage === page
                        ? "bg-green-700 text-white border-green-700"
                        : "border-gray-200 text-gray-600 hover:bg-green-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
          </div>
        </section>

        {selectedUser && (
          <UserDetailPanel
            user={selectedUser}
            orders={getUserOrders(selectedUser)}
            bookings={getUserBookings(selectedUser)}
            totalSpent={getUserTotalSpent(selectedUser)}
            formatPrice={formatPrice}
            formatShortMoney={formatShortMoney}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            getStatusText={getStatusText}
            getStatusStyle={getStatusStyle}
            getGroupText={getGroupText}
            getUserGroup={getUserGroup}
            onClose={() => setSelectedUser(null)}
            onToggleStatus={() => toggleUserStatus(selectedUser)}
            onDelete={() => deleteUser(selectedUser)}
          />
        )}
      </div>
    </div>
  );
}

function UserDetailPanel({
  user,
  orders,
  bookings,
  totalSpent,
  formatPrice,
  formatShortMoney,
  formatDate,
  formatDateTime,
  getStatusText,
  getStatusStyle,
  getGroupText,
  getUserGroup,
  onClose,
  onToggleStatus,
  onDelete,
}) {
  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden 2xl:sticky 2xl:top-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-green-950">
          Chi tiết khách hàng
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-black text-2xl">
            {(user.name || user.fullName || "K").charAt(0)}
          </div>

          <div>
            <h2 className="text-xl font-black text-green-950">
              {user.name || user.fullName || "Khách hàng"}
            </h2>
            <p className="text-sm text-gray-500 font-semibold">
              KH{String(user.id || "").slice(-5)}
            </p>
            <span
              className={`inline-flex mt-2 px-3 py-1 rounded-lg text-xs font-black ${getStatusStyle(
                user.status || "active",
              )}`}
            >
              {getStatusText(user.status || "active")}
            </span>
          </div>
        </div>

        <DetailBlock title="Thông tin liên hệ">
          <DetailRow
            icon={<Phone size={15} />}
            label="SĐT"
            value={user.phone}
          />
          <DetailRow
            icon={<Mail size={15} />}
            label="Email"
            value={user.email}
          />
          <DetailRow
            icon={<CalendarDays size={15} />}
            label="Ngày tham gia"
            value={formatDate(user.createdAt || Number(user.id))}
          />
          <DetailRow
            icon={<MapPin size={15} />}
            label="Nhóm khách"
            value={getGroupText(getUserGroup(user))}
          />
        </DetailBlock>

        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Đơn hàng" value={orders.length} />
          <MiniStat label="Đặt bàn" value={bookings.length} />
          <MiniStat label="Tổng chi tiêu" value={formatPrice(totalSpent)} />
          <MiniStat
            label="Giá trị TB"
            value={formatShortMoney(
              totalSpent / Math.max(orders.length + bookings.length, 1),
            )}
          />
        </div>

        <DetailBlock title="Lịch sử đơn hàng">
          {orders.slice(0, 5).map((order) => (
            <HistoryRow
              key={order.id}
              code={`DH${order.id}`}
              date={formatDate(order.createdAt)}
              amount={formatPrice(order.total || order.totalPrice)}
            />
          ))}

          {orders.length === 0 && <EmptyText text="Chưa có đơn hàng" />}
        </DetailBlock>

        <DetailBlock title="Lịch sử đặt bàn">
          {bookings.slice(0, 5).map((booking) => (
            <HistoryRow
              key={booking.id}
              code={`DB${booking.id}`}
              date={formatDate(booking.date)}
              amount={
                booking.selectedTable
                  ? `Bàn ${booking.selectedTable}`
                  : "Đang xếp"
              }
            />
          ))}

          {bookings.length === 0 && <EmptyText text="Chưa có lịch đặt bàn" />}
        </DetailBlock>

        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={onToggleStatus}
            className="h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 font-black hover:bg-orange-100"
          >
            {user.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}
          </button>

          <button
            onClick={onDelete}
            className="h-11 rounded-xl bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-100"
          >
            Xóa khách hàng
          </button>
        </div>
      </div>
    </aside>
  );
}

function UserStatCard({ icon, title, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[96px]">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-500 font-bold text-sm">{title}</p>
          <h3 className="text-2xl font-black text-green-950 mt-1">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function SelectBox({ label, value, onChange, children }) {
  return (
    <label className="h-12 rounded-xl border border-gray-100 bg-white px-3 flex flex-col justify-center shadow-sm">
      <span className="text-[11px] font-black text-gray-400">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="outline-none bg-transparent text-sm font-bold text-gray-700"
      >
        {children}
      </select>
    </label>
  );
}

function IconButton({ icon, color, onClick }) {
  const styles = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles[color]}`}
    >
      {icon}
    </button>
  );
}

function DetailBlock({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h4 className="font-black text-green-800 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="grid grid-cols-[22px_95px_1fr] gap-2 text-sm items-center">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-bold break-all">
        {value || "Chưa có"}
      </span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3 text-center">
      <p className="text-green-950 font-black">{value}</p>
      <p className="text-xs text-gray-500 font-semibold mt-1">{label}</p>
    </div>
  );
}

function HistoryRow({ code, date, amount }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm border-b border-gray-50 pb-2 last:border-0">
      <div>
        <p className="font-black text-gray-700">{code}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
      <span className="font-black text-green-700">{amount}</span>
    </div>
  );
}

function EmptyText({ text }) {
  return <p className="text-sm text-gray-400 font-bold">{text}</p>;
}

export default AdminUsersPage;
