import { checkLogin } from "../utils/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { tableService } from "../services/tableService";
import { bookingService } from "../services/bookingService";
import { socket } from "../utils/socket";

import LoginRequiredModal from "../components/LoginRequiredModal";

import goatIcon from "../assets/images/Icon_De.png";

import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ChefHat,
  Headset,
} from "lucide-react";

//hàm sắp xếp khu vực
const removeVietnameseTones = (str = "") =>
  String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const getAreaPriority = (area) => {
  const name = removeVietnameseTones(area.title || area.name || "");

  if (name.includes("vip")) return 0;

  const floorMatch = name.match(/tang\s*(\d+)/);

  if (floorMatch) {
    return Number(floorMatch[1]);
  }

  if (name.includes("tret")) return 1;

  return 99;
};

const sortAreasByPriority = (areas = []) => {
  return [...areas].sort((a, b) => {
    const priorityA = getAreaPriority(a);
    const priorityB = getAreaPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return String(a.title || a.name || "").localeCompare(
      String(b.title || b.name || ""),
      "vi",
      { numeric: true },
    );
  });
};

function BookingPage() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();

  const selectedDish = location.state?.selectedDish;
  const bookingCartItems = location.state?.cartItems || [];

  const subtotal = bookingCartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const totalBookingQty = bookingCartItems.reduce(
    (sum, item) => sum + item.qty,
    0,
  );
  //kiểm tra đăng nhập
  useEffect(() => {
    setIsLoggedIn(checkLogin());
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [areas, setAreas] = useState([]);
  const [adminTables, setAdminTables] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

  // load dữ liệu bàn/khu vực từ API
  useEffect(() => {
    const loadTableData = async () => {
      try {
        const [apiAreas, apiTables] = await Promise.all([
          tableService.getAreas(),
          tableService.getTables(),
        ]);

        const mappedAreas = sortAreasByPriority(
          apiAreas.map((area) => ({
            id: String(area.id),
            title: area.name,
            text: area.description,
          })),
        );

        const mappedTables = apiTables.map((table) => ({
          ...table,
          id: String(table.id),
          areaId: String(table.areaId),
          code: String(table.code || table.tableCode),
          capacity: Number(table.capacity || table.seats || 4),
          status: table.status || "available",
        }));

        setAreas(mappedAreas);
        setAdminTables(mappedTables);

        const firstArea = mappedAreas[0];

        if (!firstArea) {
          setSelectedArea("");
          setSelectedTable("");
          return;
        }

        setSelectedArea((prev) => {
          const existed = mappedAreas.some(
            (area) => String(area.id) === String(prev),
          );

          return existed ? prev : firstArea.id;
        });

        setSelectedTable((prevTable) => {
          if (prevTable) return prevTable;

          const firstAvailableTable = mappedTables.find(
            (table) =>
              String(table.areaId) === String(firstArea.id) &&
              table.status !== "serving" &&
              table.status !== "maintenance" &&
              table.status !== "disabled",
          );

          return firstAvailableTable?.code || "";
        });
      } catch (error) {
        console.error(error);
        setAreas([]);
        setAdminTables([]);
        setSelectedArea("");
        setSelectedTable("");
      }
    };

    loadTableData();

    window.addEventListener("tablesUpdated", loadTableData);
    socket.on("table_updated", loadTableData);

    return () => {
      window.removeEventListener("tablesUpdated", loadTableData);
      socket.off("table_updated", loadTableData);
    };
  }, []);

  useEffect(() => {
    const loadBookingAvailability = async () => {
      if (!form.date) {
        setBookings([]);
        return;
      }

      try {
        const bookedTables = await bookingService.getBookingAvailability(
          form.date,
        );

        setBookings(Array.isArray(bookedTables) ? bookedTables : []);
      } catch (error) {
        console.error(error);
        setBookings([]);
      }
    };

    loadBookingAvailability();

    window.addEventListener("bookingsUpdated", loadBookingAvailability);

    return () => {
      window.removeEventListener("bookingsUpdated", loadBookingAvailability);
    };
  }, [form.date]);

  const currentArea = areas.find(
    (area) => String(area.id) === String(selectedArea),
  );

  const currentTables = adminTables
    .filter((table) => String(table.areaId) === String(selectedArea))
    .sort((a, b) =>
      String(a.code || "").localeCompare(String(b.code || ""), "vi", {
        numeric: true,
      }),
    );

  const isAutoArrange = bookingCartItems.length > 0;

  const selectedTableInfo = adminTables.find(
    (table) =>
      String(table.code) === String(selectedTable) &&
      String(table.areaId) === String(selectedArea),
  );

  const selectedTableOverCapacity =
    !isAutoArrange &&
    selectedTableInfo &&
    Number(form.guests || 0) > 0 &&
    Number(form.guests || 0) > Number(selectedTableInfo.capacity || 0);
  //hàm kiểm tra bàn bị khóa theo ngày
  const isActiveBooking = (booking) => {
    return (
      booking.status === "pending" ||
      booking.status === "confirmed" ||
      booking.status === "serving" ||
      booking.status === "Chờ xác nhận" ||
      booking.status === "Đã xác nhận" ||
      booking.status === "Đang phục vụ"
    );
  };

  //hàm chỉ đặt theo ngày
  const isTableReservedAtSelectedDate = (tableCode) => {
    if (!form.date) return false;

    return bookings.some((booking) => {
      return (
        isActiveBooking(booking) &&
        String(booking.selectedTable) === String(tableCode) &&
        booking.date === form.date
      );
    });
  };

  const getTableBookingAtSelectedDate = (tableCode) => {
    if (!form.date) return null;

    return bookings.find((booking) => {
      return (
        isActiveBooking(booking) &&
        String(booking.selectedTable) === String(tableCode) &&
        booking.date === form.date
      );
    });
  };

  //hàm tìm bàn phù hợp
  const getGuestCount = () => Number(form.guests || 0);

  const isUnavailableTable = (table) => {
    return (
      isTableReservedAtSelectedDate(table.code) ||
      table.status === "serving" ||
      table.status === "maintenance" ||
      table.status === "disabled"
    );
  };

  const findBestAvailableTable = (areaId = selectedArea) => {
    const guestCount = getGuestCount();

    return (
      adminTables
        .filter(
          (table) =>
            String(table.areaId) === String(areaId) &&
            !isUnavailableTable(table) &&
            (guestCount <= 0 || Number(table.capacity || 0) >= guestCount),
        )
        .sort((a, b) => {
          const capacityDiff =
            Number(a.capacity || 0) - Number(b.capacity || 0);

          if (capacityDiff !== 0) return capacityDiff;

          return String(a.code || "").localeCompare(
            String(b.code || ""),
            "vi",
            {
              numeric: true,
            },
          );
        })[0] || null
    );
  };

  const handleSelectTable = (table) => {
    if (isAutoArrange) return;

    if (isUnavailableTable(table)) return;

    const guestCount = getGuestCount();
    const tableCapacity = Number(table.capacity || 0);

    if (guestCount > 0 && tableCapacity < guestCount) {
      const suggestedTable = findBestAvailableTable(selectedArea);

      if (suggestedTable) {
        const shouldSwitch = window.confirm(
          `Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người, nhưng bạn đang đặt ${guestCount} người.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`,
        );

        if (shouldSwitch) {
          setSelectedTable(suggestedTable.code);
        }

        return;
      }

      alert(
        `Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người, nhưng bạn đang đặt ${guestCount} người. Hiện khu vực này chưa có bàn phù hợp, vui lòng chọn khu vực khác.`,
      );

      return;
    }

    setSelectedTable(table.code);
  };

  //tự chọn bàn khi đổi ngày / khu vực / số khách
  useEffect(() => {
    if (!form.date || !selectedArea) return;

    const bestTable = findBestAvailableTable(selectedArea);

    setSelectedTable(bestTable?.code || "");
  }, [form.date, form.guests, selectedArea, bookings, adminTables]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!form.date) newErrors.date = "Vui lòng chọn ngày";
    if (!form.time) newErrors.time = "Vui lòng chọn giờ";
    if (!form.guests || Number(form.guests) <= 0) {
      newErrors.guests = "Số khách phải lớn hơn 0";
    }

    if (form.date && form.time) {
      const selectedDateTime = new Date(`${form.date}T${form.time}`);
      const now = new Date();

      const selectedDateOnly = new Date(`${form.date}T00:00`);
      const todayOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const [hour, minute] = form.time.split(":").map(Number);
      const selectedMinutes = hour * 60 + minute;

      const openMinutes = 8 * 60; // 08:00
      const closeMinutes = 22 * 60; // 22:00

      if (selectedDateOnly < todayOnly) {
        newErrors.date = "Ngày đặt bàn không được nhỏ hơn hôm nay";
      } else if (selectedDateTime <= now) {
        newErrors.time = "Giờ đặt bàn phải lớn hơn thời gian hiện tại";
      } else if (
        selectedMinutes < openMinutes ||
        selectedMinutes > closeMinutes
      ) {
        newErrors.time = "Nhà hàng chỉ nhận đặt bàn từ 08:00 đến 22:00";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!validateForm()) return;

    if (!isAutoArrange) {
      const guestCount = Number(form.guests || 0);

      if (!selectedTable) {
        alert("Vui lòng chọn bàn trống để đặt.");
        return;
      }

      const selectedTableData = adminTables.find(
        (table) =>
          String(table.code) === String(selectedTable) &&
          String(table.areaId) === String(selectedArea),
      );

      if (!selectedTableData) {
        alert("Bàn bạn chọn không hợp lệ. Vui lòng chọn lại bàn.");
        return;
      }

      if (guestCount > Number(selectedTableData.capacity || 0)) {
        const suggestedTable = findBestAvailableTable(selectedArea);

        if (suggestedTable) {
          const shouldSwitch = window.confirm(
            `Bàn ${selectedTableData.code} chỉ chứa tối đa ${selectedTableData.capacity} người, nhưng bạn đang đặt ${guestCount} người.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`,
          );

          if (shouldSwitch) {
            setSelectedTable(suggestedTable.code);
          }

          return;
        }

        alert(
          `Hiện khu vực ${currentArea?.title || ""} không có bàn phù hợp cho ${guestCount} người. Vui lòng chọn khu vực khác hoặc liên hệ nhà hàng.`,
        );

        return;
      }
    }

    const newBooking = {
      id: new Date().getTime(),
      source: "booking_page",

      type: isAutoArrange ? "table_with_food" : "table_only",

      customerName: form.name,
      phone: form.phone,
      email: form.email,

      selectedArea: isAutoArrange ? "" : selectedArea,
      selectedTable: isAutoArrange ? "" : selectedTable,
      selectedAreaTitle: isAutoArrange
        ? "Nhà hàng sắp xếp"
        : currentArea?.title || "Chưa có khu vực",

      date: form.date,
      time: form.time,
      guests: form.guests,
      note: form.note,

      selectedDish: selectedDish
        ? {
            id: selectedDish.id,
            name: selectedDish.name,
            price: selectedDish.price,
            image: selectedDish.image,
          }
        : null,

      cartItems: bookingCartItems,

      subtotal,
      total: subtotal,
      totalQty: totalBookingQty,

      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const savedBooking = await bookingService.createBooking(newBooking);

      setBookings((prev) => [savedBooking, ...prev]);

      navigate("/booking-success");
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể tạo đặt bàn. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      <main className="max-w-[1500px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-green-900">
            Đặt bàn tại Dê Hương Sơn
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <Link to="/home" className="hover:text-green-800">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-green-900 font-medium">Đặt bàn</span>
          </div>
        </div>
        <div className="bg-[#f5f3e8] border border-[#eadfcd] rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
          <CalendarDays className="w-6 h-6 text-green-800" />
          <p className="text-sm font-semibold text-green-950">
            Đặt bàn trước để được phục vụ tốt nhất. Nhà hàng sẽ chuẩn bị không
            gian phù hợp khi bạn đến.
          </p>
        </div>
        {/* thông tin món ăn đã chọn nếu có */}
        {bookingCartItems.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl text-green-900">
                Thông tin món ăn đã chọn
              </h3>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {bookingCartItems.map((item) => (
                <div
                  key={item.id}
                  className="w-[135px] shrink-0 bg-white rounded-2xl p-2 border border-green-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-xl"
                  />

                  <p className="font-bold text-green-900 mt-2 text-sm line-clamp-2 h-10">
                    {item.name}
                  </p>

                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-xs text-gray-600">SL: {item.qty}</p>

                    <p className="font-bold text-[#b88935] text-base mt-1">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* tạm tính tổng tiền món ăn đã chọn */}
            <div className="border-t border-green-200 mt-5 pt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Tạm tính</p>
                <p className="text-sm font-bold text-green-800 mt-1">
                  {bookingCartItems.length} món • Tổng số lượng:{" "}
                  {totalBookingQty}
                </p>
              </div>

              <span className="font-black text-2xl text-green-900">
                {subtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        )}
        <section className="grid lg:grid-cols-[1fr_520px] gap-6 items-start">
          {/* LEFT FORM */}
          <div className="bg-white border border-[#eadfcd] rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-black text-green-950 mb-6">
              1. THÔNG TIN ĐẶT BÀN
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Ngày đặt bàn"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                icon={<CalendarDays />}
                error={errors.date}
              />

              <Input
                label="Giờ đến"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                icon={<Clock />}
                error={errors.time}
                helperText="Giờ mở cửa: 08:00 - 22:00"
              />

              <Input
                label="Số lượng khách"
                name="guests"
                type="number"
                value={form.guests}
                onChange={handleChange}
                placeholder="Ví dụ: 6"
                icon={<Users />}
                error={errors.guests}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <Input
                label="Họ và tên"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                icon={<User />}
                error={errors.name}
              />

              <Input
                label="Số điện thoại"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ví dụ: 0901234567"
                icon={<Phone />}
                error={errors.phone}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <Input
                label="Email (tùy chọn)"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="Ví dụ: nguyenvana@gmail.com"
              />

              <label className="block">
                <p className="font-bold text-sm mb-2">
                  Ghi chú / Yêu cầu đặc biệt
                </p>

                <div className="border border-[#eadfcd] rounded-xl p-4 bg-white">
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder="Ví dụ: Trang trí sinh nhật, yêu cầu không gian yên tĩnh..."
                    className="w-full h-16 outline-none resize-none text-sm bg-transparent"
                  />
                  <p className="text-right text-xs text-gray-400">
                    {form.note.length}/200
                  </p>
                </div>
              </label>
            </div>

            <h2 className="text-lg font-black text-green-950 mt-8 mb-5">
              2. CHỌN KHU VỰC / BÀN
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {areas.map((area) => (
                <AreaCard
                  key={area.id}
                  active={String(selectedArea) === String(area.id)}
                  title={area.title}
                  text={area.text}
                  onClick={() => {
                    const areaId = String(area.id);

                    setSelectedArea(areaId);

                    const bestTable = findBestAvailableTable(areaId);

                    setSelectedTable(bestTable?.code || "");
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT TABLE SELECT */}
          <aside className="bg-white border border-[#eadfcd] rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-black text-green-950 mb-4">
              3. CHỌN BÀN
            </h2>

            {isAutoArrange && (
              <div className="mb-5 rounded-2xl bg-orange-50 border border-orange-100 p-4 text-orange-700 font-bold text-sm">
                Bạn đang đặt bàn kèm món ăn. Nhà hàng sẽ tự xếp bàn phù hợp sau
                khi xác nhận.
              </div>
            )}

            <div className="flex items-center gap-6 text-sm mb-5">
              <Legend color="bg-green-800" text="Bàn trống" />
              <Legend color="bg-[#f7dca4]" text="Đang giữ" />
              <Legend color="bg-red-500" text="Đã đặt" />
            </div>

            <p className="font-black text-green-950 mb-4">
              {currentArea?.title || "Chưa có khu vực"}
            </p>

            <div className="grid grid-cols-5 gap-3">
              {currentTables.map((table) => {
                const tableBooking = getTableBookingAtSelectedDate(table.code);

                const holding =
                  tableBooking?.status === "pending" ||
                  tableBooking?.status === "Chờ xác nhận";

                const booked =
                  tableBooking?.status === "confirmed" ||
                  tableBooking?.status === "Đã xác nhận";

                const disabled =
                  !!tableBooking ||
                  table.status === "serving" ||
                  table.status === "maintenance" ||
                  table.status === "disabled";

                const guestCount = getGuestCount();

                const insufficientCapacity =
                  guestCount > 0 && Number(table.capacity || 0) < guestCount;

                const active =
                  String(table.code) === String(selectedTable) &&
                  !disabled &&
                  !isAutoArrange;
                return (
                  <button
                    key={table.id}
                    disabled={disabled || isAutoArrange}
                    onClick={() => handleSelectTable(table)}
                    className={`relative h-16 rounded-xl border font-black transition ${
                      active
                        ? "border-green-800 bg-green-50 text-green-900"
                        : holding
                          ? "border-[#f7dca4] bg-[#fff6e6] text-[#c28b2c] cursor-not-allowed"
                          : booked
                            ? "border-red-200 bg-red-50 text-red-600 cursor-not-allowed"
                            : disabled || isAutoArrange
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : insufficientCapacity
                                ? "border-yellow-300 bg-yellow-50 text-yellow-700 hover:border-yellow-500"
                                : "border-[#eadfcd] bg-white text-green-950 hover:border-green-700"
                    }`}
                  >
                    {active && !isAutoArrange && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-800 text-white text-xs flex items-center justify-center">
                        ✓
                      </span>
                    )}

                    <span className="block leading-tight">{table.code}</span>

                    <span className="block text-[10px] mt-1 font-bold opacity-80">
                      {table.capacity} người
                    </span>

                    {insufficientCapacity && !disabled && !isAutoArrange && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 text-[10px] font-black">
                        Thiếu chỗ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 bg-[#f5f3e8] rounded-2xl p-4 flex gap-4">
              <div className="w-28 h-24 rounded-xl bg-amber-100 flex items-center justify-center text-xs text-green-800 font-bold shrink-0">
                Ảnh bàn
              </div>

              <div>
                <h3 className="font-black text-green-900">
                  {isAutoArrange
                    ? "Nhà hàng sẽ tự xếp bàn"
                    : `Bàn ${selectedTable || "chưa chọn"} - ${
                        currentArea?.title || "Chưa có khu vực"
                      }`}
                </h3>

                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>
                    ✓ Sức chứa:{" "}
                    {isAutoArrange
                      ? "Theo số khách"
                      : selectedTableInfo
                        ? `${selectedTableInfo.capacity} người`
                        : "Chưa có"}
                  </li>
                  {selectedTableOverCapacity && (
                    <li className="text-red-600 font-bold">
                      ⚠ Bàn này không đủ sức chứa cho {form.guests} người
                    </li>
                  )}

                  <li>
                    ✓ Trạng thái:{" "}
                    {isAutoArrange
                      ? "Nhà hàng sắp xếp"
                      : form.date
                        ? "Có thể đặt trong ngày này"
                        : "Vui lòng chọn ngày đặt bàn"}
                  </li>

                  <li>✓ Khu vực: {currentArea?.title || "Chưa có khu vực"}</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-[#f5f3e8] rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-green-900">
              <ShieldCheck className="w-5 h-5" />
              <span>
                Thông tin của bạn được bảo mật và chỉ sử dụng để xác nhận đặt
                bàn.
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 w-full h-12 rounded-xl bg-green-900 hover:bg-green-950 text-white font-black"
            >
              <CalendarDays className="w-5 h-5 inline mr-2" />
              XÁC NHẬN ĐẶT BÀN
            </button>
          </aside>
        </section>
        <section className="mt-8 bg-[#fff8ea] rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ServiceItem
            icon={
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-7 h-7 object-contain"
              />
            }
            title="Nguyên liệu tươi ngon"
            text="Dê núi Hương Sơn tuyển chọn mỗi ngày"
          />
          <ServiceItem
            icon={<ChefHat className="w-6 h-6" />}
            title="Phục vụ tận tâm"
            text="Đội ngũ nhân viên chuyên nghiệp"
          />
          <ServiceItem
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Không chất bảo quản"
            text="An toàn cho sức khỏe"
          />
          <ServiceItem
            icon={<Headset className="w-6 h-6" />}
            title="Hỗ trợ 24/7"
            text="Hotline: 038 713 6878 / 076 877 4619"
          />
        </section>
      </main>

      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => navigate("/login")}
        />
      )}
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  error,
  helperText,
}) {
  return (
    <label className="block">
      <p className="font-bold text-sm mb-2">{label}</p>

      <div
        className={`h-12 rounded-xl px-4 flex items-center gap-2 bg-white border ${
          error ? "border-red-500" : "border-[#eadfcd]"
        }`}
      >
        <span className="text-green-900/60">{icon}</span>

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-green-950 placeholder:text-[#8b978f]"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}

      {!error && helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </label>
  );
}

function AreaCard({ active, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-[95px] rounded-xl border p-4 text-left transition ${
        active
          ? "border-green-800 bg-green-50"
          : "border-[#eadfcd] bg-white hover:bg-[#fbf7ec]"
      }`}
    >
      {active && (
        <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-green-800 text-white text-xs flex items-center justify-center">
          ✓
        </span>
      )}

      <div className="pt-5">
        <p className="font-black text-green-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{text}</p>
      </div>
    </button>
  );
}

function Legend({ color, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded ${color}`}></span>
      <span>{text}</span>
    </div>
  );
}

function ServiceItem({ icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eadfcd] flex items-center gap-4 hover:shadow-md transition">
      <div className="w-12 h-12 rounded-full bg-[#fff8ea] flex items-center justify-center text-[#b88935]">
        {icon}
      </div>

      <div>
        <p className="font-black text-green-900 text-sm">{title}</p>

        <p className="text-xs text-gray-600 mt-1">{text}</p>
      </div>
    </div>
  );
}

export default BookingPage;
