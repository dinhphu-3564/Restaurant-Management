import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { showAdminToast } from "../../components/admin/AdminToast";
import { removeVietnameseTones } from "../../utils/string";
import { getCurrentUser, getAuthToken } from "../../utils/auth";
import { canUseAction } from "../../utils/permissions";
import {
  Gift,
  Eye,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  Copy,
  Percent,
  CalendarDays,
  Clock3,
  TicketPercent,
  Wallet,
  Search,
  RotateCcw,
  X,
  UploadCloud,
  Image,
} from "lucide-react";

const EMPTY_FORM = {
  code: "",
  name: "",
  subtitle: "",
  type: "Combo",
  discount: "",
  condition: "",
  conditionItems: [],
  serviceConditionItems: {
    dinein: [],
    delivery: [],
    pickup: [],
  },
  startDate: "",
  endDate: "",
  status: "active",
  usageLimit: "",
  used: 0,
  totalDiscount: 0,
  usageHistory: [],
  desc: "",
  cardImage: "",
  detailImage: "",
  bannerImage: "",
  serviceTypes: ["dinein", "delivery", "pickup"],
};

const API_URL = "http://localhost:5001/api/deals";

const authHeaders = (contentType = "application/json") => {
  const token = getAuthToken();
  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

function AdminDealsPage() {
  const { globalSearch, dateRange } = useOutletContext();
  const currentUser = getCurrentUser();
  const [deals, setDeals] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedDealIds, setSelectedDealIds] = useState([]);
  const [editingDeal, setEditingDeal] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // State quản lý custom modal xác nhận xóa khuyến mãi
  const [deleteConfirmDeal, setDeleteConfirmDeal] = useState(null); // { deal } hoặc { bulk: true } hoặc { bulkStatus: 'status_name' }

  //hàm lấy khuyến mãi từ backend
  const fetchDeals = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      setDeals(data.deals || []);
    } catch (error) {
      console.error("Lỗi tải khuyến mãi:", error);
      setDeals([]);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("vi-VN") + "đ";

  const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

  const formatDate = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("vi-VN");
  };

  const getStatusText = (status) => {
    if (status === "active") return "Đang áp dụng";
    if (status === "upcoming") return "Sắp diễn ra";
    if (status === "paused") return "Tạm dừng";
    return "Đã kết thúc";
  };

  const getStatusStyle = (status) => {
    if (status === "active") return "bg-green-50 text-green-700";
    if (status === "upcoming") return "bg-orange-50 text-orange-600";
    if (status === "paused") return "bg-gray-100 text-gray-600";
    return "bg-slate-100 text-slate-500";
  };

  const getTypeStyle = (type) => {
    if (type === "Combo") return "bg-green-50 text-green-700";
    if (type === "Sinh nhật") return "bg-red-50 text-red-500";
    if (type === "Đặt món") return "bg-blue-50 text-blue-600";
    if (type === "Đặt bàn") return "bg-orange-50 text-orange-600";
    if (type === "Thành viên") return "bg-cyan-50 text-cyan-700";

    return "bg-purple-50 text-purple-600";
  };

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const rawKeyword = String(search || globalSearch || "").trim();
      const keyword = removeVietnameseTones(rawKeyword);

      const matchSearch =
        !keyword ||
        removeVietnameseTones(deal.code).includes(keyword) ||
        removeVietnameseTones(deal.name).includes(keyword) ||
        removeVietnameseTones(deal.type).includes(keyword);

      const matchTab = activeTab === "all" || deal.status === activeTab;
      const matchType = typeFilter === "all" || deal.type === typeFilter;
      const matchStatus =
        statusFilter === "all" || deal.status === statusFilter;

      let matchDate = true;

      if (dateRange?.startDate || dateRange?.endDate) {
        const dealDate = new Date(deal.startDate);
        const start = dateRange.startDate
          ? new Date(dateRange.startDate)
          : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;

        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        matchDate = (!start || dealDate >= start) && (!end || dealDate <= end);
      }

      return matchSearch && matchTab && matchType && matchStatus && matchDate;
    });
  }, [
    deals,
    activeTab,
    typeFilter,
    statusFilter,
    search,
    globalSearch,
    dateRange,
  ]);

  const totalPages = Math.ceil(filteredDeals.length / pageSize);

  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalUsed = deals.reduce(
    (sum, item) => sum + Number(item.used || 0),
    0,
  );

  const totalDiscount = deals.reduce(
    (sum, item) => sum + Number(item.totalDiscount || 0),
    0,
  );

  const resetFilter = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setActiveTab("all");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, globalSearch, activeTab, typeFilter, statusFilter, dateRange]);

  const openAddModal = () => {
    setEditingDeal(null);
    setEditForm({
      ...EMPTY_FORM,
      id: Date.now(),
    });
  };

  useEffect(() => {
    const handleOpenAddDealModal = () => {
      openAddModal();
    };

    window.addEventListener("openAddDealModal", handleOpenAddDealModal);

    return () => {
      window.removeEventListener("openAddDealModal", handleOpenAddDealModal);
    };
  }, []);

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setEditForm({
      ...deal,
      conditionItems: Array.isArray(deal.conditionItems)
        ? deal.conditionItems
        : [],
      serviceConditionItems: deal.serviceConditionItems || {
        dinein: [],
        delivery: [],
        pickup: [],
      },
      serviceTypes:
        deal.serviceTypes && deal.serviceTypes.length > 0
          ? deal.serviceTypes
          : ["dinein", "delivery", "pickup"],
    });
  };

  const saveDeal = async () => {
    const code = String(editForm.code || "")
      .trim()
      .toUpperCase();
    const name = String(editForm.name || "").trim();

    const selectedServiceConditions = editForm.serviceTypes?.some(
      (type) => editForm.serviceConditionItems?.[type]?.length > 0,
    );

    const errors = {};

    if (!code) errors.code = true;
    if (!name) errors.name = true;
    if (!editForm.subtitle?.trim()) errors.subtitle = true;
    if (!editForm.discount?.trim()) errors.discount = true;
    if (!editForm.condition) errors.condition = true;
    if (!editForm.startDate) errors.startDate = true;
    if (!editForm.endDate) errors.endDate = true;
    if (!editForm.status) errors.status = true;
    if (!editForm.desc?.trim()) errors.desc = true;

    if (!editForm.serviceTypes || editForm.serviceTypes.length === 0) {
      errors.serviceTypes = true;
    }

    if (!selectedServiceConditions) {
      errors.serviceConditionItems = true;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    if (new Date(editForm.startDate) > new Date(editForm.endDate)) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    const savedDeal = {
      ...editForm,
      id: editingDeal?.id || editForm.id || Date.now(),
      slug:
        editForm.slug ||
        code
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      code,
      name,
      conditionItems: Array.isArray(editForm.conditionItems)
        ? editForm.conditionItems.filter((item) => String(item).trim() !== "")
        : [],
      serviceConditionItems: {
        dinein: editForm.serviceTypes?.includes("dinein")
          ? editForm.serviceConditionItems?.dinein || []
          : [],
        delivery: editForm.serviceTypes?.includes("delivery")
          ? editForm.serviceConditionItems?.delivery || []
          : [],
        pickup: editForm.serviceTypes?.includes("pickup")
          ? editForm.serviceConditionItems?.pickup || []
          : [],
      },
      serviceTypes: editForm.serviceTypes,
      usageLimit: Number(editForm.usageLimit || 0),
      used: Number(editingDeal?.used || editForm.used || 0),
      totalDiscount: Number(
        editingDeal?.totalDiscount || editForm.totalDiscount || 0,
      ),
      usageHistory: editingDeal?.usageHistory || editForm.usageHistory || [],
    };

    try {
      if (editingDeal) {
        const res = await fetch(`${API_URL}/${editingDeal.id}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify(savedDeal),
        });

        const data = await res.json();

        if (!data.success) {
          alert(data.message || "Cập nhật khuyến mãi thất bại.");
          return;
        }

        setDeals((prev) =>
          prev.map((deal) =>
            String(deal.id) === String(editingDeal.id) ? data.deal : deal,
          ),
        );

        setSelectedDeal((prev) =>
          String(prev?.id) === String(editingDeal.id) ? data.deal : prev,
        );
        showAdminToast({
          title: "Cập nhật khuyến mãi thành công",
          message: `Đã cập nhật khuyến mãi ${data.deal.code}.`,
        });
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(savedDeal),
        });

        const data = await res.json();

        if (!data.success) {
          alert(data.message || "Thêm khuyến mãi thất bại.");
          return;
        }

        setDeals((prev) => [data.deal, ...prev]);
        setSelectedDeal(data.deal);
        showAdminToast({
          title: "Thêm khuyến mãi thành công",
          message: `Đã thêm khuyến mãi ${data.deal.code}.`,
        });
      }

      setEditingDeal(null);
      setEditForm(EMPTY_FORM);
      setFormErrors({});
    } catch (error) {
      console.error("Lỗi lưu khuyến mãi:", error);
      alert("Không thể kết nối backend.");
    }
  };

  //hàm xóa khuyến mãi thực hiện
  const executeDeleteDeal = async (deal) => {
    try {
      const res = await fetch(`${API_URL}/${deal.id}`, {
        method: "DELETE",
        headers: authHeaders(null),
      });

      const data = await res.json();

      if (!data.success) {
        showAdminToast({
          title: "Thất bại",
          message: data.message || "Xóa khuyến mãi thất bại.",
          type: "error",
        });
        return;
      }

      setDeals((prev) => prev.filter((item) => item.id !== deal.id));

      if (selectedDeal?.id === deal.id) {
        setSelectedDeal(null);
      }
      showAdminToast({
        title: "Xóa khuyến mãi thành công",
        message: `Đã xóa khuyến mãi ${deal.code}.`,
      });
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      showAdminToast({
        title: "Thất bại",
        message: "Không thể kết nối backend.",
        type: "error",
      });
    }
  };

  const deleteDeal = (deal) => {
    setDeleteConfirmDeal({ deal });
  };

  const togglePauseDeal = async (deal) => {
    const newStatus = deal.status === "paused" ? "active" : "paused";

    try {
      const res = await fetch(`${API_URL}/${deal.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          ...deal,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Cập nhật trạng thái thất bại.");
        return;
      }

      setDeals((prev) =>
        prev.map((item) =>
          String(item.id) === String(deal.id) ? data.deal : item,
        ),
      );

      setSelectedDeal((prev) =>
        String(prev?.id) === String(deal.id) ? data.deal : prev,
      );
      showAdminToast({
        title: "Cập nhật trạng thái thành công",
        message:
          newStatus === "paused"
            ? `Đã tạm dừng khuyến mãi ${deal.code}.`
            : `Đã áp dụng lại khuyến mãi ${deal.code}.`,
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể kết nối backend.");
    }
  };

  // hàm cấp quyền hàng loạt / chọn khuyến mãi
  const handleSelectDeal = (id) => {
    const stringId = String(id);
    setSelectedDealIds((prev) =>
      prev.includes(stringId)
        ? prev.filter((item) => item !== stringId)
        : [...prev, stringId],
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedDeals.map((deal) => String(deal.id));

    const isSelectedAll =
      currentIds.length > 0 &&
      currentIds.every((id) => selectedDealIds.includes(id));

    if (isSelectedAll) {
      setSelectedDealIds((prev) =>
        prev.filter((id) => !currentIds.includes(id)),
      );
    } else {
      setSelectedDealIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  //hàm xử lý trạng thái hàng loạt thực hiện
  const executeBulkUpdateStatus = async (status) => {
    try {
      const updatedDeals = await Promise.all(
        deals
          .filter((deal) => selectedDealIds.includes(String(deal.id)))
          .map(async (deal) => {
            const res = await fetch(`${API_URL}/${deal.id}`, {
              method: "PATCH",
              headers: authHeaders(),
              body: JSON.stringify({
                ...deal,
                status,
              }),
            });

            const data = await res.json();

            if (!data.success) {
              throw new Error(
                data.message || "Cập nhật trạng thái khuyến mãi thất bại.",
              );
            }

            return data.deal;
          }),
      );

      setDeals((prev) =>
        prev.map((deal) => {
          const updated = updatedDeals.find(
            (item) => String(item.id) === String(deal.id),
          );

          return updated || deal;
        }),
      );

      showAdminToast({
        title: "Cập nhật hàng loạt thành công",
        message: `Đã chuyển ${selectedDealIds.length} khuyến mãi sang trạng thái "${getStatusText(
          status,
        )}".`,
      });

      setSelectedDealIds([]);
    } catch (error) {
      console.error("Lỗi cập nhật hàng loạt:", error);
      showAdminToast({
        title: "Thất bại",
        message: "Không thể cập nhật trạng thái khuyến mãi.",
        type: "error",
      });
    }
  };

  const bulkUpdateStatus = (status) => {
    if (selectedDealIds.length === 0) return;
    setDeleteConfirmDeal({ bulkStatus: status });
  };

  //hàm xử lý xóa hàng loạt thực hiện
  const executeBulkDeleteDeals = async () => {
    try {
      await Promise.all(
        selectedDealIds.map(async (id) => {
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: authHeaders(null),
          });

          const data = await res.json();

          if (!data.success) {
            throw new Error(data.message || "Xóa khuyến mãi thất bại.");
          }
        }),
      );

      setDeals((prev) =>
        prev.filter((deal) => !selectedDealIds.includes(String(deal.id))),
      );

      setSelectedDealIds([]);
      setSelectedDeal(null);

      showAdminToast({
        title: "Xóa hàng loạt thành công",
        message: `Đã xóa ${selectedDealIds.length} khuyến mãi đã chọn.`,
      });
    } catch (error) {
      console.error("Lỗi xóa hàng loạt:", error);
      showAdminToast({
        title: "Thất bại",
        message: error.message || "Không thể xóa khuyến mãi đã chọn.",
        type: "error",
      });
    }
  };

  const bulkDeleteDeals = () => {
    if (selectedDealIds.length === 0) return;
    setDeleteConfirmDeal({ bulk: true });
  };

  const stats = [
    {
      title: "Tổng khuyến mãi",
      value: deals.length,
      icon: <Gift />,
      bg: "bg-green-50",
      color: "text-green-700",
    },
    {
      title: "Đang áp dụng",
      value: deals.filter((item) => item.status === "active").length,
      icon: <TicketPercent />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Sắp diễn ra",
      value: deals.filter((item) => item.status === "upcoming").length,
      icon: <CalendarDays />,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      title: "Đã kết thúc",
      value: deals.filter((item) => item.status === "ended").length,
      icon: <Clock3 />,
      bg: "bg-gray-100",
      color: "text-gray-600",
    },
    {
      title: "Tổng lượt sử dụng",
      value: totalUsed.toLocaleString("vi-VN"),
      icon: <Percent />,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
    {
      title: "Tổng giảm giá",
      value: formatMoney(totalDiscount),
      icon: <Wallet />,
      bg: "bg-emerald-50",
      color: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
        {stats.map((item) => (
          <DealStatCard key={item.title} {...item} />
        ))}
      </div>

      <div
        className={`grid grid-cols-1 gap-4 items-start ${
          selectedDeal ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""
        }`}
      >
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center overflow-x-auto">
                <TabButton
                  active={activeTab === "all"}
                  onClick={() => setActiveTab("all")}
                >
                  Tất cả
                </TabButton>

                <TabButton
                  active={activeTab === "active"}
                  onClick={() => setActiveTab("active")}
                >
                  Đang áp dụng
                </TabButton>

                <TabButton
                  active={activeTab === "upcoming"}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Sắp diễn ra
                </TabButton>

                <TabButton
                  active={activeTab === "ended"}
                  onClick={() => setActiveTab("ended")}
                >
                  Đã kết thúc
                </TabButton>

                <TabButton
                  active={activeTab === "paused"}
                  onClick={() => setActiveTab("paused")}
                >
                  Tạm dừng
                </TabButton>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex flex-nowrap items-center gap-3 overflow-hidden">
              <div
                className={`h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm shrink-0 ${
                  selectedDeal ? "w-[240px]" : "w-[380px] 2xl:w-[450px]"
                }`}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã, tên chương trình, loại..."
                  className="w-full min-w-0 outline-none text-sm truncate"
                />

                <Search size={18} className="text-gray-400 shrink-0" />
              </div>

              <SelectBox
                label="Loại khuyến mãi"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                compact={selectedDeal}
              >
                <option value="all">Tất cả</option>
                <option value="Combo">Combo</option>
                <option value="Sinh nhật">Sinh nhật</option>
                <option value="Đặt món">Đặt món</option>
                <option value="Đặt bàn">Đặt bàn</option>
                <option value="Đặc biệt">Đặc biệt</option>
                <option value="Thành viên">Thành viên</option>
              </SelectBox>

              <SelectBox
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                compact={selectedDeal}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang áp dụng</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="paused">Tạm dừng</option>
                <option value="ended">Đã kết thúc</option>
              </SelectBox>

              <button
                onClick={resetFilter}
                className={`h-12 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-1 shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition ${
                  selectedDeal ? "w-[56px]" : "w-[80px]"
                }`}
              >
                <RotateCcw size={15} />
                <span className={selectedDeal ? "hidden 2xl:inline" : ""}>
                  Xóa
                </span>
              </button>

              <div className="hidden lg:flex ml-auto items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                <span>Hiển thị</span>

                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-10 w-[140px] rounded-xl border border-gray-100 px-3 font-bold outline-none bg-white shadow-sm"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
            </div>
          </div>

          {selectedDealIds.length > 0 && (
            <div className="mx-4 mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-black text-green-800">
                Đã chọn {selectedDealIds.length} khuyến mãi
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => bulkUpdateStatus("active")}
                  className="h-10 px-4 rounded-xl bg-green-100 text-green-700 border border-green-200 text-sm font-black hover:bg-green-200"
                >
                  Áp dụng
                </button>

                <button
                  onClick={() => bulkUpdateStatus("paused")}
                  className="h-10 px-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 text-sm font-black hover:bg-orange-100"
                >
                  Tạm dừng
                </button>

                <button
                  onClick={bulkDeleteDeals}
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-black hover:bg-red-100"
                >
                  Xóa
                </button>

                <button
                  onClick={() => setSelectedDealIds([])}
                  className="h-10 px-4 rounded-xl bg-white text-gray-500 border border-gray-100 text-sm font-black hover:bg-gray-50"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1300px] w-full text-left text-sm">
              <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
                <tr>
                  <th className="w-[50px] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        paginatedDeals.length > 0 &&
                        paginatedDeals.every((deal) =>
                          selectedDealIds.includes(String(deal.id)),
                        )
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-green-700"
                    />
                  </th>
                  <th className="w-[140px] px-4 py-3">Mã</th>
                  <th className="w-[220px] px-4 py-3">Tên chương trình</th>
                  <th className="w-[130px] px-4 py-3 text-center">Loại</th>
                  <th className="w-[110px] px-4 py-3 text-center">Giảm giá</th>
                  <th className="w-[180px] px-4 py-3">Điều kiện</th>
                  <th className="w-[210px] px-4 py-3 text-center">Thời gian</th>
                  <th className="w-[140px] px-4 py-3 text-center">
                    Trạng thái
                  </th>
                  <th className="w-[110px] px-4 py-3 text-center">Lượt dùng</th>
                  <th className="w-[130px] px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-10">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedDeals.length > 0 ? (
                  paginatedDeals.map((deal) => (
                    <tr
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`border-t border-gray-100 hover:bg-green-50/30 cursor-pointer transition-colors ${
                        selectedDeal?.id === deal.id ? "bg-green-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDealIds.includes(String(deal.id))}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleSelectDeal(deal.id)}
                          className="w-4 h-4 accent-green-700"
                        />
                      </td>

                      <td className="px-4 py-3 font-black text-green-700  whitespace-nowrap">
                        {deal.code}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-black text-green-950 whitespace-nowrap">
                          {deal.name}
                        </p>
                        <p className="text-xs text-gray-400 font-semibold mt-1 whitespace-nowrap">
                          {deal.subtitle}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getTypeStyle(
                            deal.type,
                          )}`}
                        >
                          {deal.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-black text-gray-700 text-center whitespace-nowrap">
                        {deal.discount}
                      </td>

                      <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                        {Number(deal.condition || 0).toLocaleString("vi-VN")}đ
                      </td>

                      <td className="px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">
                        {formatDate(deal.startDate)} -{" "}
                        {formatDate(deal.endDate)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black  whitespace-nowrap ${getStatusStyle(
                            deal.status,
                          )}`}
                        >
                          {getStatusText(deal.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-black text-gray-700 text-center">
                        {Number(deal.used || 0).toLocaleString("vi-VN")}
                      </td>

                      <td className="px-4 py-3 sticky right-0 bg-white z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-center gap-1.5">
                          <IconButton
                            icon={<Eye size={16} />}
                            color="green"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDeal(deal);
                            }}
                          />

                          <IconButton
                            icon={<Pencil size={16} />}
                            color="emerald"
                            disabled={!canUseAction(currentUser, "promotions:update")}
                            title={!canUseAction(currentUser, "promotions:update") ? "Bạn không có quyền thực hiện thao tác này." : ""}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(deal);
                            }}
                          />

                          <IconButton
                            icon={
                              deal.status === "paused" ? (
                                <PlayCircle size={16} />
                              ) : (
                                <PauseCircle size={16} />
                              )
                            }
                            color="orange"
                            disabled={!canUseAction(currentUser, "promotions:update")}
                            title={!canUseAction(currentUser, "promotions:update") ? "Bạn không có quyền thực hiện thao tác này." : ""}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePauseDeal(deal);
                            }}
                          />

                          <IconButton
                            icon={<Trash2 size={16} />}
                            color="red"
                            disabled={!canUseAction(currentUser, "promotions:delete")}
                            title={!canUseAction(currentUser, "promotions:delete") ? "Bạn không có quyền thực hiện thao tác này." : ""}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDeal(deal);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-5 py-14 text-center text-gray-400 font-bold"
                    >
                      Không có khuyến mãi phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4">
            <p className="text-gray-600 font-bold">
              Hiển thị{" "}
              {filteredDeals.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}{" "}
              - {Math.min(currentPage * pageSize, filteredDeals.length)} trong
              tổng số {filteredDeals.length} khuyến mãi
            </p>

            {totalPages > 0 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                    className={`w-9 h-9 rounded-lg border font-black ${
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
                  className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </section>

        {selectedDeal && (
          <DealDetailPanel
            deal={selectedDeal}
            formatMoney={formatMoney}
            formatDate={formatDate}
            getStatusText={getStatusText}
            getStatusStyle={getStatusStyle}
            getTypeStyle={getTypeStyle}
            onClose={() => setSelectedDeal(null)}
            onEdit={() => openEditModal(selectedDeal)}
            onTogglePause={() => togglePauseDeal(selectedDeal)}
            onDelete={() => deleteDeal(selectedDeal)}
          />
        )}
      </div>

      {editForm.id && (
        <DealFormModal
          title={editingDeal ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi"}
          subtitle={editingDeal ? editingDeal.code : "Tạo chương trình mới"}
          form={editForm}
          setForm={setEditForm}
          formErrors={formErrors}
          onClose={() => {
            setEditingDeal(null);
            setEditForm(EMPTY_FORM);
            setFormErrors({});
          }}
          onSave={saveDeal}
        />
      )}

      {/* Custom Delete Confirmation Modal for Deals */}
      {deleteConfirmDeal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={28} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-base">
                {deleteConfirmDeal.bulkStatus
                  ? "Xác nhận cập nhật trạng thái"
                  : deleteConfirmDeal.bulk
                  ? "Xác nhận xóa hàng loạt"
                  : "Xác nhận xóa khuyến mãi"}
              </h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {deleteConfirmDeal.bulkStatus
                  ? `Bạn có chắc chắn muốn cập nhật trạng thái cho ${selectedDealIds.length} khuyến mãi đã chọn?`
                  : deleteConfirmDeal.bulk
                  ? `Bạn có chắc chắn muốn xóa ${selectedDealIds.length} khuyến mãi đã chọn? Hành động này không thể khôi phục.`
                  : `Bạn có chắc chắn muốn xóa chương trình khuyến mãi "${deleteConfirmDeal.deal?.code}"? Hành động này không thể khôi phục.`}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDeal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = deleteConfirmDeal;
                  setDeleteConfirmDeal(null);
                  if (target.bulkStatus) {
                    executeBulkUpdateStatus(target.bulkStatus);
                  } else if (target.bulk) {
                    executeBulkDeleteDeals();
                  } else {
                    executeDeleteDeal(target.deal);
                  }
                }}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm ${
                  deleteConfirmDeal.bulkStatus
                    ? "bg-green-700 hover:bg-green-800"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleteConfirmDeal.bulkStatus ? "Xác nhận" : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DealDetailPanel({
  deal,
  formatMoney,
  formatDate,
  getStatusText,
  getStatusStyle,
  getTypeStyle,
  onClose,
  onEdit,
  onTogglePause,
  onDelete,
}) {
  const usageHistory = Array.isArray(deal.usageHistory)
    ? deal.usageHistory.slice(-7)
    : [];

  const maxUsage = Math.max(
    ...usageHistory.map((item) => Number(item.count || 0)),
    1,
  );
  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden xl:sticky xl:top-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-green-950">
          Chi tiết khuyến mãi
        </h3>

        <button onClick={onClose} className="text-gray-400 hover:text-red-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-r from-green-950 to-green-700 p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-lg bg-white/15 text-xs font-black">
              {getStatusText(deal.status)}
            </span>

            <button
              onClick={() => navigator.clipboard.writeText(deal.code)}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
            >
              <Copy size={16} />
            </button>
          </div>

          <h2 className="text-2xl font-black mt-5">{deal.name}</h2>

          <p className="text-[#f6d47a] text-4xl font-black mt-2">
            {deal.discount}
          </p>

          <p className="mt-4 px-4 py-2 rounded-xl border border-white/25 font-black tracking-widest inline-block">
            {deal.code}
          </p>
        </div>

        <DetailBlock title="Thông tin chương trình">
          <DetailRow label="Mã khuyến mãi" value={deal.code} />
          <DetailRow label="Tên chương trình" value={deal.name} />
          <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
            <span className="text-gray-500 font-semibold">Loại</span>
            <span
              className={`w-fit px-3 py-1 rounded-lg text-xs font-black ${getTypeStyle(
                deal.type,
              )}`}
            >
              {deal.type}
            </span>
          </div>
          <DetailRow label="Giảm giá" value={deal.discount} />

          <DetailRow
            label="Điều kiện"
            value={`${Number(deal.condition || 0).toLocaleString("vi-VN")}đ`}
          />

          {Array.isArray(deal.conditionItems) &&
            deal.conditionItems.length > 0 && (
              <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                <span className="text-gray-500 font-semibold">
                  Điều kiện khác
                </span>
                <div className="space-y-1">
                  {deal.conditionItems.map((item) => (
                    <p key={item} className="text-gray-800 font-bold">
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            )}

          <DetailRow
            label="Thời gian"
            value={`${formatDate(deal.startDate)} - ${formatDate(deal.endDate)}`}
          />

          <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
            <span className="text-gray-500 font-semibold">Trạng thái</span>
            <span
              className={`w-fit px-3 py-1 rounded-lg text-xs font-black ${getStatusStyle(
                deal.status,
              )}`}
            >
              {getStatusText(deal.status)}
            </span>
          </div>
          <DetailRow label="Mô tả" value={deal.desc || "Không có"} />
        </DetailBlock>

        <div className="grid grid-cols-2 gap-3">
          <MiniStat
            label="Đã sử dụng"
            value={`${Number(deal.used || 0).toLocaleString("vi-VN")}`}
          />
          <MiniStat
            label="Tổng giảm giá"
            value={formatMoney(deal.totalDiscount)}
          />

          <MiniStat
            label="Giới hạn lượt dùng"
            value={
              deal.usageLimit
                ? `${Number(deal.usageLimit).toLocaleString("vi-VN")} lượt`
                : "Không giới hạn"
            }
          />
        </div>

        <DetailBlock title="Thống kê sử dụng">
          {usageHistory.length > 0 ? (
            <>
              <div
                className={`h-[180px] flex items-end gap-3 border-b border-l border-gray-100 px-3 ${
                  usageHistory.length === 1 ? "justify-center" : ""
                }`}
              >
                {usageHistory.map((item) => {
                  const count = Number(item.count || 0);

                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <p className="text-xs font-black text-gray-500">
                        {count}
                      </p>

                      <div
                        className={`rounded-t-xl bg-green-600 ${
                          usageHistory.length === 1 ? "w-32" : "w-full"
                        }`}
                        style={{
                          height: `${Math.max((count / maxUsage) * 150, 8)}px`,
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`text-[11px] text-gray-400 font-bold mt-2 ${
                  usageHistory.length === 1 ? "flex justify-center" : "grid"
                }`}
                style={
                  usageHistory.length > 1
                    ? {
                        gridTemplateColumns: `repeat(${usageHistory.length}, minmax(0, 1fr))`,
                      }
                    : {}
                }
              >
                {usageHistory.map((item) => (
                  <span key={item.date}>
                    {new Date(item.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 font-bold">
              Chưa có dữ liệu sử dụng
            </div>
          )}
        </DetailBlock>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-black hover:bg-blue-100"
          >
            Sửa
          </button>

          <button
            onClick={onTogglePause}
            className="h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 font-black hover:bg-orange-100"
          >
            {deal.status === "paused" ? "Bán lại" : "Tạm dừng"}
          </button>

          <button
            onClick={onDelete}
            className="h-11 rounded-xl bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-100"
          >
            Xóa
          </button>
        </div>
      </div>
    </aside>
  );
}

function DealFormModal({
  title,
  subtitle,
  form,
  setForm,
  formErrors,
  onClose,
  onSave,
}) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleImageChange = async (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 10MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: authHeaders(null),
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Upload ảnh thất bại.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        [fieldName]: data.imageUrl,
      }));
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Không thể upload ảnh lên backend.");
    }
  };

  const removeImage = (fieldName) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="
          w-full max-w-[1320px] max-h-[92vh]
          bg-white rounded-3xl shadow-2xl overflow-hidden
          flex flex-col
        "
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-black text-green-950">{title}</h3>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              {subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={26} />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_470px] gap-8">
            {/* LEFT FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-5 content-start">
              {/* THÔNG TIN CƠ BẢN */}
              <div className="md:col-span-2">
                <h4 className="text-base font-black text-green-900 mb-3">
                  Thông tin khuyến mãi
                </h4>
              </div>

              <InputField
                label="Mã khuyến mãi"
                required
                placeholder="VD: FAMILY20"
                error={formErrors.code}
                value={form.code}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    code: value.toUpperCase(),
                  }))
                }
              />

              <InputField
                label="Tên chương trình"
                required
                placeholder="VD: Combo gia đình"
                error={formErrors.name}
                value={form.name}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, name: value }))
                }
              />

              <InputField
                label="Mô tả ngắn"
                error={formErrors.subtitle}
                placeholder="VD: Ưu đãi đặc biệt cho gia đình"
                value={form.subtitle}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, subtitle: value }))
                }
              />

              <SelectField
                label="Loại khuyến mãi"
                required
                value={form.type}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value }))
                }
              >
                <option value="Combo">Combo</option>
                <option value="Sinh nhật">Sinh nhật</option>
                <option value="Đặt món">Đặt món</option>
                <option value="Đặt bàn">Đặt bàn</option>
                <option value="Đặc biệt">Đặc biệt</option>
                <option value="Thành viên">Thành viên</option>
              </SelectField>

              <InputField
                label="Giảm giá"
                required
                placeholder="VD: 20% hoặc 100.000đ"
                value={form.discount}
                error={formErrors.discount}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, discount: value }))
                }
              />

              <InputField
                label="Hóa đơn tối thiểu áp dụng"
                required
                placeholder="VD: 2.000.000"
                error={formErrors.condition}
                value={
                  form.condition
                    ? Number(form.condition).toLocaleString("vi-VN")
                    : ""
                }
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    condition: value.replace(/\D/g, ""),
                  }))
                }
              />

              {/* ĐIỀU KIỆN */}
              <div className="md:col-span-2 mt-2">
                <h4 className="text-base font-black text-green-900 mb-3">
                  Điều kiện áp dụng
                </h4>
              </div>

              <ServiceTypeCheckboxGroup
                error={formErrors.serviceTypes}
                value={form.serviceTypes || []}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceTypes: value,
                  }))
                }
              />

              <ServiceConditionItemsField
                error={formErrors.serviceConditionItems}
                serviceTypes={form.serviceTypes || []}
                value={
                  form.serviceConditionItems || {
                    dinein: [],
                    delivery: [],
                    pickup: [],
                  }
                }
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceConditionItems: value,
                  }))
                }
              />

              {/* THỜI GIAN */}
              <div className="md:col-span-2 mt-2">
                <h4 className="text-base font-black text-green-900 mb-3">
                  Thời gian và trạng thái
                </h4>
              </div>

              <InputField
                label="Ngày bắt đầu"
                required
                type="date"
                error={formErrors.startDate}
                value={form.startDate}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, startDate: value }))
                }
              />

              <InputField
                label="Ngày kết thúc"
                required
                type="date"
                error={formErrors.endDate}
                value={form.endDate}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, endDate: value }))
                }
              />

              <SelectField
                label="Trạng thái"
                required
                error={formErrors.status}
                value={form.status}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <option value="active">Đang áp dụng</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="paused">Tạm dừng</option>
                <option value="ended">Đã kết thúc</option>
              </SelectField>

              <InputField
                label="Giới hạn lượt sử dụng"
                type="number"
                placeholder="VD: 1000"
                value={form.usageLimit}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    usageLimit: Number(value),
                  }))
                }
              />

              {/* MÔ TẢ */}
              <div className="md:col-span-2 mt-2">
                <h4 className="text-base font-black text-green-900 mb-3">
                  Mô tả chi tiết
                </h4>

                <textarea
                  value={form.desc}
                  placeholder="Nhập mô tả chi tiết về chương trình khuyến mãi..."
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, desc: e.target.value }))
                  }
                  className={`w-full h-28 rounded-xl border px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm transition-all ${
                    formErrors.desc
                      ? "border-red-500 ring-2 ring-red-100 bg-red-50"
                      : "border-gray-100 focus:border-green-200 focus:ring-2 focus:ring-green-50"
                  }`}
                />

                {formErrors.desc && (
                  <p className="mt-1 text-xs font-bold text-red-500">
                    Trường này là bắt buộc
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT IMAGES */}
            <div className="space-y-6">
              <ImageUploadBox
                title="Ảnh banner đầu trang (Deals Page)"
                size="Kích thước: 2243×701px"
                image={form.bannerImage}
                fieldName="bannerImage"
                previewClassName="w-full h-[170px]"
                horizontal
                onChange={handleImageChange}
                onRemove={removeImage}
              />

              <ImageUploadBox
                title="Ảnh hiển thị danh sách (Deals Page)"
                size="Kích thước: 1023×1537px"
                image={form.cardImage}
                fieldName="cardImage"
                previewClassName="w-[155px] h-[230px]"
                onChange={handleImageChange}
                onRemove={removeImage}
              />

              <ImageUploadBox
                title="Ảnh chi tiết (Deals Detail Page)"
                size="Kích thước: 1536×1024px"
                image={form.detailImage}
                fieldName="detailImage"
                previewClassName="w-full h-[260px]"
                horizontal
                onChange={handleImageChange}
                onRemove={removeImage}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="h-12 px-7 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={onSave}
            className="h-12 px-7 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
          >
            Lưu khuyến mãi
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageUploadBox({
  title,
  size,
  image,
  fieldName,
  previewClassName,
  horizontal = false,
  onChange,
  onRemove,
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-sm font-black text-gray-700">{title}</h4>

        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black whitespace-nowrap">
          {size}
        </span>
      </div>

      <div
        className={`grid gap-4 ${
          horizontal ? "grid-cols-1" : "grid-cols-[155px_1fr]"
        }`}
      >
        {image && (
          <div
            className={`
              relative
              rounded-2xl
              overflow-hidden
              border border-gray-100
              bg-gray-50
              ${previewClassName}
            `}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover bg-gray-50"
            />

            <button
              type="button"
              onClick={() => onRemove(fieldName)}
              className="
                absolute top-2 right-2
                w-8 h-8
                rounded-xl
                bg-white/95
                text-gray-500
                hover:text-red-500
                flex items-center justify-center
                shadow-md
              "
            >
              <X size={16} />
            </button>
          </div>
        )}

        <label
          className={`
            rounded-2xl
            border-2 border-dashed border-gray-200
            bg-white
            flex flex-col items-center justify-center
            text-center cursor-pointer
            hover:border-green-200
            hover:bg-green-50/30
            transition

            ${horizontal ? "h-[120px]" : "h-[230px]"}
            ${!image && horizontal ? "h-[180px]" : ""}
            ${!image && !horizontal ? "col-span-2" : ""}
          `}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => onChange(event, fieldName)}
            className="hidden"
          />

          {image ? (
            <UploadCloud size={34} className="text-gray-500 mb-2" />
          ) : (
            <Image size={40} className="text-gray-500 mb-3" />
          )}

          <p className="text-sm font-bold text-gray-600">
            Kéo thả ảnh vào đây hoặc
          </p>

          <span className="mt-3 h-10 px-5 rounded-xl bg-green-700 text-white font-black inline-flex items-center justify-center hover:bg-green-800 transition">
            Chọn ảnh
          </span>

          <p className="text-xs text-gray-500 font-semibold mt-3">
            JPG, PNG, WebP - Tối đa 10MB
          </p>
        </label>
      </div>
    </div>
  );
}

