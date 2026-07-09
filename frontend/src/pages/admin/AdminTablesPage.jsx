import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import AdminAddItemsModal from "../../components/admin/AdminAddItemsModal";
import AdminAddBookingModal from "../../components/admin/AdminAddBookingModal";
import AdminSpaceModals from "../../components/admin/AdminSpaceModals";
import AdminBillingModal from "../../components/admin/AdminBillingModal";
import GlobalPagination from "../../components/admin/GlobalPagination";
import {
  StatCard,
  TabButton,
  Legend,
  TableButton,
  TableDetailPanel,
  SelectField,
  SelectBox,
  ActionButton,
  StatusBadge,
} from "../../components/admin/AdminTableComponents";
import { showAdminToast } from "../../components/admin/AdminToast";
import { tableService } from "../../services/tableService";
import { bookingService } from "../../services/bookingService";
import { removeVietnameseTones } from "../../utils/string";
import { getCurrentUser } from "../../utils/auth";
import { canUseAction } from "../../utils/permissions";
import {
  sortAreasByPriority,
  TABLE_STATUS,
  STATUS_DOT,
  formatDate,
  formatDateTime,
} from "../../utils/tableHelpers";
import { useTablesData } from "../../utils/useTablesData";
import { useTablesBilling } from "../../utils/useTablesBilling";
import {
  Building2, LayoutGrid, CheckCircle, Clock3, CalendarCheck, Wrench,
  Search, Eye, Pencil, RotateCcw, X, Plus, Lock, Unlock, Trash2,
  Printer, Minus, Wallet, AlertTriangle, HelpCircle,
} from "lucide-react";

