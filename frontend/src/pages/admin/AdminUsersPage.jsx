import { useMemo, useEffect, useState } from "react";
import { getUsers, updateUserStatus, deleteUserById, bulkUpdateUserStatus, bulkDeleteUsers as bulkDeleteUsersApi } from "../../services/userService";
import { updateUserRole } from "../../services/roleService";
import { getCurrentUser } from "../../utils/auth";
import { canUseAction } from "../../utils/permissions";
import { showAdminToast } from "../../components/admin/AdminToast";
import { removeVietnameseTones } from "../../utils/string";
import { UserDetailPanel, GrantRoleModal, UserStatCard, SelectBox, IconButton } from "../../components/admin/AdminUserComponents";
import GlobalPagination from "../../components/admin/GlobalPagination";
import { Users, UserPlus, ShoppingBag, CalendarCheck, Wallet, Search, Eye, Pencil, Trash2, RotateCcw, Lock, Unlock } from "lucide-react";
import { ROLE_TEXT, formatPriceUser, formatDateUser, formatShortMoneyUser, formatDateTimeUser, getUserOrders, getUserBookings, getUserTotalSpent, getUserStatus, getUserGroup, getGroupTextUser, getStatusTextUser, getStatusStyleUser } from "../../utils/userHelpers";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalUsers: 0, newUsersThisMonth: 0, totalOrders: 0, totalBookings: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const currentUser = getCurrentUser();
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [roleValue, setRoleValue] = useState("staff");
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const loadUsers = async () => {
    setLoading(true); setError("");
    try {
      const data = await getUsers();
      setUsers(data.users || []);
      setSummary(data.summary || { totalUsers: 0, newUsersThisMonth: 0, totalOrders: 0, totalBookings: 0, totalSpent: 0 });
    } catch (error) { console.error(error); setError(error.message || "Không thể tải danh sách khách hàng."); } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = removeVietnameseTones(String(search || "").trim());
      const cleanName = removeVietnameseTones(user.name || user.fullName);
      const cleanPhone = removeVietnameseTones(user.phone);
      const cleanEmail = removeVietnameseTones(user.email);
      const matchSearch = !keyword || cleanName.includes(keyword) || cleanPhone.includes(keyword) || cleanEmail.includes(keyword);
      const matchStatus = statusFilter === "all" || getUserStatus(user) === statusFilter;
      const matchGroup = groupFilter === "all" || getUserGroup(user) === groupFilter;
      return matchSearch && matchStatus && matchGroup;
    });
  }, [users, search, statusFilter, groupFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startItem = filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredUsers.length);

  const toggleUserStatus = async (user) => {
    const newStatus = getUserStatus(user) === "locked" ? "active" : "locked";
    try {
      await updateUserStatus(user.id, newStatus); await loadUsers();
      setSelectedUser((prev) => prev && String(prev.id) === String(user.id) ? { ...prev, status: newStatus } : prev);
      showAdminToast({ title: "Cập nhật trạng thái", message: `Đã ${newStatus === "locked" ? "khóa" : "mở khóa"} khách hàng ${user.name || user.fullName || user.email}.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật trạng thái khách hàng."); }
  };

  const executeDeleteUser = async (user) => {
    try {
      await deleteUserById(user.id); await loadUsers();
      if (String(selectedUser?.id) === String(user.id)) setSelectedUser(null);
      showAdminToast({ title: "Xóa thành công", message: `Đã xóa khách hàng ${user.name || user.fullName || user.email}.` });
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: error.message || "Không thể xóa.", type: "error" }); }
  };

  const grantUserRole = async () => {
    if (!roleModalUser) return;
    if (!["staff", "manager", "admin"].includes(roleValue)) { showAdminToast({ title: "Thất bại", message: "Vai trò không hợp lệ.", type: "error" }); return; }
    try {
      setRoleSubmitting(true);
      await updateUserRole(roleModalUser.id, roleValue); await loadUsers();
      setSelectedIds((prev) => prev.filter((id) => String(id) !== String(roleModalUser.id)));
      if (String(selectedUser?.id) === String(roleModalUser.id)) setSelectedUser(null);
      setRoleModalUser(null); setRoleValue("staff");
      showAdminToast({ title: "Cấp quyền thành công", message: `Đã cấp quyền ${ROLE_TEXT[roleValue]} cho tài khoản ${roleModalUser.name || roleModalUser.fullName || roleModalUser.email}.` });
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: error.message || "Không thể cấp quyền.", type: "error" }); } finally { setRoleSubmitting(false); }
  };

  const resetFilter = () => { setSearch(""); setStatusFilter("all"); setGroupFilter("all"); };

  const currentPageIds = paginatedUsers.map((user) => String(user.id));
  const isAllChecked = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const toggleSelectAll = () => { if (isAllChecked) setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id))); else setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]); };
  const toggleSelectOne = (userId) => { const id = String(userId); setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]); };

  const executeBulkDeleteUsers = async () => {
    try {
      await bulkDeleteUsersApi(selectedIds); await loadUsers();
      setSelectedIds([]); setSelectedUser(null);
      showAdminToast({ title: "Xóa hàng loạt thành công", message: `Đã xóa ${selectedIds.length} khách hàng đã chọn.` });
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: error.message || "Không thể xóa hàng loạt.", type: "error" }); }
  };

  const bulkUpdateStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateUserStatus(selectedIds, status); await loadUsers(); setSelectedIds([]);
      showAdminToast({ title: "Cập nhật hàng loạt thành công", message: `Đã ${status === "locked" ? "khóa" : "mở khóa"} ${selectedIds.length} khách hàng đã chọn.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật hàng loạt."); }
  };

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 font-bold">{error}</div>}
      {loading && <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-green-700 font-bold">Đang tải danh sách khách hàng...</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <UserStatCard icon={<Users />} title="Tổng khách hàng" value={summary.totalUsers || users.length} bg="bg-green-50" color="text-green-700" note="so với tháng trước" />
        <UserStatCard icon={<UserPlus />} title="Khách mới tháng này" value={summary.newUsersThisMonth || 0} bg="bg-blue-50" color="text-blue-600" note="so với tháng trước" />
        <UserStatCard icon={<ShoppingBag />} title="Tổng đơn hàng" value={summary.totalOrders || 0} bg="bg-purple-50" color="text-purple-600" note="so với tháng trước" />
        <UserStatCard icon={<CalendarCheck />} title="Tổng lượt đặt bàn" value={summary.totalBookings || 0} bg="bg-red-50" color="text-red-600" note="so với tháng trước" />
        <UserStatCard icon={<Wallet />} title="Tổng chi tiêu" value={formatPriceUser(summary.totalSpent || 0)} bg="bg-emerald-50" color="text-emerald-700" note="so với tháng trước" />
      </div>

      <div className={`grid grid-cols-1 gap-4 items-start ${selectedUser ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${selectedUser ? "xl:grid-cols-[1fr_160px_160px_90px]" : "xl:grid-cols-[1fr_190px_190px_100px]"}`}>
              <div className="h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm khách hàng, SĐT, email..." className="w-full outline-none text-sm" />
                <Search size={18} className="text-gray-400" />
              </div>
              <SelectBox label="Nhóm khách" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                <option value="all">Tất cả</option><option value="new">Khách mới</option><option value="regular">Thân thiết</option><option value="vip">VIP</option>
              </SelectBox>
              <SelectBox label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="locked">Đã khóa</option>
              </SelectBox>
              <button onClick={resetFilter} className="h-12 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition">
                <RotateCcw size={16} />Xóa
              </button>
            </div>
          </div>

          <div className="px-5 py-3 text-sm font-bold text-gray-500">Tổng {filteredUsers.length} khách hàng</div>

          {selectedIds.length > 0 && (
            <div className="mx-5 mb-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-black text-primary">Đã chọn {selectedIds.length} khách hàng</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => bulkUpdateStatus("active")} className="h-9 px-4 rounded-lg bg-white text-green-700 border border-green-200 font-black hover:bg-green-100">Mở khóa</button>
                <button onClick={() => bulkUpdateStatus("locked")} className="h-9 px-4 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 font-black hover:bg-orange-100">Khóa</button>
                <button onClick={() => setDeleteConfirmUser({ bulk: true })} className="h-9 px-4 rounded-lg bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-100">Xóa</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1300px] w-full text-left text-sm">
              <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 w-10"><input type="checkbox" checked={isAllChecked} onChange={toggleSelectAll} className="w-4 h-4 accent-green-700" /></th>
                  <th className="px-4 py-3">Mã KH</th><th className="px-4 py-3">Họ và tên</th><th className="px-4 py-3">SĐT</th><th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Đơn hàng</th><th className="px-4 py-3">Đặt bàn</th><th className="px-4 py-3">Tổng chi tiêu</th>
                  <th className="px-4 py-3 text-center">Nhóm</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user, index) => {
                    const status = getUserStatus(user); const group = getUserGroup(user);
                    return (
                      <tr key={user.id || index} onClick={() => setSelectedUser(user)} className={`border-t border-gray-100 hover:bg-green-50/30 cursor-pointer ${String(selectedUser?.id) === String(user.id) ? "bg-green-50/50" : ""}`}>
                        <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(String(user.id))} onChange={(e) => { e.stopPropagation(); toggleSelectOne(user.id); }} onClick={(e) => e.stopPropagation()} className="w-4 h-4 accent-green-700" /></td>
                        <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap">KH{String(user.id || index + 1).slice(-5)}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap">{user.name || user.fullName || "Khách hàng"}</td>
                        <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{user.phone || "Chưa có"}</td>
                        <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{user.email || "Chưa có"}</td>
                        <td className="px-4 py-3 font-black text-center">{Number(user.orderCount || getUserOrders(user).length || 0)}</td>
                        <td className="px-4 py-3 font-black text-center">{Number(user.bookingCount || getUserBookings(user).length || 0)}</td>
                        <td className="px-4 py-3 font-black text-primary text-center whitespace-nowrap">{formatPriceUser(getUserTotalSpent(user))}</td>
                        <td className="px-4 py-3"><span className="px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 whitespace-nowrap">{getGroupTextUser(group)}</span></td>
                        <td className="px-4 py-3"><span className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyleUser(status)}`}>{getStatusTextUser(status)}</span></td>
                        <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                          <div className="flex items-center justify-center gap-1.5">
                            <IconButton icon={<Eye size={16} />} color="green" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} />
                            {canUseAction(currentUser, 'roles:update') && user.role !== "admin" && (<IconButton icon={<Pencil size={16} />} color="emerald" onClick={(e) => { e.stopPropagation(); setRoleModalUser(user); setRoleValue("staff"); }} />)}
                            <IconButton icon={status === "locked" ? <Lock size={16} /> : <Unlock size={16} />} color="orange" disabled={!canUseAction(currentUser, 'customers:lock')} title={!canUseAction(currentUser, 'customers:lock') ? "Bạn không có quyền." : ""} onClick={(e) => { e.stopPropagation(); toggleUserStatus(user); }} />
                            <IconButton icon={<Trash2 size={16} />} color="red" disabled={!canUseAction(currentUser, 'customers:lock')} title={!canUseAction(currentUser, 'customers:lock') ? "Bạn không có quyền." : ""} onClick={(e) => { e.stopPropagation(); setDeleteConfirmUser({ user }); }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="11" className="px-5 py-14 text-center text-gray-400 font-bold">Chưa có khách hàng phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <GlobalPagination
            total={filteredUsers.length}
            page={currentPage}
            limit={pageSize}
            onPageChange={setCurrentPage}
            onLimitChange={setPageSize}
            isLoading={loading}
            limitOptions={[10, 20, 50, 100]}
          />
        </section>

        {selectedUser && (
          <UserDetailPanel
            user={selectedUser} orders={getUserOrders(selectedUser)} bookings={getUserBookings(selectedUser)} totalSpent={getUserTotalSpent(selectedUser)}
            formatPrice={formatPriceUser} formatShortMoney={formatShortMoneyUser} formatDate={formatDateUser} formatDateTime={formatDateTimeUser}
            getStatusText={getStatusTextUser} getStatusStyle={getStatusStyleUser} getGroupText={getGroupTextUser} getUserGroup={getUserGroup}
            onClose={() => setSelectedUser(null)} onToggleStatus={() => toggleUserStatus(selectedUser)} onDelete={() => setDeleteConfirmUser({ user: selectedUser })}
          />
        )}
        {roleModalUser && (
          <GrantRoleModal user={roleModalUser} roleValue={roleValue} setRoleValue={setRoleValue} submitting={roleSubmitting} onClose={() => { setRoleModalUser(null); setRoleSubmitting(false); }} onSubmit={grantUserRole} />
        )}
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner"><Trash2 size={28} /></div>
              <div>
                <h4 className="font-black text-gray-900 text-base">{deleteConfirmUser.bulk ? "Xác nhận xóa hàng loạt" : "Xác nhận xóa khách hàng"}</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{deleteConfirmUser.bulk ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn? Hành động này không thể khôi phục.` : `Bạn có chắc chắn muốn xóa khách hàng "${deleteConfirmUser.user?.name || "này"}"? Hành động này không thể khôi phục.`}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setDeleteConfirmUser(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
                <button type="button" onClick={() => { const target = deleteConfirmUser; setDeleteConfirmUser(null); if (target.bulk) executeBulkDeleteUsers(); else executeDeleteUser(target.user); }} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm">Xác nhận xóa</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;
