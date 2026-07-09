import React from "react";
import { IconButton } from "./AdminDealsComponents";
import { Eye, Pencil, PlayCircle, PauseCircle, Trash2 } from "lucide-react";

export default function AdminDealTable({
  paginatedDeals,
  selectedDealIds,
  selectedDeal,
  setSelectedDeal,
  toggleSelectAll,
  handleSelectDeal,
  getTypeStyle,
  formatDate,
  getStatusStyle,
  getStatusText,
  currentUser,
  canUseAction,
  openEditModal,
  togglePauseDeal,
  deleteDeal
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1300px] w-full text-left text-sm">
        <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
          <tr>
            <th className="w-[50px] px-4 py-3">
              <input
                type="checkbox"
                checked={
                  paginatedDeals.length > 0 &&
                  paginatedDeals.every((deal) => selectedDealIds.includes(String(deal.id)))
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-green-700"
              />
            </th>
            <th className="w-[140px] px-4 py-3">Mã</th>
            <th className="w-[220px] px-4 py-3">Tên chương trình</th>
            <th className="w-[130px] px-4 py-3 text-center">Loại</th>
            <th className="w-[110px] px-4 py-3 text-center">Giảm giá</th>
            <th className="w-[180px] px-4 py-3">Điều kiện</th>
            <th className="w-[210px] px-4 py-3 text-center">Thời gian</th>
            <th className="w-[140px] px-4 py-3 text-center">Trạng thái</th>
            <th className="w-[110px] px-4 py-3 text-center">Lượt dùng</th>
            <th className="w-[130px] px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedDeals.length > 0 ? (
            paginatedDeals.map((deal) => (
              <tr
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className={`border-t border-gray-100 hover:bg-green-50/30 cursor-pointer transition-colors ${
                  selectedDeal?.id === deal.id ? "bg-green-50/50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedDealIds.includes(String(deal.id))}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSelectDeal(deal.id)}
                    className="w-4 h-4 accent-green-700"
                  />
                </td>
                <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap">
                  {deal.code}
                </td>
                <td className="px-4 py-3">
                  <p className="font-black text-primary whitespace-nowrap">{deal.name}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1 whitespace-nowrap">{deal.subtitle}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getTypeStyle(deal.type)}`}>
                    {deal.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-black text-gray-700 text-center whitespace-nowrap">
                  {deal.discount}
                </td>
                <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                  {Number(deal.condition || 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                  {formatDate(deal.startDate)} - {formatDate(deal.endDate)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(deal.status)}`}>
                    {getStatusText(deal.status)}
                  </span>
                </td>
                <td className="px-4 py-3 font-black text-gray-700 text-center">
                  {Number(deal.used || 0).toLocaleString("vi-VN")}
                </td>
                <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center justify-center gap-1.5">
                    <IconButton icon={<Eye size={16} />} color="green" onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }} />
                    <IconButton icon={<Pencil size={16} />} color="emerald" disabled={!canUseAction(currentUser, "promotions:update")} onClick={(e) => { e.stopPropagation(); openEditModal(deal); }} />
                    <IconButton icon={deal.status === "paused" ? <PlayCircle size={16} /> : <PauseCircle size={16} />} color="orange" disabled={!canUseAction(currentUser, "promotions:update")} onClick={(e) => { e.stopPropagation(); togglePauseDeal(deal); }} />
                    <IconButton icon={<Trash2 size={16} />} color="red" disabled={!canUseAction(currentUser, "promotions:delete")} onClick={(e) => { e.stopPropagation(); deleteDeal(deal); }} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="10" className="px-5 py-14 text-center text-gray-400 font-bold">Không có khuyến mãi phù hợp</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
