import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { tableService } from "../../services/tableService";
import { bookingService } from "../../services/bookingService";
import {
  Building2,
  LayoutGrid,
  CheckCircle,
  Clock3,
  CalendarCheck,
  Wrench,
  Search,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Plus,
  Lock,
  Unlock,
} from "lucide-react";

const TABLE_STATUS = {
  available: "Trống",
  holding: "Đang giữ",
  booked: "Đã đặt",
  serving: "Đang phục vụ",
  maintenance: "Bảo trì",
  disabled: "Ngừng sử dụng",
};

const STATUS_STYLE = {
  available: "bg-green-50 text-green-700 border-green-100",
  holding: "bg-orange-50 text-orange-600 border-orange-100",
  booked: "bg-red-50 text-red-600 border-red-100",
  serving: "bg-blue-50 text-blue-600 border-blue-100",
  maintenance: "bg-gray-100 text-gray-600 border-gray-200",
  disabled: "bg-gray-50 text-gray-400 border-gray-100",
};

const STATUS_DOT = {
  available: "bg-green-600",
  holding: "bg-orange-500",
  booked: "bg-red-500",
  serving: "bg-blue-500",
  maintenance: "bg-gray-500",
  disabled: "bg-gray-300",
};

const TABLE_STATUS_STYLE = {
  available: "border-green-200 bg-green-50 text-green-700",
  holding: "border-orange-200 bg-orange-50 text-orange-600",
  booked: "border-red-200 bg-red-50 text-red-600",
  serving: "border-blue-200 bg-blue-50 text-blue-600",
  maintenance: "border-gray-200 bg-gray-100 text-gray-500",
  disabled: "border-gray-200 bg-gray-50 text-gray-400",
};

const TABLE_DOT_STYLE = {
  available: "bg-green-600",
  holding: "bg-orange-500",
  booked: "bg-red-500",
  serving: "bg-blue-500",
  maintenance: "bg-gray-500",
  disabled: "bg-gray-300",
};

const DEFAULT_AREAS = [
  {
    id: "floor1",
    name: "Tầng trệt",
    description: "Khu vực chính, gần lối vào",
    tablePrefix: 1,
    count: 20,
  },
  {
    id: "floor2",
    name: "Tầng 2",
    description: "Không gian rộng, yên tĩnh",
    tablePrefix: 2,
    count: 20,
  },
  {
    id: "vip",
    name: "Phòng VIP",
    description: "Riêng tư, phù hợp tiếp khách",
    tablePrefix: 3,
    count: 10,
  },
];

function createDefaultTables() {
  return DEFAULT_AREAS.flatMap((area) =>
    Array.from({ length: area.count }, (_, index) => {
      const number = area.tablePrefix * 100 + index + 1;

      return {
        id: String(number),
        code: String(number),
        areaId: area.id,
        areaName: area.name,
        capacity: area.id === "vip" ? 8 : index % 2 === 0 ? 4 : 6,

        status:
          number === 108 || number === 304
            ? "serving"
            : number === 111 || number === 305
              ? "maintenance"
              : "available",
        description:
          index % 2 === 0 ? "Gần lối vào" : "Gần cửa sổ, không gian thoáng mát",
        updatedAt: new Date().toISOString(),
      };
    }),
  );
}

