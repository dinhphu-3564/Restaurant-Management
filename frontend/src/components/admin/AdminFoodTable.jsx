import React from "react";
import { Star, Eye, Pencil, Trash2 } from "lucide-react";
import { ActionButton } from "./AdminMenuComponents";

export default function AdminFoodTable({
  currentFoods,
  selectedFood,
  setSelectedFood,
  selectedFoodIds,
  toggleSelectAllCurrentPage,
  toggleSelectFood,
  formatPrice,
  getStatusStyle,
  getStatusText,
  formatDateTime,
  currentUser,
  canUseAction,
  openEditFoodModal,
  deleteFood
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1370px] w-full text-left text-sm table-fixed">
        <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
          <tr>
            <th className="w-[50px] px-4 py-3">
              <input
                type="checkbox"
                checked={
                  currentFoods.length > 0 &&
                  currentFoods.every((food) =>
                    selectedFoodIds.includes(food.id),
                  )
                }
                onChange={toggleSelectAllCurrentPage}
                className="w-4 h-4 accent-green-700"
              />
            </th>
            <th className="w-[230px] px-4 py-3">Món ăn</th>
            <th className="w-[200px] px-4 py-3">Mã món</th>
            <th className="w-[120px] px-4 py-3">Danh mục</th>
            <th className="w-[130px] px-4 py-3">Giá bán</th>
            <th className="w-[130px] px-4 py-3 text-center">
              Trạng thái
            </th>
            <th className="w-[150px] px-4 py-3 text-center">Badge</th>
            <th className="w-[90px] px-4 py-3">Đã bán</th>
            <th className="w-[110px] px-4 py-3">Đánh giá</th>
            <th className="w-[130px] px-4 py-3 text-center">Cập nhật</th>

            <th className="w-[130px] px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-20">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {currentFoods.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center">
                <p className="text-gray-500 font-bold">
                  Chưa có món ăn nào.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Bấm “Thêm món ăn” để thêm dữ liệu vào database.
                </p>
              </td>
            </tr>
          )}

          {currentFoods.map((food) => (
            <tr
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className={`border-t border-gray-100 cursor-pointer hover:bg-green-50/30 ${selectedFood?.id === food.id ? "bg-green-50/50" : ""}`}
            >
              <td className="w-[50px] px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedFoodIds.includes(food.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelectFood(food.id)}
                  className="w-4 h-4 accent-green-700"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="font-black text-gray-700 leading-snug line-clamp-2">
                    {food.name}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap truncate max-w-[190px]" title={food.id}>
                {food.id}
              </td>
              <td className={`px-4 py-3`}>{food.category}</td>
              <td className="px-4 py-3 font-black text-primary">
                {formatPrice(food.price)}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center justify-center min-w-[92px] px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(
                    food.status,
                  )}`}
                >
                  {getStatusText(food.status)}
                </span>
              </td>

              <td className="px-4 py-3 text-center">
                {food.badge ? (
                  <span className="inline-flex items-center justify-center max-w-[120px] px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-black whitespace-nowrap overflow-hidden text-ellipsis">
                    {food.badge}
                  </span>
                ) : (
                  <span className="text-gray-400 font-bold text-center">
                    —
                  </span>
                )}
              </td>

              <td className="px-4 py-3 font-bold text-center">
                {food.sold}
              </td>

              <td className={`px-4 py-3 `}>
                <div className="font-black text-gray-700 flex items-center gap-1 ">
                  <Star
                    size={15}
                    className="text-yellow-500 fill-yellow-500"
                  />
                  {food.rating}
                </div>
                <p className="text-xs text-gray-400">({food.reviews})</p>
              </td>

              <td
                className={`px-4 py-3 font-semibold text-center text-gray-600`}
              >
                {formatDateTime(food.updatedAt)}
              </td>

              <td className="px-4 py-3 sticky right-0 bg-white z-20 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-center gap-2">
                  <ActionButton
                    icon={<Eye size={16} />}
                    color="green"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFood(food);
                    }}
                  />

                  <ActionButton
                    icon={<Pencil size={16} />}
                    color="emerald"
                    disabled={!canUseAction(currentUser, "menu:update")}
                    title={!canUseAction(currentUser, "menu:update") ? "Bạn không có quyền thực hiện thao tác này." : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditFoodModal(food);
                    }}
                  />

                  <ActionButton
                    icon={<Trash2 size={16} />}
                    color="red"
                    disabled={!canUseAction(currentUser, "menu:delete")}
                    title={!canUseAction(currentUser, "menu:delete") ? "Bạn không có quyền thực hiện thao tác này." : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFood(food);
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