function DealStatCard({ icon, title, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[96px] hover:bg-green-50/40 hover:border-green-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-gray-500 font-bold text-sm leading-tight line-clamp-2">
            {title}
          </p>

          <h3 className="text-2xl font-black text-green-950 mt-1 truncate">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-16 min-w-[150px] px-5 border-b-2 font-black text-base whitespace-nowrap transition-all duration-200 ${
        active
          ? "border-green-700 text-green-700 bg-green-50/40"
          : "border-transparent text-gray-500 hover:text-green-700 hover:bg-green-50/40"
      }`}
    >
      {children}
    </button>
  );
}

function SelectBox({ label, value, onChange, children, compact = false }) {
  return (
    <label
      className={`h-12 rounded-xl border border-gray-100 bg-white flex flex-col justify-center shadow-sm shrink-0 min-w-0 ${
        compact ? "w-[125px] px-3" : "w-[170px] 2xl:w-[190px] px-4"
      }`}
    >
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

function IconButton({ icon, color, onClick, disabled = false, title = "" }) {
  const colors = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center hover:scale-105 transition-all ${
        disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50" : colors[color]
      }`}
    >
      {icon}
    </button>
  );
}

function DetailBlock({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h4 className="font-black text-green-800 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-bold break-words">
        {value || "Chưa có"}
      </span>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3 text-center">
      <p className="text-green-950 font-black">{value}</p>
      <p className="text-xs text-gray-500 font-semibold mt-1">{label}</p>
    </div>
  );
}

