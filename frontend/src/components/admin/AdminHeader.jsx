import { useState, useRef, useEffect } from "react";
import {
  Bell,
  CalendarDays,
  Search,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

function AdminHeader({
  title = "Trang quản trị",
  subtitle = "Quản lý hệ thống",
  action = null,
  globalSearch = "",
  setGlobalSearch,
  dateRange = {
    startDate: "",
    endDate: "",
  },
  setDateRange,
  dateMode = "range",
  setDateMode,
  dateLabel = "",
  setDateLabel,
}) {
  const [isDateOpen, setIsDateOpen] = useState(false);

  const popupRef = useRef(null);

  const formatDateInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  const setWeekByDate = (value) => {
    if (!value) return;

    const selected = new Date(value);
    const day = selected.getDay() || 7;

    const start = new Date(selected);
    start.setDate(selected.getDate() - day + 1);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    setDateRange?.({
      startDate: formatDateInput(start),
      endDate: formatDateInput(end),
    });

    setDateLabel?.(
      `${formatDateDisplay(formatDateInput(start))} - ${formatDateDisplay(
        formatDateInput(end),
      )}`,
    );
  };

  const setMonthByValue = (value) => {
    if (!value) return;

    const [year, month] = value.split("-").map(Number);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    setDateRange?.({
      startDate: formatDateInput(start),
      endDate: formatDateInput(end),
    });

    setDateLabel?.(`Tháng ${month}/${year}`);
  };

  const setYearByValue = (value) => {
    if (!value) return;

    const year = Number(value);

    setDateRange?.({
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    });

    setDateLabel?.(`Năm ${year}`);
  };

  const formatDateDisplay = (value) => {
    if (!value) return "";

    const [year, month, day] = value.split("-");

    return `${day}/${month}/${year}`;
  };

  const displayDate =
    dateLabel ||
    (dateRange.startDate && dateRange.endDate
      ? `${formatDateDisplay(dateRange.startDate)} - ${formatDateDisplay(
          dateRange.endDate,
        )}`
      : "Chọn thời gian");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-[76px] bg-white border-b border-gray-100 flex items-center justify-between px-5">
      <div>
        <h1 className="text-2xl font-black text-green-950">{title}</h1>

        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex h-11 w-[300px] items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
          <Search size={18} className="text-gray-400" />

          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch?.(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>

        <div ref={popupRef} className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="h-11 px-4 rounded-2xl border border-gray-100 bg-white shadow-sm text-sm font-black text-gray-700 flex items-center justify-between gap-3 hover:bg-green-50/50 transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDays size={18} className="text-green-800 shrink-0" />
              <span className="truncate">{displayDate}</span>
            </div>

            <ChevronDown size={17} className="text-gray-400 shrink-0" />
          </button>

          {isDateOpen && (
            <div className="absolute right-0 top-14 z-50 w-[380px] rounded-2xl border border-gray-100 bg-white shadow-xl p-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setDateMode?.("range");
                    setDateLabel?.("");
                  }}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "range"
                      ? "bg-green-800 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  Ngày
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode?.("week")}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "week"
                      ? "bg-green-800 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  Tuần
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode?.("month")}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "month"
                      ? "bg-green-800 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  Tháng
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode?.("year")}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "year"
                      ? "bg-green-800 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-800"
                  }`}
                >
                  Năm
                </button>
              </div>

              {dateMode === "range" && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="text-xs font-black text-gray-400">
                      Từ ngày
                    </span>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => {
                        setDateRange?.((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }));
                        setDateLabel?.("");
                      }}
                      className="w-full h-11 rounded-xl border border-gray-100 px-3 text-sm font-bold outline-none"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-black text-gray-400">
                      Đến ngày
                    </span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => {
                        setDateRange?.((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }));
                        setDateLabel?.("");
                      }}
                      className="w-full h-11 rounded-xl border border-gray-100 px-3 text-sm font-bold outline-none"
                    />
                  </label>
                </div>
              )}

              {dateMode === "week" && (
                <label className="space-y-1 block">
                  <span className="text-xs font-black text-gray-400">
                    Chọn một ngày trong tuần
                  </span>

                  <input
                    type="date"
                    onChange={(e) => setWeekByDate(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-100 px-3 text-sm font-bold outline-none"
                  />

                  <p className="text-xs text-gray-400 font-semibold">
                    Hệ thống sẽ tự lấy từ thứ 2 đến chủ nhật của tuần đó.
                  </p>
                </label>
              )}

              {dateMode === "month" && (
                <label className="space-y-1 block">
                  <span className="text-xs font-black text-gray-400">
                    Chọn tháng
                  </span>

                  <input
                    type="month"
                    onChange={(e) => setMonthByValue(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-100 px-3 text-sm font-bold outline-none"
                  />
                </label>
              )}

              {dateMode === "year" && (
                <label className="space-y-1 block">
                  <span className="text-xs font-black text-gray-400">
                    Chọn năm
                  </span>

                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    placeholder="VD: 2026"
                    onChange={(e) => setYearByValue(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-100 px-3 text-sm font-bold outline-none"
                  />
                </label>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDateRange?.({
                      startDate: "",
                      endDate: "",
                    });
                    setDateLabel?.("");
                  }}
                  className="h-10 px-4 rounded-xl bg-gray-50 text-gray-600 font-black hover:bg-red-50 hover:text-red-600 transition"
                >
                  Xóa
                </button>

                <button
                  type="button"
                  onClick={() => setIsDateOpen(false)}
                  className="h-10 px-4 rounded-xl bg-green-800 text-white font-black hover:bg-green-900 transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        {action}
        <button className="relative w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600">
          <Bell size={20} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">
            6
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-2 bg-green-50 text-green-800 px-4 h-11 rounded-full font-bold">
          <ShieldCheck size={18} />
          Admin
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
