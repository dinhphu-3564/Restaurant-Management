import React from "react";
import {
  CalendarDays,
  Clock,
  Truck,
  Store,
} from "lucide-react";

export function ServiceCard({ active, icon, title, subtitle, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border px-2 py-3 md:p-5 text-center transition-all ${
        active
          ? "border-green-800 bg-green-50 shadow-sm"
          : "border-[#eadfcd] bg-white"
      }`}
    >
      <div
        className={`mx-auto w-9 h-9 md:w-24 md:h-24 rounded-full flex items-center justify-center ${
          active ? "bg-green-100" : "bg-[#fbf0dc]"
        }`}
      >
        <div
          className={`w-5 h-5 md:w-14 md:h-14 ${
            active ? "text-green-800" : "text-[#c99a45]"
          }`}
        >
          {icon}
        </div>
      </div>

      <h3 className="font-black text-green-900 text-[12px] md:text-xl mt-2 md:mt-5 leading-tight">
        {title}
      </h3>

      <p className="font-bold text-gray-500 text-[10px] md:text-base mt-0.5">
        {subtitle}
      </p>

      <p className="hidden md:block text-sm text-gray-500 mt-5 leading-relaxed text-center">
        {text}
      </p>

      {active && (
        <div className="absolute top-2 right-2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-green-800 flex items-center justify-center">
          <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white"></span>
        </div>
      )}
    </button>
  );
}

export function Input({
  label,
  name,
  type = "text",
  placeholder,
  error,
  helperText,
  icon,
  value,
  onChange,
}) {
  return (
    <label className="block text-left w-full">
      {label && (
        <span className="block text-xs font-black text-green-900 mb-1 select-none">
          {label}
        </span>
      )}
      <div
        className={`relative h-11 w-full rounded-xl border flex items-center bg-white px-3 transition ${
          error ? "border-red-500 ring-2 ring-red-50" : "border-[#eadfcd]"
        }`}
      >
        {icon && <span className="text-gray-400 mr-2 shrink-0">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 outline-none text-xs md:text-sm font-semibold text-gray-700 bg-transparent"
        />
      </div>
      {helperText && !error && (
        <span className="block text-[10px] text-gray-400 mt-1">{helperText}</span>
      )}
      {error && <span className="block text-[10px] text-red-500 mt-1">{error}</span>}
    </label>
  );
}

export function Textarea({ label, value, name = "note", onChange }) {
  return (
    <label className="block text-left w-full">
      <span className="block text-xs font-black text-green-900 mb-1 select-none">
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder="Yêu cầu khác..."
        className="w-full h-24 rounded-xl border border-[#eadfcd] p-3 text-xs md:text-sm font-semibold text-gray-700 outline-none resize-none bg-white"
      />
    </label>
  );
}

export function DineInForm({
  errors,
  checkoutForm,
  saveCheckoutForm,
  serviceType,
  deliveryTimeType,
}) {
  const handleChange = (name, value) => {
    const finalValue = name === "phone" ? value.replace(/\D/g, "") : value;
    saveCheckoutForm({
      ...checkoutForm,
      [name]: finalValue,
      serviceType,
      deliveryTimeType,
    });
  };

  return (
    <div className="bg-white border border-[#eadfcd] rounded-2xl p-4 md:p-5 shadow-sm">
      <h2 className="font-black text-green-955 text-xl md:text-2xl mb-4 text-left">
        2. THÔNG TIN ĐẶT BÀN
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
        <Input
          label="Ngày đặt bàn"
          name="date"
          type="date"
          icon={<CalendarDays size={16} />}
          error={errors.date}
          value={checkoutForm.date}
          onChange={handleChange}
        />

        <Input
          label="Giờ đến"
          name="time"
          type="time"
          icon={<Clock size={16} />}
          error={errors.time}
          helperText="Giờ mở cửa: 08:00 - 22:00"
          value={checkoutForm.time}
          onChange={handleChange}
        />

        <Input
          label="Số lượng khách"
          name="guests"
          type="number"
          placeholder="Ví dụ: 6"
          error={errors.guests}
          value={checkoutForm.guests}
          onChange={handleChange}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Input
          label="Họ và tên"
          name="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          error={errors.name}
          value={checkoutForm.name}
          onChange={handleChange}
        />

        <Input
          label="Số điện thoại"
          name="phone"
          placeholder="Ví dụ: 0901234567"
          error={errors.phone}
          value={checkoutForm.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Ghi chú / Yêu cầu đặc biệt"
          value={checkoutForm.note}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export function PickupForm({
  errors,
  checkoutForm,
  saveCheckoutForm,
  serviceType,
  deliveryTimeType,
}) {
  const handleChange = (name, value) => {
    const finalValue = name === "phone" ? value.replace(/\D/g, "") : value;
    saveCheckoutForm({
      ...checkoutForm,
      [name]: finalValue,
      serviceType,
      deliveryTimeType,
    });
  };

  return (
    <div className="bg-white border border-[#eadfcd] rounded-2xl p-5 shadow-sm text-left">
      <h2 className="font-black text-green-955 text-xl md:text-2xl mb-4">
        2. THÔNG TIN LẤY HÀNG
      </h2>

      <p className="font-bold text-sm mb-3">Thời gian đến lấy</p>

      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <Input
          name="date"
          type="date"
          icon={<CalendarDays size={16} />}
          error={errors.date}
          value={checkoutForm.date}
          onChange={handleChange}
        />
        <Input
          name="time"
          type="time"
          icon={<Clock size={16} />}
          error={errors.time}
          helperText="Giờ nhận món: 08:00 - 22:00"
          value={checkoutForm.time}
          onChange={handleChange}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Input
          label="Tên người lấy"
          name="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          error={errors.name}
          value={checkoutForm.name}
          onChange={handleChange}
        />
        <Input
          label="Số điện thoại"
          name="phone"
          placeholder="Ví dụ: 0901234567"
          error={errors.phone}
          value={checkoutForm.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Ghi chú (nếu có)"
          value={checkoutForm.note}
          onChange={handleChange}
        />
      </div>

      <div className="mt-3 bg-[#fbf0dc] rounded-xl p-3 text-xs md:text-sm font-bold text-gray-700">
        <b className="text-green-900">Lưu ý:</b> Vui lòng đến đúng giờ đã chọn.
        Nhà hàng sẽ chuẩn bị món theo thời gian bạn đặt.
      </div>
    </div>
  );
}

export function DeliveryForm({
  errors,
  deliveryTimeType,
  setDeliveryTimeType,
  checkoutForm,
  saveCheckoutForm,
  serviceType,
}) {
  const handleChange = (name, value) => {
    const finalValue = name === "phone" ? value.replace(/\D/g, "") : value;
    saveCheckoutForm({
      ...checkoutForm,
      [name]: finalValue,
      serviceType,
      deliveryTimeType,
    });
  };

  const handleChangeDeliveryTimeType = (type) => {
    setDeliveryTimeType(type);

    saveCheckoutForm({
      ...checkoutForm,
      deliveryTimeType: type,
      serviceType,
      date: type === "now" ? "" : checkoutForm.date,
      time: type === "now" ? "" : checkoutForm.time,
    });
  };

  return (
    <div className="bg-white border border-[#eadfcd] rounded-2xl p-4 md:p-5 shadow-sm text-left">
      <h2 className="font-black text-green-955 text-xl md:text-2xl mb-4">
        2. THÔNG TIN GIAO HÀNG
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
        <Input
          label="Người nhận"
          name="name"
          placeholder="Ví dụ: Nguyễn Văn A"
          error={errors.name}
          value={checkoutForm.name}
          onChange={handleChange}
        />
        <Input
          label="Số điện thoại"
          name="phone"
          placeholder="Ví dụ: 090 123 4567"
          error={errors.phone}
          value={checkoutForm.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <Input
          label="Địa chỉ giao hàng"
          name="address"
          placeholder="Ví dụ: 123 Đường Lê Lợi, TP. Hà Tĩnh"
          error={errors.address}
          value={checkoutForm.address}
          onChange={handleChange}
        />
      </div>

      <div className="mt-4">
        <p className="font-bold text-xs md:text-sm mb-1">Thời gian giao hàng</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleChangeDeliveryTimeType("now")}
            className={`rounded-xl p-3 border transition ${
              deliveryTimeType === "now"
                ? "bg-green-50 border-green-800 text-green-900 shadow-md"
                : "bg-white border-[#eadfcd] text-green-900"
            }`}
          >
            <Truck className="w-5 h-5 mx-auto mb-1" />
            <p className="font-bold text-sm">Giao ngay</p>
            <p
              className={`text-[11px] mt-1 ${
                deliveryTimeType === "now" ? "text-green-700" : "text-gray-500"
              }`}
            >
              (Giao nhanh nhất có thể)
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleChangeDeliveryTimeType("schedule")}
            className={`rounded-xl p-3 border transition ${
              deliveryTimeType === "schedule"
                ? "bg-green-50 border-green-800 text-green-900 shadow-md"
                : "bg-white border-[#eadfcd] text-green-900"
            }`}
          >
            <Store className="w-5 h-5 mx-auto mb-1" />
            <p className="font-bold text-sm">Hẹn giờ giao</p>
            <p
              className={`text-[11px] mt-1 ${
                deliveryTimeType === "schedule"
                  ? "text-green-700"
                  : "text-gray-500"
              }`}
            >
              (Chọn giờ giao cụ thể)
            </p>
          </button>
        </div>
      </div>

      {deliveryTimeType === "schedule" && (
        <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4">
          <Input
            name="date"
            type="date"
            icon={<CalendarDays size={16} />}
            error={errors.date}
            value={checkoutForm.date}
            onChange={handleChange}
          />
          <Input
            name="time"
            type="time"
            icon={<Clock size={16} />}
            error={errors.time}
            helperText="Giờ nhận món: 08:00 - 22:00"
            value={checkoutForm.time}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="mt-4">
        <Textarea
          label="Ghi chú thêm (nếu có)"
          value={checkoutForm.note}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
