import React from "react";
import { X } from "lucide-react";
import { DetailBlock, DetailRow } from "./AdminMenuComponents";

export default function AdminFoodDetailModal({
  selectedFood,
  setSelectedFood,
  formatPrice,
  getStatusText,
  formatDateTime,
  canUseAction,
  currentUser,
  openEditFoodModal,
  toggleFoodStatus
}) {
  if (!selectedFood) return null;

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden 2xl:sticky 2xl:top-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-primary">
          Chi tiết món ăn
        </h3>
        <button
          onClick={() => setSelectedFood(null)}
          className="text-gray-400 hover:text-red-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <img
          src={selectedFood.image}
          alt={selectedFood.name}
          className="w-full h-[150px] 2xl:h-[170px] rounded-xl object-cover bg-gray-100"
        />

        <div>
          <h2 className="text-2xl font-black text-primary">
            {selectedFood.name}
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            Mã món: {selectedFood.id}
          </p>
        </div>

        <DetailBlock title="Thông tin chung">
          <DetailRow label="Danh mục" value={selectedFood.category} />
          <DetailRow label="Loại món" value={selectedFood.type} />
          <DetailRow
            label="Giá bán"
            value={formatPrice(selectedFood.price)}
          />
          <DetailRow
            label="Giá vốn"
            value={formatPrice(selectedFood.costPrice)}
          />
          <DetailRow
            label="Trạng thái"
            value={getStatusText(selectedFood.status)}
          />
          <DetailRow label="Đã bán" value={`${selectedFood.sold} phần`} />
          <DetailRow
            label="Đánh giá"
            value={`${selectedFood.rating} (${selectedFood.reviews} đánh giá)`}
          />
          <DetailRow label="Cập nhật" value={formatDateTime(selectedFood.updatedAt)} />
        </DetailBlock>

        <DetailBlock title="Mô tả ngắn">
          <p>{selectedFood.shortDescription || "Chưa có mô tả ngắn"}</p>
        </DetailBlock>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
          <button
            disabled={!canUseAction(currentUser, "menu:update")}
            onClick={() => openEditFoodModal(selectedFood)}
            className={`h-11 rounded-xl border text-sm font-black transition w-full ${
              !canUseAction(currentUser, "menu:update")
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
            }`}
            title={!canUseAction(currentUser, "menu:update") ? "Bạn không có quyền chỉnh sửa món ăn." : ""}
          >
            Chỉnh sửa
          </button>

          <button
            disabled={!canUseAction(currentUser, "menu:update")}
            onClick={() => toggleFoodStatus(selectedFood)}
            className={`h-11 rounded-xl text-sm font-black border transition ${
              !canUseAction(currentUser, "menu:update")
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : selectedFood.status === "stopped"
                ? "bg-primary/10 text-primary border-primary hover:bg-primary/20"
                : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
            }`}
            title={!canUseAction(currentUser, "menu:update") ? "Bạn không có quyền thay đổi trạng thái món ăn." : ""}
          >
            {selectedFood.status === "stopped" ? "Bán lại" : "Ngừng bán"}
          </button>
        </div>
      </div>
    </aside>
  );
}
