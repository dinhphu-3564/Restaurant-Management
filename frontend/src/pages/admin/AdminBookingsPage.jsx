import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarCheck,
  Clock3,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  CalendarDays,
  Users,
  Phone,
  Mail,
  MapPin,
  Utensils,
  X,
  Check,
} from "lucide-react";

function AdminBookingsPage() {
  const { globalSearch, dateRange } = useOutletContext();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [guestFilter, setGuestFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);

  const [editForm, setEditForm] = useState({
    status: "pending",
    selectedAreaTitle: "",
    selectedTable: "",
    note: "",
  });

  const pageSize = 10;

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    setBookings(savedBookings);
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + "đ";

  const formatDate = (value) => {
    if (!value) return "Chưa có";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      { hour: "2-digit", minute: "2-digit" },
    )}`;
  };

  const removeVietnameseTones = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
      case "canceled":
        return "Đã hủy";
      default:
        return status || "Chờ xác nhận";
    }
  };

  const getStatusStyle = (status) => {
    const text = getStatusText(status);

    if (text === "Hoàn thành") return "bg-green-50 text-green-700";
    if (text === "Đã hủy") return "bg-red-50 text-red-600";
    if (text === "Đã xác nhận") return "bg-blue-50 text-blue-600";

    return "bg-orange-50 text-orange-600";
  };

  const getTypeText = (booking) => {
    if (booking.type === "table_with_order") return "Từ Checkout";
    if (booking.type === "table_with_food") return "Kèm món";
    return "Chỉ đặt bàn";
  };

  const getTypeStyle = (booking) => {
    if (booking.type === "table_with_order")
      return "bg-purple-50 text-purple-600";

    if (booking.type === "table_with_food") return "bg-green-50 text-green-700";

    return "bg-blue-50 text-blue-600";
  };

  const updateBookingStatus = (id, status) => {
    const updatedAt = new Date().toISOString();

    const newBookings = bookings.map((item) =>
      String(item.id) === String(id) ? { ...item, status, updatedAt } : item,
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    setSelectedBooking((prev) =>
      prev && String(prev.id) === String(id)
        ? { ...prev, status, updatedAt }
        : prev,
    );
  };
  //hàm mở popup sửa
  const openEditBookingModal = (booking) => {
    setEditingBooking(booking);

    setEditForm({
      status: booking.status || "pending",
      selectedAreaTitle: booking.selectedAreaTitle || booking.area || "",
      selectedTable: booking.selectedTable || "",
      note: booking.note || "",
    });
  };
  //hàm lưu chỉnh sửa
  const saveEditBooking = () => {
    if (!editingBooking) return;

    const newBookings = bookings.map((booking) =>
      String(booking.id) === String(editingBooking.id)
        ? {
            ...booking,
            status: editForm.status,
            selectedAreaTitle: editForm.selectedAreaTitle,
            selectedTable: editForm.selectedTable,
            note: editForm.note,
            updatedAt: new Date().toISOString(),
          }
        : booking,
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    setSelectedBooking((prev) =>
      prev && String(prev.id) === String(editingBooking.id)
        ? {
            ...prev,
            status: editForm.status,
            selectedAreaTitle: editForm.selectedAreaTitle,
            selectedTable: editForm.selectedTable,
            note: editForm.note,
            updatedAt: new Date().toISOString(),
          }
        : prev,
    );

    setEditingBooking(null);
  };
  //hàm hủy đặt bàn
  const cancelBookingByTrash = (booking) => {
    const confirmCancel = window.confirm(
      `Bạn có chắc muốn hủy đặt bàn DB${booking.id}?`,
    );

    if (!confirmCancel) return;

    updateBookingStatus(booking.id, "cancelled");
  };

  const deleteBooking = (id) => {
    const newBookings = bookings.filter(
      (item) => String(item.id) !== String(id),
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    if (String(selectedBooking?.id) === String(id)) {
      setSelectedBooking(newBookings[0] || null);
    }
  };

  //checkbox từng dòng
  const toggleSelectBooking = (bookingId) => {
    setSelectedBookingIds((prev) =>
      prev.includes(String(bookingId))
        ? prev.filter((id) => id !== String(bookingId))
        : [...prev, String(bookingId)],
    );
  };
  //checkbox chọn tất cả trang hiện tại
  const toggleSelectAllCurrentPage = () => {
    const currentIds = paginatedBookings.map((booking) => String(booking.id));

    const isSelectedAll = currentIds.every((id) =>
      selectedBookingIds.includes(id),
    );

    if (isSelectedAll) {
      setSelectedBookingIds((prev) =>
        prev.filter((id) => !currentIds.includes(id)),
      );
    } else {
      setSelectedBookingIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };
  //hàm cập nhật trạng thái nhiều
  const updateSelectedBookingsStatus = (status) => {
    if (selectedBookingIds.length === 0) return;

    const statusText = getStatusText(status);

    const confirmUpdate = window.confirm(
      `Bạn có chắc muốn chuyển ${selectedBookingIds.length} đặt bàn sang trạng thái "${statusText}"?`,
    );

    if (!confirmUpdate) return;

    const updatedAt = new Date().toISOString();

    const newBookings = bookings.map((booking) =>
      selectedBookingIds.includes(String(booking.id))
        ? { ...booking, status, updatedAt }
        : booking,
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    setSelectedBooking((prev) =>
      prev && selectedBookingIds.includes(String(prev.id))
        ? { ...prev, status, updatedAt }
        : prev,
    );

    setSelectedBookingIds([]);
  };
  //hàm xóa nhiều
  const deleteSelectedBookings = () => {
    if (selectedBookingIds.length === 0) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa ${selectedBookingIds.length} đặt bàn đã chọn?`,
    );

    if (!confirmDelete) return;

    const newBookings = bookings.filter(
      (booking) => !selectedBookingIds.includes(String(booking.id)),
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    if (
      selectedBooking &&
      selectedBookingIds.includes(String(selectedBooking.id))
    ) {
      setSelectedBooking(null);
    }

    setSelectedBookingIds([]);
  };

  const todayString = new Date().toISOString().split("T")[0];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowString = tomorrowDate.toISOString().split("T")[0];

  const totalBookings = bookings.length;

  const pendingCount = bookings.filter(
    (item) => getStatusText(item.status) === "Chờ xác nhận",
  ).length;

  const confirmedCount = bookings.filter(
    (item) => getStatusText(item.status) === "Đã xác nhận",
  ).length;

  const completedCount = bookings.filter(
    (item) => getStatusText(item.status) === "Hoàn thành",
  ).length;

  const cancelledCount = bookings.filter(
    (item) => getStatusText(item.status) === "Đã hủy",
  ).length;

  const todayCount = bookings.filter(
    (item) => item.date === todayString,
  ).length;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = removeVietnameseTones(globalSearch || search);
      const rawKeyword = (globalSearch || search).toLowerCase().trim();

      const bookingId = String(booking.id || "");
      const customerName =
        booking.customerName || booking.fullName || booking.name || "";
      const phone = booking.phone || "";

      const matchSearch =
        !keyword ||
        removeVietnameseTones(customerName).includes(keyword) ||
        phone.includes(rawKeyword) ||
        bookingId.toLowerCase().includes(rawKeyword);

      let matchDate = true;

      if (dateRange?.startDate || dateRange?.endDate) {
        const bookingDate = new Date(booking.date);

        const start = dateRange.startDate
          ? new Date(dateRange.startDate)
          : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        matchDate =
          (!start || bookingDate >= start) && (!end || bookingDate <= end);
      }

      const areaName = booking.selectedAreaTitle || booking.area || "";
      const matchArea =
        areaFilter === "all" ||
        removeVietnameseTones(areaName).includes(
          removeVietnameseTones(areaFilter),
        );

      const matchStatus =
        statusFilter === "all" ||
        getStatusText(booking.status) === statusFilter;

      const matchType =
        typeFilter === "all" ||
        (typeFilter === "table_only" &&
          getTypeText(booking) === "Chỉ đặt bàn") ||
        (typeFilter === "table_with_food" &&
          getTypeText(booking) === "Kèm món") ||
        (typeFilter === "table_with_order" &&
          getTypeText(booking) === "Từ Checkout");

      const guests = Number(booking.guests || booking.people || 0);

      const matchGuest =
        guestFilter === "all" ||
        (guestFilter === "1-2" && guests >= 1 && guests <= 2) ||
        (guestFilter === "3-5" && guests >= 3 && guests <= 5) ||
        (guestFilter === "6-10" && guests >= 6 && guests <= 10) ||
        (guestFilter === "10+" && guests > 10);

      const matchTab =
        activeTab === "all" ||
        (activeTab === "pending" &&
          getStatusText(booking.status) === "Chờ xác nhận") ||
        (activeTab === "today" && booking.date === todayString) ||
        (activeTab === "tomorrow" && booking.date === tomorrowString);

      return (
        matchSearch &&
        matchDate &&
        matchArea &&
        matchStatus &&
        matchType &&
        matchGuest &&
        matchTab
      );
    });
  }, [
    bookings,
    search,
    globalSearch,
    dateRange,
    areaFilter,
    statusFilter,
    typeFilter,
    guestFilter,
    activeTab,
  ]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilter = () => {
    setSearch("");
    setAreaFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setGuestFilter("all");
    setActiveTab("all");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    globalSearch,
    dateRange,
    areaFilter,
    statusFilter,
    typeFilter,
    guestFilter,
    activeTab,
  ]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <BookingStatCard
          icon={<CalendarCheck />}
          title="Tổng đặt bàn"
          value={totalBookings}
          bg="bg-green-50"
          color="text-green-700"
        />

        <BookingStatCard
          icon={<Clock3 />}
          title="Chờ xác nhận"
          value={pendingCount}
          bg="bg-orange-50"
          color="text-orange-600"
        />

        <BookingStatCard
          icon={<CalendarDays />}
          title="Lịch hôm nay"
          value={todayCount}
          bg="bg-blue-50"
          color="text-blue-600"
        />

        <BookingStatCard
          icon={<CheckCircle />}
          title="Hoàn thành"
          value={completedCount}
          bg="bg-green-50"
          color="text-green-600"
        />

        <BookingStatCard
          icon={<XCircle />}
          title="Đã hủy"
          value={cancelledCount}
          bg="bg-red-50"
          color="text-red-600"
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 items-start ${
          selectedBooking ? "xl:grid-cols-[minmax(0,1fr)_340px]" : ""
        }`}
      >
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 border-b border-gray-100">
            <div className="flex items-center gap-8 overflow-x-auto">
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              >
                Tất cả đặt bàn
              </TabButton>

              <TabButton
                active={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
              >
                Chờ xác nhận ({pendingCount})
              </TabButton>

              <TabButton
                active={activeTab === "today"}
                onClick={() => setActiveTab("today")}
              >
                Lịch đặt hôm nay
              </TabButton>

              <TabButton
                active={activeTab === "tomorrow"}
                onClick={() => setActiveTab("tomorrow")}
              >
                Lịch đặt ngày mai
              </TabButton>
            </div>
          </div>

          <div className="p-4">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
                selectedBooking
                  ? "xl:grid-cols-[220px_105px_105px_105px_105px_60px]"
                  : "xl:grid-cols-[380px_140px_140px_140px_140px_80px] 2xl:grid-cols-[420px_170px_170px_170px_170px_90px]"
              }`}
            >
              <div className="h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo mã, tên, SĐT..."
                  className="w-full outline-none text-sm"
                />

                <Search size={18} className="text-gray-400" />
              </div>

              <SelectBox
                label="Khu vực"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="tầng trệt">Tầng trệt</option>
                <option value="tầng 2">Tầng 2</option>
                <option value="vip">Phòng VIP</option>
              </SelectBox>

              <SelectBox
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </SelectBox>

              <SelectBox
                label="Loại đặt bàn"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="table_only">Chỉ đặt bàn</option>
                <option value="table_with_food">Kèm món</option>
                <option value="table_with_order">Từ Checkout</option>
              </SelectBox>

              <SelectBox
                label="Số khách"
                value={guestFilter}
                onChange={(e) => setGuestFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="1-2">1 - 2 khách</option>
                <option value="3-5">3 - 5 khách</option>
                <option value="6-10">6 - 10 khách</option>
                <option value="10+">Trên 10 khách</option>
              </SelectBox>

              <button
                onClick={resetFilter}
                className="h-12 px-2 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition"
              >
                <RotateCcw size={15} />
                <span className={selectedBooking ? "hidden 2xl:inline" : ""}>
                  Xóa
                </span>
              </button>
            </div>
          </div>
          {/* thanh thao tác hàng loạt */}
          {selectedBookingIds.length > 0 && (
            <div className="mx-4 mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-green-800">
                Đã chọn {selectedBookingIds.length} đặt bàn
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updateSelectedBookingsStatus("confirmed")}
                  className="h-10 px-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-sm font-black hover:bg-blue-100 transition"
                >
                  Xác nhận
                </button>

                <button
                  onClick={() => updateSelectedBookingsStatus("completed")}
                  className="h-10 px-4 rounded-xl bg-green-100 text-green-700 border border-green-200 text-sm font-black hover:bg-green-200 transition"
                >
                  Hoàn thành
                </button>

                <button
                  onClick={() => updateSelectedBookingsStatus("cancelled")}
                  className="h-10 px-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 text-sm font-black hover:bg-orange-100 transition"
                >
                  Hủy bàn
                </button>

                <button
                  onClick={deleteSelectedBookings}
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-black hover:bg-red-100 transition"
                >
                  Xóa
                </button>

                <button
                  onClick={() => setSelectedBookingIds([])}
                  className="h-10 px-4 rounded-xl bg-white text-gray-500 border border-gray-100 text-sm font-black hover:bg-gray-50 transition"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
                <tr>
                  <th className="w-[50px] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        paginatedBookings.length > 0 &&
                        paginatedBookings.every((booking) =>
                          selectedBookingIds.includes(String(booking.id)),
                        )
                      }
                      onChange={toggleSelectAllCurrentPage}
                      className="w-4 h-4 accent-green-700"
                    />
                  </th>
                  <th className="px-4 py-3">Mã đặt bàn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Giờ</th>
                  <th className="px-4 py-3">Số khách</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Bàn</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking, index) => (
                    <tr
                      key={booking.id || index}
                      onClick={() => setSelectedBooking(booking)}
                      className={`border-t border-gray-100 hover:bg-green-50/30 transition cursor-pointer ${
                        String(selectedBooking?.id) === String(booking.id)
                          ? "bg-green-50/50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedBookingIds.includes(
                            String(booking.id),
                          )}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleSelectBooking(booking.id)}
                          className="w-4 h-4 accent-green-700"
                        />
                      </td>

                      <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap">
                        DB{booking.id}
                      </td>

                      <td className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap">
                        {booking.customerName || booking.name || "Khách hàng"}
                      </td>

                      <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                        {booking.phone || "Chưa có"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(booking.date)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {booking.time || "Chưa có"}
                      </td>

                      <td className="px-4 py-3 font-black">
                        {booking.guests || 0}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {booking.selectedAreaTitle ||
                          booking.area ||
                          "Nhà hàng sắp xếp"}
                      </td>

                      <td className="px-4 py-3 font-bold">
                        {booking.selectedTable || "Đang xếp"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getTypeStyle(
                            booking,
                          )}`}
                        >
                          {getTypeText(booking)}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-black text-green-950 whitespace-nowrap">
                        {formatPrice(booking.total)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex justify-center min-w-[105px] px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(
                            booking.status,
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-100"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditBookingModal(booking);
                            }}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelBookingByTrash(booking);
                            }}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="13"
                      className="px-5 py-14 text-center text-gray-400 font-bold"
                    >
                      Chưa có lịch đặt bàn phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <p className="text-gray-600 font-bold">
              Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredBookings.length)} trong
              tổng số {filteredBookings.length} đặt bàn
            </p>

            {totalPages > 0 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg border font-black transition ${
                      currentPage === page
                        ? "bg-green-700 text-white border-green-700"
                        : "border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </section>

        {selectedBooking && (
          <BookingDetailPanel
            booking={selectedBooking}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            formatPrice={formatPrice}
            getStatusText={getStatusText}
            getStatusStyle={getStatusStyle}
            getTypeText={getTypeText}
            onClose={() => setSelectedBooking(null)}
            onConfirm={() =>
              updateBookingStatus(selectedBooking.id, "confirmed")
            }
            onComplete={() =>
              updateBookingStatus(selectedBooking.id, "completed")
            }
            onCancel={() =>
              updateBookingStatus(selectedBooking.id, "cancelled")
            }
          />
        )}
      </div>
      {editingBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-green-950">
                  Chỉnh sửa đặt bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  DB{editingBooking.id}
                </p>
              </div>

              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-black text-gray-500">
                  Trạng thái
                </span>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-gray-500">
                  Khu vực
                </span>
                <select
                  value={editForm.selectedAreaTitle}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      selectedAreaTitle: e.target.value,
                    }))
                  }
                  className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                >
                  <option value="">Nhà hàng sắp xếp</option>
                  <option value="Tầng trệt">Tầng trệt</option>
                  <option value="Khu vực tầng 2">Khu vực tầng 2</option>
                  <option value="Phòng VIP">Phòng VIP</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-gray-500">Bàn</span>
                <input
                  value={editForm.selectedTable}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      selectedTable: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: 302"
                  className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-gray-500">
                  Ghi chú
                </span>
                <textarea
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Nhập ghi chú đặt bàn..."
                  className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                />
              </label>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingBooking(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveEditBooking}
                className="h-11 px-5 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingDetailPanel({
  booking,
  formatDate,
  formatDateTime,
  formatPrice,
  getStatusText,
  getStatusStyle,
  getTypeText,
  onClose,
  onConfirm,
  onComplete,
  onCancel,
}) {
  if (!booking) {
    return (
      <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400 font-bold">
        Chọn một lịch đặt bàn để xem chi tiết
      </aside>
    );
  }

  const foods = booking.cartItems || booking.items || [];

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden 2xl:sticky 2xl:top-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-green-950">Chi tiết đặt bàn</h3>

        <button onClick={onClose} className="text-gray-400 hover:text-red-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-black text-gray-400">Mã đặt bàn</p>

            <span
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(
                booking.status,
              )}`}
            >
              {getStatusText(booking.status)}
            </span>
          </div>

          <h2 className="text-2xl font-black text-green-950 mt-1 break-all leading-tight">
            DB{booking.id}
          </h2>

          <p className="text-xs text-gray-500 font-semibold mt-2">
            Tạo lúc: {formatDateTime(booking.createdAt)}
          </p>

          <p className="text-xs text-gray-400 font-semibold mt-1">
            Cập nhật: {formatDateTime(booking.updatedAt || booking.createdAt)}
          </p>
        </div>

        <DetailBlock icon={<Users />} title="Thông tin khách hàng">
          <DetailRow
            label="Họ tên"
            value={booking.customerName || booking.name || "Chưa có"}
          />
          <DetailRow label="SĐT" value={booking.phone || "Chưa có"} />
          <DetailRow label="Email" value={booking.email || "Chưa có"} />
        </DetailBlock>

        <DetailBlock icon={<CalendarDays />} title="Thông tin đặt bàn">
          <DetailRow label="Ngày" value={formatDate(booking.date)} />
          <DetailRow label="Giờ" value={booking.time || "Chưa có"} />
          <DetailRow label="Số khách" value={`${booking.guests || 0} người`} />
          <DetailRow
            label="Khu vực"
            value={
              booking.selectedAreaTitle || booking.area || "Nhà hàng sắp xếp"
            }
          />
          <DetailRow
            label="Bàn"
            value={booking.selectedTable || "Đang sắp xếp"}
          />
          <DetailRow label="Loại đặt" value={getTypeText(booking)} />
          <DetailRow label="Ghi chú" value={booking.note || "Không có"} />
        </DetailBlock>

        <DetailBlock icon={<Utensils />} title="Thông tin món ăn">
          {foods.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_46px_90px_90px] gap-2 text-xs font-black text-gray-500">
                <span>Món ăn</span>
                <span>SL</span>
                <span>Đơn giá</span>
                <span className="text-right">Thành tiền</span>
              </div>

              {foods.map((food, index) => (
                <div
                  key={food.id || index}
                  className="grid grid-cols-[1fr_46px_90px_90px] gap-2 text-xs font-semibold text-gray-700"
                >
                  <span>{food.name}</span>
                  <span>{food.qty || 1}</span>
                  <span>{formatPrice(food.price)}</span>
                  <span className="text-right">
                    {formatPrice(
                      Number(food.price || 0) * Number(food.qty || 1),
                    )}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-100 flex justify-between font-black text-green-800">
                <span>Tổng tiền</span>
                <span>{formatPrice(booking.total)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-bold">
              Khách chỉ đặt bàn, chưa chọn món.
            </p>
          )}
        </DetailBlock>

        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={onConfirm}
            disabled={booking.status === "confirmed"}
            className="
      h-11 rounded-xl
      bg-blue-50 text-blue-700
      border border-blue-100
      text-sm font-black
      hover:bg-blue-100
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center justify-center gap-1
      transition
    "
          >
            <Check size={16} />
            Xác nhận
          </button>

          <button
            onClick={onComplete}
            disabled={booking.status === "completed"}
            className="
      h-11 rounded-xl
      bg-green-50 text-green-700
      border border-green-100
      text-sm font-black
      hover:bg-green-100
      disabled:opacity-50 disabled:cursor-not-allowed
      transition
    "
          >
            Hoàn thành
          </button>

          <button
            onClick={onCancel}
            disabled={booking.status === "cancelled"}
            className="
      col-span-2
      h-11 rounded-xl
      bg-red-50 text-red-600
      border border-red-100
      text-sm font-black
      hover:bg-red-100
      disabled:opacity-50 disabled:cursor-not-allowed
      transition
    "
          >
            Hủy bàn
          </button>
        </div>
      </div>
    </aside>
  );
}

function BookingStatCard({ icon, title, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[96px] hover:bg-green-50/40 hover:border-green-100 hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-gray-500 font-bold text-sm leading-tight">
            {title}
          </p>
          <h3 className="text-2xl font-black text-green-950 mt-1">{value}</h3>
          <p className="text-green-600 text-[11px] font-black mt-1">
            ↑ so với hôm qua
          </p>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-14 px-3 border-b-2 font-black whitespace-nowrap transition ${
        active
          ? "border-green-700 text-green-700 bg-green-50/40"
          : "border-transparent text-gray-500 hover:text-green-700 hover:bg-green-50/40"
      }`}
    >
      {children}
    </button>
  );
}

function SelectBox({ label, value, onChange, children }) {
  return (
    <label className="h-12 rounded-xl border border-gray-100 bg-white px-3 flex flex-col justify-center shadow-sm min-w-0">
      <span className="text-[11px] font-black text-gray-400">{label}</span>

      <select
        value={value}
        onChange={onChange}
        className="outline-none bg-transparent text-sm font-bold text-gray-700 min-w-0"
      >
        {children}
      </select>
    </label>
  );
}

function DetailBlock({ icon, title, children }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h4 className="font-black text-green-800 mb-3 flex items-center gap-2">
        <span className="text-green-700">{icon}</span>
        {title}
      </h4>

      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-bold">{value}</span>
    </div>
  );
}

export default AdminBookingsPage;
