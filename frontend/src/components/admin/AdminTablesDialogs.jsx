import React from "react";

/**
 * Component dialog xác nhận tái sử dụng cho AdminTablesPage
 * Hiển thị overlay full-screen với icon, tiêu đề, thông điệp và 2 nút hành động
 */
export function ConfirmDialog({ confirmDialog, setConfirmDialog }) {
  if (!confirmDialog) return null;

  const { HelpCircle } = require("lucide-react");

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${confirmDialog.iconBg || "bg-blue-50 text-blue-600"}`}>
          {confirmDialog.icon || <HelpCircle size={28} />}
        </div>
        <div>
          <h4 className="font-black text-gray-900 text-base">{confirmDialog.title}</h4>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-line">
            {confirmDialog.message}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmDialog(null);
              if (confirmDialog.onCancel) confirmDialog.onCancel();
            }}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDialog(null);
              if (confirmDialog.onConfirm) confirmDialog.onConfirm();
            }}
            className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm ${confirmDialog.confirmStyle || "bg-blue-600 hover:bg-blue-700"}`}
          >
            {confirmDialog.confirmText || "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Component popup xếp bàn cho khách đặt bàn chưa có bàn
 */
export function AssignBookingModal({
  assignBooking, setAssignBooking,
  assignForm, setAssignForm,
  areas, tables,
  formatDate, formatDateTime,
  isTableBookedAtDate,
  saveAssignBooking,
  SelectField,
}) {
  const { X } = require("lucide-react");
  if (!assignBooking) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-primary-950">Xếp bàn cho khách</h3>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              DB{assignBooking.id} -{" "}
              {assignBooking.customerName || assignBooking.name || "Khách hàng"}
            </p>
          </div>
          <button onClick={() => setAssignBooking(null)} className="text-gray-400 hover:text-red-500">
            <X size={22} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <SelectField
            label="Khu vực"
            value={assignForm.areaId}
            onChange={(value) => setAssignForm((prev) => ({ ...prev, areaId: value, tableCode: "" }))}
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </SelectField>
          <SelectField
            label="Bàn trống"
            value={assignForm.tableCode}
            onChange={(value) => setAssignForm((prev) => ({ ...prev, tableCode: value }))}
          >
            <option value="">Chọn bàn</option>
            {tables
              .filter(
                (table) =>
                  String(table.areaId) === String(assignForm.areaId) &&
                  table.status === "available" &&
                  Number(table.capacity) >= Number(assignBooking.guests || assignBooking.people || 0) &&
                  !isTableBookedAtDate(table.code, assignBooking.date)
              )
              .map((table) => (
                <option key={table.id} value={table.code}>
                  Bàn {table.code} - {table.capacity} người
                </option>
              ))}
          </SelectField>
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-sm">
            <p className="font-black text-primary-900 mb-2">Thông tin khách</p>
            <p>Khách: {assignBooking.customerName || assignBooking.name}</p>
            <p>SĐT: {assignBooking.phone || "Chưa có"}</p>
            <p>Thời gian: {formatDate(assignBooking.date)} - {assignBooking.time || "Chưa có"}</p>
            <p>Số khách: {assignBooking.guests || assignBooking.people || 0}</p>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setAssignBooking(null)}
            className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
          >
            Đóng
          </button>
          <button
            onClick={saveAssignBooking}
            className="h-11 px-5 rounded-xl bg-primary-800 text-white font-black hover:bg-primary-900"
          >
            Lưu xếp bàn
          </button>
        </div>
      </div>
    </div>
  );
}
