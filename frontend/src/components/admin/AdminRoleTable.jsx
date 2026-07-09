import React from "react";
import { Eye, Plus } from "lucide-react";
import { Avatar } from "./AdminRoleComponents";
import { ROLE_BADGE, ROLE_TEXT } from "../../utils/rolesHelpers";

export default function AdminRoleTable({
  paginatedUsers,
  selectedAccount,
  setSelectedAccount,
  formatDateTime
}) {
  return (
    <div className="overflow-x-auto max-w-full">
      <table className="min-w-[1080px] w-full table-fixed text-left text-[13px]">
        <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase whitespace-nowrap">
          <tr>
            <th className="px-4 py-3 w-[70px]">Avatar</th>
            <th className="px-4 py-3 w-[110px]">Mã TK</th>
            <th className="px-4 py-3 w-[180px]">Họ tên</th>
            <th className="px-4 py-3 w-[260px]">Email</th>
            <th className="px-4 py-3 w-[140px]">SĐT</th>
            <th className="px-4 py-3 w-[130px] text-center">Vai trò</th>
            <th className="px-4 py-3 w-[130px] text-center">Trạng thái</th>
            <th className="px-4 py-3 w-[150px]">Ngày tạo</th>
            <th className="px-4 py-3 w-[120px] text-center sticky right-0 bg-[#fbfcfb] z-20 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedAccount(user)}
                className={`border-t border-gray-100 cursor-pointer hover:bg-green-50/30 ${
                  String(selectedAccount?.id) === String(user.id) ? "bg-green-50/50" : ""
                }`}
              >
                <td className="px-4 py-3 w-[70px]"><Avatar user={user} /></td>
                <td className="px-4 py-3 w-[110px] font-black text-green-700 whitespace-nowrap">TK{String(user.id).padStart(5, "0")}</td>
                <td className="px-4 py-3 w-[180px]">
                  <p title={user.name || user.fullName || "Chưa có"} className="font-bold text-gray-700 truncate">{user.name || user.fullName || "Chưa có"}</p>
                </td>
                <td className="px-4 py-3 w-[260px]">
                  <p title={user.email || "Chưa có"} className="text-gray-600 font-semibold truncate">{user.email || "Chưa có"}</p>
                </td>
                <td className="px-4 py-3 w-[140px]">
                  <p title={user.phone || "Chưa có"} className="text-gray-600 font-semibold truncate">{user.phone || "Chưa có"}</p>
                </td>
                <td className="px-4 py-3 w-[130px] text-center">
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${ROLE_BADGE[user.role] || "bg-gray-50 text-gray-600"}`}>
                    {ROLE_TEXT[user.role] || user.role}
                  </span>
                </td>
                <td className="px-4 py-3 w-[130px] text-center">
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${user.status === "locked" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    {user.status === "locked" ? "Đã khóa" : "Hoạt động"}
                  </span>
                </td>
                <td className="px-4 py-3 w-[150px]">
                  <p title={formatDateTime(user.createdAt)} className="text-gray-600 font-semibold truncate">{formatDateTime(user.createdAt)}</p>
                </td>
                <td className={`px-4 py-3 w-[120px] text-center sticky right-0 z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)] ${String(selectedAccount?.id) === String(user.id) ? "bg-green-50" : "bg-white"}`}>
                  <div className="relative flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedAccount(user); }}
                      className="w-8 h-8 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition inline-flex items-center justify-center"
                      title="Xem chi tiết"
                    >
                      <Eye size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9" className="px-5 py-14 text-center text-gray-400 font-bold">Chưa có tài khoản phù hợp</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
