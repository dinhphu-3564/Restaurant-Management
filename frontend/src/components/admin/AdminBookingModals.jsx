import React from "react";

const TABLE_STATUS_STYLE = {
  available: "border-green-200 bg-green-50 text-green-700",
  holding: "border-orange-200 bg-orange-50 text-orange-600",
  booked: "border-red-200 bg-red-50 text-red-600",
  serving: "border-blue-200 bg-blue-50 text-blue-600",
  maintenance: "border-gray-200 bg-gray-100 text-gray-500",
  disabled: "border-gray-200 bg-gray-50 text-gray-400",
  selected:
    "border-green-700 bg-green-100 text-green-900 ring-2 ring-green-700",
};

const TABLE_DOT_STYLE = {
  available: "bg-green-600",
  holding: "bg-orange-500",
  booked: "bg-red-500",
  serving: "bg-blue-500",
  maintenance: "bg-gray-500",
  disabled: "bg-gray-300",
};

const TABLE_STATUS_TEXT = {
  available: "Trống",
  holding: "Đang giữ",
  booked: "Đã đặt",
  serving: "Đang phục vụ",
  maintenance: "Bảo trì",
  disabled: "Ngừng sử dụng",
};

export default function AdminBookingModals({
  editingBooking,
  setEditingBooking,
  editForm,
  setEditForm,
  isAddingBooking,
  setIsAddingBooking,
  addForm,
  setAddForm,
  areas,
  tables,
  getTableStatusForAdd,
  getTableStatusForEdit,
  getEditGuestCount,
  handleSelectTableForEditBooking,
  saveAddBooking,
  saveEditBooking,
  formatDate,
  errors = {},
}) {
  return (
    <>
      {editingBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
          <div className={`w-full bg-white rounded-3xl shadow-2xl overflow-hidden transition-all ${editingBooking.status === "completed" ? "max-w-sm" : "max-w-6xl"}`}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary">
                  Chỉnh sửa đặt bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  {editingBooking.bookingCode || `DB${editingBooking.id}`}
                </p>
              </div>

              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {editingBooking.status === "completed" ? (
              <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center text-white text-3xl shadow-lg">
                  ✓
                </div>
                <div>
                  <p className="text-lg font-black text-primary mt-1">Đặt bàn đã hoàn thành</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Lịch đặt <strong className="text-gray-600">{editingBooking.bookingCode || `DB${editingBooking.id}`}</strong> đã hoàn tất phục vụ.
                  </p>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-left space-y-1.5 mt-1">
                  {editingBooking.date && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Ngày đặt</span>
                      <span className="font-black text-gray-700">{formatDate(editingBooking.date)}</span>
                    </div>
                  )}
                  {editingBooking.selectedTable && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Bàn</span>
                      <span className="font-black text-gray-700">{editingBooking.selectedTable}</span>
                    </div>
                  )}
                  {editingBooking.guests && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Số khách</span>
                      <span className="font-black text-gray-700">{editingBooking.guests} người</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Ngày đặt
                    </span>

                    <input
                      type="date"
                      disabled={editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed"}
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                          selectedTable:
                            editingBooking?.date === e.target.value
                              ? editingBooking?.selectedTable || ""
                              : "",
                        }))
                      }
                      className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Trạng thái
                    </span>
                    {editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed" ? (
                      <div className="mt-2 w-full rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col gap-1 bg-gray-50 select-none">
                        <span className={`text-sm font-black ${editingBooking.status === "serving" ? "text-amber-600" : editingBooking.status === "completed" ? "text-primary" : "text-blue-600"}`}>
                          {editingBooking.status === "serving" ? "🟡 Đang phục vụ" : editingBooking.status === "completed" ? "✅ Hoàn thành" : "🔵 Đã xác nhận"}
                        </span>
                        <span className="text-xs text-gray-400 leading-snug">
                          Tất cả thao tác còn lại vui lòng xử lý tại <strong>Sơ đồ bàn</strong>
                        </span>
                      </div>
                    ) : (
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Khu vực
                    </span>

                    <select
                      disabled={editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed"}
                      value={editForm.selectedArea}
                      onChange={(e) => {
                        const areaId = e.target.value;
                        const area = areas.find(
                          (item) => String(item.id) === String(areaId),
                        );

                        setEditForm((prev) => ({
                          ...prev,
                          selectedArea: areaId,
                          selectedAreaTitle: area?.name || "",
                          selectedTable: "",
                        }));
                      }}
                      className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                    >
                      <option value="">Nhà hàng sắp xếp</option>

                      {areas.map((area) => (
                        <option key={area.id} value={String(area.id)}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Ghi chú
                    </span>

                    <textarea
                      disabled={editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed"}
                      value={editForm.note}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      placeholder="Nhập ghi chú đặt bàn..."
                      className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                    />
                  </label>
                </div>
                {/* phần chọn khu vực + bàn trong popup */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-black text-gray-500">
                        Chọn bàn
                      </span>

                      <p className="text-xs text-gray-400 font-bold mt-1">
                        Lịch này có{" "}
                        {editingBooking?.guests || editingBooking?.people || 0}{" "}
                        khách. Chỉ nên chọn bàn đủ sức chứa.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <i className="w-2.5 h-2.5 rounded-full bg-primary" />
                        Trống
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        Đang giữ
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        Đã đặt
                      </span>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-gray-100 p-4">
                    {editForm.selectedArea ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                        {tables
                          .filter(
                            (table) =>
                              String(table.areaId) ===
                              String(editForm.selectedArea),
                          )
                          .map((table) => {
                            const currentTable =
                              String(editingBooking?.selectedTable) ===
                              String(table.code) &&
                              editingBooking?.date === editForm.date;

                            const newSelectedTable =
                              String(editForm.selectedTable) ===
                              String(table.code) && !currentTable;

                            const rawStatus = getTableStatusForEdit(table);
                            const status = currentTable ? "selected" : rawStatus;

                            const guestCount = getEditGuestCount();

                            const insufficientCapacity =
                              guestCount > 0 &&
                              Number(table.capacity || 0) < guestCount;

                            const disabled =
                              currentTable || rawStatus !== "available" || editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed";

                            return (
                              <button
                                key={table.id}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  handleSelectTableForEditBooking(
                                    table,
                                    rawStatus,
                                    currentTable,
                                  )
                                }
                                className={`relative h-14 rounded-xl border font-black transition ${currentTable
                                    ? TABLE_STATUS_STYLE.selected
                                    : newSelectedTable
                                      ? "border-primary bg-primary text-white ring-2 ring-primary/20"
                                      : disabled
                                        ? TABLE_STATUS_STYLE[status] ||
                                        TABLE_STATUS_STYLE.available
                                        : insufficientCapacity
                                          ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                          : TABLE_STATUS_STYLE[status] ||
                                          TABLE_STATUS_STYLE.available
                                  } ${disabled
                                    ? "cursor-not-allowed opacity-90"
                                    : "hover:scale-[1.02]"
                                  }`}
                              >
                                <span
                                  className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${currentTable || newSelectedTable
                                      ? "bg-primary"
                                      : TABLE_DOT_STYLE[status]
                                    }`}
                                />

                                <div className="flex flex-col items-center leading-tight">
                                  <span>{table.code}</span>

                                  <span className="mt-1 text-[10px] font-black">
                                    {rawStatus === "available"
                                      ? `${table.capacity} người`
                                      : TABLE_STATUS_TEXT[rawStatus] || rawStatus}
                                  </span>

                                  {currentTable && (
                                    <span className="mt-1 text-[10px] font-black text-primary">
                                      Bàn đang chọn
                                    </span>
                                  )}

                                  {newSelectedTable && (
                                    <span className="mt-1 text-[10px] font-black text-white">
                                      Bàn mới
                                    </span>
                                  )}

                                  {insufficientCapacity &&
                                    !disabled &&
                                    !newSelectedTable && (
                                      <span className="mt-1 text-[10px] font-black text-yellow-700">
                                        Thiếu chỗ
                                      </span>
                                    )}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400 font-bold">
                        Vui lòng chọn khu vực để hiển thị bàn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingBooking(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              {editingBooking.status !== "completed" && (
                <button
                  onClick={saveEditBooking}
                  className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary-dark"
                >
                  Lưu thay đổi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thêm popup form */}
      {isAddingBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary">
                  Thêm đặt bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Admin tạo lịch đặt bàn mới cho khách hàng
                </p>
              </div>

              <button
                onClick={() => setIsAddingBooking(false)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 max-h-[72vh] overflow-y-auto">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Tên khách hàng
                  </span>
                  <input
                    value={addForm.customerName}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên khách hàng"
                    className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm transition-all duration-200 ${
                      errors.customerName
                        ? "border-red-500 ring-2 ring-red-100 bg-red-50/10 placeholder-red-300"
                        : "border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.customerName && (
                    <span className="text-xs text-red-500 font-bold mt-1.5 block select-none">
                      {errors.customerName}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">SĐT</span>
                  <input
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        phone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="Nhập số điện thoại"
                    className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm transition-all duration-200 ${
                      errors.phone
                        ? "border-red-500 ring-2 ring-red-100 bg-red-50/10 placeholder-red-300"
                        : "border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-xs text-red-500 font-bold mt-1.5 block select-none">
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Email
                  </span>
                  <input
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Nhập email nếu có"
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Ngày đặt
                    </span>
                    <input
                      type="date"
                      value={addForm.date}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                          selectedTable: "",
                        }))
                      }
                      className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm transition-all duration-200 ${
                        errors.date
                          ? "border-red-500 ring-2 ring-red-100 bg-red-50/10"
                          : "border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                    {errors.date && (
                      <span className="text-xs text-red-500 font-bold mt-1.5 block select-none">
                        {errors.date}
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Giờ
                    </span>
                    <input
                      type="time"
                      value={addForm.time}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm transition-all duration-200 ${
                        errors.time
                          ? "border-red-500 ring-2 ring-red-100 bg-red-50/10"
                          : "border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      }`}
                    />
                    {errors.time && (
                      <span className="text-xs text-red-500 font-bold mt-1.5 block select-none">
                        {errors.time}
                      </span>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Số khách
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={addForm.guests}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        guests: e.target.value,
                        selectedTable: "",
                      }))
                    }
                    className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm transition-all duration-200 ${
                      errors.guests
                        ? "border-red-500 ring-2 ring-red-100 bg-red-50/10"
                        : "border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.guests && (
                    <span className="text-xs text-red-500 font-bold mt-1.5 block select-none">
                      {errors.guests}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Khu vực
                  </span>
                  <select
                    value={addForm.selectedArea}
                    onChange={(e) => {
                      const areaId = String(e.target.value);
                      const area = areas.find(
                        (item) => String(item.id) === areaId,
                      );

                      setAddForm((prev) => ({
                        ...prev,
                        selectedArea: areaId,
                        selectedAreaTitle: area?.name || "",
                        selectedTable: "",
                      }));
                    }}
                    className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm transition-all duration-200 ${
                      errors.selectedArea
                        ? "border-red-500 ring-2 ring-red-100 bg-red-50/10"
                        : "border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                  >
                    <option value="">Chọn khu vực</option>

                    {areas.map((area) => (
                      <option key={area.id} value={String(area.id)}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Ghi chú
                  </span>
                  <textarea
                    value={addForm.note}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    placeholder="Nhập ghi chú đặt bàn..."
                    className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                  />
                </label>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-black text-gray-500">
                      Chọn bàn
                    </span>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                      Lịch này có {addForm.guests || 0} khách. Chỉ nên chọn bàn
                      đủ sức chứa.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-primary" />
                      Trống
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      Đang giữ
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Đã đặt
                    </span>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-gray-100 p-4">
                  {addForm.selectedArea ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                      {tables
                        .filter(
                          (table) =>
                            String(table.areaId) ===
                            String(addForm.selectedArea),
                        )
                        .map((table) => {
                          const status = getTableStatusForAdd(table);
                          const isSelected =
                            String(addForm.selectedTable) ===
                            String(table.code);

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
                              onClick={() => {
                                if (disabled) return;

                                if (insufficientCapacity) {
                                  alert(
                                    `Bàn ${table.code} chỉ chứa tối đa ${table.capacity} người. Vui lòng chọn bàn khác phù hợp hơn.`,
                                  );
                                  return;
                                }

                                setAddForm((prev) => ({
                                  ...prev,
                                  selectedTable: table.code,
                                }));
                              }}
                              className={`relative h-16 rounded-xl border font-black transition ${isSelected
                                  ? insufficientCapacity
                                    ? "border-red-600 bg-red-50 text-red-600 ring-2 ring-red-300"
                                    : "border-primary bg-primary text-white ring-2 ring-primary/20"
                                  : disabled
                                    ? TABLE_STATUS_STYLE[status] ||
                                    TABLE_STATUS_STYLE.available
                                    : insufficientCapacity
                                      ? "border-red-500 bg-red-50 text-red-600"
                                      : TABLE_STATUS_STYLE[status] ||
                                      TABLE_STATUS_STYLE.available
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
                                <span>{table.code}</span>

                                <span className="mt-1 text-[10px] font-black">
                                  {status === "available"
                                    ? `${table.capacity} người`
                                    : TABLE_STATUS_TEXT[status] || status}
                                </span>

                                {isSelected && (
                                  <span className="mt-1 text-[10px] font-black text-white">
                                    Đang chọn
                                  </span>
                                )}

                                {insufficientCapacity &&
                                  !disabled && (
                                    <span className="mt-1 text-[10px] font-black text-red-600">
                                      Thiếu chỗ
                                    </span>
                                  )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-gray-400 font-bold">
                      Vui lòng chọn khu vực để hiển thị bàn
                    </div>
                  )}
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
                className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary-dark"
              >
                Tạo đặt bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
