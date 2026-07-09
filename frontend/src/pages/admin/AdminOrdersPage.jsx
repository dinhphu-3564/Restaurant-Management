import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { showAdminToast } from "../../components/admin/AdminToast";
import { removeVietnameseTones } from "../../utils/string";
import { getCurrentUser, getAuthToken } from "../../utils/auth";
import { socket } from "../../utils/socket";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import {
  getStatusTextOrder, getStatusStyleOrder, getServiceText,
  getPaymentText, getPaymentStatusText,
  formatPriceOrder, formatDateTimeOrder, hasVietnameseTone,
} from "../../utils/orderHelpers";
import {
  OrderDetailPanel, DetailBlock, DetailRow,
} from "../../components/admin/AdminOrderComponents";
import GlobalPagination from "../../components/admin/GlobalPagination";
import {
  ShoppingBag, Clock3, CheckCircle, XCircle, Truck, Wallet,
  Search, Eye, Pencil, Trash2, RotateCcw, CalendarDays,
  Store, Utensils, CreditCard, Landmark,
} from "lucide-react";

const API_URL = "http://localhost:5001/api/orders";
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getServiceIcon = (type) => {
  switch (type) {
    case "delivery": return <Truck size={18} className="text-green-600" />;
    case "pickup": return <Store size={18} className="text-green-600" />;
    case "dinein": return <Utensils size={18} className="text-green-600" />;
    default: return <Utensils size={18} className="text-gray-500" />;
  }
};

const getPaymentIcon = (method) => {
  switch (method) {
    case "bank": return <Landmark size={18} className="text-blue-600" />;
    case "momo": return <Wallet size={18} className="text-pink-500" />;
    case "vnpay": return <CreditCard size={18} className="text-blue-500" />;
    default: return <Wallet size={18} className="text-gray-500" />;
  }
};

