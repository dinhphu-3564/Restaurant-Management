import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";

export function AnimatedNumber({ value, isCurrency = false, isDecimal = false, duration = 2000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endVal = Number(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * endVal);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (isCurrency) {
    return <span>{displayValue.toLocaleString("vi-VN")}đ</span>;
  }

  if (isDecimal) {
    return <span>{displayValue.toFixed(1)}</span>;
  }

  return <span>{displayValue.toLocaleString("vi-VN")}</span>;
}

export function DashboardCard({ icon, title, value, percent, bg, color, to, isCurrency = false }) {
  const percentStr = String(percent || "0.0%");
  const isUp = !percentStr.includes("-");
  const displayPercent = percentStr.replace(/[+-]/g, "");

  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-start gap-2.5 hover:shadow-md transition group select-none text-left min-w-0"
    >
      {/* Icon on the left */}
      <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
        {React.cloneElement(icon, { size: 16 })}
      </div>
      {/* Content column */}
      <div className="flex flex-col flex-1">
        {/* Row 1: Title */}
        <p className="text-[11px] sm:text-xs font-black text-gray-500 truncate leading-tight">
          {title}
        </p>
        {/* Row 2: Value */}
        <h3 className="text-[20px] sm:text-[22px] font-black text-green-955 mt-1 leading-none truncate">
          <AnimatedNumber value={value} isCurrency={isCurrency} />
        </h3>
        {/* Row 3: Percent */}
        <div className="mt-1 flex items-center">
          <span className={`px-1.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black flex items-center gap-0.5 shrink-0 ${isUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
            {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {displayPercent}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryLine({ color, name, value, chartProgress }) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-gray-500 flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          {name}
        </span>

        <span className="text-gray-900 font-black">{value.toLocaleString("vi-VN")}đ</span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-50 overflow-hidden">
        <div
          style={{ width: `${chartProgress}%` }}
          className={`h-full rounded-full ${color} transition-all duration-1000`}
        />
      </div>
    </div>
  );
}

export function StatusLine({ icon, title, value, bg, color, total = 100, chartProgress, to }) {
  return (
    <Link to={to} className="block space-y-1.5 group select-none text-left">
      <div className="flex justify-between items-center text-xs font-black">
        <span className="text-gray-600 flex items-center gap-2">
          <span className={`w-6 h-6 rounded-lg ${bg} ${color} flex items-center justify-center`}>
            {icon}
          </span>
          {title}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-gray-900 text-sm font-black">
            {value} <span className="text-[10px] text-gray-400 font-bold">/ {total}</span>
          </span>
          <span className="text-primary text-[10px] opacity-0 group-hover:opacity-100 transition">
            →
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-gray-50 overflow-hidden">
        <div
          style={{ width: `${chartProgress}%` }}
          className={`h-full rounded-full ${bg} transition-all duration-1000`}
        />
      </div>
    </Link>
  );
}

export function PanelHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-4 border-b border-gray-100 text-left">
      <h4 className="text-lg font-black text-gray-900">{title}</h4>

      {to && (
        <Link to={to} className="text-xs font-black text-[#c99a45] hover:text-primary transition shrink-0 select-none">
          Xem tất cả →
        </Link>
      )}
    </div>
  );
}

export function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-14 text-center text-gray-400 font-bold">
        {text}
      </td>
    </tr>
  );
}

export function SmallStat({ icon, title, value, change, orange = false }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left hover:shadow-md transition-all duration-300">
      <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
        <span className={orange ? "text-amber-500" : "text-primary"}>{icon}</span>
        {title}
      </p>

      <div className="flex justify-between items-baseline gap-2 mt-2">
        <h4 className="text-2xl font-black text-green-955">{value}</h4>
        {change && (
          <span className={`text-[10px] font-black leading-none ${change.startsWith("+") ? "text-green-600" : "text-red-500"
            }`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