function ServiceConditionItemsField({
  serviceTypes = [],
  value = {},
  onChange,
  error = false,
}) {
  const groups = [
    {
      key: "dinein",
      title: "Ăn tại quán",
      options: [
        "Áp dụng khi dùng bữa tại nhà hàng",
        "Áp dụng khi đặt bàn trước",
        "Áp dụng cho nhóm từ 4 khách trở lên",
        "Xuất trình mã khuyến mãi khi thanh toán",
        "Không áp dụng vào ngày lễ, Tết",
        "Không áp dụng kèm các ưu đãi khác",
      ],
    },
    {
      key: "delivery",
      title: "Giao tận nơi",
      options: [
        "Áp dụng khi đặt món qua website",
        "Áp dụng cho đơn giao trong khu vực hỗ trợ",
        "Không áp dụng phí vận chuyển",
        "Khách hàng cung cấp đúng số điện thoại và địa chỉ",
        "Đơn hàng cần được xác nhận trước khi giao",
        "Không áp dụng kèm các ưu đãi khác",
      ],
    },
    {
      key: "pickup",
      title: "Đến lấy tại quán",
      options: [
        "Áp dụng khi khách tự đến nhận món tại nhà hàng",
        "Áp dụng khi đặt món trước qua website",
        "Khách cần nhận món trong thời gian đã hẹn",
        "Không áp dụng phí giao hàng",
        "Xuất trình mã khuyến mãi khi nhận món",
        "Không áp dụng kèm các ưu đãi khác",
      ],
    },
  ];

  const toggle = (groupKey, text) => {
    const current = value[groupKey] || [];

    const nextGroup = current.includes(text)
      ? current.filter((item) => item !== text)
      : [...current, text];

    onChange({
      ...value,
      [groupKey]: nextGroup,
    });
  };

  return (
    <div
      className={`md:col-span-2 rounded-2xl ${
        error ? "ring-2 ring-red-100 bg-red-50/40 p-3" : ""
      }`}
    >
      <p className="text-sm font-black text-gray-500 mb-3">
        Điều kiện theo hình thức phục vụ
      </p>

      <div className="grid xl:grid-cols-3 gap-4">
        {groups.map((group) => {
          const enabled = serviceTypes.includes(group.key);
          const selectedItems = value[group.key] || [];

          return (
            <div
              key={group.key}
              className={`rounded-2xl border p-4 ${
                enabled
                  ? "border-green-100 bg-green-50/30"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <h4 className="font-black text-green-900 mb-3">{group.title}</h4>

              <div className="space-y-2">
                {group.options.map((item) => (
                  <label
                    key={item}
                    className={`min-h-11 rounded-xl border px-3 py-2 flex items-center gap-2 cursor-pointer text-sm font-bold transition ${
                      selectedItems.includes(item)
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-gray-100 bg-white text-gray-600"
                    } ${!enabled ? "pointer-events-none" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      disabled={!enabled}
                      onChange={() => toggle(group.key, item)}
                      className="w-4 h-4 accent-green-700 shrink-0"
                    />

                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500">
          Vui lòng chọn ít nhất 1 điều kiện theo hình thức phục vụ
        </p>
      )}
    </div>
  );
}

function ServiceTypeCheckboxGroup({ value = [], onChange, error = false }) {
  const options = [
    { key: "dinein", label: "Ăn tại quán" },
    { key: "delivery", label: "Giao tận nơi" },
    { key: "pickup", label: "Đến lấy tại quán" },
  ];

  const toggle = (key) => {
    if (value.includes(key)) {
      onChange(value.filter((item) => item !== key));
    } else {
      onChange([...value, key]);
    }
  };

  return (
    <div
      className={`md:col-span-2 rounded-2xl ${
        error ? "ring-2 ring-red-100 bg-red-50/40 p-3" : ""
      }`}
    >
      <p className="text-sm font-black text-gray-500 mb-2">
        Áp dụng hình thức phục vụ <span className="text-red-500">*</span>
      </p>

      <div
        className={`grid sm:grid-cols-3 gap-3 rounded-2xl ${
          error ? "ring-2 ring-red-100 bg-red-50/40 p-3" : ""
        }`}
      >
        {options.map((option) => (
          <label
            key={option.key}
            className={`
              h-12 rounded-xl border px-4 flex items-center gap-3 cursor-pointer font-bold transition
              ${
                value.includes(option.key)
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-gray-100 bg-white text-gray-600"
              }
            `}
          >
            <input
              type="checkbox"
              checked={value.includes(option.key)}
              onChange={() => toggle(option.key)}
              className="w-4 h-4 accent-green-700"
            />

            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-red-500">
          Vui lòng chọn ít nhất 1 hình thức phục vụ
        </p>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  error = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm bg-white transition-all ${
          error
            ? "border-red-500 ring-2 ring-red-100 bg-red-50"
            : "border-gray-100 focus:border-green-200 focus:ring-2 focus:ring-green-50"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">
          Trường này là bắt buộc
        </p>
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  required = false,
  error = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-500">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full h-12 rounded-xl border px-4 font-bold outline-none shadow-sm bg-white transition-all ${
          error
            ? "border-red-500 ring-2 ring-red-100 bg-red-50"
            : "border-gray-100 focus:border-green-200 focus:ring-2 focus:ring-green-50"
        }`}
      >
        {children}
      </select>

      {error && (
        <p className="mt-1 text-xs font-bold text-red-500">
          Trường này là bắt buộc
        </p>
      )}
    </label>
  );
}

export default AdminDealsPage;
