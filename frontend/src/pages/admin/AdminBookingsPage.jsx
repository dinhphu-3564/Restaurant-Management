import { useMemo, useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { tableService } from "../../services/tableService";
import { bookingService } from "../../services/bookingService";
import { socket } from "../../utils/socket";
import { showAdminToast } from "../../components/admin/AdminToast";
import { removeVietnameseTones } from "../../utils/string";
import { getCurrentUser } from "../../utils/auth";
import { canUseAction } from "../../utils/permissions";
import { sortAreasByPriority } from "../../utils/tableHelpers";
import {
  normalizeTableStatus, getStatusText, getStatusStyle,
  getTypeText, getTypeStyle, formatPrice,
  formatDateBooking, formatDateTimeBooking, isActiveBooking,
} from "../../utils/bookingHelpers";
import {
  BookingDetailPanel, BookingStatCard, TabButton, SelectBox,
} from "../../components/admin/AdminBookingComponents";
import GlobalPagination from "../../components/admin/GlobalPagination";
import AdminBookingModals from "../../components/admin/AdminBookingModals";
import {
  CalendarCheck, Clock3, CheckCircle, XCircle, Search, Eye,
  Pencil, Trash2, RotateCcw, CalendarDays, Users, X,
} from "lucide-react";

function AdminBookingsPage() {
  const currentUser = getCurrentUser();
  const { globalSearch, dateRange } = useOutletContext();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // ─── State ────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState(initialSearch);
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [guestFilter, setGuestFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const [addForm, setAddForm] = useState({
    customerName: "", phone: "", email: "", date: "", time: "",
    guests: 1, selectedArea: "", selectedAreaTitle: "", selectedTable: "", note: "", status: "pending",
  });

  const [editForm, setEditForm] = useState({
    status: "pending", date: "", selectedArea: "", selectedAreaTitle: "", selectedTable: "", note: "",
  });

  const [errors, setErrors] = useState({});

  // ─── Data Loading ─────────────────────────────────────────────────
  const loadTableLayout = async () => {
    try {
      const [apiAreas, apiTables] = await Promise.all([tableService.getAreas(), tableService.getTables()]);
      const nextAreas = sortAreasByPriority(
        apiAreas.map((area) => ({ ...area, id: String(area.id), name: area.name || area.title || "Khu vực" }))
      );
      const nextTables = apiTables.map((table) => ({
        ...table,
        id: String(table.id || table.code),
        code: String(table.code || table.tableCode || table.name || table.id),
        areaId: String(table.areaId),
        areaName: table.areaName || "",
        status: normalizeTableStatus(table.status),
        capacity: Number(table.capacity || table.seats || 4),
      }));
      setAreas(nextAreas);
      setTables(nextTables);
      return { areas: nextAreas, tables: nextTables };
    } catch (error) {
      console.error(error);
      setAreas([]); setTables([]);
      return { areas: [], tables: [] };
    }
  };

  const loadBookings = async () => {
    try {
      const [apiBookings] = await Promise.all([bookingService.getBookings(), loadTableLayout()]);
      setBookings(apiBookings);
      const viewId = searchParams.get("view");
      if (viewId) {
        const bookingToView = apiBookings.find((b) => String(b.id) === String(viewId));
        if (bookingToView) setSelectedBooking(bookingToView);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể tải danh sách đặt bàn.");
    }
  };

  useEffect(() => {
    loadBookings();
    window.addEventListener("bookingsUpdated", loadBookings);
    window.addEventListener("tablesUpdated", loadBookings);
    socket.on("table_updated", loadBookings);
    return () => {
      window.removeEventListener("bookingsUpdated", loadBookings);
      window.removeEventListener("tablesUpdated", loadBookings);
      socket.off("table_updated", loadBookings);
    };
  }, []);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam !== null) setSearch(searchParam);
  }, [searchParams]);

  useEffect(() => {
    const viewId = searchParams.get("view");
    if (viewId && bookings.length > 0) {
      const bookingToView = bookings.find((b) => String(b.id) === String(viewId));
      if (bookingToView) setSelectedBooking(bookingToView);
    }
  }, [searchParams, bookings]);

  useEffect(() => {
    const openAddBookingModal = async () => {
      if (!canUseAction(currentUser, "bookings:create")) {
        showAdminToast({ title: "Từ chối", message: "Bạn không có quyền thêm đặt bàn.", type: "error" });
        return;
      }
      const layout = await loadTableLayout();
      const firstArea = layout.areas[0];
      setAddForm((prev) => ({
        ...prev, date: prev.date || new Date().toISOString().split("T")[0],
        selectedArea: firstArea?.id || "", selectedAreaTitle: firstArea?.name || "", selectedTable: "",
      }));
      setIsAddingBooking(true);
    };
    window.addEventListener("openAddBookingModal", openAddBookingModal);
    return () => window.removeEventListener("openAddBookingModal", openAddBookingModal);
  }, []);

  // ─── Date Constants ───────────────────────────────────────────────
  const todayString = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowString = tomorrowDate.toISOString().split("T")[0];

  // ─── Stats ────────────────────────────────────────────────────────
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((item) => getStatusText(item.status) === "Chờ xác nhận").length;
  const confirmedCount = bookings.filter((item) => getStatusText(item.status) === "Đã xác nhận").length;
  const completedCount = bookings.filter((item) => getStatusText(item.status) === "Hoàn thành").length;
  const cancelledCount = bookings.filter((item) => getStatusText(item.status) === "Đã hủy").length;
  const todayCount = bookings.filter((item) => item.date === todayString).length;

  // ─── Filters ──────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = removeVietnameseTones(globalSearch || search);
      const rawKeyword = (globalSearch || search).toLowerCase().trim();
      const bookingId = String(booking.id || "");
      const customerName = booking.customerName || booking.fullName || booking.name || "";
      const phone = booking.phone || "";
      const matchSearch = !keyword || removeVietnameseTones(customerName).includes(keyword) || phone.includes(rawKeyword) || bookingId.toLowerCase().includes(rawKeyword);

      let matchDate = true;
      if (dateRange?.startDate || dateRange?.endDate) {
        const bookingDate = new Date(booking.date);
        const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        matchDate = (!start || bookingDate >= start) && (!end || bookingDate <= end);
      }

      const areaName = booking.selectedAreaTitle || booking.area || "";
      const matchArea = areaFilter === "all" || removeVietnameseTones(areaName).includes(removeVietnameseTones(areaFilter));
      const matchStatus = statusFilter === "all" || getStatusText(booking.status) === statusFilter;
      const matchType = typeFilter === "all" ||
        (typeFilter === "table_only" && getTypeText(booking) === "Chỉ đặt bàn") ||
        (typeFilter === "table_with_food" && getTypeText(booking) === "Kèm món") ||
        (typeFilter === "table_with_order" && getTypeText(booking) === "Từ Checkout");

      const guests = Number(booking.guests || booking.people || 0);
      const matchGuest = guestFilter === "all" ||
        (guestFilter === "1-2" && guests >= 1 && guests <= 2) ||
        (guestFilter === "3-5" && guests >= 3 && guests <= 5) ||
        (guestFilter === "6-10" && guests >= 6 && guests <= 10) ||
        (guestFilter === "10+" && guests > 10);

      const matchTab = activeTab === "all" ||
        (activeTab === "pending" && getStatusText(booking.status) === "Chờ xác nhận") ||
        (activeTab === "today" && booking.date === todayString) ||
        (activeTab === "tomorrow" && booking.date === tomorrowString);

      return matchSearch && matchDate && matchArea && matchStatus && matchType && matchGuest && matchTab;
    });
  }, [bookings, search, globalSearch, dateRange, areaFilter, statusFilter, typeFilter, guestFilter, activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  useEffect(() => setCurrentPage(1), [search, globalSearch, dateRange, areaFilter, statusFilter, typeFilter, guestFilter, activeTab]);

  const resetFilter = () => { setSearch(""); setAreaFilter("all"); setStatusFilter("all"); setTypeFilter("all"); setGuestFilter("all"); setActiveTab("all"); };

  // ─── Booking Actions ──────────────────────────────────────────────
  const updateBookingStatus = async (id, status) => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((item) => String(item.id) === String(id) ? updatedBooking : item));
      setSelectedBooking((prev) => prev && String(prev.id) === String(id) ? updatedBooking : prev);
      showAdminToast({ title: "Cập nhật trạng thái thành công", message: `Đã chuyển đặt bàn ${updatedBooking.bookingCode || `DB${updatedBooking.id}`} sang "${getStatusText(status)}".` });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật trạng thái đặt bàn."); }
  };

  const openEditBookingModal = (booking) => {
    setEditingBooking(booking);
    const areaTitle = booking.selectedAreaTitle || booking.area || "";
    const matchedArea = areas.find((area) => String(area.id) === String(booking.selectedArea) || area.name === areaTitle);
    setEditForm({ status: booking.status || "pending", date: booking.date || "", selectedArea: booking.selectedArea || matchedArea?.id || "", selectedAreaTitle: areaTitle || matchedArea?.name || "", selectedTable: booking.selectedTable || "", note: booking.note || "" });
  };

  // ─── Edit Table Logic ─────────────────────────────────────────────
  const getTableBookingAtDate = (tableCode, date) => {
    if (!date) return null;
    return bookings.find((booking) => String(booking.id) !== String(editingBooking?.id) && isActiveBooking(booking) && String(booking.selectedTable) === String(tableCode) && booking.date === date);
  };

  const getTableStatusForEdit = (table) => {
    const bookingAtDate = getTableBookingAtDate(table.code, editForm.date);
    if (bookingAtDate?.status === "pending" || bookingAtDate?.status === "Chờ xác nhận") return "holding";
    if (["confirmed", "Đã xác nhận", "serving", "Đang phục vụ"].includes(bookingAtDate?.status)) return "booked";
    return table.status;
  };

  const getEditGuestCount = () => Number(editingBooking?.guests || editingBooking?.people || 0);

  const findBestTableForEditBooking = () => {
    const guestCount = getEditGuestCount();
    return tables.filter((table) => {
      const sameArea = String(table.areaId) === String(editForm.selectedArea);
      const available = getTableStatusForEdit(table) === "available";
      const enoughCapacity = guestCount <= 0 || Number(table.capacity || 0) >= guestCount;
      return sameArea && available && enoughCapacity;
    }).sort((a, b) => {
      const diff = Number(a.capacity || 0) - Number(b.capacity || 0);
      return diff !== 0 ? diff : String(a.code || "").localeCompare(String(b.code || ""), "vi", { numeric: true });
    })[0] || null;
  };

  const handleSelectTableForEditBooking = (table, rawStatus, currentTable) => {
    if (currentTable || rawStatus !== "available") return;
    const guestCount = getEditGuestCount();
    const tableCapacity = Number(table.capacity || 0);
    if (guestCount > 0 && tableCapacity < guestCount) {
      const suggestedTable = findBestTableForEditBooking();
      if (suggestedTable) {
        const shouldSwitch = window.confirm(`Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người, nhưng lịch đặt này có ${guestCount} khách.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`);
        if (shouldSwitch) setEditForm((prev) => ({ ...prev, selectedTable: suggestedTable.code }));
        return;
      }
      alert(`Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người. Hiện khu vực này không có bàn phù hợp cho ${guestCount} khách.`);
      return;
    }
    setEditForm((prev) => ({ ...prev, selectedTable: table.code }));
  };

  const saveEditBooking = async () => {
    if (!editingBooking) return;
    const guestCount = getEditGuestCount();
    if (!editForm.date) { alert("Vui lòng chọn ngày đặt bàn."); return; }
    if (editForm.status === "confirmed" && !editForm.selectedTable) { alert("Vui lòng chọn bàn trước khi xác nhận đặt bàn."); return; }
    if (editForm.selectedTable) {
      const selectedTableData = tables.find((table) => String(table.code) === String(editForm.selectedTable) && String(table.areaId) === String(editForm.selectedArea));
      if (!selectedTableData) { alert("Bàn đã chọn không hợp lệ. Vui lòng chọn lại."); return; }
      if (guestCount > Number(selectedTableData.capacity || 0)) {
        const suggestedTable = findBestTableForEditBooking();
        if (suggestedTable) {
          const shouldSwitch = window.confirm(`Bàn ${selectedTableData.code} chỉ chứa tối đa ${selectedTableData.capacity} người, nhưng lịch đặt này có ${guestCount} khách.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`);
          if (shouldSwitch) setEditForm((prev) => ({ ...prev, selectedTable: suggestedTable.code }));
          return;
        }
        alert(`Khu vực này không có bàn phù hợp cho ${guestCount} khách. Vui lòng chọn khu vực khác.`);
        return;
      }
    }
    try {
      const updatedBooking = await bookingService.updateBooking(editingBooking.id, { status: editForm.status, date: editForm.date, time: editForm.time || editingBooking.time, selectedArea: editForm.selectedArea, selectedAreaTitle: editForm.selectedAreaTitle, selectedTable: editForm.selectedTable, note: editForm.note });
      setBookings((prev) => prev.map((booking) => String(booking.id) === String(editingBooking.id) ? updatedBooking : booking));
      setSelectedBooking((prev) => prev && String(prev.id) === String(editingBooking.id) ? updatedBooking : prev);
      showAdminToast({ title: "Lưu thay đổi thành công", message: `Đã cập nhật đặt bàn ${updatedBooking.bookingCode || `DB${updatedBooking.id}`}.` });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
      setEditingBooking(null);
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật đặt bàn."); }
  };

  // ─── Delete / Bulk ────────────────────────────────────────────────
  const executeDeleteBooking = async (id) => {
    try {
      await bookingService.deleteBooking(id);
      setBookings((prev) => prev.filter((booking) => String(booking.id) !== String(id)));
      setSelectedBooking((prev) => prev && String(prev.id) === String(id) ? null : prev);
      setSelectedBookingIds((prev) => prev.filter((bookingId) => String(bookingId) !== String(id)));
      showAdminToast({ title: "Xóa đặt bàn thành công", message: `Đã xóa đặt bàn DB${id}.` });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: error.message || "Không thể xóa đặt bàn.", type: "error" }); }
  };

  const deleteBooking = (id) => setDeleteConfirmBooking({ bookingId: id });

  const toggleSelectBooking = (bookingId) => setSelectedBookingIds((prev) => prev.includes(String(bookingId)) ? prev.filter((id) => id !== String(bookingId)) : [...prev, String(bookingId)]);

  const toggleSelectAllCurrentPage = () => {
    const currentIds = paginatedBookings.map((booking) => String(booking.id));
    const isSelectedAll = currentIds.every((id) => selectedBookingIds.includes(id));
    if (isSelectedAll) {
      setSelectedBookingIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedBookingIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const executeUpdateSelectedBookingsStatus = async (status) => {
    if (status === "confirmed") {
      const selectedBookings = bookings.filter((booking) => selectedBookingIds.includes(String(booking.id)));
      const bookingsWithoutTable = selectedBookings.filter((booking) => !booking.selectedTable);
      if (bookingsWithoutTable.length > 0) {
        showAdminToast({ title: "Thất bại", message: `Có ${bookingsWithoutTable.length} đặt bàn chưa được chọn bàn. Vui lòng chọn bàn trước khi xác nhận.`, type: "error" });
        return;
      }
    }
    try {
      const updatedBookings = await Promise.all(selectedBookingIds.map((id) => bookingService.updateBookingStatus(id, status)));
      const updatedMap = new Map(updatedBookings.map((booking) => [String(booking.id), booking]));
      setBookings((prev) => prev.map((booking) => updatedMap.has(String(booking.id)) ? updatedMap.get(String(booking.id)) : booking));
      setSelectedBooking((prev) => prev && updatedMap.has(String(prev.id)) ? updatedMap.get(String(prev.id)) : prev);
      showAdminToast({ title: "Cập nhật hàng loạt thành công", message: `Đã chuyển ${selectedBookingIds.length} đặt bàn sang trạng thái "${getStatusText(status)}".` });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
      setSelectedBookingIds([]);
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: error.message || "Không thể cập nhật trạng thái hàng loạt.", type: "error" }); }
  };

  const updateSelectedBookingsStatus = (status) => {
    if (selectedBookingIds.length === 0) return;
    setDeleteConfirmBooking({ bulkStatus: status });
  };

  const executeDeleteSelectedBookings = async () => {
    try {
      await Promise.all(selectedBookingIds.map((id) => bookingService.deleteBooking(id)));
      setBookings((prev) => prev.filter((booking) => !selectedBookingIds.includes(String(booking.id))));
      setSelectedBooking((prev) => prev && selectedBookingIds.includes(String(prev.id)) ? null : prev);
      showAdminToast({ title: "Xóa hàng loạt thành công", message: `Đã xóa ${selectedBookingIds.length} đặt bàn đã chọn.` });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
      setSelectedBookingIds([]);
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: error.message || "Không thể xóa các đặt bàn đã chọn.", type: "error" }); }
  };

  const deleteSelectedBookings = () => { if (selectedBookingIds.length === 0) return; setDeleteConfirmBooking({ bulk: true }); };

  // ─── Add Booking ──────────────────────────────────────────────────
  const getTableStatusForAdd = (table) => {
    if (!addForm.date) return table.status;
    const existedBooking = bookings.find((booking) => isActiveBooking(booking) && String(booking.selectedTable) === String(table.code) && booking.date === addForm.date);
    if (existedBooking?.status === "pending" || existedBooking?.status === "Chờ xác nhận") return "holding";
    if (["confirmed", "Đã xác nhận", "serving", "Đang phục vụ"].includes(existedBooking?.status)) return "booked";
    return table.status;
  };

  const saveAddBooking = async () => {
    const errs = {};
    if (!addForm.customerName.trim()) errs.customerName = "Vui lòng nhập tên khách hàng";
    if (!addForm.phone.trim()) {
      errs.phone = "Vui lòng nhập số điện thoại";
    } else {
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
      if (!phoneRegex.test(addForm.phone.trim())) {
        errs.phone = "Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)";
      }
    }
    if (!addForm.date) errs.date = "Vui lòng chọn ngày đặt bàn";
    if (!addForm.time) errs.time = "Vui lòng chọn giờ đặt bàn";
    if (!addForm.selectedTable) errs.selectedTable = "Vui lòng chọn bàn";
    const guestCount = Number(addForm.guests);
    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      errs.guests = "Số khách phải lớn hơn 0";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showAdminToast({
        title: "Lỗi nhập liệu",
        message: "Vui lòng kiểm tra các trường thông tin lỗi (được viền đỏ) và chọn bàn.",
        type: "error",
      });
      return;
    }
    setErrors({});

    const selectedTableData = tables.find((table) => String(table.code) === String(addForm.selectedTable) && String(table.areaId) === String(addForm.selectedArea));
    if (!selectedTableData) {
      showAdminToast({ title: "Lỗi dữ liệu", message: "Bàn đã chọn không hợp lệ. Vui lòng chọn lại.", type: "error" });
      setErrors({ selectedTable: true });
      return;
    }
    if (guestCount > Number(selectedTableData.capacity || 0)) {
      showAdminToast({ title: "Lỗi vượt chứa", message: `Bàn ${selectedTableData.code} chỉ chứa tối đa ${selectedTableData.capacity} người. Vui lòng chọn bàn khác phù hợp hơn.`, type: "error" });
      setErrors({ guests: "Bàn không đủ sức chứa" });
      return;
    }
    try {
      const savedBooking = await bookingService.createAdminBooking({ customerName: addForm.customerName.trim(), phone: addForm.phone.trim(), email: addForm.email.trim(), date: addForm.date, time: addForm.time, guests: Number(addForm.guests || 1), selectedArea: addForm.selectedArea, selectedAreaTitle: addForm.selectedAreaTitle, selectedTable: addForm.selectedTable, note: addForm.note.trim(), status: addForm.status, type: "table_only", total: 0 });
      setBookings((prev) => [savedBooking, ...prev]);
      setSelectedBooking(savedBooking);
      setIsAddingBooking(false);
      showAdminToast({ title: "Tạo đặt bàn thành công", message: `Đã tạo đặt bàn ${savedBooking.bookingCode || `DB${savedBooking.id}`}.` });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
      setAddForm({ customerName: "", phone: "", email: "", date: "", time: "", guests: 1, selectedArea: "", selectedAreaTitle: "", selectedTable: "", note: "", status: "pending" });
    } catch (error) { console.error(error); showAdminToast({ title: "Lỗi lưu dữ liệu", message: error.message || "Không thể tạo đặt bàn.", type: "error" }); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <BookingStatCard icon={<CalendarCheck />} title="Tổng đặt bàn" value={totalBookings} bg="bg-green-50" color="text-green-700" note="so với hôm qua" />
        <BookingStatCard icon={<Clock3 />} title="Chờ xác nhận" value={pendingCount} bg="bg-orange-50" color="text-orange-600" note="cần xử lý" />
        <BookingStatCard icon={<CalendarDays />} title="Lịch hôm nay" value={todayCount} bg="bg-blue-50" color="text-blue-600" note="so với hôm qua" />
        <BookingStatCard icon={<CheckCircle />} title="Hoàn thành" value={completedCount} bg="bg-green-50" color="text-green-600" note="so với hôm qua" />
        <BookingStatCard icon={<XCircle />} title="Đã hủy" value={cancelledCount} bg="bg-red-50" color="text-red-600" note="so với hôm qua" />
      </div>

      <div className={`grid grid-cols-1 gap-4 items-start ${selectedBooking ? "xl:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-5 border-b border-gray-100">
            <div className="flex items-center gap-8 overflow-x-auto">
              <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>Tất cả đặt bàn</TabButton>
              <TabButton active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Chờ xác nhận ({pendingCount})</TabButton>
              <TabButton active={activeTab === "today"} onClick={() => setActiveTab("today")}>Lịch đặt hôm nay</TabButton>
              <TabButton active={activeTab === "tomorrow"} onClick={() => setActiveTab("tomorrow")}>Lịch đặt ngày mai</TabButton>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${selectedBooking ? "xl:grid-cols-[220px_105px_105px_105px_105px_60px]" : "xl:grid-cols-[380px_140px_140px_140px_140px_80px] 2xl:grid-cols-[420px_170px_170px_170px_170px_90px]"}`}>
              <div className="h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo mã, tên, SĐT..." className="w-full outline-none text-sm" />
                <Search size={18} className="text-gray-400" />
              </div>
              <SelectBox label="Khu vực" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                {areas.map((area) => <option key={area.id} value={area.name}>{area.name}</option>)}
              </SelectBox>
              <SelectBox label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </SelectBox>
              <SelectBox label="Loại đặt bàn" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="table_only">Chỉ đặt bàn</option>
                <option value="table_with_food">Kèm món</option>
                <option value="table_with_order">Từ Checkout</option>
              </SelectBox>
              <SelectBox label="Số khách" value={guestFilter} onChange={(e) => setGuestFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="1-2">1 - 2 khách</option>
                <option value="3-5">3 - 5 khách</option>
                <option value="6-10">6 - 10 khách</option>
                <option value="10+">Trên 10 khách</option>
              </SelectBox>
              <button onClick={resetFilter} className="h-12 px-2 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition">
                <RotateCcw size={15} /><span className={selectedBooking ? "hidden 2xl:inline" : ""}>Xóa</span>
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedBookingIds.length > 0 && (
            <div className="mx-4 mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-primary">Đã chọn {selectedBookingIds.length} đặt bàn</p>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => updateSelectedBookingsStatus("confirmed")} className="h-10 px-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-sm font-black hover:bg-blue-100 transition">Xác nhận</button>
                <button onClick={deleteSelectedBookings} className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-black hover:bg-red-100 transition">Xóa</button>
                <button onClick={() => setSelectedBookingIds([])} className="h-10 px-4 rounded-xl bg-white text-gray-500 border border-gray-100 text-sm font-black hover:bg-gray-50 transition">Bỏ chọn</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-[#fbfcfb] text-gray-500 font-bold text-sm whitespace-nowrap">
                <tr>
                  <th className="w-[50px] px-4 py-3">
                    <input type="checkbox" checked={paginatedBookings.length > 0 && paginatedBookings.every((booking) => selectedBookingIds.includes(String(booking.id)))} onChange={toggleSelectAllCurrentPage} className="w-4 h-4 accent-green-700" />
                  </th>
                  <th className="px-4 py-3">Mã đặt bàn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3 text-center">Ngày</th>
                  <th className="px-4 py-3 text-center">Giờ</th>
                  <th className="px-4 py-3">Số khách</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Bàn</th>
                  <th className="px-4 py-3 text-center">Loại</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.length > 0 ? (
                  paginatedBookings.map((booking, index) => (
                    <tr key={booking.id || index} onClick={() => setSelectedBooking(booking)} className={`border-t border-gray-100 hover:bg-green-50/30 transition cursor-pointer ${String(selectedBooking?.id) === String(booking.id) ? "bg-green-50/50" : ""}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedBookingIds.includes(String(booking.id))} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelectBooking(booking.id)} className="w-4 h-4 accent-green-700" />
                      </td>
                      <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap">{booking.bookingCode || `DB${booking.id}`}</td>
                      <td className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap">{booking.customerName || booking.name || "Khách hàng"}</td>
                      <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{booking.phone || "Chưa có"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDateBooking(booking.date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{booking.time || "Chưa có"}</td>
                      <td className="px-4 py-3 font-black text-center">{booking.guests || 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{booking.selectedAreaTitle || booking.area || "Nhà hàng sắp xếp"}</td>
                      <td className="px-4 py-3 font-bold">{booking.selectedTable || "Đang xếp"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getTypeStyle(booking)}`}>{getTypeText(booking)}</span>
                      </td>
                      <td className="px-4 py-3 font-black text-primary whitespace-nowrap text-center">{formatPrice(booking.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex justify-center min-w-[105px] px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(booking.status)}`}>{getStatusText(booking.status)}</span>
                      </td>
                      <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }} className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-100"><Eye size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); openEditBookingModal(booking); }} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100"><Pencil size={16} /></button>
                          {canUseAction(currentUser, "bookings:delete") && (
                            <button onClick={(e) => { e.stopPropagation(); deleteBooking(booking.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100" title="Xóa lịch đặt bàn"><Trash2 size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="13" className="px-5 py-14 text-center text-gray-400 font-bold">Chưa có lịch đặt bàn phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <GlobalPagination
            total={filteredBookings.length}
            page={currentPage}
            limit={pageSize}
            onPageChange={setCurrentPage}
            onLimitChange={setPageSize}
            limitOptions={[10, 20, 50, 100]}
          />
        </section>

        {selectedBooking && (
          <BookingDetailPanel
            booking={selectedBooking}
            formatDate={formatDateBooking}
            formatDateTime={formatDateTimeBooking}
            formatPrice={formatPrice}
            getStatusText={getStatusText}
            getStatusStyle={getStatusStyle}
            getTypeText={getTypeText}
            onClose={() => setSelectedBooking(null)}
            onConfirm={() => {
              if (!selectedBooking.selectedTable) {
                openEditBookingModal(selectedBooking);
                showAdminToast({ title: "Cần chọn bàn trước", message: "Vui lòng chọn bàn trước khi xác nhận đặt bàn.", type: "warning" });
                return;
              }
              updateBookingStatus(selectedBooking.id, "confirmed");
            }}
            onComplete={() => updateBookingStatus(selectedBooking.id, "completed")}
            onCancel={() => updateBookingStatus(selectedBooking.id, "cancelled")}
          />
        )}
      </div>

      {/* Modals */}
      <AdminBookingModals
        editingBooking={editingBooking} setEditingBooking={setEditingBooking}
        editForm={editForm} setEditForm={setEditForm}
        isAddingBooking={isAddingBooking} setIsAddingBooking={setIsAddingBooking}
        addForm={addForm} setAddForm={setAddForm}
        areas={areas} tables={tables}
        getTableStatusForAdd={getTableStatusForAdd}
        getTableStatusForEdit={getTableStatusForEdit}
        getEditGuestCount={getEditGuestCount}
        handleSelectTableForEditBooking={handleSelectTableForEditBooking}
        saveAddBooking={saveAddBooking}
        saveEditBooking={saveEditBooking}
        formatDate={formatDateBooking}
        errors={errors}
      />

      {/* Delete / Bulk Confirm Modal */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner"><Trash2 size={28} /></div>
            <div>
              <h4 className="font-black text-gray-900 text-base">{deleteConfirmBooking.bulkStatus ? "Xác nhận cập nhật trạng thái" : deleteConfirmBooking.bulk ? "Xác nhận xóa hàng loạt" : "Xác nhận xóa đặt bàn"}</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{deleteConfirmBooking.bulkStatus ? `Bạn có chắc chắn muốn cập nhật trạng thái cho ${selectedBookingIds.length} đặt bàn đã chọn?` : deleteConfirmBooking.bulk ? `Bạn có chắc chắn muốn xóa ${selectedBookingIds.length} đặt bàn đã chọn? Hành động này không thể khôi phục.` : `Bạn có chắc chắn muốn xóa lịch đặt bàn DB${deleteConfirmBooking.bookingId}? Hành động này không thể khôi phục.`}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmBooking(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
              <button type="button" onClick={() => {
                const target = deleteConfirmBooking;
                setDeleteConfirmBooking(null);
                if (target.bulkStatus) executeUpdateSelectedBookingsStatus(target.bulkStatus);
                else if (target.bulk) executeDeleteSelectedBookings();
                else executeDeleteBooking(target.bookingId);
              }} className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm ${deleteConfirmBooking.bulkStatus ? "bg-primary hover:bg-primary-light" : "bg-red-600 hover:bg-red-700"}`}>
                {deleteConfirmBooking.bulkStatus ? "Xác nhận" : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;
