import React from "react";
import { X } from "lucide-react";
import { InputField, SelectField } from "./AdminTableComponents";

const TABLE_STATUS = {
  available: "Trống",
  holding: "Đang giữ",
  booked: "Đã đặt",
  serving: "Đang phục vụ",
  maintenance: "Bảo trì",
  disabled: "Ngừng sử dụng",
};

const TABLE_STATUS_STYLE = {
  available: "border-green-200 bg-green-50 text-green-700",
  holding: "border-orange-200 bg-orange-50 text-orange-600",
  booked: "border-red-200 bg-red-50 text-red-600",
  serving: "border-blue-200 bg-blue-50 text-blue-600",
  maintenance: "border-gray-200 bg-gray-100 text-gray-500",
  disabled: "border-gray-200 bg-gray-50 text-gray-400",
};

const TABLE_DOT_STYLE = {
  available: "bg-green-600",
  holding: "bg-orange-500",
  booked: "bg-red-500",
  serving: "bg-blue-500",
  maintenance: "bg-gray-500",
  disabled: "bg-gray-300",
};

export default function AdminAddBookingModal({
  isAddingBooking,
  setIsAddingBooking,
  addForm,
  setAddForm,
  areas,
  tables,
  getTableStatusForAdd,
  handleSelectTableForAddBooking,
  saveAddBooking,
  errors = {},
}) {
  if (!isAddingBooking) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-primary-955">
              Thêm đặt bàn
            </h3>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Tạo lịch đặt bàn mới từ trang Bàn & Khu vực
            </p>
          </div>

          <button
            onClick={() => setIsAddingBooking(false)}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Thông tin khách hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Tên khách hàng"
              required
              error={errors.customerName}
              value={addForm.customerName}
              onChange={(value) =>
                setAddForm((prev) => ({ ...prev, customerName: value }))
              }
            />

            <InputField
              label="SĐT"
              required
              error={errors.phone}
              value={addForm.phone}
              onChange={(value) =>
                setAddForm((prev) => ({ ...prev, phone: value.replace(/\D/g, "") }))
              }
            />

            <div className="md:col-span-2">
              <InputField
                label="Email"
                error={errors.email}
                value={addForm.email}
                onChange={(value) =>
                  setAddForm((prev) => ({ ...prev, email: value }))
                }
              />
            </div>
          </div>

          {/* Chi tiết lịch đặt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
            <InputField
              label="Ngày đặt"
              required
              type="date"
              error={errors.date}
              value={addForm.date}
              onChange={(value) =>
                setAddForm((prev) => ({
                  ...prev,
                  date: value,
                  selectedTable: "",
                }))
              }
            />

            <InputField
              label="Giờ"
              required
              type="time"
              error={errors.time}
              value={addForm.time}
              onChange={(value) =>
                setAddForm((prev) => ({ ...prev, time: value }))
              }
            />

            <InputField
              label="Số khách"
              required
              type="number"
              error={errors.guests}
              value={addForm.guests}
              onChange={(value) => {
                setAddForm((prev) => ({
                  ...prev,
                  guests: value,
                  selectedTable: "",
                }));
              }}
            />

            <SelectField
              label="Khu vực"
              required
              error={errors.selectedArea}
              value={addForm.selectedArea}
              onChange={(value) => {
                const area = areas.find(
                  (item) => String(item.id) === String(value),
                );

                setAddForm((prev) => ({
                  ...prev,
                  selectedArea: value,
                  selectedAreaTitle: area?.name || "",
                  selectedTable: "",
                }));
              }}
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </SelectField>

            <div className="md:col-span-2">
              <label className="block">
                <span className="text-sm font-black text-gray-500">
                  Ghi chú
                </span>
                <textarea
                  value={addForm.note}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="mt-2 w-full h-20 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                />
              </label>
            </div>
          </div>

          {/* Chọn bàn - đặt ở cuối cùng */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-black text-gray-500 mb-3">
              Chọn bàn
            </p>

            <div className="rounded-2xl border border-gray-100 p-4 max-h-[300px] overflow-y-auto bg-gray-50/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {tables
                  .filter(
                    (table) =>
                      String(table.areaId) === String(addForm.selectedArea),
                  )
                  .map((table) => {
                    const status = getTableStatusForAdd(table);

                    const isSelected =
                      String(addForm.selectedTable) === String(table.code);

                    const guestCount = Number(addForm.guests || 0);

                    const insufficientCapacity =
                      guestCount > 0 &&
                      Number(table.capacity || 0) < guestCount;

                    const disabled = status !== "available";

                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          handleSelectTableForAddBooking(table, status)
                        }
                        className={`relative h-16 rounded-xl border font-black transition ${isSelected
                            ? insufficientCapacity
                              ? "border-red-600 bg-red-50 text-red-600 ring-2 ring-red-300"
                              : "border-primary bg-primary text-white ring-2 ring-primary/20"
                            : disabled
                              ? TABLE_STATUS_STYLE[status]
                              : insufficientCapacity
                                ? "border-red-500 bg-red-50 text-red-600"
                                : TABLE_STATUS_STYLE[status]
                          } ${disabled
                            ? "cursor-not-allowed opacity-80"
                            : "hover:scale-[1.02]"
                          }`}
                      >
                        <span
                          className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${isSelected
                              ? "bg-white"
                              : TABLE_DOT_STYLE[status]
                            }`}
                        />

                        <div className="flex flex-col items-center leading-tight">
                          <span>Bàn {table.code}</span>

                          <span className="mt-1 text-[10px] font-black">
                            {status === "available"
                              ? `${table.capacity} người`
                              : TABLE_STATUS[status]}
                          </span>

                          {isSelected && (
                            <span className="mt-1 text-[10px] font-black text-white">
                              Đang chọn
                            </span>
                          )}

                          {insufficientCapacity &&
                            !disabled && (
                              <span className={`mt-1 text-[10px] font-black ${isSelected ? "text-red-600" : "text-red-600"}`}>
                                Thiếu chỗ
                              </span>
                            )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setIsAddingBooking(false)}
            className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
          >
            Đóng
          </button>

          <button
            onClick={saveAddBooking}
            className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary/90"
          >
            Tạo đặt bàn
          </button>
        </div>
      </div>
    </div>
  );
}