function AdminOrdersPage() {
  const currentUser = getCurrentUser();
  const { setExportExcelHandler, globalSearch, dateRange, dateMode, dateLabel } = useOutletContext();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  // ─── State ────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState(null);
  const [editForm, setEditForm] = useState({ status: "pending", paymentMethod: "", note: "" });

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) setStatusFilter(statusParam);
  }, [searchParams]);

  // ─── Load Orders ──────────────────────────────────────────────────
  const loadOrders = () => {
    fetch(API_URL, { headers: { ...getAuthHeaders() } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
          const viewId = searchParams.get("view");
          if (viewId) {
            const orderToView = data.orders.find((o) => String(o.id) === String(viewId));
            if (orderToView) setSelectedOrder(orderToView);
          }
        }
      })
      .catch((error) => console.error("Không lấy được đơn hàng:", error));
  };

  useEffect(() => {
    loadOrders();
    const handleOrderChange = () => loadOrders();
    window.addEventListener("ordersUpdated", handleOrderChange);
    socket.on("new_order", handleOrderChange);
    socket.on("order_updated", handleOrderChange);
    return () => {
      window.removeEventListener("ordersUpdated", handleOrderChange);
      socket.off("new_order", handleOrderChange);
      socket.off("order_updated", handleOrderChange);
    };
  }, [searchParams]);

  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = orders.find((o) => String(o.id) === String(selectedOrder.id));
      if (updatedOrder && JSON.stringify(updatedOrder) !== JSON.stringify(selectedOrder)) {
        if (updatedOrder.totalPaid > (selectedOrder.totalPaid || 0)) {
          showAdminToast({ title: "Thanh toán nhận được", message: "Khách hàng vừa chuyển khoản cho đơn hàng này!", type: "success" });
        }
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders, selectedOrder]);

  // ─── Stats ────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, item) => sum + Number(item.total || item.totalPrice || 0), 0);
  const pendingCount = orders.filter((item) => ["Chờ xác nhận", "Chờ xử lý"].includes(getStatusTextOrder(item.status))).length;
  const preparingCount = orders.filter((item) => getStatusTextOrder(item.status) === "Đang chuẩn bị").length;
  const deliveringCount = orders.filter((item) => getStatusTextOrder(item.status) === "Đang giao").length;
  const completedCount = orders.filter((item) => getStatusTextOrder(item.status) === "Hoàn thành").length;
  const cancelledCount = orders.filter((item) => getStatusTextOrder(item.status) === "Đã hủy").length;

  // ─── Filters ──────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.customerName || order.fullName || order.name || "";
      const phone = order.phone || "";
      const orderId = String(order.id || "");
      const keyword = (globalSearch || search).toLowerCase().trim();
      const searchKeyword = keyword.replace("#", "");
      const rawCustomerName = customerName.toLowerCase();
      const normalizedCustomerName = removeVietnameseTones(customerName);
      const normalizedKeyword = removeVietnameseTones(searchKeyword);
      const matchName = !keyword ? true : hasVietnameseTone(keyword) ? rawCustomerName.startsWith(keyword) : normalizedCustomerName.startsWith(normalizedKeyword);
      const matchSearch = !keyword || matchName || phone.includes(searchKeyword) || orderId.toLowerCase().includes(searchKeyword);

      let matchDate = true;
      if (dateRange?.startDate || dateRange?.endDate) {
        const orderDate = new Date(order.createdAt);
        const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        matchDate = (!start || orderDate >= start) && (!end || orderDate <= end);
      }

      const matchService = serviceType === "all" || order.serviceType === serviceType;
      const matchPayment = paymentMethod === "all" || order.paymentMethod === paymentMethod;
      const matchStatus = statusFilter === "all" || getStatusTextOrder(order.status) === statusFilter || order.status === statusFilter;
      const matchTab = activeTab === "all" || (activeTab === "dinein" && order.serviceType === "dinein") || (activeTab === "food" && order.serviceType === "delivery") || (activeTab === "pickup" && order.serviceType === "pickup") || (activeTab === "cancelled" && getStatusTextOrder(order.status) === "Đã hủy");
      return matchSearch && matchDate && matchService && matchPayment && matchStatus && matchTab;
    });
  }, [orders, search, globalSearch, dateRange, serviceType, paymentMethod, statusFilter, activeTab]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = useMemo(() => filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filteredOrders, currentPage, pageSize]);

  useEffect(() => setCurrentPage(1), [search, globalSearch, dateRange, serviceType, paymentMethod, statusFilter, activeTab, pageSize]);
  const resetFilter = () => { setSearch(""); setServiceType("all"); setPaymentMethod("all"); setStatusFilter("all"); setActiveTab("all"); };

  // ─── Excel Export ─────────────────────────────────────────────────
  const formatFileDate = (value) => { if (!value) return ""; const [year, month, day] = value.split("-"); return `${day}-${month}-${year}`; };
  const getOrderMonth = (order) => { const date = new Date(order.createdAt); if (Number.isNaN(date.getTime())) return null; return date.getMonth() + 1; };
  const getExcelFileName = () => {
    if (dateMode === "month" && dateLabel) return `DonHang_${dateLabel.replaceAll(" ", "_").replaceAll("/", "_")}.xlsx`;
    if (dateMode === "year" && dateLabel) return `DonHang_${dateLabel.replaceAll(" ", "_")}.xlsx`;
    if (dateMode === "week" && dateLabel) return `DonHang_Tuan_${formatFileDate(dateRange.startDate)}_den_${formatFileDate(dateRange.endDate)}.xlsx`;
    if (dateRange?.startDate && dateRange?.endDate) return `DonHang_${formatFileDate(dateRange.startDate)}_den_${formatFileDate(dateRange.endDate)}.xlsx`;
    return "DonHang_TatCa.xlsx";
  };
  const mapOrderToExcelRow = (order, index) => ({ STT: index + 1, "Mã đơn": order.id || "", "Khách hàng": order.customerName || order.fullName || order.name || "", "Số điện thoại": order.phone || "", "Loại phục vụ": getServiceText(order.serviceType), "Phương thức thanh toán": getPaymentText(order.paymentMethod), "Tổng tiền": Number(order.total || order.totalPrice || 0), "Trạng thái": getStatusTextOrder(order.status), "Ngày tạo": formatDateTimeOrder(order.createdAt) });
  const setSheetColumnWidths = (worksheet, widths) => { worksheet["!cols"] = widths.map((width) => ({ wch: width })); };
  const formatMoneyColumn = (worksheet, columnIndex) => {
    if (!worksheet["!ref"]) return;
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: columnIndex });
      if (worksheet[cellAddress]) worksheet[cellAddress].z = '#,##0 "₫"';
    }
  };
  const styleWorksheet = (worksheet, { centerCols = [], rightCols = [], boldRows = [] } = {}) => {
    if (!worksheet["!ref"]) return;
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cell]) continue;
        const isBoldRow = boldRows.includes(row);
        let horizontal = "left";
        if (isBoldRow || centerCols.includes(col)) horizontal = "center";
        else if (rightCols.includes(col)) horizontal = "right";
        worksheet[cell].s = { ...worksheet[cell].s, font: { ...(worksheet[cell].s?.font || {}), bold: isBoldRow }, alignment: { ...(worksheet[cell].s?.alignment || {}), horizontal, vertical: "center" } };
      }
    }
  };

  const exportToExcel = () => {
    if (dateMode === "year" && dateRange?.startDate && dateRange?.endDate) {
      // Year export
      const workbook = XLSX.utils.book_new();
      const summaryData = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const monthOrders = filteredOrders.filter((order) => getOrderMonth(order) === month);
        const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0);
        return { Tháng: `Tháng ${month}`, "Số đơn": monthOrders.length, "Tổng tiền": monthRevenue };
      });
      const totalOrdersInYear = summaryData.reduce((sum, item) => sum + Number(item["Số đơn"] || 0), 0);
      const totalRevenueInYear = summaryData.reduce((sum, item) => sum + Number(item["Tổng tiền"] || 0), 0);
      summaryData.push({ Tháng: "", "Số đơn": "", "Tổng tiền": "" });
      summaryData.push({ Tháng: "Tổng cộng", "Số đơn": totalOrdersInYear, "Tổng tiền": totalRevenueInYear });
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      formatMoneyColumn(summarySheet, 2);
      setSheetColumnWidths(summarySheet, [16, 12, 24]);
      const totalRowIndex = summaryData.findIndex((item) => item.Tháng === "Tổng cộng");
      styleWorksheet(summarySheet, { centerCols: [0, 1], rightCols: [2], boldRows: [0, totalRowIndex + 1] });
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng hợp");
      for (let month = 1; month <= 12; month++) {
        const monthOrders = filteredOrders.filter((order) => getOrderMonth(order) === month);
        const monthData = monthOrders.length > 0 ? monthOrders.map((order, index) => mapOrderToExcelRow(order, index)) : [{ STT: "", "Mã đơn": "Không có đơn hàng", "Khách hàng": "", "Số điện thoại": "", "Loại phục vụ": "", "Phương thức thanh toán": "", "Tổng tiền": "", "Trạng thái": "", "Ngày tạo": "" }];
        const monthSheet = XLSX.utils.json_to_sheet(monthData);
        formatMoneyColumn(monthSheet, 6);
        setSheetColumnWidths(monthSheet, [10, 22, 26, 22, 22, 22, 26, 22, 22]);
        styleWorksheet(monthSheet, { centerCols: [0, 1, 3, 7, 8], rightCols: [6], boldRows: [0] });
        XLSX.utils.book_append_sheet(workbook, monthSheet, `Tháng ${month}`);
      }
      const blob = new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, getExcelFileName());
    } else {
      const exportData = filteredOrders.map((order, index) => mapOrderToExcelRow(order, index));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const totalOrders = filteredOrders.length;
      const totalRev = filteredOrders.reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0);
      formatMoneyColumn(worksheet, 6);
      worksheet["!cols"] = [{ wch: 10 }, { wch: 22 }, { wch: 26 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 26 }, { wch: 22 }, { wch: 22 }, { wch: 6 }, { wch: 22 }, { wch: 22 }];
      styleWorksheet(worksheet, { centerCols: [0, 1, 3, 7, 8], rightCols: [6], boldRows: [0] });
      worksheet["K1"] = { t: "s", v: "THỐNG KÊ" };
      worksheet["K2"] = { t: "s", v: "Tổng số đơn" };
      worksheet["L2"] = { t: "n", v: totalOrders };
      worksheet["K3"] = { t: "s", v: "Tổng tiền" };
      worksheet["L3"] = { t: "n", v: totalRev };
      worksheet["L3"].z = '#,##0 "₫"';
      worksheet["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(exportData.length, 2), c: 11 } });
      ["K1", "K2", "K3", "L2", "L3"].forEach((cell) => { if (!worksheet[cell]) return; worksheet[cell].s = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } }; });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hàng");
      const blob = new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, getExcelFileName());
    }
    showAdminToast({ title: "Xuất Excel thành công", message: `Đã xuất file ${getExcelFileName()}.` });
  };

  useEffect(() => {
    setExportExcelHandler(() => exportToExcel);
    return () => setExportExcelHandler(null);
  }, [setExportExcelHandler, filteredOrders, dateMode, dateLabel, dateRange?.startDate, dateRange?.endDate]);

  // ─── Order Actions ────────────────────────────────────────────────
  const updateOrderStatus = async (id, status) => {
    if (status === "completed") {
      const currentOrder = orders.find((o) => String(o.id) === String(id));
      if (currentOrder && (currentOrder.remainingAmount > 0 || currentOrder.paymentStatus !== "paid")) {
        showAdminToast({ title: "Không thể hoàn thành", message: "Đơn hàng chưa thanh toán đủ số tiền. Vui lòng thanh toán phần còn thiếu trước khi hoàn thành.", type: "error" });
        return;
      }
    }
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ status, updatedAt: new Date().toISOString() }) });
      const data = await res.json();
      if (!data.success) { showAdminToast({ title: "Lỗi cập nhật", message: data.message || "Không thể cập nhật trạng thái đơn hàng.", type: "error" }); return; }
      const updatedOrder = data.order;
      setOrders((prev) => prev.map((order) => String(order.id) === String(id) ? updatedOrder : order));
      setSelectedOrder((prev) => prev && String(prev.id) === String(id) ? updatedOrder : prev);
      showAdminToast({ title: "Cập nhật trạng thái đơn hàng thành công", message: `Đã chuyển đơn #${updatedOrder.id} sang "${getStatusTextOrder(status)}".` });
    } catch (error) { console.error(error); alert("Không kết nối được backend."); }
  };

  const openEditOrderModal = (order) => { setEditingOrder(order); setEditForm({ status: order.status || "pending", paymentMethod: order.paymentMethod || "", note: order.note || "" }); };

  const saveEditOrder = async () => {
    if (!editingOrder) return;
    try {
      const res = await fetch(`${API_URL}/${editingOrder.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ status: editForm.status, paymentMethod: editForm.paymentMethod, note: editForm.note, updatedAt: new Date().toISOString() }) });
      const data = await res.json();
      if (!data.success) { alert("Không thể lưu thay đổi đơn hàng."); return; }
      const updatedOrder = data.order;
      setOrders((prev) => prev.map((order) => String(order.id) === String(editingOrder.id) ? updatedOrder : order));
      setSelectedOrder((prev) => prev && String(prev.id) === String(editingOrder.id) ? updatedOrder : prev);
      showAdminToast({ title: "Lưu thay đổi đơn hàng thành công", message: `Đã cập nhật đơn #${updatedOrder.id}.` });
      setEditingOrder(null);
    } catch (error) { console.error(error); alert("Không kết nối được backend."); }
  };

  const cancelOrderByTrash = (order) => setDeleteConfirmOrder({ cancel: true, order });
  const executeCancelOrder = (order) => updateOrderStatus(order.id, "cancelled");

  const toggleSelectOrder = (orderId) => setSelectedOrderIds((prev) => prev.includes(String(orderId)) ? prev.filter((id) => id !== String(orderId)) : [...prev, String(orderId)]);
  const toggleSelectAllCurrentPage = () => {
    const currentIds = paginatedOrders.map((order) => String(order.id));
    const isSelectedAll = currentIds.every((id) => selectedOrderIds.includes(id));
    if (isSelectedAll) setSelectedOrderIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    else setSelectedOrderIds((prev) => [...new Set([...prev, ...currentIds])]);
  };

  const executeUpdateSelectedOrdersStatus = async (status) => {
    try {
      const updatedAt = new Date().toISOString();
      const results = await Promise.all(selectedOrderIds.map(async (id) => { const res = await fetch(`${API_URL}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ status, updatedAt }) }); return res.json(); }));
      const hasError = results.some((item) => !item.success);
      if (hasError) { showAdminToast({ title: "Thất bại", message: "Có đơn hàng cập nhật thất bại. Vui lòng tải lại danh sách.", type: "error" }); return; }
      const updatedOrderMap = results.reduce((map, item) => { if (item.success && item.order) map[String(item.order.id)] = item.order; return map; }, {});
      setOrders((prev) => prev.map((order) => updatedOrderMap[String(order.id)] || order));
      setSelectedOrder((prev) => prev ? updatedOrderMap[String(prev.id)] || prev : prev);
      showAdminToast({ title: "Cập nhật hàng loạt thành công", message: `Đã chuyển ${selectedOrderIds.length} đơn hàng sang trạng thái "${getStatusTextOrder(status)}".` });
      setSelectedOrderIds([]);
    } catch (error) { console.error(error); showAdminToast({ title: "Thất bại", message: "Không thể cập nhật nhiều đơn hàng.", type: "error" }); }
  };

  const updateSelectedOrdersStatus = (status) => { if (selectedOrderIds.length === 0) return; setDeleteConfirmOrder({ bulkStatus: status }); };

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
        <OrderStatCard icon={<ShoppingBag />} title="Tất cả đơn hàng" value={orders.length} bg="bg-green-50" color="text-green-700" />
        <OrderStatCard icon={<Clock3 />} title="Chờ xác nhận" value={pendingCount} bg="bg-blue-50" color="text-blue-600" />
        <OrderStatCard icon={<CalendarDays />} title="Đang chuẩn bị" value={preparingCount} bg="bg-purple-50" color="text-purple-600" />
        <OrderStatCard icon={<Truck />} title="Đang giao" value={deliveringCount} bg="bg-orange-50" color="text-orange-600" />
        <OrderStatCard icon={<CheckCircle />} title="Hoàn thành" value={completedCount} bg="bg-green-50" color="text-green-600" />
        <OrderStatCard icon={<XCircle />} title="Đã hủy" value={cancelledCount} bg="bg-red-50" color="text-red-600" />
        <OrderStatCard icon={<Wallet />} title="Tổng doanh thu" value={formatPriceOrder(totalRevenue)} bg="bg-yellow-50" color="text-yellow-600" />
      </div>

      <div className={`grid grid-cols-1 gap-4 items-start ${selectedOrder ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-5 border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center overflow-x-auto">
                {[["all", "Tất cả đơn hàng"], ["dinein", "Ăn tại quán"], ["food", "Giao tận nơi"], ["pickup", "Đến lấy"], ["cancelled", "Đã hủy"]].map(([value, label]) => (
                  <TabButton key={value} active={activeTab === value} onClick={() => setActiveTab(value)}>{label}</TabButton>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                <span>Hiển thị</span>
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-10 w-[140px] rounded-xl border border-gray-100 px-3 font-bold outline-none bg-white shadow-sm">
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 space-y-3">
            <div className="flex flex-nowrap items-center gap-3 overflow-hidden">
              <div className={`h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm shrink-0 ${selectedOrder ? "w-[240px]" : "w-[380px] 2xl:w-[450px]"}`}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm theo mã đơn, khách hàng, SĐT..." className="w-full min-w-0 outline-none text-sm truncate" />
                <Search size={18} className="text-gray-400 shrink-0" />
              </div>
              <SelectBox label="Loại hình phục vụ" value={serviceType} onChange={(e) => setServiceType(e.target.value)} compact={selectedOrder}>
                <option value="all">Tất cả</option>
                <option value="dinein">Ăn tại quán</option>
                <option value="delivery">Giao tận nơi</option>
                <option value="pickup">Đến lấy tại quán</option>
              </SelectBox>
              <SelectBox label="Phương thức thanh toán" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} compact={selectedOrder}>
                <option value="all">Tất cả</option>
                <option value="cash">Tiền mặt</option>
                <option value="bank">Chuyển khoản</option>
                <option value="momo">Ví MoMo</option>
                <option value="vnpay">VNPay</option>
                <option value="pay_after_meal">Sau bữa ăn</option>
              </SelectBox>
              <SelectBox label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} compact={selectedOrder}>
                <option value="all">Tất cả</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                <option value="Đang giao">Đang giao</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </SelectBox>
              <button onClick={resetFilter} className={`h-12 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-1 shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 ${selectedOrder ? "w-[56px]" : "w-[80px]"}`}>
                <RotateCcw size={15} /><span className={selectedOrder ? "hidden 2xl:inline" : ""}>Xóa</span>
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedOrderIds.length > 0 && (
            <div className="mx-4 mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-primary">Đã chọn {selectedOrderIds.length} đơn hàng</p>
              <div className="flex flex-wrap items-center gap-2">
                {[["confirmed", "Xác nhận", "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"], ["preparing", "Chuẩn bị", "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"], ["delivering", "Đang giao", "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"], ["completed", "Hoàn thành", "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"], ["cancelled", "Hủy đơn", "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"]].map(([status, label, style]) => (
                  <button key={status} onClick={() => updateSelectedOrdersStatus(status)} className={`h-10 px-4 rounded-xl border text-sm font-black transition ${style}`}>{label}</button>
                ))}
                <button onClick={() => setSelectedOrderIds([])} className="h-10 px-4 rounded-xl bg-white text-gray-500 border border-gray-100 text-sm font-black hover:bg-gray-50 transition">Bỏ chọn</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-[#fbfcfb] text-gray-500 font-bold text-sm whitespace-nowrap">
                <tr>
                  <th className="w-[50px] px-4 py-3">
                    <input type="checkbox" checked={paginatedOrders.length > 0 && paginatedOrders.every((order) => selectedOrderIds.includes(String(order.id)))} onChange={toggleSelectAllCurrentPage} className="w-4 h-4 accent-green-700" />
                  </th>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Loại phục vụ</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3 text-center">Tổng tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="w-[120px] px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  paginatedOrders.map((order, index) => (
                    <tr key={order.id || index} onClick={() => setSelectedOrder(order)} className={`border-t border-gray-100 hover:bg-green-50/30 transition-colors cursor-pointer ${String(selectedOrder?.id) === String(order.id) ? "bg-green-50/50" : ""}`}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selectedOrderIds.includes(String(order.id))} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelectOrder(order.id)} className="w-4 h-4 accent-green-700" /></td>
                      <td className="px-4 py-3 font-black text-green-700 whitespace-nowrap">#{order.id || index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 text-primary flex items-center justify-center font-black">{(order.customerName || order.name || "A").charAt(0).toUpperCase()}</div>
                          <span className="font-bold text-gray-700 whitespace-nowrap">{order.customerName || order.fullName || order.name || "Khách hàng"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{order.phone || "Chưa có"}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2 font-semibold text-gray-700 whitespace-nowrap">{getServiceIcon(order.serviceType)}{getServiceText(order.serviceType)}</div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2 font-semibold text-gray-700 whitespace-nowrap">{getPaymentIcon(order.paymentMethod)}{getPaymentText(order.paymentMethod)}</div></td>
                      <td className="px-4 py-3 font-black text-primary whitespace-nowrap text-center">{formatPriceOrder(order.total || order.totalPrice)}</td>
                      <td className="px-4 py-3 text-center"><span className={`inline-flex items-center justify-center min-w-[96px] px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyleOrder(order.status)}`}>{getStatusTextOrder(order.status)}</span></td>
                      <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{formatDateTimeOrder(order.createdAt)}</td>
                      <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-100 hover:scale-105 transition-all"><Eye size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); openEditOrderModal(order); }} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 hover:scale-105 transition-all"><Pencil size={16} /></button>
                          {currentUser?.role !== "staff" && (<button onClick={(e) => { e.stopPropagation(); cancelOrderByTrash(order); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 hover:scale-105 transition-all"><Trash2 size={16} /></button>)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="10" className="px-5 py-14 text-center text-gray-400 font-bold">Chưa có đơn hàng phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination & Legend */}
          <div className="border-t border-gray-100">
            <GlobalPagination
              total={filteredOrders.length}
              page={currentPage}
              limit={pageSize}
              onPageChange={setCurrentPage}
              onLimitChange={setPageSize}
              limitOptions={[10, 20, 50, 100]}
            />
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
              {[["bg-yellow-400", "Chờ xác nhận"], ["bg-blue-500", "Đã xác nhận"], ["bg-purple-500", "Đang chuẩn bị"], ["bg-orange-500", "Đang giao"], ["bg-primary", "Hoàn thành"], ["bg-red-500", "Đã hủy"]].map(([color, text]) => (<div key={text} className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>{text}</div>))}
            </div>
          </div>
        </section>

        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            formatPrice={formatPriceOrder}
            formatDateTime={formatDateTimeOrder}
            getStatusText={getStatusTextOrder}
            getStatusStyle={getStatusStyleOrder}
            getServiceText={getServiceText}
            getPaymentText={getPaymentText}
            getPaymentStatusText={getPaymentStatusText}
            onClose={() => setSelectedOrder(null)}
            onChangeStatus={(status) => updateOrderStatus(selectedOrder.id, status)}
            onAddPayment={async (amount, method) => {
              try {
                const res = await fetch(`http://localhost:5001/api/orders/${selectedOrder.id}/payments`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` }, body: JSON.stringify({ amount, paymentMethod: method }) });
                const data = await res.json();
                if (data.success) { showAdminToast({ title: "Thành công", description: "Đã thêm thanh toán.", type: "success" }); setSelectedOrder(data.order); loadOrders(); }
                else showAdminToast({ title: "Lỗi", description: data.message, type: "error" });
              } catch (err) { showAdminToast({ title: "Lỗi", description: "Lỗi kết nối", type: "error" }); }
            }}
          />
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div><h3 className="text-xl font-black text-primary">Chỉnh sửa đơn hàng</h3><p className="text-sm text-gray-500 font-semibold mt-1">#{editingOrder.id}</p></div>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-red-500 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-black text-gray-500">Trạng thái</span>
                <select value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))} className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm">
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="preparing">Đang chuẩn bị</option>
                  <option value="delivering">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-gray-500">Phương thức thanh toán</span>
                <select value={editForm.paymentMethod} onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))} className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm">
                  <option value="">Chưa chọn</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="bank">Chuyển khoản</option>
                  <option value="momo">Ví MoMo</option>
                  <option value="vnpay">VNPay</option>
                  <option value="pay_after_meal">Sau bữa ăn</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-gray-500">Ghi chú</span>
                <textarea value={editForm.note} onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Nhập ghi chú cho đơn hàng..." className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm" />
              </label>
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditingOrder(null)} className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200">Đóng</button>
              <button onClick={saveEditOrder} className="h-11 px-5 rounded-xl bg-primary text-white font-black hover:bg-primary/90">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner"><Trash2 size={28} /></div>
            <div>
              <h4 className="font-black text-gray-900 text-base">{deleteConfirmOrder.bulkStatus ? "Xác nhận cập nhật trạng thái" : "Xác nhận hủy đơn hàng"}</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{deleteConfirmOrder.bulkStatus ? `Bạn có chắc chắn muốn cập nhật trạng thái cho ${selectedOrderIds.length} đơn hàng đã chọn?` : `Bạn có chắc chắn muốn hủy đơn hàng #${deleteConfirmOrder.order?.id}?`}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmOrder(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
              <button type="button" onClick={() => { const target = deleteConfirmOrder; setDeleteConfirmOrder(null); if (target.bulkStatus) executeUpdateSelectedOrdersStatus(target.bulkStatus); else executeCancelOrder(target.order); }} className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm ${deleteConfirmOrder.bulkStatus ? "bg-primary hover:bg-primary-light" : "bg-red-600 hover:bg-red-700"}`}>
                {deleteConfirmOrder.bulkStatus ? "Xác nhận" : "Hủy đơn hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderStatCard({ icon, title, value, bg, color, note = "" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex items-start gap-2.5 hover:bg-green-50/40 hover:border-green-100 hover:-translate-y-0.5 hover:shadow-md transition text-left min-w-0">
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
            {note || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}


function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`h-16 min-w-[180px] px-6 border-b-2 font-black text-lg whitespace-nowrap transition-all duration-200 ${active ? "border-primary/20 border-t-primary bg-primary/5" : "border-transparent text-gray-500 hover:text-primary hover:bg-primary/5"}`}>
      {children}
    </button>
  );
}

function SelectBox({ label, value, onChange, children, compact = false }) {
  return (
    <label className={`h-12 rounded-xl border border-gray-100 bg-white flex flex-col justify-center shadow-sm shrink-0 min-w-0 ${compact ? "w-[125px] px-3" : "w-[160px] 2xl:w-[180px] px-4"}`}>
      <span className="text-[11px] font-black text-gray-400 truncate">{label}</span>
      <select value={value} onChange={onChange} className="outline-none bg-transparent text-sm font-bold text-gray-700 min-w-0 truncate">{children}</select>
    </label>
  );
}

export default AdminOrdersPage;
