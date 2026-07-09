import React from "react";
import { X, Trash2 } from "lucide-react";
import { InputField, SelectField } from "./AdminTableComponents";

const TABLE_STATUS = {
  available: "Trống",
  holding: "Đang giữ",
  booked: "Đã đặt",
  serving: "Đang phục vụ",
  maintenance: "Bảo trì",
  disabled: "Ngừng sử dụng",
};

export default function AdminSpaceModals({
  isAddingArea,
  setIsAddingArea,
  areaForm,
  setAreaForm,
  saveAddArea,
  isAddingTable,
  setIsAddingTable,
  tableForm,
  setTableForm,
  areas,
  saveAddTable,
  editingArea,
  setEditingArea,
  areaEditForm,
  setAreaEditForm,
  saveEditArea,
  deleteConfirmArea,
  setDeleteConfirmArea,
  handleDeleteArea,
  editingTable,
  setEditingTable,
  tableEditForm,
  setTableEditForm,
  saveEditTable,
}) {
  return (
    <>
      {/* popup “Thêm khu vực” */}
      {isAddingArea && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-955">
                  Thêm khu vực
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Tạo tầng hoặc khu vực mới trong nhà hàng
                </p>
              </div>

              <button
                onClick={() => setIsAddingArea(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <InputField
                label="Tên khu vực"
                value={areaForm.name}
                onChange={(value) =>
                  setAreaForm((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
              />

              <label className="block">
                <span className="text-sm font-black text-gray-500">Mô tả</span>
                <textarea
                  value={areaForm.description}
                  onChange={(e) =>
                    setAreaForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Khu vực tầng 3, phòng riêng, ngoài trời..."
                  className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                />
              </label>

              <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-sm text-primary-900 font-semibold">
                Sau khi thêm, khu vực này sẽ xuất hiện trong sơ đồ bàn và popup
                đặt bàn.
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAddingArea(false)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveAddArea}
                className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary/90"
              >
                Thêm khu vực
              </button>
            </div>
          </div>
        </div>
      )}

      {/* popup “Thêm bàn vật lý” */}
      {isAddingTable && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-955">
                  Thêm bàn mới
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Tạo bàn vật lý trong khu vực nhà hàng
                </p>
              </div>

              <button
                onClick={() => setIsAddingTable(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <SelectField
                  label="Khu vực"
                  value={tableForm.areaId}
                  onChange={(value) =>
                    setTableForm((prev) => ({
                      ...prev,
                      areaId: value,
                    }))
                  }
                >
                  <option value="">Chọn khu vực</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </SelectField>

                <InputField
                  label="Sức chứa"
                  type="number"
                  value={tableForm.capacity}
                  onChange={(value) =>
                    setTableForm((prev) => ({
                      ...prev,
                      capacity: value,
                    }))
                  }
                />

                <SelectField
                  label="Trạng thái"
                  value={tableForm.status}
                  onChange={(value) =>
                    setTableForm((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  {Object.entries(TABLE_STATUS)
                    .filter(([key]) => key !== "holding" && key !== "booked")
                    .map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                </SelectField>
              </div>

              <div className="flex flex-col h-full">
                <label className="block flex-1 flex flex-col h-full">
                  <span className="text-sm font-black text-gray-500">Mô tả</span>
                  <textarea
                    value={tableForm.description}
                    onChange={(e) =>
                      setTableForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Ví dụ: Gần cửa sổ, phù hợp gia đình, phòng riêng..."
                    className="mt-2 w-full flex-1 min-h-[140px] md:min-h-0 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                  />
                </label>
              </div>

              <div className="md:col-span-2 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900 font-semibold">
                Mã bàn sẽ được hệ thống tự tạo theo khu vực: Tầng 1 → 101, Tầng
                2 → 201, Phòng VIP → VIP01. Có thể chỉnh sửa mã bàn sau khi tạo.
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAddingTable(false)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveAddTable}
                className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary/90"
              >
                Thêm bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {editingArea && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-955">
                  Chỉnh sửa khu vực
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Cập nhật tên tầng, phòng hoặc mô tả khu vực
                </p>
              </div>

              <button
                onClick={() => setEditingArea(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <InputField
                label="Tên khu vực"
                value={areaEditForm.name}
                onChange={(value) =>
                  setAreaEditForm((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
              />

              <label className="block">
                <span className="text-sm font-black text-gray-500">Mô tả</span>
                <textarea
                  value={areaEditForm.description}
                  onChange={(e) =>
                    setAreaEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Khu vực tầng 1, phòng riêng, sân vườn..."
                  className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                />
              </label>

              <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-sm text-primary-900 font-semibold">
                Nếu đổi tên khu vực, các bàn thuộc khu vực này sẽ hiển thị theo
                tên mới.
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmArea(editingArea)}
                className="h-10 px-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition inline-flex items-center justify-center gap-1.5 text-xs whitespace-nowrap shrink-0"
              >
                <Trash2 size={14} />
                Xóa khu vực
              </button>

              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  className="h-10 px-4 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 text-xs whitespace-nowrap"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={saveEditArea}
                  className="h-10 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 text-xs whitespace-nowrap"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom centered Delete Confirmation Modal for Area */}
      {deleteConfirmArea && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-left">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={28} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-base">Xác nhận xóa khu vực</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Bạn có chắc chắn muốn xóa khu vực <span className="font-bold text-gray-800">"{deleteConfirmArea.name}"</span>? Hành động này sẽ xóa đồng thời không gian tương ứng và không thể khôi phục.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmArea(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteArea(deleteConfirmArea.id, deleteConfirmArea.name)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTable && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-955">
                  Chỉnh sửa bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Bàn {editingTable.code}
                </p>
              </div>

              <button
                onClick={() => setEditingTable(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <InputField
                label="Mã bàn"
                value={tableEditForm.code}
                onChange={(value) =>
                  setTableEditForm((prev) => ({
                    ...prev,
                    code: value,
                  }))
                }
              />

              <InputField
                label="Sức chứa"
                type="number"
                value={tableEditForm.capacity}
                onChange={(value) =>
                  setTableEditForm((prev) => ({
                    ...prev,
                    capacity: value,
                  }))
                }
              />

              <SelectField
                label="Trạng thái"
                value={tableEditForm.status}
                onChange={(value) =>
                  setTableEditForm((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                {Object.entries(TABLE_STATUS)
                  .filter(([key]) => key !== "holding" && key !== "booked")
                  .map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
              </SelectField>

              <label className="block">
                <span className="text-sm font-black text-gray-500">Mô tả</span>
                <textarea
                  value={tableEditForm.description}
                  onChange={(e) =>
                    setTableEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                />
              </label>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingTable(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveEditTable}
                className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary/90"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