function AdminTablesPage() {
  const { globalSearch } = useOutletContext();

  const [assignBooking, setAssignBooking] = useState(null);
  const [assignForm, setAssignForm] = useState({
    areaId: "floor1",
    tableCode: "",
  });

  const [areas, setAreas] = useState(() => {
    return JSON.parse(localStorage.getItem("adminAreas")) || DEFAULT_AREAS;
  });

  const [tables, setTables] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("adminTables")) || createDefaultTables()
    );
  });

  const today = new Date().toISOString().split("T")[0];

  const [bookings, setBookings] = useState([]);
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  const [addForm, setAddForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    date: today,
    time: "",
    guests: 1,
    selectedArea: "floor1",
    selectedAreaTitle: "Tầng trệt",
    selectedTable: "",
    note: "",
    status: "pending",
  });
  const [activeTab, setActiveTab] = useState("map");
  const [selectedArea, setSelectedArea] = useState("floor1");
  const [selectedTable, setSelectedTable] = useState(null);

  const [viewDate, setViewDate] = useState(today);
  const [viewTime, setViewTime] = useState("");

  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingTable, setEditingTable] = useState(null);
  const [editForm, setEditForm] = useState({
    areaId: "floor1",
    capacity: 4,
    status: "available",
    description: "",
  });

  const pageSize = 10;

  useEffect(() => {
    localStorage.setItem("adminAreas", JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem("adminTables", JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    const loadBookings = () => {
      setBookings(JSON.parse(localStorage.getItem("bookings")) || []);
    };

    loadBookings();

    window.addEventListener("bookingsUpdated", loadBookings);
    window.addEventListener("storage", loadBookings);

    return () => {
      window.removeEventListener("bookingsUpdated", loadBookings);
      window.removeEventListener("storage", loadBookings);
    };
  }, []);

  useEffect(() => {
    const openAddBookingModal = () => {
      setIsAddingBooking(true);
    };

    window.addEventListener("openAddBookingModal", openAddBookingModal);

    return () => {
      window.removeEventListener("openAddBookingModal", openAddBookingModal);
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "Chưa có";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  //hàm kiểm tra booking theo ngày
  const isSameBookingSlot = (booking) => {
    if (!booking.date) return false;

    return booking.date === viewDate;
  };

  const getBookingByTable = (tableCode) => {
    return bookings.find((booking) => {
      const status = booking.status;

      const isActive =
        status === "pending" ||
        status === "confirmed" ||
        status === "Chờ xác nhận" ||
        status === "Đã xác nhận";

      return (
        String(booking.selectedTable) === String(tableCode) &&
        isActive &&
        isSameBookingSlot(booking)
      );
    });
  };

  const syncTableWithBooking = (table) => {
    const booking = getBookingByTable(table.code);

    if (
      booking &&
      table.status !== "maintenance" &&
      table.status !== "disabled"
    ) {
      return {
        ...table,
        status: booking.status === "confirmed" ? "booked" : "holding",
        currentBooking: booking,
      };
    }

    return table;
  };

  const displayTables = tables.map(syncTableWithBooking);

  const filteredTables = useMemo(() => {
    const keyword = String(globalSearch || search)
      .toLowerCase()
      .trim();

    return displayTables.filter((table) => {
      const matchSearch =
        !keyword ||
        table.code.toLowerCase().includes(keyword) ||
        table.areaName.toLowerCase().includes(keyword) ||
        table.description.toLowerCase().includes(keyword);

      const matchArea = areaFilter === "all" || table.areaId === areaFilter;
      const matchStatus =
        statusFilter === "all" || table.status === statusFilter;

      const matchCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "1-4" && table.capacity <= 4) ||
        (capacityFilter === "5-6" &&
          table.capacity >= 5 &&
          table.capacity <= 6) ||
        (capacityFilter === "7+" && table.capacity >= 7);

      return matchSearch && matchArea && matchStatus && matchCapacity;
    });
  }, [
    displayTables,
    search,
    globalSearch,
    areaFilter,
    statusFilter,
    capacityFilter,
  ]);

  const totalPages = Math.ceil(filteredTables.length / pageSize);

  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalAreas = areas.length;
  const totalTables = displayTables.length;
  const availableCount = displayTables.filter(
    (t) => t.status === "available",
  ).length;
  const holdingCount = displayTables.filter(
    (t) => t.status === "holding",
  ).length;
  const bookedCount = displayTables.filter((t) => t.status === "booked").length;
  const maintenanceCount = displayTables.filter(
    (t) => t.status === "maintenance",
  ).length;

  const resetFilter = () => {
    setSearch("");
    setAreaFilter("all");
    setStatusFilter("all");
    setCapacityFilter("all");
  };

  const openEditTable = (table) => {
    setEditingTable(table);
    setEditForm({
      areaId: table.areaId,
      capacity: table.capacity,
      status: table.status,
      description: table.description,
    });
  };

  const saveEditTable = () => {
    const area = areas.find((item) => item.id === editForm.areaId);
    const updatedAt = new Date().toISOString();

    const updatedTable = {
      ...editingTable,
      areaId: editForm.areaId,
      areaName: area?.name || editingTable.areaName,
      capacity: Number(editForm.capacity),
      status: editForm.status,
      description: editForm.description,
      updatedAt,
    };

    setTables((prev) =>
      prev.map((table) =>
        table.id === editingTable.id ? updatedTable : table,
      ),
    );

    setSelectedTable(updatedTable);
    setEditingTable(null);
  };

  const updateTableStatus = (tableId, status) => {
    const updatedAt = new Date().toISOString();

    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status,
              updatedAt,
            }
          : table,
      ),
    );

    setSelectedTable((prev) =>
      prev?.id === tableId ? { ...prev, status, updatedAt } : prev,
    );
  };

  const deleteTable = (table) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa bàn ${table.code}?`,
    );
    if (!confirmDelete) return;

    setTables((prev) => prev.filter((item) => item.id !== table.id));

    if (selectedTable?.id === table.id) {
      setSelectedTable(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, globalSearch, areaFilter, statusFilter, capacityFilter]);
  //hàm hủy đặt bàn
  const cancelCurrentBooking = (booking) => {
    if (!booking) return;

    const confirmCancel = window.confirm(
      `Bạn có chắc muốn hủy đặt bàn DB${booking.id}?`,
    );

    if (!confirmCancel) return;

    const updatedAt = new Date().toISOString();

    const newBookings = bookings.map((item) =>
      String(item.id) === String(booking.id)
        ? {
            ...item,
            status: "cancelled",
            updatedAt,
          }
        : item,
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    setTables(tableService.getTables());

    setSelectedTable((prev) =>
      prev
        ? {
            ...prev,
            status: "available",
            currentBooking: null,
            updatedAt,
          }
        : prev,
    );
  };

  //biến lọc khách chưa chọn bàn
  const unassignedBookings = bookings.filter((booking) => {
    const status = booking.status;

    const isActive =
      status === "pending" ||
      status === "confirmed" ||
      status === "Chờ xác nhận" ||
      status === "Đã xác nhận";

    const noArea =
      !booking.selectedAreaTitle ||
      booking.selectedAreaTitle === "Nhà hàng sắp xếp" ||
      booking.selectedAreaTitle === "Đang xếp";

    const noTable =
      !booking.selectedTable ||
      booking.selectedTable === "Đang xếp" ||
      booking.selectedTable === "Đang sắp xếp";

    return isActive && (noArea || noTable);
  });
  //hàm mở popup và lưu xếp bàn
  const openAssignBookingModal = (booking) => {
    setAssignBooking(booking);
    setAssignForm({
      areaId: "floor1",
      tableCode: "",
    });
  };

  const saveAssignBooking = () => {
    if (!assignBooking) return;

    if (!assignForm.tableCode) {
      alert("Vui lòng chọn bàn");
      return;
    }

    const area = areas.find((item) => item.id === assignForm.areaId);
    const updatedAt = new Date().toISOString();

    const newBookings = bookings.map((booking) =>
      String(booking.id) === String(assignBooking.id)
        ? {
            ...booking,
            selectedArea: assignForm.areaId,
            selectedAreaTitle: area?.name || "",
            selectedTable: assignForm.tableCode,

            status: "confirmed",

            assignedAt: updatedAt,
            assignedBy: "admin",

            updatedAt,
          }
        : booking,
    );

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    setTables(tableService.getTables());

    setAssignBooking(null);
  };
  //hàm xác nhận booking
  const confirmCurrentBooking = (booking) => {
    if (!booking) return;

    const updatedBookings = bookingService.confirmBooking(booking.id);
    setBookings(updatedBookings);

    setTables(tableService.getTables());

    setSelectedTable((prev) =>
      prev
        ? {
            ...prev,
            status: "booked",
            currentBooking: {
              ...booking,
              status: "confirmed",
              updatedAt: new Date().toISOString(),
            },
          }
        : prev,
    );
  };

  const isTableBookedAtDate = (tableCode, date) => {
    return bookings.some(
      (booking) =>
        String(booking.selectedTable) === String(tableCode) &&
        booking.date === date &&
        (booking.status === "pending" ||
          booking.status === "confirmed" ||
          booking.status === "Chờ xác nhận" ||
          booking.status === "Đã xác nhận"),
    );
  };

  //hàm kiểm tra trạng thái bàn khi thêm
  const getTableStatusForAdd = (table) => {
    if (!addForm.date) return table.status;

    const existedBooking = bookings.find(
      (booking) =>
        String(booking.selectedTable) === String(table.code) &&
        booking.date === addForm.date &&
        (booking.status === "pending" ||
          booking.status === "confirmed" ||
          booking.status === "Chờ xác nhận" ||
          booking.status === "Đã xác nhận"),
    );

    if (
      existedBooking?.status === "pending" ||
      existedBooking?.status === "Chờ xác nhận"
    ) {
      return "holding";
    }

    if (
      existedBooking?.status === "confirmed" ||
      existedBooking?.status === "Đã xác nhận"
    ) {
      return "booked";
    }

    return table.status;
  };

  //hàm lưu đặt bàn
  const saveAddBooking = () => {
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

    const newBooking = {
      id: Date.now(),
      customerName: addForm.customerName.trim(),
      name: addForm.customerName.trim(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
    };

    const newBookings = [newBooking, ...bookings];

    setBookings(newBookings);
    localStorage.setItem("bookings", JSON.stringify(newBookings));

    window.dispatchEvent(
      new CustomEvent("bookingsUpdated", {
        detail: newBookings,
      }),
    );

    setSelectedTable(null);
    setIsAddingBooking(false);

    setAddForm({
      customerName: "",
      phone: "",
      email: "",
      date: today,
      time: "",
      guests: 1,
      selectedArea: "floor1",
      selectedAreaTitle: "Tầng trệt",
      selectedTable: "",
      note: "",
      status: "pending",
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
        <StatCard
          icon={<Building2 />}
          title="Tổng khu vực"
          value={totalAreas}
          bg="bg-green-50"
          color="text-green-700"
        />
        <StatCard
          icon={<LayoutGrid />}
          title="Tổng bàn"
          value={totalTables}
          bg="bg-blue-50"
          color="text-blue-600"
        />
        <StatCard
          icon={<CheckCircle />}
          title="Bàn trống"
          value={availableCount}
          bg="bg-green-50"
          color="text-green-600"
        />
        <StatCard
          icon={<Clock3 />}
          title="Đang giữ ngày đã chọn"
          value={holdingCount}
          bg="bg-orange-50"
          color="text-orange-600"
        />

        <StatCard
          icon={<CalendarCheck />}
          title="Đã đặt ngày đã chọn"
          value={bookedCount}
          bg="bg-red-50"
          color="text-red-600"
        />
        <StatCard
          icon={<Wrench />}
          title="Bảo trì"
          value={maintenanceCount}
          bg="bg-gray-100"
          color="text-gray-600"
        />
      </div>
      <div
        className={`grid grid-cols-1 gap-4 items-start ${selectedTable ? "xl:grid-cols-[minmax(0,1fr)_340px]" : ""}`}
      >
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 border-b border-gray-100">
            <div className="flex items-center gap-8 overflow-x-auto">
              <TabButton
                active={activeTab === "map"}
                onClick={() => setActiveTab("map")}
              >
                Sơ đồ bàn
              </TabButton>

              <TabButton
                active={activeTab === "list"}
                onClick={() => setActiveTab("list")}
              >
                Danh sách bàn
              </TabButton>
            </div>
          </div>

          {activeTab === "map" && (
            <>
              {/* bộ lọc ngày/giờ trên sơ đồ bàn */}
              <div className="px-4 pt-4">
                <div className="rounded-2xl border border-gray-100 bg-green-50/40 p-4 flex flex-col md:flex-row md:items-end gap-4">
                  <label className="block">
                    <span className="text-sm font-black text-green-900">
                      Ngày xem trạng thái bàn
                    </span>
                    <input
                      type="date"
                      value={viewDate}
                      onChange={(e) => {
                        setViewDate(e.target.value);
                        setSelectedTable(null);
                      }}
                      className="mt-2 h-11 rounded-xl border border-green-100 bg-white px-4 font-bold outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-4 p-4">
                <aside className="rounded-2xl border border-gray-100 bg-white p-4 self-start">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-green-950">Khu vực</h3>

                    <button className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-green-700 hover:bg-green-50">
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {areas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => setSelectedArea(area.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selectedArea === area.id
                            ? "bg-green-50 border-green-200 text-green-900"
                            : "bg-white border-gray-100 text-gray-600 hover:bg-green-50/50"
                        }`}
                      >
                        <p className="font-black">{area.name}</p>

                        <p className="text-sm font-semibold mt-1">
                          {
                            displayTables.filter(
                              (table) => table.areaId === area.id,
                            ).length
                          }{" "}
                          bàn
                        </p>
                      </button>
                    ))}
                  </div>
                </aside>

                <div className="space-y-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(TABLE_STATUS).map(([key, label]) => (
                      <Legend key={key} color={STATUS_DOT[key]} text={label} />
                    ))}

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="ml-auto h-10 rounded-xl border border-gray-100 px-4 text-sm font-bold outline-none"
                    >
                      <option value="all">Tất cả trạng thái</option>

                      {Object.entries(TABLE_STATUS)
                        .filter(
                          ([key]) => key !== "holding" && key !== "booked",
                        )
                        .map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </div>

                  {areas
                    .filter(
                      (area) =>
                        selectedArea === "all" || area.id === selectedArea,
                    )
                    .map((area) => {
                      const areaTables = displayTables.filter((table) => {
                        const matchArea = table.areaId === area.id;
                        const matchStatus =
                          statusFilter === "all" ||
                          table.status === statusFilter;

                        return matchArea && matchStatus;
                      });

                      return (
                        <div
                          key={area.id}
                          className="rounded-2xl border border-gray-100 p-4"
                        >
                          <h3 className="font-black text-green-950 mb-4">
                            {area.name}{" "}
                            <span className="text-sm text-gray-500">
                              ({areaTables.length} bàn)
                            </span>
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {areaTables.map((table) => (
                              <TableButton
                                key={table.id}
                                table={table}
                                active={selectedTable?.id === table.id}
                                onClick={() => setSelectedTable(table)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {unassignedBookings.length > 0 && (
                <section className="mx-4 mb-4 rounded-2xl border border-orange-100 bg-orange-50/40 overflow-hidden">
                  <div className="px-5 py-4 border-b border-orange-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-green-950">
                        Khách đặt bàn chưa chọn khu vực / bàn
                      </h3>
                    </div>

                    <span className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-600 text-sm font-black">
                      {unassignedBookings.length} lịch
                    </span>
                  </div>

                  <div className="max-h-[390px] overflow-auto relative">
                    <table className="min-w-[1230px] w-full text-left text-sm table-fixed">
                      <thead className="sticky top-0 z-30 bg-white text-gray-600 font-black text-xs uppercase shadow-sm">
                        <tr>
                          <th className="w-[190px] px-4 py-3 whitespace-nowrap bg-white">
                            Mã đặt
                          </th>
                          <th className="w-[190px] px-4 py-3 whitespace-nowrap bg-white">
                            Khách hàng
                          </th>
                          <th className="w-[150px] px-4 py-3 whitespace-nowrap bg-white">
                            SĐT
                          </th>
                          <th className="w-[140px] px-4 py-3 whitespace-nowrap bg-white">
                            Ngày
                          </th>
                          <th className="w-[100px] px-4 py-3 whitespace-nowrap bg-white">
                            Giờ
                          </th>
                          <th className="w-[110px] px-4 py-3 whitespace-nowrap bg-white">
                            Số khách
                          </th>
                          <th className="w-[200px] px-4 py-3 whitespace-nowrap bg-white">
                            Ghi chú
                          </th>
                          <th className="w-[150px] px-4 py-3 text-center sticky right-0 bg-white z-30 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)]">
                            Thao tác
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {unassignedBookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="border-t border-orange-100 bg-white"
                          >
                            <td className="w-[190px] px-4 py-3 font-black text-green-700 whitespace-nowrap overflow-hidden text-ellipsis">
                              DB{booking.id}
                            </td>

                            <td className="w-[190px] px-4 py-3 font-bold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                              {booking.customerName ||
                                booking.fullName ||
                                booking.name ||
                                "Khách hàng"}
                            </td>

                            <td className="w-[150px] px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                              {booking.phone || "Chưa có"}
                            </td>

                            <td className="w-[140px] px-4 py-3 font-semibold whitespace-nowrap">
                              {formatDate(booking.date)}
                            </td>

                            <td className="w-[100px] px-4 py-3 font-semibold whitespace-nowrap">
                              {booking.time || "Chưa có"}
                            </td>

                            <td className="w-[110px] px-4 py-3 font-black whitespace-nowrap">
                              {booking.guests || booking.people || 0} người
                            </td>

                            <td className="w-[200px] px-4 py-3 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                              {booking.note || "Không có"}
                            </td>

                            <td className="w-[150px] px-4 py-3 text-center sticky right-0 bg-white z-20 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)]">
                              <button
                                onClick={() => openAssignBookingModal(booking)}
                                className="h-9 min-w-[92px] px-4 rounded-lg bg-green-700 text-white font-black hover:bg-green-800 transition whitespace-nowrap"
                              >
                                Xếp bàn
                              </button>
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

          {activeTab === "list" && (
            <>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_150px_150px_150px_56px] gap-3">
                  <div className="h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm min-w-0">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm bàn, khu vực..."
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
                      <option key={area.id} value={area.id}>
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
                    {Object.entries(TABLE_STATUS)
                      .filter(([key]) => key !== "holding" && key !== "booked")
                      .map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                  </SelectBox>

                  <SelectBox
                    label="Sức chứa"
                    value={capacityFilter}
                    onChange={(e) => setCapacityFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="1-4">1 - 4 người</option>
                    <option value="5-6">5 - 6 người</option>
                    <option value="7+">Trên 7 người</option>
                  </SelectBox>

                  <button
                    onClick={resetFilter}
                    className="h-12 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <RotateCcw size={17} />
                  </button>
                </div>
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
                      <th className="px-4 py-3 text-center sticky right-0 bg-[#fbfcfb]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTables.map((table) => (
                      <tr
                        key={table.id}
                        onClick={() => setSelectedTable(table)}
                        className={`border-t border-gray-100 cursor-pointer hover:bg-green-50/30 ${
                          selectedTable?.id === table.id ? "bg-green-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-black text-green-700">
                          {table.code}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          {table.areaName}
                        </td>
                        <td className="px-4 py-3">{table.capacity} người</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={table.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {table.description}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDateTime(table.updatedAt)}
                        </td>
                        <td className="px-4 py-3 sticky right-0 bg-white">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton
                              icon={<Eye size={16} />}
                              color="green"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTable(table);
                              }}
                            />

                            <ActionButton
                              icon={<Pencil size={16} />}
                              color="emerald"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditTable(table);
                              }}
                            />

                            <ActionButton
                              icon={<Trash2 size={16} />}
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTable(table);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  Hiển thị{" "}
                  {filteredTables.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}{" "}
                  - {Math.min(currentPage * pageSize, filteredTables.length)}{" "}
                  trong tổng số {filteredTables.length} bàn
                </p>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg border font-black ${
                          currentPage === page
                            ? "bg-green-700 text-white border-green-700"
                            : "border-gray-200 text-gray-600 hover:bg-green-50"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
              </div>
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
            onStatusChange={(status) =>
              updateTableStatus(selectedTable.id, status)
            }
            onCancelBooking={() =>
              cancelCurrentBooking(selectedTable.currentBooking)
            }
            onConfirmBooking={() =>
              confirmCurrentBooking(selectedTable.currentBooking)
            }
          />
        )}
      </div>
      {/* popup xếp bàn */}
      {assignBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-green-950">
                  Xếp bàn cho khách
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  DB{assignBooking.id} -{" "}
                  {assignBooking.customerName ||
                    assignBooking.name ||
                    "Khách hàng"}
                </p>
              </div>

              <button
                onClick={() => setAssignBooking(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <SelectField
                label="Khu vực"
                value={assignForm.areaId}
                onChange={(value) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    areaId: value,
                    tableCode: "",
                  }))
                }
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Bàn trống"
                value={assignForm.tableCode}
                onChange={(value) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    tableCode: value,
                  }))
                }
              >
                <option value="">Chọn bàn</option>

                {tables
                  .filter(
                    (table) =>
                      table.areaId === assignForm.areaId &&
                      table.status === "available" &&
                      Number(table.capacity) >=
                        Number(
                          assignBooking.guests || assignBooking.people || 0,
                        ) &&
                      !isTableBookedAtDate(table.code, assignBooking.date),
                  )
                  .map((table) => (
                    <option key={table.id} value={table.code}>
                      Bàn {table.code} - {table.capacity} người
                    </option>
                  ))}
              </SelectField>

              <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm">
                <p className="font-black text-green-900 mb-2">
                  Thông tin khách
                </p>
                <p>Khách: {assignBooking.customerName || assignBooking.name}</p>
                <p>SĐT: {assignBooking.phone || "Chưa có"}</p>
                <p>
                  Thời gian: {formatDate(assignBooking.date)} -
                  {assignBooking.time || "Chưa có"}
                </p>
                <p>
                  Số khách: {assignBooking.guests || assignBooking.people || 0}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setAssignBooking(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveAssignBooking}
                className="h-11 px-5 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
              >
                Lưu xếp bàn
              </button>
            </div>
          </div>
        </div>
      )}
      {editingTable && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-green-950">
                  Chỉnh sửa bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Bàn {editingTable.code}
                </p>
              </div>

              <button
                onClick={() => setEditingTable(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <SelectField
                label="Khu vực"
                value={editForm.areaId}
                onChange={(value) =>
                  setEditForm((prev) => ({ ...prev, areaId: value }))
                }
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </SelectField>

              <InputField
                label="Sức chứa"
                type="number"
                value={editForm.capacity}
                onChange={(value) =>
                  setEditForm((prev) => ({ ...prev, capacity: value }))
                }
              />

              <SelectField
                label="Trạng thái"
                value={editForm.status}
                onChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: value }))
                }
              >
                {Object.entries(TABLE_STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </SelectField>

              <label className="block">
                <span className="text-sm font-black text-gray-500">Mô tả</span>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                />
              </label>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingTable(null)}
                className="h-11 px-5 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveEditTable}
                className="h-11 px-5 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
      {/* popup */}
      {isAddingBooking && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-green-950">
                  Thêm đặt bàn
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Tạo lịch đặt bàn mới từ trang Bàn & Khu vực
                </p>
              </div>

              <button
                onClick={() => setIsAddingBooking(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 max-h-[72vh] overflow-y-auto">
              <div className="space-y-4">
                <InputField
                  label="Tên khách hàng"
                  value={addForm.customerName}
                  onChange={(value) =>
                    setAddForm((prev) => ({ ...prev, customerName: value }))
                  }
                />

                <InputField
                  label="SĐT"
                  value={addForm.phone}
                  onChange={(value) =>
                    setAddForm((prev) => ({ ...prev, phone: value }))
                  }
                />

                <InputField
                  label="Email"
                  value={addForm.email}
                  onChange={(value) =>
                    setAddForm((prev) => ({ ...prev, email: value }))
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Ngày đặt"
                    type="date"
                    value={addForm.date}
                    onChange={(value) =>
                      setAddForm((prev) => ({
                        ...prev,
                        date: value,
                        selectedTable: "",
                      }))
                    }
                  />

                  <InputField
                    label="Giờ"
                    type="time"
                    value={addForm.time}
                    onChange={(value) =>
                      setAddForm((prev) => ({ ...prev, time: value }))
                    }
                  />
                </div>

                <InputField
                  label="Số khách"
                  type="number"
                  value={addForm.guests}
                  onChange={(value) =>
                    setAddForm((prev) => ({ ...prev, guests: value }))
                  }
                />

                <SelectField
                  label="Khu vực"
                  value={addForm.selectedArea}
                  onChange={(value) => {
                    const area = areas.find((item) => item.id === value);

                    setAddForm((prev) => ({
                      ...prev,
                      selectedArea: value,
                      selectedAreaTitle: area?.name || "",
                      selectedTable: "",
                    }));
                  }}
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </SelectField>

                <label className="block">
                  <span className="text-sm font-black text-gray-500">
                    Ghi chú
                  </span>
                  <textarea
                    value={addForm.note}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, note: e.target.value }))
                    }
                    className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
                  />
                </label>
              </div>

              <div>
                <p className="text-sm font-black text-gray-500 mb-3">
                  Chọn bàn
                </p>

                <div className="rounded-2xl border border-gray-100 p-4 max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {tables
                      .filter((table) => table.areaId === addForm.selectedArea)
                      .map((table) => {
                        const status = getTableStatusForAdd(table);

                        const isSelected =
                          String(addForm.selectedTable) === String(table.code);

                        const disabled = status !== "available";

                        return (
                          <button
                            key={table.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;

                              setAddForm((prev) => ({
                                ...prev,
                                selectedTable: table.code,
                              }));
                            }}
                            className={`relative h-16 rounded-xl border font-black transition ${
                              isSelected
                                ? "border-green-700 bg-green-600 text-white ring-2 ring-green-300"
                                : TABLE_STATUS_STYLE[status]
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
                              <span>Bàn {table.code}</span>

                              <span className="mt-1 text-[10px] font-black">
                                {status === "available"
                                  ? `${table.capacity} người`
                                  : TABLE_STATUS[status]}
                              </span>

                              {isSelected && (
                                <span className="mt-1 text-[10px] font-black text-white">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
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
                className="h-11 px-5 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
              >
                Tạo đặt bàn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableButton({ table, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-12 rounded-xl border font-black transition ${
        active ? "ring-2 ring-green-700" : ""
      } ${STATUS_STYLE[table.status]}`}
    >
      <span
        className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${STATUS_DOT[table.status]}`}
      ></span>
      {table.code}
    </button>
  );
}

function TableDetailPanel({
  table,
  booking,
  formatDate,
  formatDateTime,
  onClose,
  onEdit,
  onStatusChange,
  onCancelBooking,
  onConfirmBooking,
}) {
  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden 2xl:sticky 2xl:top-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-black text-green-950">
          Chi tiết bàn {table.code}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="h-36 rounded-2xl border border-gray-100 bg-[#fbfcfb] flex items-center justify-center">
          <div className="w-28 h-28 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center text-3xl font-black text-green-950 shadow-sm">
            {table.code}
          </div>
        </div>

        <StatusBadge status={table.status} />

        <DetailBlock title="Thông tin bàn">
          <DetailRow label="Mã bàn" value={table.code} />
          <DetailRow label="Khu vực" value={table.areaName} />
          <DetailRow label="Sức chứa" value={`${table.capacity} người`} />
          <DetailRow label="Mô tả" value={table.description} />
          <DetailRow label="Cập nhật" value={formatDateTime(table.updatedAt)} />
        </DetailBlock>

        {booking && (
          <DetailBlock title="Thông tin đặt bàn hiện tại">
            {booking ? (
              <>
                <DetailRow
                  label="Mã đặt bàn"
                  value={`DB${booking.id || "Chưa có"}`}
                />
                <DetailRow
                  label="Khách hàng"
                  value={
                    booking.customerName ||
                    booking.fullName ||
                    booking.name ||
                    "Chưa có"
                  }
                />
                <DetailRow
                  label="Số điện thoại"
                  value={booking.phone || "Chưa có"}
                />
                <DetailRow label="Email" value={booking.email || "Chưa có"} />
                <DetailRow label="Ngày đặt" value={formatDate(booking.date)} />
                <DetailRow label="Giờ đặt" value={booking.time || "Chưa có"} />
                <DetailRow
                  label="Số khách"
                  value={`${booking.guests || booking.people || 0} người`}
                />
                <DetailRow
                  label="Loại đặt"
                  value={
                    booking.type === "table_with_order"
                      ? "Đặt bàn kèm đơn món"
                      : booking.type === "table_with_food"
                        ? "Đặt bàn kèm món"
                        : "Chỉ đặt bàn"
                  }
                />
                <DetailRow
                  label="Tổng tiền"
                  value={`${Number(booking.total || 0).toLocaleString("vi-VN")}đ`}
                />
                <DetailRow label="Ghi chú" value={booking.note || "Không có"} />
                <DetailRow
                  label="Tạo lúc"
                  value={formatDateTime(booking.createdAt)}
                />
                <DetailRow
                  label="Xếp bàn lúc"
                  value={formatDateTime(booking.assignedAt)}
                />

                <DetailRow
                  label="Xếp bởi"
                  value={booking.assignedBy || "Chưa có"}
                />
              </>
            ) : (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5 text-center">
                <p className="font-black text-gray-500">
                  Bàn này chưa có lịch đặt hiện tại
                </p>
                <p className="text-sm text-gray-400 font-semibold mt-1">
                  Khi khách đặt đúng mã bàn này, thông tin sẽ tự hiển thị ở đây.
                </p>
              </div>
            )}
          </DetailBlock>
        )}

        {booking && (
          <button
            onClick={onCancelBooking}
            className="w-full h-12 rounded-xl bg-red-50 text-red-600 border border-red-100 font-black hover:bg-red-100 transition"
          >
            Hủy đặt bàn
          </button>
        )}

        {booking?.status === "pending" && booking?.selectedTable && (
          <button
            onClick={onConfirmBooking}
            className="w-full h-12 rounded-xl bg-green-700 text-white border border-green-700 font-black hover:bg-green-800 transition"
          >
            Xác nhận đặt bàn
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={() => onStatusChange("available")}
            className="h-11 rounded-xl bg-green-50 text-green-700 border border-green-100 font-black hover:bg-green-100"
          >
            <Unlock size={16} className="inline mr-1" />
            Mở bàn
          </button>

          <button
            onClick={() => onStatusChange("maintenance")}
            className="h-11 rounded-xl bg-gray-100 text-gray-600 border border-gray-200 font-black hover:bg-gray-200"
          >
            <Lock size={16} className="inline mr-1" />
            Bảo trì
          </button>

          <button
            onClick={() => onStatusChange("holding")}
            className="h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 font-black hover:bg-orange-100"
          >
            Đang giữ
          </button>

          <button
            onClick={onEdit}
            className="h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-black hover:bg-blue-100"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </aside>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black border ${STATUS_STYLE[status]}`}
    >
      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`}></span>
      {TABLE_STATUS[status]}
    </span>
  );
}

function StatCard({ icon, title, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[96px] hover:bg-green-50/40 hover:border-green-100 hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-500 font-bold text-sm">{title}</p>
          <h3 className="text-2xl font-black text-green-950 mt-1">{value}</h3>
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
    <label className="h-12 rounded-xl border border-gray-100 bg-white px-3 flex flex-col justify-center shadow-sm min-w-[150px]">
      <span className="text-[11px] font-black text-gray-400">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="outline-none bg-transparent text-sm font-bold text-gray-700"
      >
        {children}
      </select>
    </label>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
      >
        {children}
      </select>
    </label>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
      />
    </label>
  );
}

function ActionButton({ icon, color, onClick }) {
  const colors = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${colors[color]}`}
    >
      {icon}
    </button>
  );
}

function Legend({ color, text }) {
  return (
    <div className="h-9 px-3 rounded-xl border border-gray-100 bg-white flex items-center gap-2 text-sm font-bold text-gray-600">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
      {text}
    </div>
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
      <span className="text-gray-800 font-bold break-words">{value}</span>
    </div>
  );
}

export default AdminTablesPage;
