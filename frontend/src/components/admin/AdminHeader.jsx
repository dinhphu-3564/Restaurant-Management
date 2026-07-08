import { clearAuthSession, getCurrentUser } from "../../utils/auth";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Search,
  ShieldCheck,
  ChevronDown,
  LogOut,
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
  notifications = [],
}) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const popupRef = useRef(null);
  const notificationsPopupRef = useRef(null);

  const formatDateInput = (date) => {
    return date.toISOString().split("T")[0];
  };

  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const ROLE_TEXT = {
    admin: "Quản trị viên",
    manager: "Quản lý",
    staff: "Nhân viên",
    user: "Khách hàng",
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/admin/login");
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
      if (notificationsPopupRef.current && !notificationsPopupRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-[76px] bg-white border-b border-gray-100 flex items-center justify-between px-5 min-w-0">
      <div className="shrink-0 min-w-0 mr-4">
        <h1 className="text-xl sm:text-2xl font-black text-primary whitespace-nowrap">{title}</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex h-11 w-[220px] 2xl:w-[300px] items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 shadow-sm">
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
            className="h-11 px-4 rounded-2xl border border-gray-100 bg-white shadow-sm text-sm font-black text-gray-700 flex items-center justify-between gap-3 hover:bg-primary/5 transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDays size={18} className="text-primary shrink-0" />
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
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  Ngày
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode?.("week")}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "week"
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  Tuần
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode?.("month")}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "month"
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  Tháng
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode?.("year")}
                  className={`h-10 rounded-xl text-sm font-black transition ${
                    dateMode === "year"
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary"
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
                  className="h-10 px-4 rounded-xl bg-primary text-white font-black hover:bg-primary-light transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        {action}
        <div ref={notificationsPopupRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-green-50/50 transition"
          >
            <Bell size={20} />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-[320px] sm:w-[360px] rounded-2xl border border-gray-100 bg-white shadow-xl py-2 animate-[scaleIn_0.2s_ease-out]">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-black text-gray-800">Thông báo mới</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                    {notifications.length} cần xử lý
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400 font-bold text-xs">
                  Không có thông báo mới
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
                  {notifications.map((n) => {
                    const isOrder = n.type === 'order';
                    const d = n.details || {};
                    const infoLine = isOrder
                      ? `#${d.orderCode} · ${d.customerName} · ${Number(d.total || 0).toLocaleString('vi-VN')}đ`
                      : `${d.bookingCode} · ${d.customerName} · ${d.time}${d.date ? ', ' + d.date : ''}`;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          navigate(n.link);
                          setIsNotificationsOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 hover:brightness-95 transition text-left border-l-[3px] ${
                          isOrder
                            ? 'bg-amber-50/50 border-l-amber-400 hover:bg-amber-50'
                            : 'bg-blue-50/50 border-l-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isOrder ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isOrder ? '🛒' : '📅'} {n.title}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-[11px] font-semibold truncate ${
                          isOrder ? 'text-amber-900' : 'text-blue-900'
                        }`}>
                          {infoLine}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 bg-primary/10 text-primary px-4 h-11 rounded-full font-bold">
          <ShieldCheck size={18} />
          <span>{currentUser?.name || "Admin"}</span>
          <span className="text-xs text-primary font-black hidden 2xl:inline">
            ({ROLE_TEXT[currentUser?.role] || "Nhân viên"})
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="h-11 px-4 rounded-full bg-red-50 text-red-600 font-black hover:bg-red-100 transition flex items-center gap-2"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
