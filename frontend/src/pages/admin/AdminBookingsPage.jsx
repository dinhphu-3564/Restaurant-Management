import { useMemo, useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { tableService } from "../../services/tableService";
import { bookingService } from "../../services/bookingService";
import { socket } from "../../utils/socket";
import { showAdminToast } from "../../components/admin/AdminToast";
import { removeVietnameseTones } from "../../utils/string";
import { getCurrentUser } from "../../utils/auth";
import { canUseAction } from "../../utils/permissions";
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
  Utensils,
  X,
  Check,
} from "lucide-react";

const normalizeTableStatus = (status) => {
  if (!status) return "available";

  if (status === "empty") return "available";
  if (status === "free") return "available";

  return status;
};

function AdminBookingsPage() {
  const currentUser = getCurrentUser();
  const TABLE_STATUS_STYLE = {
    available: "border-green-200 bg-green-50 text-green-700",
    holding: "border-orange-200 bg-orange-50 text-orange-600",
    booked: "border-red-200 bg-red-50 text-red-600",
    serving: "border-blue-200 bg-blue-50 text-blue-600",
    maintenance: "border-gray-200 bg-gray-100 text-gray-500",
    disabled: "border-gray-200 bg-gray-50 text-gray-400",
    selected:
      "border-green-700 bg-green-100 text-green-900 ring-2 ring-green-700",
  };

  const TABLE_DOT_STYLE = {
    available: "bg-green-600",
    holding: "bg-orange-500",

    booked: "bg-red-500",
    serving: "bg-blue-500",
    maintenance: "bg-gray-500",
    disabled: "bg-gray-300",
    selected: "bg-blue-500",
  };

  const TABLE_STATUS_TEXT = {
    available: "Trống",
    holding: "Đang giữ",
    booked: "Đã đặt",
    serving: "Đang phục vụ",
    maintenance: "Bảo trì",
    disabled: "Ngừng sử dụng",
  };

  const getAreaPriority = (area) => {
    const name = removeVietnameseTones(area.name || area.title || "");

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

      return String(a.name || "").localeCompare(String(b.name || ""), "vi", {
        numeric: true,
      });
    });
  };

  const { globalSearch, dateRange } = useOutletContext();

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

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

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam !== null) {
      setSearch(searchParam);
    }
  }, [searchParams]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  // State quản lý custom modal xác nhận cho Booking
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState(null); // { booking } hoặc { bulk: true } hoặc { bulkStatus: 'status_name' }

  const [addForm, setAddForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: 1,
    selectedArea: "",
    selectedAreaTitle: "",
    selectedTable: "",
    note: "",
    status: "pending",
  });

  const [editForm, setEditForm] = useState({
    status: "pending",
    date: "",
    selectedArea: "",
    selectedAreaTitle: "",
    selectedTable: "",
    note: "",
  });

  const pageSize = 10;
  //Tự cập nhật khi trang khác thay đổi bookings
  const loadBookings = async () => {
    try {
      const [apiBookings] = await Promise.all([
        bookingService.getBookings(),
        loadTableLayout(),
      ]);

      setBookings(apiBookings);
      
      const viewId = searchParams.get("view");
      if (viewId) {
        const bookingToView = apiBookings.find(
          (b) => String(b.id) === String(viewId)
        );
        if (bookingToView) {
          setSelectedBooking(bookingToView);
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể tải danh sách đặt bàn.");
    }
  };

  const loadTableLayout = async () => {
    try {
      const [apiAreas, apiTables] = await Promise.all([
        tableService.getAreas(),
        tableService.getTables(),
      ]);

      const nextAreas = sortAreasByPriority(
        apiAreas.map((area) => ({
          ...area,
          id: String(area.id),
          name: area.name || area.title || "Khu vực",
        })),
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

      return {
        areas: nextAreas,
        tables: nextTables,
      };
    } catch (error) {
      console.error(error);
      setAreas([]);
      setTables([]);

      return {
        areas: [],
        tables: [],
      };
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
    const viewId = searchParams.get("view");
    if (viewId && bookings.length > 0) {
      const bookingToView = bookings.find(
        (b) => String(b.id) === String(viewId)
      );
      if (bookingToView) {
        setSelectedBooking(bookingToView);
      }
    }
  }, [searchParams, bookings]);

  useEffect(() => {
    const openAddBookingModal = async () => {
      if (!canUseAction(currentUser, "bookings:create")) {
        showAdminToast({
          title: "Từ chối",
          message: "Bạn không có quyền thêm đặt bàn.",
          type: "error",
        });
        return;
      }
      const layout = await loadTableLayout();
      const firstArea = layout.areas[0];

      setAddForm((prev) => ({
        ...prev,
        date: prev.date || new Date().toISOString().split("T")[0],
        selectedArea: firstArea?.id || "",
        selectedAreaTitle: firstArea?.name || "",
        selectedTable: "",
      }));

      setIsAddingBooking(true);
    };

    window.addEventListener("openAddBookingModal", openAddBookingModal);

    return () => {
      window.removeEventListener("openAddBookingModal", openAddBookingModal);
    };
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

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "serving":
        return "Đang phục vụ";
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
    if (text === "Đang phục vụ") return "bg-indigo-50 text-indigo-700";
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

  //cập nhật trạng thái admin
  const updateBookingStatus = async (id, status) => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(
        id,
        status,
      );

      setBookings((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? updatedBooking : item,
        ),
      );

      setSelectedBooking((prev) =>
        prev && String(prev.id) === String(id) ? updatedBooking : prev,
      );

      showAdminToast({
        title: "Cập nhật trạng thái thành công",
        message: `Đã chuyển đặt bàn ${
          updatedBooking.bookingCode || `DB${updatedBooking.id}`
        } sang "${getStatusText(status)}".`,
      });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể cập nhật trạng thái đặt bàn.");
    }
  };
  //hàm mở popup sửa
  const openEditBookingModal = (booking) => {
    setEditingBooking(booking);

    const areaTitle = booking.selectedAreaTitle || booking.area || "";

    const matchedArea = areas.find(
      (area) =>
        String(area.id) === String(booking.selectedArea) ||
        area.name === areaTitle,
    );

    setEditForm({
      status: booking.status || "pending",
      date: booking.date || "",
      selectedArea: booking.selectedArea || matchedArea?.id || "",
      selectedAreaTitle: areaTitle || matchedArea?.name || "",
      selectedTable: booking.selectedTable || "",
      note: booking.note || "",
    });
  };
  //hàm kiểm tra bàn theo ngày
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

  const getTableBookingAtDate = (tableCode, date) => {
    if (!date) return null;

    return bookings.find(
      (booking) =>
        String(booking.id) !== String(editingBooking?.id) &&
        isActiveBooking(booking) &&
        String(booking.selectedTable) === String(tableCode) &&
        booking.date === date,
    );
  };

  const getTableStatusForEdit = (table) => {
    const bookingAtDate = getTableBookingAtDate(table.code, editForm.date);

    if (
      bookingAtDate?.status === "pending" ||
      bookingAtDate?.status === "Chờ xác nhận"
    ) {
      return "holding";
    }

    if (
      bookingAtDate?.status === "confirmed" ||
      bookingAtDate?.status === "Đã xác nhận" ||
      bookingAtDate?.status === "serving" ||
      bookingAtDate?.status === "Đang phục vụ"
    ) {
      return "booked";
    }

    return table.status;
  };

  const getEditGuestCount = () => {
    return Number(editingBooking?.guests || editingBooking?.people || 0);
  };

  const findBestTableForEditBooking = () => {
    const guestCount = getEditGuestCount();

    return (
      tables
        .filter((table) => {
          const sameArea =
            String(table.areaId) === String(editForm.selectedArea);

          const available = getTableStatusForEdit(table) === "available";

          const enoughCapacity =
            guestCount <= 0 || Number(table.capacity || 0) >= guestCount;

          return sameArea && available && enoughCapacity;
        })
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

  const handleSelectTableForEditBooking = (table, rawStatus, currentTable) => {
    if (currentTable) return;

    if (rawStatus !== "available") return;

    const guestCount = getEditGuestCount();
    const tableCapacity = Number(table.capacity || 0);

    if (guestCount > 0 && tableCapacity < guestCount) {
      const suggestedTable = findBestTableForEditBooking();

      if (suggestedTable) {
        const shouldSwitch = window.confirm(
          `Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người, nhưng lịch đặt này có ${guestCount} khách.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`,
        );

        if (shouldSwitch) {
          setEditForm((prev) => ({
            ...prev,
            selectedTable: suggestedTable.code,
          }));
        }

        return;
      }

      alert(
        `Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người. Hiện khu vực này không có bàn phù hợp cho ${guestCount} khách.`,
      );

      return;
    }

    setEditForm((prev) => ({
      ...prev,
      selectedTable: table.code,
    }));
  };

  //hàm lưu chỉnh sửa
  const saveEditBooking = async () => {
    if (!editingBooking) return;

    const guestCount = getEditGuestCount();

    if (!editForm.date) {
      alert("Vui lòng chọn ngày đặt bàn.");
      return;
    }

    if (editForm.status === "confirmed" && !editForm.selectedTable) {
      alert("Vui lòng chọn bàn trước khi xác nhận đặt bàn.");
      return;
    }

    if (editForm.selectedTable) {
      const selectedTableData = tables.find(
        (table) =>
          String(table.code) === String(editForm.selectedTable) &&
          String(table.areaId) === String(editForm.selectedArea),
      );

      if (!selectedTableData) {
        alert("Bàn đã chọn không hợp lệ. Vui lòng chọn lại.");
        return;
      }

      if (guestCount > Number(selectedTableData.capacity || 0)) {
        const suggestedTable = findBestTableForEditBooking();

        if (suggestedTable) {
          const shouldSwitch = window.confirm(
            `Bàn ${selectedTableData.code} chỉ chứa tối đa ${selectedTableData.capacity} người, nhưng lịch đặt này có ${guestCount} khách.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`,
          );

          if (shouldSwitch) {
            setEditForm((prev) => ({
              ...prev,
              selectedTable: suggestedTable.code,
            }));
          }

          return;
        }

        alert(
          `Khu vực này không có bàn phù hợp cho ${guestCount} khách. Vui lòng chọn khu vực khác.`,
        );

        return;
      }
    }

    try {
      const updatedBooking = await bookingService.updateBooking(
        editingBooking.id,
        {
          status: editForm.status,
          date: editForm.date,
          time: editForm.time || editingBooking.time,
          selectedArea: editForm.selectedArea,
          selectedAreaTitle: editForm.selectedAreaTitle,
          selectedTable: editForm.selectedTable,
          note: editForm.note,
        },
      );

      setBookings((prev) =>
        prev.map((booking) =>
          String(booking.id) === String(editingBooking.id)
            ? updatedBooking
            : booking,
        ),
      );

      setSelectedBooking((prev) =>
        prev && String(prev.id) === String(editingBooking.id)
          ? updatedBooking
          : prev,
      );

      showAdminToast({
        title: "Lưu thay đổi thành công",
        message: `Đã cập nhật đặt bàn ${
          updatedBooking.bookingCode || `DB${updatedBooking.id}`
        }.`,
      });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));

      setEditingBooking(null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể cập nhật đặt bàn.");
    }
  };

  //hàm xóa đặt bàn thực hiện
  const executeDeleteBooking = async (id) => {
    try {
      await bookingService.deleteBooking(id);

      setBookings((prev) =>
        prev.filter((booking) => String(booking.id) !== String(id)),
      );

      setSelectedBooking((prev) =>
        prev && String(prev.id) === String(id) ? null : prev,
      );

      setSelectedBookingIds((prev) =>
        prev.filter((bookingId) => String(bookingId) !== String(id)),
      );
      showAdminToast({
        title: "Xóa đặt bàn thành công",
        message: `Đã xóa đặt bàn DB${id}.`,
      });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) {
      console.error(error);
      showAdminToast({
        title: "Thất bại",
        message: error.message || "Không thể xóa đặt bàn.",
        type: "error",
      });
    }
  };

  const deleteBooking = (id) => {
    setDeleteConfirmBooking({ bookingId: id });
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

  //hàm cập nhật trạng thái nhiều thực hiện
  const executeUpdateSelectedBookingsStatus = async (status) => {
    if (status === "confirmed") {
      const selectedBookings = bookings.filter((booking) =>
        selectedBookingIds.includes(String(booking.id)),
      );

      const bookingsWithoutTable = selectedBookings.filter(
         (booking) => !booking.selectedTable,
      );

      if (bookingsWithoutTable.length > 0) {
        showAdminToast({
          title: "Thất bại",
          message: `Có ${bookingsWithoutTable.length} đặt bàn chưa được chọn bàn. Vui lòng chọn bàn trước khi xác nhận.`,
          type: "error",
        });
        return;
      }
    }

    const statusText = getStatusText(status);

    try {
      const updatedBookings = await Promise.all(
        selectedBookingIds.map((id) =>
          bookingService.updateBookingStatus(id, status),
        ),
      );

      const updatedMap = new Map(
        updatedBookings.map((booking) => [String(booking.id), booking]),
      );

      setBookings((prev) =>
        prev.map((booking) =>
          updatedMap.has(String(booking.id))
            ? updatedMap.get(String(booking.id))
            : booking,
        ),
      );

      setSelectedBooking((prev) =>
        prev && updatedMap.has(String(prev.id))
          ? updatedMap.get(String(prev.id))
          : prev,
      );

      showAdminToast({
        title: "Cập nhật hàng loạt thành công",
        message: `Đã chuyển ${selectedBookingIds.length} đặt bàn sang trạng thái "${statusText}".`,
      });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));

      setSelectedBookingIds([]);
    } catch (error) {
      console.error(error);
      showAdminToast({
        title: "Thất bại",
        message: error.message || "Không thể cập nhật trạng thái hàng loạt.",
        type: "error",
      });
    }
  };

  const updateSelectedBookingsStatus = (status) => {
    if (selectedBookingIds.length === 0) return;
    setDeleteConfirmBooking({ bulkStatus: status });
  };

  //hàm xóa nhiều thực hiện
  const executeDeleteSelectedBookings = async () => {
    try {
      await Promise.all(
        selectedBookingIds.map((id) => bookingService.deleteBooking(id)),
      );

      setBookings((prev) =>
        prev.filter(
          (booking) => !selectedBookingIds.includes(String(booking.id)),
        ),
      );

      setSelectedBooking((prev) =>
        prev && selectedBookingIds.includes(String(prev.id)) ? null : prev,
      );

      showAdminToast({
        title: "Xóa hàng loạt thành công",
        message: `Đã xóa ${selectedBookingIds.length} đặt bàn đã chọn.`,
      });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));

      setSelectedBookingIds([]);
    } catch (error) {
      console.error(error);
      showAdminToast({
        title: "Thất bại",
        message: error.message || "Không thể xóa các đặt bàn đã chọn.",
        type: "error",
      });
    }
  };

  const deleteSelectedBookings = () => {
    if (selectedBookingIds.length === 0) return;
    setDeleteConfirmBooking({ bulk: true });
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

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredBookings, currentPage, pageSize]);

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

  //hàm kiểm tra bàn khi thêm mới
  const isActiveAddBooking = (booking) => {
    return (
      booking.status === "pending" ||
      booking.status === "confirmed" ||
      booking.status === "Chờ xác nhận" ||
      booking.status === "Đã xác nhận"
    );
  };

  const getTableStatusForAdd = (table) => {
    if (!addForm.date) return table.status;

    const existedBooking = bookings.find(
      (booking) =>
        isActiveAddBooking(booking) &&
        String(booking.selectedTable) === String(table.code) &&
        booking.date === addForm.date,
    );

    if (
      existedBooking?.status === "pending" ||
      existedBooking?.status === "Chờ xác nhận"
    ) {
      return "holding";
    }

    if (
      existedBooking?.status === "confirmed" ||
      existedBooking?.status === "Đã xác nhận" ||
      existedBooking?.status === "serving" ||
      existedBooking?.status === "Đang phục vụ"
    ) {
      return "booked";
    }

    return table.status;
  };

  //hàm lưu đặt bàn mới
  const saveAddBooking = async () => {
    if (!addForm.customerName.trim()) {
      alert("Vui lòng nhập tên khách hàng.");
      return;
    }

    if (!addForm.phone.trim()) {
      alert("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!addForm.date) {
      alert("Vui lòng chọn ngày đặt bàn.");
      return;
    }

    if (!addForm.time) {
      alert("Vui lòng chọn giờ đặt bàn.");
      return;
    }

    if (!addForm.selectedTable) {
      alert("Vui lòng chọn bàn.");
      return;
    }

    const guestCount = Number(addForm.guests);

    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      alert("Số khách phải lớn hơn 0.");
      return;
    }

    const selectedTableData = tables.find(
      (table) =>
        String(table.code) === String(addForm.selectedTable) &&
        String(table.areaId) === String(addForm.selectedArea),
    );

    if (!selectedTableData) {
      alert("Bàn đã chọn không hợp lệ. Vui lòng chọn lại.");
      return;
    }

    if (guestCount > Number(selectedTableData.capacity || 0)) {
      alert(
        `Bàn ${selectedTableData.code} chỉ chứa tối đa ${selectedTableData.capacity} người. Vui lòng chọn bàn khác phù hợp hơn.`,
      );
      return;
    }

    const payload = {
      customerName: addForm.customerName.trim(),
      phone: addForm.phone.trim(),
      email: addForm.email.trim(),
      date: addForm.date,
      time: addForm.time,
      guests: Number(addForm.guests || 1),
      selectedArea: addForm.selectedArea,
      selectedAreaTitle: addForm.selectedAreaTitle,
      selectedTable: addForm.selectedTable,
      note: addForm.note.trim(),
      status: addForm.status,
      type: "table_only",
      total: 0,
    };

    try {
      const savedBooking = await bookingService.createAdminBooking(payload);

      setBookings((prev) => [savedBooking, ...prev]);
      setSelectedBooking(savedBooking);
      setIsAddingBooking(false);
      showAdminToast({
        title: "Tạo đặt bàn thành công",
        message: `Đã tạo đặt bàn ${
          savedBooking.bookingCode || `DB${savedBooking.id}`
        }.`,
      });
      window.dispatchEvent(new Event("bookingsUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));

      setAddForm({
        customerName: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        guests: 1,
        selectedArea: "",
        selectedAreaTitle: "",
        selectedTable: "",
        note: "",
        status: "pending",
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Không thể tạo đặt bàn.");
    }
  };

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

                {areas.map((area) => (
                  <option key={area.id} value={area.name}>
                    {area.name}
                  </option>
                ))}
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
              <p className="text-sm font-black text-primary">
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
              <thead className="bg-[#fbfcfb] text-gray-500 font-bold text-sm whitespace-nowrap">
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
                  <th className="px-4 py-3 text-center">Ngày</th>
                  <th className="px-4 py-3 text-center">Giờ</th>
                  <th className="px-4 py-3">Số khách</th>
                  <th className="px-4 py-3">Khu vực</th>
                  <th className="px-4 py-3">Bàn</th>
                  <th className="px-4 py-3 text-center">Loại</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
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
                        {booking.bookingCode || `DB${booking.id}`}
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

                      <td className="px-4 py-3 font-black text-center">
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

                      <td className="px-4 py-3 font-black text-primary whitespace-nowrap text-center">
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

                          {canUseAction(currentUser, "bookings:delete") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBooking(booking.id);
                              }}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                              title="Xóa lịch đặt bàn"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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
              Hiển thị{" "}
              {filteredBookings.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}{" "}
              - {Math.min(currentPage * pageSize, filteredBookings.length)}{" "}
              trong tổng số {filteredBookings.length} đặt bàn
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
                        ? "bg-primary text-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                        : "border-gray-200 text-gray-600 hover:bg-primary/5 hover:text-primary"
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
            onConfirm={() => {
              if (!selectedBooking.selectedTable) {
                openEditBookingModal(selectedBooking);

                showAdminToast({
                  title: "Cần chọn bàn trước",
                  message: "Vui lòng chọn bàn trước khi xác nhận đặt bàn.",
                  type: "warning",
                });

                return;
              }

              updateBookingStatus(selectedBooking.id, "confirmed");
            }}
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
          <div className={`w-full bg-white rounded-3xl shadow-2xl overflow-hidden transition-all ${editingBooking.status === "completed" ? "max-w-sm" : "max-w-6xl"}`}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary">
                  Chỉnh sửa đặt bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  {editingBooking.bookingCode || `DB${editingBooking.id}`}
                </p>
              </div>

              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {editingBooking.status === "completed" ? (
              <div className="px-6 pt-6 pb-2 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/50 to-primary flex items-center justify-center text-white text-3xl shadow-lg">
                  ✓
                </div>
                <div>
                  <p className="text-lg font-black text-primary mt-1">Đặt bàn đã hoàn thành</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Lịch đặt <strong className="text-gray-600">{editingBooking.bookingCode || `DB${editingBooking.id}`}</strong> đã hoàn tất phục vụ.
                  </p>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-left space-y-1.5 mt-1">
                  {editingBooking.date && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Ngày đặt</span>
                      <span className="font-black text-gray-700">{formatDate(editingBooking.date)}</span>
                    </div>
                  )}
                  {editingBooking.selectedTable && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Bàn</span>
                      <span className="font-black text-gray-700">{editingBooking.selectedTable}</span>
                    </div>
                  )}
                  {editingBooking.guests && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Số khách</span>
                      <span className="font-black text-gray-700">{editingBooking.guests} người</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Ngày đặt
                  </span>

                  <input
                    type="date"
                    disabled={editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed"}
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                        selectedTable:
                          editingBooking?.date === e.target.value
                            ? editingBooking?.selectedTable || ""
                            : "",
                      }))
                    }
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Trạng thái
                  </span>
                  {editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed" ? (
                    <div className="mt-2 w-full rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex flex-col gap-1 bg-gray-50 select-none">
                      <span className={`text-sm font-black ${editingBooking.status === "serving" ? "text-amber-600" : editingBooking.status === "completed" ? "text-primary" : "text-blue-600"}`}>
                        {editingBooking.status === "serving" ? "🟡 Đang phục vụ" : editingBooking.status === "completed" ? "✅ Hoàn thành" : "🔵 Đã xác nhận"}
                      </span>
                      <span className="text-xs text-gray-400 leading-snug">
                        Tất cả thao tác còn lại vui lòng xử lý tại <strong>Sơ đồ bàn</strong>
                      </span>
                    </div>
                  ) : (
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Khu vực
                  </span>

                  <select
                    disabled={editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed"}
                    value={editForm.selectedArea}
                    onChange={(e) => {
                      const areaId = e.target.value;
                      const area = areas.find(
                        (item) => String(item.id) === String(areaId),
                      );

                      setEditForm((prev) => ({
                        ...prev,
                        selectedArea: areaId,
                        selectedAreaTitle: area?.name || "",
                        selectedTable: "",
                      }));
                    }}
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  >
                    <option value="">Nhà hàng sắp xếp</option>

                    {areas.map((area) => (
                      <option key={area.id} value={String(area.id)}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Ghi chú
                  </span>

                  <textarea
                    disabled={editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed"}
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    placeholder="Nhập ghi chú đặt bàn..."
                    className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                  />
                </label>
              </div>
              {/* phần chọn khu vực + bàn trong popup */}
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-black text-gray-500">
                      Chọn bàn
                    </span>

                    <p className="text-xs text-gray-400 font-bold mt-1">
                      Lịch này có{" "}
                      {editingBooking?.guests || editingBooking?.people || 0}{" "}
                      khách. Chỉ nên chọn bàn đủ sức chứa.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-primary" />
                      Trống
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      Đang giữ
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Đã đặt
                    </span>
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-gray-100 p-4">
                  {editForm.selectedArea ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                      {tables
                        .filter(
                          (table) =>
                            String(table.areaId) ===
                            String(editForm.selectedArea),
                        )
                        .map((table) => {
                          const currentTable =
                            String(editingBooking?.selectedTable) ===
                              String(table.code) &&
                            editingBooking?.date === editForm.date;

                          const newSelectedTable =
                            String(editForm.selectedTable) ===
                              String(table.code) && !currentTable;

                          const rawStatus = getTableStatusForEdit(table);
                          const status = currentTable ? "selected" : rawStatus;

                          const guestCount = getEditGuestCount();

                          const insufficientCapacity =
                            guestCount > 0 &&
                            Number(table.capacity || 0) < guestCount;

                          const disabled =
                            currentTable || rawStatus !== "available" || editingBooking?.status === "completed" || editingBooking?.status === "serving" || editingBooking?.status === "confirmed";

                          return (
                            <button
                              key={table.id}
                              type="button"
                              disabled={disabled}
                              onClick={() =>
                                handleSelectTableForEditBooking(
                                  table,
                                  rawStatus,
                                  currentTable,
                                )
                              }
                              className={`relative h-14 rounded-xl border font-black transition ${
                                currentTable
                                  ? TABLE_STATUS_STYLE.selected
                                  : newSelectedTable
                                    ? "border-primary bg-primary text-white ring-2 ring-primary/20"
                                    : disabled
                                      ? TABLE_STATUS_STYLE[status] ||
                                        TABLE_STATUS_STYLE.available
                                      : insufficientCapacity
                                        ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                        : TABLE_STATUS_STYLE[status] ||
                                          TABLE_STATUS_STYLE.available
                              } ${
                                disabled
                                  ? "cursor-not-allowed opacity-90"
                                  : "hover:scale-[1.02]"
                              }`}
                            >
                              <span
                                className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${
                                  currentTable || newSelectedTable
                                    ? "bg-primary"
                                    : TABLE_DOT_STYLE[status]
                                }`}
                              />

                              <div className="flex flex-col items-center leading-tight">
                                <span>{table.code}</span>

                                <span className="mt-1 text-[10px] font-black">
                                  {rawStatus === "available"
                                    ? `${table.capacity} người`
                                    : TABLE_STATUS_TEXT[rawStatus] || rawStatus}
                                </span>

                                {currentTable && (
                                  <span className="mt-1 text-[10px] font-black text-primary">
                                    Bàn đang chọn
                                  </span>
                                )}

                                {newSelectedTable && (
                                  <span className="mt-1 text-[10px] font-black text-white">
                                    Bàn mới
                                  </span>
                                )}

                                {insufficientCapacity &&
                                  !disabled &&
                                  !newSelectedTable && (
                                    <span className="mt-1 text-[10px] font-black text-yellow-700">
                                      Thiếu chỗ
                                    </span>
                                  )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-400 font-bold">
                      Vui lòng chọn khu vực để hiển thị bàn
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingBooking(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              {editingBooking.status !== "completed" && (
                <button
                  onClick={saveEditBooking}
                  className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary-dark"
                >
                  Lưu thay đổi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Thêm popup form */}
      {isAddingBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary">
                  Thêm đặt bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Admin tạo lịch đặt bàn mới cho khách hàng
                </p>
              </div>

              <button
                onClick={() => setIsAddingBooking(false)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 max-h-[72vh] overflow-y-auto">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Tên khách hàng
                  </span>
                  <input
                    value={addForm.customerName}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên khách hàng"
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">SĐT</span>
                  <input
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Nhập số điện thoại"
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Email
                  </span>
                  <input
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Nhập email nếu có"
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Ngày đặt
                    </span>
                    <input
                      type="date"
                      value={addForm.date}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                          selectedTable: "",
                        }))
                      }
                      className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-gray-500">
                      Giờ
                    </span>
                    <input
                      type="time"
                      value={addForm.time}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Số khách
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={addForm.guests}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        guests: e.target.value,
                        selectedTable: "",
                      }))
                    }
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Khu vực
                  </span>
                  <select
                    value={addForm.selectedArea}
                    onChange={(e) => {
                      const areaId = String(e.target.value);
                      const area = areas.find(
                        (item) => String(item.id) === areaId,
                      );

                      setAddForm((prev) => ({
                        ...prev,
                        selectedArea: areaId,
                        selectedAreaTitle: area?.name || "",
                        selectedTable: "",
                      }));
                    }}
                    className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
                  >
                    <option value="">Chọn khu vực</option>

                    {areas.map((area) => (
                      <option key={area.id} value={String(area.id)}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Ghi chú
                  </span>
                  <textarea
                    value={addForm.note}
                    onChange={(e) =>
                      setAddForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    placeholder="Nhập ghi chú đặt bàn..."
                    className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                  />
                </label>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-black text-gray-500">
                      Chọn bàn
                    </span>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                      Lịch này có {addForm.guests || 0} khách. Chỉ nên chọn bàn
                      đủ sức chứa.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-primary" />
                      Trống
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      Đang giữ
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Đã đặt
                    </span>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto rounded-2xl border border-gray-100 p-4">
                  {addForm.selectedArea ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                      {tables
                        .filter(
                          (table) =>
                            String(table.areaId) ===
                            String(addForm.selectedArea),
                        )
                        .map((table) => {
                          const status = getTableStatusForAdd(table);
                          const isSelected =
                            String(addForm.selectedTable) ===
                            String(table.code);

                          const guestCount = Number(addForm.guests || 0);

                          const insufficientCapacity =
                            guestCount > 0 &&
                            Number(table.capacity || 0) < guestCount;

                          const disabled = status !== "available";

                          return (
                            <button
                              key={table.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => {
                                if (disabled) return;

                                if (insufficientCapacity) {
                                  alert(
                                    `Bàn ${table.code} chỉ chứa tối đa ${table.capacity} người. Vui lòng chọn bàn khác phù hợp hơn.`,
                                  );
                                  return;
                                }

                                setAddForm((prev) => ({
                                  ...prev,
                                  selectedTable: table.code,
                                }));
                              }}
                              className={`relative h-16 rounded-xl border font-black transition ${
                                isSelected
                                  ? "border-primary bg-primary text-white ring-2 ring-primary/20"
                                  : disabled
                                    ? TABLE_STATUS_STYLE[status] ||
                                      TABLE_STATUS_STYLE.available
                                    : insufficientCapacity
                                      ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                      : TABLE_STATUS_STYLE[status] ||
                                        TABLE_STATUS_STYLE.available
                              } ${
                                disabled
                                  ? "cursor-not-allowed opacity-80"
                                  : "hover:scale-[1.02]"
                              }`}
                            >
                              <span
                                className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${
                                  isSelected
                                    ? "bg-white"
                                    : TABLE_DOT_STYLE[status]
                                }`}
                              />

                              <div className="flex flex-col items-center leading-tight">
                                <span>{table.code}</span>

                                <span className="mt-1 text-[10px] font-black">
                                  {status === "available"
                                    ? `${table.capacity} người`
                                    : TABLE_STATUS_TEXT[status] || status}
                                </span>

                                {isSelected && (
                                  <span className="mt-1 text-[10px] font-black text-white">
                                    Đang chọn
                                  </span>
                                )}

                                {insufficientCapacity &&
                                  !disabled &&
                                  !isSelected && (
                                    <span className="mt-1 text-[10px] font-black text-yellow-700">
                                      Thiếu chỗ
                                    </span>
                                  )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-gray-400 font-bold">
                      Vui lòng chọn khu vực để hiển thị bàn
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsAddingBooking(false)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveAddBooking}
                className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary-dark"
              >
                Tạo đặt bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal for Bookings */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={28} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-base">
                {deleteConfirmBooking.bulkStatus
                  ? "Xác nhận cập nhật trạng thái"
                  : deleteConfirmBooking.bulk
                  ? "Xác nhận xóa hàng loạt"
                  : "Xác nhận xóa đặt bàn"}
              </h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {deleteConfirmBooking.bulkStatus
                  ? `Bạn có chắc chắn muốn cập nhật trạng thái cho ${selectedBookingIds.length} đặt bàn đã chọn?`
                  : deleteConfirmBooking.bulk
                  ? `Bạn có chắc chắn muốn xóa ${selectedBookingIds.length} đặt bàn đã chọn? Hành động này không thể khôi phục.`
                  : `Bạn có chắc chắn muốn xóa lịch đặt bàn DB${deleteConfirmBooking.bookingId}? Hành động này không thể khôi phục.`}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = deleteConfirmBooking;
                  setDeleteConfirmBooking(null);
                  if (target.bulkStatus) {
                    executeUpdateSelectedBookingsStatus(target.bulkStatus);
                  } else if (target.bulk) {
                    executeDeleteSelectedBookings();
                  } else {
                    executeDeleteBooking(target.bookingId);
                  }
                }}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm ${
                  deleteConfirmBooking.bulkStatus
                    ? "bg-primary hover:bg-primary-light"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleteConfirmBooking.bulkStatus ? "Xác nhận" : "Xác nhận xóa"}
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
            {booking.bookingCode || `DB${booking.id}`}
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

        {booking.status === "pending" && (
          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={onConfirm}
              className="
        h-11 rounded-xl
        bg-blue-50 text-blue-700
        border border-blue-100
        text-sm font-black
        hover:bg-blue-100
        flex items-center justify-center gap-1
        transition
      "
            >
              <Check size={16} />
              Xác nhận
            </button>

            <button
              onClick={onCancel}
              className="
        h-11 rounded-xl
        bg-red-50 text-red-600
        border border-red-100
        text-sm font-black
        hover:bg-red-100
        transition
      "
            >
              Hủy bàn
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function BookingStatCard({ icon, title, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[96px] hover:bg-primary/5 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-md transition">
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
          <p className="text-primary text-[11px] font-black mt-1">
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
          ? "border-primary/20 border-t-primary bg-primary/5"
          : "border-transparent text-gray-500 hover:text-primary hover:bg-primary/5"
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
