import React from "react";

export function StatCard({ icon, title, value, bg, color, note = "", valueColor }) {
  const textColor = valueColor || color;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-start gap-2.5 hover:bg-primary/5 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-md transition text-left min-w-0">
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
        <h3 className={`text-[20px] sm:text-[22px] font-black ${textColor} mt-1 leading-none truncate`}>
          {value}
        </h3>

        {/* Row 3: Tỉ lệ % / Ghi chú */}
        <div className="mt-1 flex items-center min-w-0 h-5">
          <span className="px-1.5 py-0.5 rounded-lg bg-green-50 text-green-700 text-[9px] sm:text-[10px] font-black shrink-0">
            {note || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SelectBox({ label, value, onChange, children }) {
  return (
    <label className="h-12 rounded-xl border border-gray-100 bg-white px-3 flex flex-col justify-center shadow-sm min-w-0">
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

export function ActionButton({ icon, color, onClick, disabled = false, title = "" }) {
  const colors = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50" : colors[color]
        }`}
    >
      {icon}
    </button>
  );
}

export function InputBox({ label, value, onChange, type = "text" }) {
  return (
    <label>
      <span className="text-sm font-black text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
      />
    </label>
  );
}

export function MiniInfoInput({ label, value, onChange, placeholder }) {
  return (
    <label className="rounded-xl bg-[#f8f3e8] px-3 py-3 text-center">
      <span className="block text-xs font-black text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-center text-sm font-black text-primary outline-none placeholder:text-primary/40"
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label>
      <span className="text-sm font-black text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
      >
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

export function DetailBlock({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h4 className="font-black text-primary mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[95px_1fr] gap-3 text-sm">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-bold break-words">{value}</span>
    </div>
  );
}

export function TextAreaBox({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="md:col-span-2">
      <span className="text-sm font-black text-gray-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
      />
    </label>
  );
}