function AdminTablesPage() {
  const { globalSearch } = useOutletContext();
  const currentUser = getCurrentUser();
  const today = new Date().toISOString().split("T")[0];

  // ─── Data & Loading ───────────────────────────────────────────────
  const {
    areas, setAreas,
    tables, setTables,
    tableLoading,
    bookings, setBookings,
    selectedArea, setSelectedArea,
    assignForm, setAssignForm,
    addForm, setAddForm,
    loadTableLayout,
  } = useTablesData({ today });

  // ─── Billing & Cart ───────────────────────────────────────────────
  const [selectedTable, setSelectedTable] = useState(null);
  const billing = useTablesBilling({ selectedTable, setSelectedTable, bookings, setBookings });

  // ─── UI State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("map");
  const [viewDate, setViewDate] = useState(today);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ─── Assign Booking ───────────────────────────────────────────────
  const [assignBooking, setAssignBooking] = useState(null);

  // ─── Edit States ──────────────────────────────────────────────────
  const [editingTable, setEditingTable] = useState(null);
  const [editForm, setEditForm] = useState({ areaId: "", code: "", capacity: 4, status: "available", description: "" });
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: "", description: "" });
  const [editingArea, setEditingArea] = useState(null);
  const [areaEditForm, setAreaEditForm] = useState({ name: "", description: "" });
  const [deleteConfirmArea, setDeleteConfirmArea] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [tableForm, setTableForm] = useState({ areaId: "", capacity: 4, status: "available", description: "" });

  // ─── Confirm Dialog ───────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState(null);
  const showConfirm = (options) => new Promise((resolve) => {
    setConfirmDialog({
      ...options,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

  // ─── Menu Items (Gọi thêm món) ────────────────────────────────────
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategory, setItemCategory] = useState("all");

  useEffect(() => {
    if (billing.activeAddItemsBooking) {
      setMenuLoading(true);
      fetch("http://localhost:5001/api/menu-items")
        .then((res) => res.json())
        .then((data) => { if (data.success) setMenuItems(data.data || []); })
        .catch(console.error)
        .finally(() => setMenuLoading(false));
    }
  }, [billing.activeAddItemsBooking]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = removeVietnameseTones(item.name || "")
        .toLowerCase()
        .includes(removeVietnameseTones(itemSearch || "").toLowerCase());
      const matchCategory = itemCategory === "all" || item.category === itemCategory;
      return matchSearch && matchCategory && item.status !== "stopped";
    });
  }, [menuItems, itemSearch, itemCategory]);

  useEffect(() => {
    const handler = () => setIsAddingBooking(true);
    window.addEventListener("openAddBookingModal", handler);
    return () => window.removeEventListener("openAddBookingModal", handler);
  }, []);

  // ─── Table Sync Logic ─────────────────────────────────────────────
  const isSameBookingSlot = (booking) => booking.date && booking.date === viewDate;

  const getBookingByTable = (tableCode) => {
    const servingBooking = bookings.find(
      (b) => String(b.selectedTable) === String(tableCode) && b.status === "serving"
    );
    if (servingBooking) return servingBooking;
    return bookings.find((b) => {
      const isActive = ["pending", "confirmed", "serving", "Chờ xác nhận", "Đã xác nhận", "Đang phục vụ"].includes(b.status);
      return String(b.selectedTable) === String(tableCode) && isActive && isSameBookingSlot(b);
    });
  };

  const syncTableWithBooking = (table) => {
    const booking = getBookingByTable(table.code);
    if (booking && table.status !== "maintenance" && table.status !== "disabled") {
      let syncStatus = table.status;
      if (booking.status === "confirmed") syncStatus = "booked";
      else if (booking.status === "serving") syncStatus = "serving";
      else if (booking.status === "pending") syncStatus = "holding";
      return { ...table, status: syncStatus, currentBooking: booking };
    }
    return table;
  };

  const displayTables = tables.map(syncTableWithBooking);

  // ─── Filter ───────────────────────────────────────────────────────
  const filteredTables = useMemo(() => {
    const rawKeyword = String(globalSearch || search).trim();
    const keyword = removeVietnameseTones(rawKeyword);
    return displayTables.filter((table) => {
      const cleanCode = removeVietnameseTones(table.code);
      const cleanAreaName = removeVietnameseTones(table.areaName);
      const cleanDesc = removeVietnameseTones(table.description);
      const matchSearch = !keyword || cleanCode.includes(keyword) || cleanAreaName.includes(keyword) || cleanDesc.includes(keyword);
      const matchArea = areaFilter === "all" || String(table.areaId) === String(areaFilter);
      const matchStatus = statusFilter === "all" || table.status === statusFilter;
      const matchCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "1-4" && table.capacity <= 4) ||
        (capacityFilter === "5-6" && table.capacity >= 5 && table.capacity <= 6) ||
        (capacityFilter === "7+" && table.capacity >= 7);
      return matchSearch && matchArea && matchStatus && matchCapacity;
    });
  }, [displayTables, search, globalSearch, areaFilter, statusFilter, capacityFilter]);

  const totalPages = Math.ceil(filteredTables.length / pageSize);
  const paginatedTables = filteredTables.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ─── Stats ────────────────────────────────────────────────────────
  const totalAreas = areas.length;
  const totalTables = displayTables.length;
  const availableCount = displayTables.filter((t) => t.status === "available").length;
  const holdingCount = displayTables.filter((t) => t.status === "holding").length;
  const bookedCount = displayTables.filter((t) => t.status === "booked").length;
  const maintenanceCount = displayTables.filter((t) => t.status === "maintenance").length;

  useEffect(() => setCurrentPage(1), [search, globalSearch, areaFilter, statusFilter, capacityFilter]);

  // ─── Area CRUD ────────────────────────────────────────────────────
  const openAddArea = () => { setAreaForm({ name: "", description: "" }); setIsAddingArea(true); };

  const saveAddArea = async () => {
    if (!areaForm.name.trim()) { alert("Vui lòng nhập tên khu vực."); return; }
    try {
      const savedArea = await tableService.createArea({ name: areaForm.name.trim(), description: areaForm.description.trim() });
      setAreas((prev) => sortAreasByPriority([...prev, savedArea]));
      setSelectedArea(savedArea.id);
      setAssignForm((prev) => ({ ...prev, areaId: savedArea.id, tableCode: "" }));
      setAddForm((prev) => ({ ...prev, selectedArea: savedArea.id, selectedAreaTitle: savedArea.name, selectedTable: "" }));
      setTableForm((prev) => ({ ...prev, areaId: savedArea.id }));
      setAreaForm({ name: "", description: "" });
      setIsAddingArea(false);
      showAdminToast({ title: "Thêm khu vực thành công", message: `Đã thêm khu vực ${savedArea.name}.` });
      window.dispatchEvent(new Event("areasUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); alert(error.message || "Không thể thêm khu vực."); }
  };

  const openEditArea = (area) => { setEditingArea(area); setAreaEditForm({ name: area.name || "", description: area.description || "" }); };

  const saveEditArea = async () => {
    if (!editingArea || !areaEditForm.name.trim()) { alert("Vui lòng nhập tên khu vực."); return; }
    try {
      const updatedArea = await tableService.updateArea(editingArea.id, { name: areaEditForm.name.trim(), description: areaEditForm.description.trim() });
      setAreas((prev) => sortAreasByPriority(prev.map((area) => String(area.id) === String(editingArea.id) ? updatedArea : area)));
      setTables((prev) => prev.map((table) => String(table.areaId) === String(editingArea.id) ? { ...table, areaName: updatedArea.name } : table));
      setSelectedTable((prev) => prev && String(prev.areaId) === String(editingArea.id) ? { ...prev, areaName: updatedArea.name } : prev);
      setAddForm((prev) => String(prev.selectedArea) === String(editingArea.id) ? { ...prev, selectedAreaTitle: updatedArea.name } : prev);
      setAssignForm((prev) => String(prev.areaId) === String(editingArea.id) ? { ...prev, areaId: updatedArea.id } : prev);
      setEditingArea(null);
      showAdminToast({ title: "Cập nhật khu vực thành công", message: `Đã cập nhật khu vực ${updatedArea.name}.` });
      window.dispatchEvent(new Event("areasUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật khu vực."); }
  };

  const handleDeleteArea = async (id, name) => {
    try {
      await tableService.deleteArea(id);
      showAdminToast({ title: "Xóa khu vực thành công", message: `Đã xóa khu vực ${name} và không gian tương ứng.` });
      await loadTableLayout();
      window.dispatchEvent(new Event("areasUpdated"));
      window.dispatchEvent(new Event("tablesUpdated"));
      setEditingArea(null);
      setDeleteConfirmArea(null);
    } catch (error) { console.error(error); alert(error.message || "Không thể xóa khu vực."); }
  };

  // ─── Table CRUD ───────────────────────────────────────────────────
  const openAddTable = () => {
    const currentArea = areas.find((area) => String(area.id) === String(selectedArea)) || areas[0];
    if (!currentArea) { alert("Vui lòng tạo khu vực trước khi thêm bàn."); return; }
    setTableForm({ areaId: currentArea.id, capacity: 4, status: "available", description: "" });
    setIsAddingTable(true);
  };

  const saveAddTable = async () => {
    if (!tableForm.areaId) { alert("Vui lòng chọn khu vực."); return; }
    if (Number(tableForm.capacity) <= 0) { alert("Sức chứa phải lớn hơn 0."); return; }
    try {
      const savedTable = await tableService.createTable({ areaId: tableForm.areaId, code: "", capacity: Number(tableForm.capacity || 4), status: tableForm.status, description: tableForm.description.trim() });
      setTables((prev) => [...prev, savedTable]);
      setSelectedArea(savedTable.areaId);
      setSelectedTable(savedTable);
      setActiveTab("map");
      setTableForm({ areaId: savedTable.areaId, capacity: 4, status: "available", description: "" });
      setIsAddingTable(false);
      showAdminToast({ title: "Thêm bàn thành công", message: `Đã thêm bàn ${savedTable.code}.` });
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); alert(error.message || "Không thể thêm bàn."); }
  };

  const openEditTable = (table) => {
    const editableStatus = table.status === "holding" || table.status === "booked" ? "available" : table.status;
    setEditingTable(table);
    setEditForm({ areaId: table.areaId, code: table.code, capacity: table.capacity, status: editableStatus, description: table.description });
  };

  const saveEditTable = async () => {
    if (!editingTable) return;
    try {
      const updatedTable = await tableService.updateTable(editingTable.id, { areaId: editForm.areaId, code: String(editForm.code || "").trim(), capacity: Number(editForm.capacity), status: editForm.status, description: editForm.description });
      setTables((prev) => prev.map((table) => String(table.id) === String(editingTable.id) ? updatedTable : table));
      setSelectedTable(updatedTable);
      setEditingTable(null);
      showAdminToast({ title: "Cập nhật bàn thành công", message: `Đã cập nhật bàn ${updatedTable.code}.` });
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật bàn."); }
  };

  const updateTableStatus = async (tableId, status) => {
    try {
      const updatedTable = await tableService.updateTableStatus(tableId, status);
      setTables((prev) => prev.map((table) => String(table.id) === String(tableId) ? updatedTable : table));
      setSelectedTable((prev) => prev && String(prev.id) === String(tableId) ? updatedTable : prev);
      showAdminToast({ title: "Cập nhật trạng thái bàn thành công", message: `Đã chuyển bàn ${updatedTable.code} sang "${TABLE_STATUS[status]}".` });
      window.dispatchEvent(new Event("tablesUpdated"));
    } catch (error) { console.error(error); alert(error.message || "Không thể cập nhật trạng thái bàn."); }
  };

  // ─── Booking Actions ──────────────────────────────────────────────
  const cancelCurrentBooking = async (booking) => {
    if (!booking) return;
    const confirmCancel = await showConfirm({ title: "Hủy đặt bàn", message: `Bạn có chắc muốn hủy đặt bàn ${booking.bookingCode || `DB${booking.id}`}?`, icon: <AlertTriangle size={28} />, iconBg: "bg-red-50 text-red-600", confirmStyle: "bg-red-600 hover:bg-red-700", confirmText: "Hủy đặt bàn" });
    if (!confirmCancel) return;
    try {
      const updatedBooking = await bookingService.updateBookingStatus(booking.id, "cancelled");
      setBookings((prev) => prev.map((item) => String(item.id) === String(booking.id) ? updatedBooking : item));
      setSelectedTable((prev) => prev ? { ...prev, status: "available", currentBooking: null } : prev);
      showAdminToast({ title: "Hủy đặt bàn thành công", message: `Đã hủy đặt bàn ${updatedBooking.bookingCode || `DB${updatedBooking.id}`}.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể hủy đặt bàn."); }
  };

  const confirmCurrentBooking = async (booking) => {
    if (!booking) return;
    try {
      const updatedBooking = await bookingService.updateBookingStatus(booking.id, "confirmed");
      setBookings((prev) => prev.map((item) => String(item.id) === String(booking.id) ? updatedBooking : item));
      setSelectedTable((prev) => prev ? { ...prev, status: "booked", currentBooking: updatedBooking } : prev);
      showAdminToast({ title: "Xác nhận đặt bàn thành công", message: `Đã xác nhận đặt bàn ${updatedBooking.bookingCode || `DB${updatedBooking.id}`}.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể xác nhận đặt bàn."); }
  };

  const completeCurrentBooking = async (booking, table) => {
    if (!booking || !table) return;
    if (booking.paymentStatus !== "paid") {
      const isPrivileged = ["admin", "manager"].includes(currentUser?.role);
      if (isPrivileged) {
        const bypass = await showConfirm({ title: "Cảnh báo thanh toán", message: `Lịch đặt bàn DB${booking.id} chưa được thanh toán!\n\nBạn là Quản lý/Admin, bạn có chắc chắn muốn bỏ qua thanh toán để HOÀN THÀNH phục vụ và giải phóng bàn ${table.code} không?`, icon: <AlertTriangle size={28} />, iconBg: "bg-red-50 text-red-600", confirmStyle: "bg-red-600 hover:bg-red-700", confirmText: "Bỏ qua & Hoàn thành" });
        if (!bypass) return;
      } else {
        alert("Không thể hoàn thành dịch vụ: Bàn này chưa thanh toán hóa đơn! Vui lòng thực hiện thanh toán trước.");
        return;
      }
    }
    const confirmComplete = await showConfirm({ title: "Xác nhận hoàn thành", message: `Bạn có chắc muốn hoàn thành đặt bàn ${booking.bookingCode || `DB${booking.id}`} và mở lại bàn ${table.code}?`, icon: <CheckCircle size={28} />, iconBg: "bg-green-50 text-green-600", confirmStyle: "bg-green-600 hover:bg-green-700", confirmText: "OK" });
    if (!confirmComplete) return;
    try {
      const updatedBooking = await bookingService.updateBookingStatus(booking.id, "completed");
      const updatedTable = await tableService.updateTableStatus(table.id, "available");
      setBookings((prev) => prev.map((item) => String(item.id) === String(booking.id) ? updatedBooking : item));
      setTables((prev) => prev.map((item) => String(item.id) === String(table.id) ? updatedTable : item));
      setSelectedTable({ ...updatedTable, currentBooking: null });
      showAdminToast({ title: "Hoàn thành đặt bàn thành công", message: `Đã hoàn thành đặt bàn ${updatedBooking.bookingCode || `DB${updatedBooking.id}`} và mở lại bàn ${updatedTable.code}.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể hoàn thành đặt bàn."); }
  };

  const startServingBooking = async (booking, table) => {
    if (!booking || !table) return;
    try {
      const updatedTable = await tableService.updateTableStatus(table.id, "serving");
      const updatedBooking = await bookingService.updateBookingStatus(booking.id, "serving");
      setTables((prev) => prev.map((item) => String(item.id) === String(table.id) ? updatedTable : item));
      setBookings((prev) => prev.map((item) => String(item.id) === String(booking.id) ? updatedBooking : item));
      setSelectedTable({ ...updatedTable, currentBooking: updatedBooking });
      showAdminToast({ title: "Nhận bàn thành công", message: `Đã chuyển bàn ${table.code} sang trạng thái phục vụ.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể nhận bàn."); }
  };

  // ─── Assign Booking ───────────────────────────────────────────────
  const unassignedBookings = bookings.filter((booking) => {
    const isActive = ["pending", "confirmed", "Chờ xác nhận", "Đã xác nhận"].includes(booking.status);
    const noArea = !booking.selectedAreaTitle || booking.selectedAreaTitle === "Nhà hàng sắp xếp" || booking.selectedAreaTitle === "Đang xếp";
    const noTable = !booking.selectedTable || booking.selectedTable === "Đang xếp" || booking.selectedTable === "Đang sắp xếp";
    return isActive && (noArea || noTable);
  });

  const openAssignBookingModal = (booking) => {
    const firstArea = areas[0];
    setAssignBooking(booking);
    setAssignForm({ areaId: booking.selectedArea || firstArea?.id || "", tableCode: "" });
  };

  const saveAssignBooking = async () => {
    if (!assignBooking) return;
    if (!assignForm.tableCode) { alert("Vui lòng chọn bàn"); return; }
    const area = areas.find((item) => String(item.id) === String(assignForm.areaId));
    try {
      const updatedBooking = await bookingService.updateBooking(assignBooking.id, { status: "confirmed", selectedArea: assignForm.areaId, selectedAreaTitle: area?.name || "", selectedTable: assignForm.tableCode, note: assignBooking.note || "", date: assignBooking.date, time: assignBooking.time, guests: Number(assignBooking.guests || assignBooking.people || 1) });
      setBookings((prev) => prev.map((booking) => String(booking.id) === String(assignBooking.id) ? updatedBooking : booking));
      setSelectedTable((prev) => prev ? { ...prev, status: "booked", currentBooking: updatedBooking } : prev);
      setAssignBooking(null);
      showAdminToast({ title: "Xếp bàn thành công", message: `Đã xếp bàn ${assignForm.tableCode} cho ${updatedBooking.bookingCode || `DB${updatedBooking.id}`}.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể xếp bàn."); }
  };

  const isTableBookedAtDate = (tableCode, date) => {
    return bookings.some((booking) => String(booking.selectedTable) === String(tableCode) && booking.date === date && ["pending", "confirmed", "Chờ xác nhận", "Đã xác nhận"].includes(booking.status));
  };

  // ─── Add Booking ──────────────────────────────────────────────────

  const getTableStatusForAdd = (table) => {
    if (!addForm.date) return table.status;
    const existedBooking = bookings.find((booking) => String(booking.selectedTable) === String(table.code) && booking.date === addForm.date && ["pending", "confirmed", "Chờ xác nhận", "Đã xác nhận"].includes(booking.status));
    if (existedBooking?.status === "pending" || existedBooking?.status === "Chờ xác nhận") return "holding";
    if (existedBooking?.status === "confirmed" || existedBooking?.status === "Đã xác nhận") return "booked";
    return table.status;
  };

  const findBestTableForAddBooking = () => {
    const guestCount = Number(addForm.guests || 0);
    return tables.filter((table) => {
      const sameArea = String(table.areaId) === String(addForm.selectedArea);
      const available = table.status === "available" && !isTableBookedAtDate(table.code, addForm.date);
      const enoughCapacity = guestCount <= 0 || Number(table.capacity || 0) >= guestCount;
      return sameArea && available && enoughCapacity;
    }).sort((a, b) => {
      const capacityDiff = Number(a.capacity || 0) - Number(b.capacity || 0);
      if (capacityDiff !== 0) return capacityDiff;
      return String(a.code || "").localeCompare(String(b.code || ""), "vi", { numeric: true });
    })[0] || null;
  };

  const handleSelectTableForAddBooking = async (table, status) => {
    if (status !== "available") return;
    const guestCount = Number(addForm.guests || 0);
    const tableCapacity = Number(table.capacity || 0);
    if (guestCount > 0 && tableCapacity < guestCount) {
      const suggestedTable = findBestTableForAddBooking();
      if (suggestedTable) {
        const shouldSwitch = await showConfirm({ title: "Gợi ý chuyển bàn", message: `Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người, nhưng lịch đặt này có ${guestCount} khách.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`, icon: <HelpCircle size={28} />, iconBg: "bg-blue-50 text-blue-600", confirmStyle: "bg-green-600 hover:bg-green-700", confirmText: "Chuyển bàn" });
        if (shouldSwitch) setAddForm((prev) => ({ ...prev, selectedTable: suggestedTable.code }));
        return;
      }
      alert(`Bàn ${table.code} chỉ chứa tối đa ${tableCapacity} người. Hiện khu vực này không có bàn phù hợp cho ${guestCount} khách.`);
      return;
    }
    setAddForm((prev) => ({ ...prev, selectedTable: table.code }));
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
    const guestCount = Number(addForm.guests);
    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      errs.guests = "Số khách phải lớn hơn 0";
    }
    if (!addForm.selectedTable) errs.selectedTable = "Vui lòng chọn bàn";

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      showAdminToast({
        title: "Lỗi nhập liệu",
        message: "Vui lòng kiểm tra các trường thông tin lỗi (được viền đỏ) và chọn bàn.",
        type: "error",
      });
      return;
    }
    setAddErrors({});

    const selectedTableData = tables.find((table) => String(table.code) === String(addForm.selectedTable) && String(table.areaId) === String(addForm.selectedArea));
    if (!selectedTableData) {
      showAdminToast({ title: "Lỗi dữ liệu", message: "Bàn đã chọn không hợp lệ. Vui lòng chọn lại.", type: "error" });
      setAddErrors({ selectedTable: true });
      return;
    }
    if (guestCount > Number(selectedTableData.capacity || 0)) {
      const suggestedTable = findBestTableForAddBooking();
      if (suggestedTable) {
        const shouldSwitch = await showConfirm({ title: "Gợi ý chuyển bàn", message: `Bàn ${selectedTableData.code} chỉ chứa tối đa ${selectedTableData.capacity} người, nhưng lịch đặt này có ${addForm.guests} khách.\n\nBạn có muốn chuyển sang bàn ${suggestedTable.code} (${suggestedTable.capacity} người) không?`, icon: <HelpCircle size={28} />, iconBg: "bg-blue-50 text-blue-600", confirmStyle: "bg-green-600 hover:bg-green-700", confirmText: "Chuyển bàn" });
        if (shouldSwitch) setAddForm((prev) => ({ ...prev, selectedTable: suggestedTable.code }));
        return;
      }
      alert(`Khu vực này không có bàn phù hợp cho ${addForm.guests} khách. Vui lòng chọn khu vực khác.`);
      return;
    }
    try {
      const savedBooking = await bookingService.createAdminBooking({ customerName: addForm.customerName.trim(), phone: addForm.phone.trim(), email: addForm.email.trim(), date: addForm.date, time: addForm.time, guests: guestCount, selectedArea: addForm.selectedArea, selectedAreaTitle: addForm.selectedAreaTitle, selectedTable: addForm.selectedTable, note: addForm.note.trim(), status: addForm.status, type: "table_only", total: 0 });
      setBookings((prev) => [savedBooking, ...prev]);
      setSelectedTable(null);
      setIsAddingBooking(false);
      const firstArea = areas[0];
      setAddForm({ customerName: "", phone: "", email: "", date: today, time: "", guests: 1, selectedArea: firstArea?.id || "", selectedAreaTitle: firstArea?.name || "", selectedTable: "", note: "", status: "pending" });
      showAdminToast({ title: "Tạo đặt bàn thành công", message: `Đã tạo đặt bàn ${savedBooking.bookingCode || `DB${savedBooking.id}`}.` });
    } catch (error) { console.error(error); alert(error.message || "Không thể tạo đặt bàn."); }
  };

  const resetFilter = () => { setSearch(""); setAreaFilter("all"); setStatusFilter("all"); setCapacityFilter("all"); };

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="overflow-x-auto xl:overflow-visible pb-1">
        <div className="grid grid-flow-col auto-cols-[150px] sm:auto-cols-[158px] md:auto-cols-[166px] lg:auto-cols-[172px] xl:grid-flow-row xl:grid-cols-6 xl:auto-cols-auto gap-2 w-max xl:w-full">
          <StatCard icon={<Building2 size={18} />} title="Tổng khu vực" value={totalAreas} bg="bg-green-50" color="text-green-700" note="hiện tại" />
          <StatCard icon={<LayoutGrid size={18} />} title="Tổng bàn" value={totalTables} bg="bg-blue-50" color="text-blue-600" note="hiện tại" />
          <StatCard icon={<CheckCircle size={18} />} title="Bàn trống" value={availableCount} bg="bg-green-50" color="text-green-600" note="hiện tại" />
          <StatCard icon={<Clock3 size={18} />} title="Đang giữ ngày đã chọn" value={holdingCount} bg="bg-orange-50" color="text-orange-600" note="theo lịch chọn" />
          <StatCard icon={<CalendarCheck size={18} />} title="Đã đặt ngày đã chọn" value={bookedCount} bg="bg-red-50" color="text-red-600" note="theo lịch chọn" />
          <StatCard icon={<Wrench size={18} />} title="Bảo trì" value={maintenanceCount} bg="bg-gray-100" color="text-gray-600" note="hiện tại" />
        </div>
      </div>

      {tableLoading && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-black text-green-700">
          Đang tải danh sách bàn/khu vực...
        </div>
      )}

      <div className={`grid grid-cols-1 gap-4 items-start ${selectedTable ? "xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
          {/* Tabs */}
          <div className="px-5 border-b border-gray-100">
            <div className="flex items-center gap-8 overflow-x-auto">
              <TabButton active={activeTab === "map"} onClick={() => setActiveTab("map")}>Sơ đồ bàn</TabButton>
              <TabButton active={activeTab === "list"} onClick={() => setActiveTab("list")}>Danh sách bàn</TabButton>
            </div>
          </div>

          {/* Map Tab */}
          {activeTab === "map" && (
            <>
              <div className="px-4 pt-4">
                <div className="rounded-2xl border border-gray-100 bg-green-50/40 p-4 flex flex-col md:flex-row md:items-end gap-4">
                  <label className="block">
                    <span className="text-sm font-black text-green-900">Ngày xem trạng thái bàn</span>
                    <input type="date" value={viewDate} onChange={(e) => { setViewDate(e.target.value); setSelectedTable(null); }} className="mt-2 h-11 rounded-xl border border-green-100 bg-white px-4 font-bold outline-none" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)] 2xl:grid-cols-[230px_minmax(0,1fr)] gap-3 sm:gap-4 p-3 sm:p-4">
                {/* Area sidebar */}
                <aside className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 self-start">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-primary">Khu vực</h3>
                    {canUseAction(currentUser, "tables:create") && (
                      <button onClick={openAddArea} title="Thêm khu vực" className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-green-700 hover:bg-green-50">
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {areas.map((area) => {
                      const areaTableCount = displayTables.filter((table) => String(table.areaId) === String(area.id)).length;
                      const isActive = String(selectedArea) === String(area.id);
                      return (
                        <div key={area.id} className={`group w-full rounded-xl border p-3 sm:p-4 transition flex items-start justify-between gap-3 ${isActive ? "bg-primary-50 border-primary/20 border-t-primary" : "bg-white border-gray-100 text-gray-600 hover:bg-primary-50/50"}`}>
                          <button type="button" onClick={() => setSelectedArea(area.id)} className="flex-1 text-left">
                            <p className="font-black text-sm sm:text-base leading-5">{area.name}</p>
                            <p className="text-xs sm:text-sm font-semibold mt-1">{areaTableCount} bàn</p>
                          </button>
                          {canUseAction(currentUser, "tables:update") && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); openEditArea(area); }} title="Chỉnh sửa khu vực" className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-secondary-700 flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 hover:bg-secondary-50 transition">
                              <Pencil size={15} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </aside>

                {/* Map content */}
                <div className="space-y-4 min-w-0">
                  <div className="overflow-x-auto pb-1 -mx-1 px-1">
                    <div className="flex items-center gap-2 min-w-max xl:min-w-0 xl:w-full">
                      <div className="flex items-center gap-1.5 shrink-0">
                        {Object.entries(TABLE_STATUS).map(([key, label]) => (
                          <Legend key={key} color={STATUS_DOT[key]} text={label} compact={!!selectedTable} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 xl:ml-auto">
                        {canUseAction(currentUser, "tables:create") && (
                          <button onClick={openAddTable} className="h-8 px-3 rounded-xl bg-primary-800 text-white text-[11px] font-black flex items-center justify-center gap-1.5 hover:bg-primary-900 transition whitespace-nowrap">
                            <Plus size={14} />Thêm bàn
                          </button>
                        )}
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 w-[132px] rounded-xl border border-gray-100 px-2.5 text-[11px] font-black outline-none bg-white">
                          <option value="all">Tất cả trạng thái</option>
                          {Object.entries(TABLE_STATUS).filter(([key]) => key !== "holding" && key !== "booked").map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {areas.filter((area) => selectedArea === "all" || String(area.id) === String(selectedArea)).map((area) => {
                    const areaTables = displayTables.filter((table) => String(table.areaId) === String(area.id) && (statusFilter === "all" || table.status === statusFilter));
                    return (
                      <div key={area.id} className="rounded-2xl border border-gray-100 p-4">
                        <h3 className="font-black text-primary mb-4">{area.name} <span className="text-sm text-gray-500">({areaTables.length} bàn)</span></h3>
                        <div className="overflow-x-auto px-2 py-3 -mx-2">
                          <div className="grid grid-cols-5 gap-2 sm:gap-3 xl:gap-4 min-w-[400px]">
                            {areaTables.map((table) => (
                              <TableButton key={table.id} table={table} active={selectedTable?.id === table.id} onClick={() => setSelectedTable(table)} />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unassigned Bookings */}
              {unassignedBookings.length > 0 && (
                <section className="mx-4 mb-4 rounded-2xl border border-orange-100 bg-orange-50/40 overflow-hidden">
                  <div className="px-5 py-4 border-b border-orange-100 flex items-center justify-between">
                    <h3 className="font-black text-primary">Khách đặt bàn chưa chọn khu vực / bàn</h3>
                    <span className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-600 text-sm font-black">{unassignedBookings.length} lịch</span>
                  </div>
                  <div className="max-h-[390px] overflow-auto relative">
                    <table className="min-w-[1230px] w-full text-left text-sm table-fixed">
                      <thead className="sticky top-0 z-30 bg-white text-gray-600 font-black text-xs uppercase shadow-sm">
                        <tr>
                          <th className="w-[190px] px-4 py-3 whitespace-nowrap bg-white">Mã đặt</th>
                          <th className="w-[190px] px-4 py-3 whitespace-nowrap bg-white">Khách hàng</th>
                          <th className="w-[150px] px-4 py-3 whitespace-nowrap bg-white">SĐT</th>
                          <th className="w-[140px] px-4 py-3 whitespace-nowrap bg-white">Ngày</th>
                          <th className="w-[100px] px-4 py-3 whitespace-nowrap bg-white">Giờ</th>
                          <th className="w-[110px] px-4 py-3 whitespace-nowrap bg-white">Số khách</th>
                          <th className="w-[200px] px-4 py-3 whitespace-nowrap bg-white">Ghi chú</th>
                          <th className="w-[150px] px-4 py-3 text-center sticky right-0 bg-white z-30 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)]">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unassignedBookings.map((booking) => (
                          <tr key={booking.id} className="border-t border-orange-100 bg-white">
                            <td className="w-[190px] px-4 py-3 font-black text-primary-700 whitespace-nowrap overflow-hidden text-ellipsis">DB{booking.id}</td>
                            <td className="w-[190px] px-4 py-3 font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">{booking.customerName || booking.fullName || booking.name || "Khách hàng"}</td>
                            <td className="w-[150px] px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{booking.phone || "Chưa có"}</td>
                            <td className="w-[140px] px-4 py-3 font-semibold whitespace-nowrap">{formatDate(booking.date)}</td>
                            <td className="w-[100px] px-4 py-3 font-semibold whitespace-nowrap">{booking.time || "Chưa có"}</td>
                            <td className="w-[110px] px-4 py-3 font-black whitespace-nowrap">{booking.guests || booking.people || 0} người</td>
                            <td className="w-[200px] px-4 py-3 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">{booking.note || "Không có"}</td>
                            <td className="w-[150px] px-4 py-3 text-center sticky right-0 bg-white z-20 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)]">
                              <button onClick={() => openAssignBookingModal(booking)} className="h-9 min-w-[92px] px-4 rounded-lg bg-primary-700 text-white font-black hover:bg-primary-800 transition whitespace-nowrap">Xếp bàn</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}

          {/* List Tab */}
          {activeTab === "list" && (
            <>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_150px_150px_150px_56px] gap-3">
                  <div className="h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm min-w-0">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm bàn, khu vực..." className="w-full outline-none text-sm" />
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <SelectBox label="Khu vực" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                    <option value="all">Tất cả</option>
                    {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                  </SelectBox>
                  <SelectBox label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Tất cả</option>
                    {Object.entries(TABLE_STATUS).filter(([key]) => key !== "holding" && key !== "booked").map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </SelectBox>
                  <SelectBox label="Sức chứa" value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="1-4">1 - 4 người</option>
                    <option value="5-6">5 - 6 người</option>
                    <option value="7+">Trên 7 người</option>
                  </SelectBox>
                  <button onClick={resetFilter} className="h-12 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition">
                    <RotateCcw size={17} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-4 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-500">Danh sách bàn ({filteredTables.length} bàn)</p>
                {canUseAction(currentUser, "tables:create") && (
                  <button onClick={openAddTable} className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light shadow-sm shadow-primary/30 transition self-start sm:self-auto flex items-center gap-2 whitespace-nowrap">
                    <Plus size={16} />Thêm bàn
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-left text-sm">
                  <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Mã bàn</th>
                      <th className="px-4 py-3">Khu vực</th>
                      <th className="px-4 py-3">Sức chứa</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Mô tả</th>
                      <th className="px-4 py-3">Cập nhật cuối</th>
                      <th className="px-4 py-3 text-center sticky right-0 bg-[#fbfcfb]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTables.map((table) => (
                      <tr key={table.id} onClick={() => setSelectedTable(table)} className={`border-t border-gray-100 cursor-pointer hover:bg-primary-50/30 ${selectedTable?.id === table.id ? "bg-primary-50/50" : ""}`}>
                        <td className="px-4 py-3 font-black text-primary-700">{table.code}</td>
                        <td className="px-4 py-3 font-bold">{table.areaName}</td>
                        <td className="px-4 py-3">{table.capacity} người</td>
                        <td className="px-4 py-3"><StatusBadge status={table.status} /></td>
                        <td className="px-4 py-3 text-gray-600">{table.description}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDateTime(table.updatedAt)}</td>
                        <td className="px-4 py-3 sticky right-0 bg-white">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton icon={<Eye size={16} />} color="primary" onClick={(e) => { e.stopPropagation(); setSelectedTable(table); }} />
                            <ActionButton icon={<Pencil size={16} />} color="secondary" onClick={(e) => { e.stopPropagation(); openEditTable(table); }} />
                            <ActionButton icon={table.status === "disabled" ? <Unlock size={16} /> : <Lock size={16} />} color={table.status === "disabled" ? "primary" : "red"} onClick={(e) => { e.stopPropagation(); updateTableStatus(table.id, table.status === "disabled" ? "available" : "disabled"); }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <GlobalPagination
                total={filteredTables.length}
                page={currentPage}
                limit={pageSize}
                onPageChange={setCurrentPage}
                onLimitChange={setPageSize}
                isLoading={tableLoading}
                limitOptions={[10, 20, 50, 100]}
              />
            </>
          )}
        </section>

        {selectedTable && (
          <TableDetailPanel
            table={selectedTable}
            booking={selectedTable.currentBooking}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            onClose={() => setSelectedTable(null)}
            onEdit={() => openEditTable(selectedTable)}
            onStatusChange={(status) => updateTableStatus(selectedTable.id, status)}
            onCancelBooking={() => cancelCurrentBooking(selectedTable.currentBooking)}
            onConfirmBooking={() => confirmCurrentBooking(selectedTable.currentBooking)}
            onCompleteBooking={() => completeCurrentBooking(selectedTable.currentBooking, selectedTable)}
            onStartServing={startServingBooking}
            onOpenAddItems={billing.setActiveAddItemsBooking}
            onOpenBilling={billing.setActiveBillingBooking}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Assign Booking Modal */}
      {assignBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-primary-950">Xếp bàn cho khách</h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">DB{assignBooking.id} - {assignBooking.customerName || assignBooking.name || "Khách hàng"}</p>
              </div>
              <button onClick={() => setAssignBooking(null)} className="text-gray-400 hover:text-red-500"><X size={22} /></button>
            </div>
            <div className="p-6 space-y-4">
              <SelectField label="Khu vực" value={assignForm.areaId} onChange={(value) => setAssignForm((prev) => ({ ...prev, areaId: value, tableCode: "" }))}>
                {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
              </SelectField>
              <SelectField label="Bàn trống" value={assignForm.tableCode} onChange={(value) => setAssignForm((prev) => ({ ...prev, tableCode: value }))}>
                <option value="">Chọn bàn</option>
                {tables.filter((table) => String(table.areaId) === String(assignForm.areaId) && table.status === "available" && Number(table.capacity) >= Number(assignBooking.guests || assignBooking.people || 0) && !isTableBookedAtDate(table.code, assignBooking.date)).map((table) => (
                  <option key={table.id} value={table.code}>Bàn {table.code} - {table.capacity} người</option>
                ))}
              </SelectField>
              <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 text-sm">
                <p className="font-black text-primary-900 mb-2">Thông tin khách</p>
                <p>Khách: {assignBooking.customerName || assignBooking.name}</p>
                <p>SĐT: {assignBooking.phone || "Chưa có"}</p>
                <p>Thời gian: {formatDate(assignBooking.date)} - {assignBooking.time || "Chưa có"}</p>
                <p>Số khách: {assignBooking.guests || assignBooking.people || 0}</p>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setAssignBooking(null)} className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200">Đóng</button>
              <button onClick={saveAssignBooking} className="h-11 px-5 rounded-xl bg-primary-800 text-white font-black hover:bg-primary-900">Lưu xếp bàn</button>
            </div>
          </div>
        </div>
      )}

      {/* Space Modals */}
      <AdminSpaceModals
        isAddingArea={isAddingArea} setIsAddingArea={setIsAddingArea}
        areaForm={areaForm} setAreaForm={setAreaForm} saveAddArea={saveAddArea}
        isAddingTable={isAddingTable} setIsAddingTable={setIsAddingTable}
        tableForm={tableForm} setTableForm={setTableForm} areas={areas} saveAddTable={saveAddTable}
        editingArea={editingArea} setEditingArea={setEditingArea}
        areaEditForm={areaEditForm} setAreaEditForm={setAreaEditForm} saveEditArea={saveEditArea}
        deleteConfirmArea={deleteConfirmArea} setDeleteConfirmArea={setDeleteConfirmArea} handleDeleteArea={handleDeleteArea}
        editingTable={editingTable} setEditingTable={setEditingTable}
        tableEditForm={editForm} setTableEditForm={setEditForm} saveEditTable={saveEditTable}
      />

      {/* Add Booking Modal */}
      <AdminAddBookingModal
        isAddingBooking={isAddingBooking} setIsAddingBooking={setIsAddingBooking}
        addForm={addForm} setAddForm={setAddForm}
        areas={areas} tables={tables}
        getTableStatusForAdd={getTableStatusForAdd}
        handleSelectTableForAddBooking={handleSelectTableForAddBooking}
        saveAddBooking={saveAddBooking}
        errors={addErrors}
      />

      {/* Add Items Modal */}
      <AdminAddItemsModal
        activeAddItemsBooking={billing.activeAddItemsBooking}
        setActiveAddItemsBooking={billing.setActiveAddItemsBooking}
        cartToAdd={billing.cartToAdd} setCartToAdd={billing.setCartToAdd}
        menuItems={menuItems} menuLoading={menuLoading} filteredMenuItems={filteredMenuItems}
        itemSearch={itemSearch} setItemSearch={setItemSearch}
        itemCategory={itemCategory} setItemCategory={setItemCategory}
        handleAddItemToTempCart={billing.handleAddItemToTempCart}
        handleUpdateTempCartQty={billing.handleUpdateTempCartQty}
        saveAddedItems={billing.saveAddedItems}
      />

      {/* Billing Modal */}
      <AdminBillingModal
        activeBillingBooking={billing.activeBillingBooking}
        setActiveBillingBooking={billing.setActiveBillingBooking}
        appliedCoupon={billing.appliedCoupon}
        applyCouponCode={billing.applyCouponCode}
        couponCodeInput={billing.couponCodeInput}
        setCouponCodeInput={billing.setCouponCodeInput}
        couponMsg={billing.couponMsg}
        paymentMethod={billing.paymentMethod}
        setPaymentMethod={billing.setPaymentMethod}
        simulatedPaid={billing.simulatedPaid}
        cashReceived={billing.cashReceived}
        handleCashReceivedChange={billing.handleCashReceivedChange}
        setCashReceived={billing.setCashReceived}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        handleSimulatePayment={billing.handleSimulatePayment}
        confirmPayment={billing.confirmPayment}
      />

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${confirmDialog.iconBg || "bg-blue-50 text-blue-600"}`}>
              {confirmDialog.icon || <HelpCircle size={28} />}
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-base">{confirmDialog.title}</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-line">{confirmDialog.message}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => { setConfirmDialog(null); if (confirmDialog.onCancel) confirmDialog.onCancel(); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
              <button type="button" onClick={() => { setConfirmDialog(null); if (confirmDialog.onConfirm) confirmDialog.onConfirm(); }} className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm ${confirmDialog.confirmStyle || "bg-blue-600 hover:bg-blue-700"}`}>{confirmDialog.confirmText || "Xác nhận"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTablesPage;
