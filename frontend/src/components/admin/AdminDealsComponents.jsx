import React from "react";
import { X, UploadCloud, Image } from "lucide-react";

export function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3 text-center">
      <p className="text-primary font-black">{value}</p>
      <p className="text-xs text-gray-500 font-semibold mt-1">{label}</p>
    </div>
  );
}

export function ServiceConditionItemsField({
  serviceTypes = [],
  value = {},
  onChange,
  error = false,
}) {
  const groups = [
    {
      key: "dinein",
      title: "Ăn tại quán",
      options: [
        "Áp dụng khi dùng bữa tại nhà hàng",
        "Áp dụng khi đặt bàn trước",
        "Áp dụng cho nhóm từ 4 khách trở lên",
        "Xuất trình mã khuyến mãi khi thanh toán",
        "Không áp dụng vào ngày lễ, Tết",
        "Không áp dụng kèm các ưu đãi khác",
      ],
    },
    {
      key: "delivery",
      title: "Giao tận nơi",
      options: [
        "Áp dụng khi đặt món qua website",
        "Áp dụng cho đơn giao trong khu vực hỗ trợ",
        "Không áp dụng phí vận chuyển",
        "Khách hàng cung cấp đúng số điện thoại và địa chỉ",
        "Đơn hàng cần được xác nhận trước khi giao",
        "Không áp dụng kèm các ưu đãi khác",
      ],
    },
    {
      key: "pickup",
      title: "Đến lấy tại quán",
      options: [
        "Áp dụng khi khách tự đến nhận món tại nhà hàng",
        "Áp dụng khi đặt món trước qua website",
        "Khách cần nhận món trong thời gian đã hẹn",
        "Không áp dụng phí giao hàng",
        "Xuất trình mã khuyến mãi khi nhận món",
        "Không áp dụng kèm các ưu đãi khác",
      ],
    },
  ];

  const toggle = (groupKey, text) => {
    const current = value[groupKey] || [];

    const nextGroup = current.includes(text)
      ? current.filter((item) => item !== text)
      : [...current, text];

    onChange({
      ...value,
      [groupKey]: nextGroup,
    });
  };

  return (
    <div
      className={`md:col-span-2 rounded-2xl ${
        error ? "ring-2 ring-red-100 bg-red-50/40 p-3" : ""
      }`}
    >
      <p className="text-sm font-black text-gray-500 mb-3">
        Điều kiện theo hình thức phục vụ
      </p>

      <div className="grid xl:grid-cols-3 gap-4">
        {groups.map((group) => {
          const enabled = serviceTypes.includes(group.key);
          const selectedItems = value[group.key] || [];

          return (
            <div
              key={group.key}
              className={`rounded-2xl border p-4 ${
                enabled
                  ? "border-green-100 bg-green-50/30"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <h4 className="font-black text-green-900 mb-3">{group.title}</h4>

              <div className="space-y-2">
                {group.options.map((item) => (
                  <label
                    key={item}
                    className={`min-h-11 rounded-xl border px-3 py-2 flex items-center gap-2 cursor-pointer text-sm font-bold transition ${
                      selectedItems.includes(item)
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-gray-100 bg-white text-gray-600"
                    } ${!enabled ? "pointer-events-none" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      disabled={!enabled}
                      onChange={() => toggle(group.key, item)}
                      className="w-4 h-4 accent-green-700 shrink-0"
                    />

                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500">
          Vui lòng chọn ít nhất 1 điều kiện theo hình thức phục vụ
        </p>
      )}
    </div>
  );
}

export function ServiceTypeCheckboxGroup({ value = [], onChange, error = false }) {
  const options = [
    { key: "dinein", label: "Ăn tại quán" },
    { key: "delivery", label: "Giao tận nơi" },
    { key: "pickup", label: "Đến lấy tại quán" },
  ];

  const toggle = (key) => {
    if (value.includes(key)) {
      onChange(value.filter((item) => item !== key));
    } else {
      onChange([...value, key]);
    }
  };

  return (
    <div
      className={`md:col-span-2 rounded-2xl ${
        error ? "ring-2 ring-red-100 bg-red-50/40 p-3" : ""
      }`}
    >
      <p className="text-sm font-black text-gray-500 mb-2">
        Áp dụng hình thức phục vụ <span className="text-red-500">*</span>
      </p>

      <div
        className={`grid sm:grid-cols-3 gap-3 rounded-2xl ${
          error ? "ring-2 ring-red-100 bg-red-50/40 p-3" : ""
        }`}
      >
        {options.map((option) => (
          <label
            key={option.key}
            className={`
              h-12 rounded-xl border px-4 flex items-center gap-3 cursor-pointer font-bold transition
              ${
                value.includes(option.key)
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-100 bg-white text-gray-600"
              }
            `}
          >
            <input
              type="checkbox"
              checked={value.includes(option.key)}
              onChange={() => toggle(option.key)}
              className="w-4 h-4 accent-green-700"
            />

            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500">
          Vui lòng chọn ít nhất 1 hình thức phục vụ
        </p>
      )}
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  error = false,
}) {
  return (
    <label className="block text-left">
      <span className="text-sm font-black text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm bg-white transition-all ${
          error
            ? "border-red-500 ring-2 ring-red-100 bg-red-50"
            : "border-gray-100 focus:border-green-200 focus:ring-2 focus:ring-green-50"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">
          Trường này là bắt buộc
        </p>
      )}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  required = false,
  error = false,
}) {
  return (
    <label className="block text-left">
      <span className="text-sm font-black text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm bg-white transition-all ${
          error
            ? "border-red-500 ring-2 ring-red-100 bg-red-50"
            : "border-gray-100 focus:border-green-200 focus:ring-2 focus:ring-green-50"
        }`}
      >
        {children}
      </select>

      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">
          Trường này là bắt buộc
        </p>
      )}
    </label>
  );
}

export function ImageUploadBox({
  title,
  size,
  image,
  fieldName,
  previewClassName,
  horizontal = false,
  onChange,
  onRemove,
}) {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-sm font-black text-gray-700">{title}</h4>

        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black whitespace-nowrap">
          {size}
        </span>
      </div>

      <div
        className={`grid gap-4 ${
          horizontal ? "grid-cols-1" : "grid-cols-[155px_1fr]"
        }`}
      >
        {image && (
          <div
            className={`
              relative
              rounded-2xl
              overflow-hidden
              border border-gray-100
              bg-gray-50
              ${previewClassName}
            `}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover bg-gray-50"
            />

            <button
              type="button"
              onClick={() => onRemove(fieldName)}
              className="
                absolute top-2 right-2
                w-8 h-8
                rounded-xl
                bg-white/95
                text-gray-500
                hover:text-red-500
                flex items-center justify-center
                shadow-md
              "
            >
              <X size={16} />
            </button>
          </div>
        )}

        <label
          className={`
            rounded-2xl
            border-2 border-dashed border-gray-200
            bg-white
            flex flex-col items-center justify-center
            text-center cursor-pointer
            hover:border-green-200
            hover:bg-green-50/30
            transition

            ${horizontal ? "h-[120px]" : "h-[230px]"}
            ${!image && horizontal ? "h-[180px]" : ""}
            ${!image && !horizontal ? "col-span-2" : ""}
          `}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => onChange(event, fieldName)}
            className="hidden"
          />

          {image ? (
            <UploadCloud size={34} className="text-gray-500 mb-2" />
          ) : (
            <Image size={40} className="text-gray-500 mb-3" />
          )}

          <p className="text-sm font-bold text-gray-600">
            Kéo thả ảnh vào đây hoặc
          </p>

          <span className="mt-3 h-10 px-5 rounded-xl bg-green-700 text-white font-black inline-flex items-center justify-center hover:bg-green-800 transition">
            Chọn ảnh
          </span>

          <p className="text-xs text-gray-500 font-semibold mt-3">
            JPG, PNG, WebP - Tối đa 10MB
          </p>
        </label>
      </div>
    </div>
  );
}

export function DealStatCard({ icon, title, value, bg, color, note = "so với tuần trước" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-start gap-2.5 hover:bg-green-50/40 hover:border-green-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-left min-w-0">
      {/* Icon ở trước (bên trái) */}
      <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
        {React.cloneElement(icon, { size: 16 })}
      </div>
      
      {/* 3 hàng bắt đầu bằng nhau ở bên phải */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Row 1: Tên danh mục */}
        <p className="text-[11px] sm:text-xs font-black text-gray-500 truncate leading-tight">
          {title}
        </p>

        {/* Row 2: Số tiền, thông số */}
        <h3 className="text-[20px] sm:text-[22px] font-black text-green-955 mt-1 leading-none truncate">
          {value}
        </h3>

        {/* Row 3: Tỉ lệ % / Ghi chú */}
        <div className="mt-1 flex items-center min-w-0 h-5">
          <span className="px-1.5 py-0.5 rounded-lg bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-black shrink-0">
            {note}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-16 min-w-[150px] px-5 border-b-2 font-black text-base whitespace-nowrap transition-all duration-200 ${
        active
          ? "border-primary/20 border-t-primary bg-primary/5"
          : "border-transparent text-gray-500 hover:text-primary hover:bg-primary/5"
      }`}
    >
      {children}
    </button>
  );
}

export function SelectBox({ label, value, onChange, children, compact = false }) {
  return (
    <label
      className={`h-12 rounded-xl border border-gray-100 bg-white flex flex-col justify-center shadow-sm shrink-0 min-w-0 text-left ${
        compact ? "w-[125px] px-3" : "w-[170px] 2xl:w-[190px] px-4"
      }`}
    >
      <span className="text-[11px] font-black text-gray-400 truncate">
        {label}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="outline-none bg-transparent text-sm font-bold text-gray-700 min-w-0 truncate"
      >
        {children}
      </select>
    </label>
  );
}

export function IconButton({ icon, color, onClick, disabled = false, title = "" }) {
  const colors = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center hover:scale-105 transition-all ${
        disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50" : colors[color]
      }`}
    >
      {icon}
    </button>
  );
}

export function DetailBlock({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-4 text-left">
      <h4 className="font-black text-primary mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm text-left">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-bold break-words">
        {value || "Chưa có"}
      </span>
    </div>
  );
}
