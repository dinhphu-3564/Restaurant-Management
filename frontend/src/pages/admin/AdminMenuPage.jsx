import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Utensils,
  CheckCircle,
  PauseCircle,
  XCircle,
  Tag,
  Search,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Star,
} from "lucide-react";

function AdminMenuPage() {
  const { globalSearch, setHeaderAction } = useOutletContext();
  const [selectedFood, setSelectedFood] = useState(null);

  const [addFormTab, setAddFormTab] = useState("description");
  const [showOtherCategories, setShowOtherCategories] = useState(false);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);

  //state sửa món
  const [editingFood, setEditingFood] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  //hàm thêm món ăn
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  const emptyFoodForm = {
    name: "",
    image: "",
    images: [],
    category: "Dê hấp",
    subCategory: "",
    price: "",
    type: "Món chính",
    status: "selling",
    badge: "",
    portion: "",
    cooking: "",
    time: "",
    shortDescription: "",
    description: "",
    ingredients: "",
    flavor: "",
  };
  const [editForm, setEditForm] = useState(emptyFoodForm);

  const [foods, setFoods] = useState(() => {
    const savedFoods = localStorage.getItem("adminFoods");
    return savedFoods
      ? JSON.parse(savedFoods)
      : [
          {
            id: "DE001",
            name: "Dê hấp tía tô",
            image: "/src/assets/images/Menu/de-hap-tia-to.png",
            category: "Dê hấp",
            price: 399000,
            type: "Món chính",
            status: "selling",
            badge: "Món ăn tâm huyết",
            sold: 312,
            rating: 4.9,
            reviews: 128,
            updatedAt: "18/06/2026",
            description:
              "Thịt dê hấp cùng lá tía tô, giữ trọn vị ngọt tự nhiên.",
          },

          {
            id: "DE002",
            name: "Dê tái chanh",
            image: "/src/assets/images/Menu/de-tai-chanh.png",
            category: "Món khác",
            price: 129000,
            type: "Món chính",
            status: "selling",
            badge: "",
            sold: 176,
            rating: 4.6,
            reviews: 86,
            updatedAt: "16/06/2026",
            description: "Dê tái chanh ăn kèm rau thơm và nước chấm đặc biệt.",
          },

          {
            id: "DE003",
            name: "Dê nướng tảng",
            image: "/src/assets/images/Menu/de-nuong-tang.png",
            category: "Dê nướng",
            price: 399000,
            type: "Món chính",
            status: "selling",
            badge: "Bán chạy",
            sold: 254,
            rating: 4.8,
            reviews: 104,
            updatedAt: "15/06/2026",
            description: "Thịt dê nướng nguyên tảng thơm mềm, đậm vị.",
          },

          {
            id: "DE004",
            name: "Sườn dê nướng",
            image: "/src/assets/images/Menu/suon-de-nuong.png",
            category: "Dê nướng",
            price: 189000,
            type: "Món chính",
            status: "selling",
            badge: "",
            sold: 193,
            rating: 4.7,
            reviews: 77,
            updatedAt: "14/06/2026",
            description: "Sườn dê tẩm ướp gia vị truyền thống nướng than hoa.",
          },

          {
            id: "DE005",
            name: "Dê xào lăn",
            image: "/src/assets/images/Menu/de-xao-lan.png",
            category: "Dê xào",
            price: 169000,
            type: "Món chính",
            status: "selling",
            badge: "",
            sold: 142,
            rating: 4.5,
            reviews: 59,
            updatedAt: "13/06/2026",
            description: "Món dê xào lăn thơm béo với nước cốt dừa.",
          },

          {
            id: "DE006",
            name: "Dê né",
            image: "/src/assets/images/Menu/de-ne.png",
            category: "Dê áp chảo",
            price: 159000,
            type: "Món chính",
            status: "paused",
            badge: "",
            sold: 110,
            rating: 4.4,
            reviews: 48,
            updatedAt: "12/06/2026",
            description: "Thịt dê áp chảo nóng hổi trên đĩa gang.",
          },

          {
            id: "DE007",
            name: "Lẩu dê Hương Sơn",
            image: "/src/assets/images/Menu/lau-de.png",
            category: "Dê lẩu",
            price: 399000,
            type: "Món chính",
            status: "selling",
            badge: "Đặc sản",
            sold: 287,
            rating: 4.9,
            reviews: 131,
            updatedAt: "18/06/2026",
            description: "Lẩu dê đậm đà hương vị đặc trưng của nhà hàng.",
          },

          {
            id: "DE008",
            name: "Tiết canh dê",
            image: "/src/assets/images/Menu/tiet-canh-de.png",
            category: "Món khác",
            price: 99000,
            type: "Món khai vị",
            status: "selling",
            badge: "",
            sold: 84,
            rating: 4.3,
            reviews: 31,
            updatedAt: "10/06/2026",
            description: "Tiết canh dê tươi ăn kèm lạc rang và rau thơm.",
          },

          {
            id: "DE009",
            name: "Dê nhúng mẻ",
            image: "/src/assets/images/Menu/de-nhung-me.png",
            category: "Dê lẩu",
            price: 289000,
            type: "Món chính",
            status: "selling",
            badge: "",
            sold: 153,
            rating: 4.6,
            reviews: 63,
            updatedAt: "11/06/2026",
            description: "Dê nhúng mẻ chua thanh, ăn cùng rau tươi.",
          },

          {
            id: "DE010",
            name: "Dồi dê nướng",
            image: "/src/assets/images/Menu/doi-de-nuong.png",
            category: "Dê nướng",
            price: 139000,
            type: "Món khai vị",
            status: "selling",
            badge: "",
            sold: 166,
            rating: 4.5,
            reviews: 57,
            updatedAt: "09/06/2026",
            description:
              "Dồi dê nướng thơm giòn, đặc sản được nhiều khách chọn.",
          },

          {
            id: "DE011",
            name: "Rau rừng xào tỏi",
            image: "/src/assets/images/Menu/rau-rung-xao-toi.png",
            category: "Món khác",
            price: 79000,
            type: "Món phụ",
            status: "selling",
            badge: "",
            sold: 211,
            rating: 4.4,
            reviews: 65,
            updatedAt: "08/06/2026",
            description: "Rau rừng tươi xào tỏi giữ nguyên độ giòn ngọt.",
          },

          {
            id: "DE012",
            name: "Cơm cháy",
            image: "/src/assets/images/Menu/com-chay.png",
            category: "Món khác",
            price: 69000,
            type: "Món phụ",
            status: "stopped",
            badge: "",
            sold: 42,
            rating: 4.0,
            reviews: 15,
            updatedAt: "06/06/2026",
            description: "Cơm cháy giòn rụm dùng kèm nước sốt đặc biệt.",
          },

          {
            id: "DE013",
            name: "Cháo dê",
            image: "/src/assets/images/Menu/chao-de.png",
            category: "Món khác",
            price: 89000,
            type: "Món phụ",
            status: "selling",
            badge: "",
            sold: 95,
            rating: 4.2,
            reviews: 28,
            updatedAt: "07/06/2026",
            description: "Cháo dê nóng hổi thích hợp dùng cuối bữa ăn.",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("adminFoods", JSON.stringify(foods));
  }, [foods]);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("vi-VN") + "đ";

  const formatMoneyInput = (value) => {
    if (!value) return "";

    return Number(String(value).replace(/\D/g, "")).toLocaleString("vi-VN");
  };

  const getStatusText = (status) => {
    switch (status) {
      case "selling":
        return "Đang bán";
      case "paused":
        return "Tạm ngưng";
      case "stopped":
        return "Ngừng bán";
      default:
        return "Đang bán";
    }
  };

  const getStatusStyle = (status) => {
    if (status === "selling") return "bg-green-50 text-green-700";
    if (status === "paused") return "bg-orange-50 text-orange-600";
    return "bg-red-50 text-red-600";
  };

  const removeVietnameseTones = (str = "") => {
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  };

  const createSearchText = (food) => {
    return [
      food.id,
      food.name,
      food.category,
      food.type,
      getStatusText(food.status),
      food.badge,
      food.price,
      food.description,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const rawKeyword = String(globalSearch || search)
        .toLowerCase()
        .trim();
      const keyword = removeVietnameseTones(rawKeyword);

      const rawSearchText = createSearchText(food).toLowerCase();
      const normalizedSearchText = removeVietnameseTones(
        createSearchText(food),
      );

      const matchSearch =
        !keyword ||
        rawSearchText.includes(rawKeyword) ||
        normalizedSearchText.includes(keyword);

      const matchCategory =
        categoryFilter === "all" || food.category === categoryFilter;

      const matchStatus =
        statusFilter === "all" || food.status === statusFilter;

      const matchType = typeFilter === "all" || food.type === typeFilter;

      const matchBadge =
        badgeFilter === "all" ||
        (badgeFilter === "has" && food.badge) ||
        (badgeFilter === "none" && !food.badge);

      return (
        matchSearch && matchCategory && matchStatus && matchType && matchBadge
      );
    });
  }, [
    foods,
    search,
    globalSearch,
    categoryFilter,
    statusFilter,
    typeFilter,
    badgeFilter,
  ]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentFoods = filteredFoods.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    globalSearch,
    categoryFilter,
    statusFilter,
    typeFilter,
    badgeFilter,
  ]);

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setBadgeFilter("all");
  };

  // mã món
  const createNextFoodId = () => {
    const maxId =
      foods.length > 0
        ? Math.max(...foods.map((f) => Number(String(f.id).replace("DE", ""))))
        : 0;

    return `DE${String(maxId + 1).padStart(3, "0")}`;
  };

  //hàm mở form sửa
  const otherSubCategories = [
    "Hải sản",
    "Bò",
    "Heo",
    "Gà",
    "Vịt",
    "Ếch",
    "Cá",
    "Món chay",
  ];

  const openEditFoodModal = (food) => {
    const isOtherCategory =
      food.parentCategory === "Món khác" ||
      otherSubCategories.includes(food.category);

    setEditingFood(food);

    setEditForm({
      ...emptyFoodForm,
      ...food,

      category: isOtherCategory ? "Món khác" : food.category || "Dê hấp",
      subCategory: isOtherCategory ? food.subCategory || food.category : "",

      price: String(food.price || ""),
      images: food.images?.length
        ? food.images
        : food.image
          ? [food.image]
          : [],
      image: food.image || food.images?.[0] || "",
      shortDescription: food.shortDescription || "",
      description: food.description || "",
      ingredients: food.ingredients || "",
      flavor: food.flavor || "",
    });

    setAddFormTab("description");
    setShowOtherCategories(isOtherCategory);
    setIsAddFoodOpen(true);
  };

  //hàm xử lý ảnh
  const handleFoodImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map((file) => URL.createObjectURL(file));

    setEditForm((prev) => {
      const updatedImages = [...(prev.images || []), ...newImages];

      return {
        ...prev,
        image: prev.image || updatedImages[0],
        images: updatedImages,
      };
    });
  };

  const moveImage = (index, direction) => {
    setEditForm((prev) => {
      const images = [...prev.images];

      const newIndex = index + direction;

      if (newIndex < 0 || newIndex >= images.length) {
        return prev;
      }

      [images[index], images[newIndex]] = [images[newIndex], images[index]];

      return {
        ...prev,
        images,
        image: images[0], // ảnh đầu tiên luôn là ảnh chính
      };
    });
  };
  // Hàm lưu thêm/sửa món ăn
  const saveAddFood = () => {
    if (!editForm.name.trim()) {
      alert("Vui lòng nhập tên món");
      return;
    }

    if (!editForm.price) {
      alert("Vui lòng nhập giá bán");
      return;
    }

    if (editForm.category === "Món khác" && !editForm.subCategory) {
      alert("Vui lòng chọn mục con");
      return;
    }
    if (editingFood) {
      const updatedAt = new Date().toLocaleDateString("vi-VN");

      const updatedFood = {
        ...editingFood,
        ...editForm,
        price: Number(editForm.price),
        image:
          editForm.image ||
          editForm.images?.[0] ||
          "/src/assets/images/Menu/default-food.png",
        images:
          editForm.images?.length > 0
            ? editForm.images
            : [editForm.image || "/src/assets/images/Menu/default-food.png"],
        category:
          editForm.category === "Món khác" && editForm.subCategory
            ? editForm.subCategory
            : editForm.category,

        parentCategory: editForm.category,
        subCategory: editForm.subCategory,

        updatedAt,
      };

      setFoods((prev) =>
        prev.map((food) => (food.id === editingFood.id ? updatedFood : food)),
      );

      setSelectedFood(updatedFood);
      setEditingFood(null);
      setIsAddFoodOpen(false);
      setEditForm(emptyFoodForm);
      return;
    }

    const newFood = {
      id: createNextFoodId(),
      name: editForm.name.trim(),

      image: editForm.image || "/src/assets/images/Menu/default-food.png",
      images: editForm.images?.length ? editForm.images : [editForm.image],

      category:
        editForm.category === "Món khác" && editForm.subCategory
          ? editForm.subCategory
          : editForm.category,

      parentCategory: editForm.category,
      subCategory: editForm.subCategory,

      price: Number(editForm.price),

      type: editForm.type,
      status: editForm.status,
      badge: editForm.badge,

      portion: editForm.portion,
      cooking: editForm.cooking,
      time: editForm.time,

      shortDescription: editForm.shortDescription,
      description: editForm.description,
      ingredients: editForm.ingredients,
      flavor: editForm.flavor,

      sold: 0,
      rating: 0,
      reviews: 0,
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };

    setFoods((prev) => [newFood, ...prev]);
    setSelectedFood(newFood);
    setIsAddFoodOpen(false);
  };

  //hàm bán lại
  const toggleFoodStatus = (food) => {
    const updatedAt = new Date().toLocaleDateString("vi-VN");

    const nextStatus = food.status === "stopped" ? "selling" : "stopped";

    setFoods((prev) =>
      prev.map((item) =>
        item.id === food.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt,
            }
          : item,
      ),
    );

    setSelectedFood((prev) =>
      prev?.id === food.id
        ? {
            ...prev,
            status: nextStatus,
            updatedAt,
          }
        : prev,
    );
  };
  //hàm xóa món
  const deleteFood = (food) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa món "${food.name}"?`,
    );

    if (!confirmDelete) return;

    setFoods((prev) => prev.filter((item) => item.id !== food.id));

    if (selectedFood?.id === food.id) {
      setSelectedFood(null);
    }
  };
  //hàm chọn nhiều món
  const toggleSelectFood = (foodId) => {
    setSelectedFoodIds((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId],
    );
  };

  const toggleSelectAllCurrentPage = () => {
    const currentIds = currentFoods.map((food) => food.id);

    const isSelectedAll = currentIds.every((id) =>
      selectedFoodIds.includes(id),
    );

    if (isSelectedAll) {
      setSelectedFoodIds((prev) =>
        prev.filter((id) => !currentIds.includes(id)),
      );
    } else {
      setSelectedFoodIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const deleteSelectedFoods = () => {
    if (selectedFoodIds.length === 0) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa ${selectedFoodIds.length} món đã chọn?`,
    );

    if (!confirmDelete) return;

    setFoods((prev) =>
      prev.filter((food) => !selectedFoodIds.includes(food.id)),
    );

    if (selectedFoodIds.includes(selectedFood?.id)) {
      setSelectedFood(null);
    }

    setSelectedFoodIds([]);
  };

  const stopSelectedFoods = () => {
    if (selectedFoodIds.length === 0) return;

    const updatedAt = new Date().toLocaleDateString("vi-VN");

    setFoods((prev) =>
      prev.map((food) =>
        selectedFoodIds.includes(food.id)
          ? {
              ...food,
              status: "stopped",
              updatedAt,
            }
          : food,
      ),
    );

    setSelectedFood((prev) =>
      prev && selectedFoodIds.includes(prev.id)
        ? {
            ...prev,
            status: "stopped",
            updatedAt,
          }
        : prev,
    );

    setSelectedFoodIds([]);
  };

  //hàm thêm món ăn
  useEffect(() => {
    setHeaderAction({
      label: "Thêm món ăn",
      onClick: () => {
        setEditForm(emptyFoodForm);
        setAddFormTab("description");
        setShowOtherCategories(false);
        setIsAddFoodOpen(true);
      },
    });

    return () => {
      setHeaderAction(null);
    };
  }, [setHeaderAction]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <StatCard
          icon={<Utensils />}
          title="Tổng món ăn"
          value={foods.length}
          bg="bg-green-50"
          color="text-green-700"
        />
        <StatCard
          icon={<CheckCircle />}
          title="Đang bán"
          value={foods.filter((f) => f.status === "selling").length}
          bg="bg-blue-50"
          color="text-blue-600"
        />
        <StatCard
          icon={<PauseCircle />}
          title="Tạm ngưng"
          value={foods.filter((f) => f.status === "paused").length}
          bg="bg-orange-50"
          color="text-orange-600"
        />
        <StatCard
          icon={<XCircle />}
          title="Ngừng bán"
          value={foods.filter((f) => f.status === "stopped").length}
          bg="bg-red-50"
          color="text-red-600"
        />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 items-start ${
          selectedFood ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""
        }`}
      >
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1">
              <div
                className={`h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm shrink-0 ${
                  selectedFood ? "w-[260px]" : "w-[360px]"
                }`}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên món, mã món..."
                  className="w-full min-w-0 outline-none text-sm truncate"
                />
                <Search size={18} className="text-gray-400" />
              </div>

              <SelectBox
                label="Danh mục"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="Món khai vị">Món khai vị</option>
                <option value="Dê hấp">Dê hấp</option>
                <option value="Dê nướng">Dê nướng</option>
                <option value="Dê xào">Dê xào</option>
                <option value="Dê lẩu">Dê lẩu</option>
                <option value="Sườn dê">Sườn dê</option>
                <option value="Dồi dê">Dồi dê</option>
                <option value="Ngọc dương">Ngọc dương</option>
                <option value="Lòng dê">Lòng dê</option>
                <option value="Món hầm">Món hầm</option>
                <option value="Món khác">Món khác</option>
                <option value="Hải sản">Hải sản</option>
                <option value="Bò">Bò</option>
                <option value="Heo">Heo</option>
                <option value="Gà">Gà</option>
                <option value="Vịt">Vịt</option>
                <option value="Ếch">Ếch</option>
                <option value="Cá">Cá</option>
                <option value="Món chay">Món chay</option>
                <option value="Đồ uống">Đồ uống</option>
              </SelectBox>

              <SelectBox
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="selling">Đang bán</option>
                <option value="paused">Tạm ngưng</option>
                <option value="stopped">Ngừng bán</option>
              </SelectBox>

              <SelectBox
                label="Loại món"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="Món chính">Món chính</option>
                <option value="Món phụ">Món phụ</option>
                <option value="Đồ uống">Đồ uống</option>
              </SelectBox>

              <SelectBox
                label="Badge"
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="has">Có badge</option>
                <option value="none">Không có</option>
              </SelectBox>

              <button
                onClick={resetFilter}
                className="h-12 px-2 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition"
              >
                <RotateCcw size={15} />
                <span className={selectedFood ? "hidden 2xl:inline" : ""}>
                  Xóa
                </span>
              </button>
            </div>
          </div>
          {/* thanh thao tác hàng loạt */}
          {selectedFoodIds.length > 0 && (
            <div className="mx-4 mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-green-800">
                Đã chọn {selectedFoodIds.length} món
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={stopSelectedFoods}
                  className="h-10 px-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 text-sm font-black hover:bg-orange-100 transition"
                >
                  Ngừng bán
                </button>

                <button
                  onClick={deleteSelectedFoods}
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-black hover:bg-red-100 transition"
                >
                  Xóa món
                </button>

                <button
                  onClick={() => setSelectedFoodIds([])}
                  className="h-10 px-4 rounded-xl bg-white text-gray-500 border border-gray-100 text-sm font-black hover:bg-gray-50 transition"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-[1370px] w-full text-left text-sm table-fixed">
              <thead className="bg-[#fbfcfb] text-gray-600 font-black text-xs uppercase">
                <tr>
                  <th className="w-[50px] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        currentFoods.length > 0 &&
                        currentFoods.every((food) =>
                          selectedFoodIds.includes(food.id),
                        )
                      }
                      onChange={toggleSelectAllCurrentPage}
                      className="w-4 h-4 accent-green-700"
                    />
                  </th>
                  <th className="w-[230px] px-4 py-3">Món ăn</th>
                  <th className="w-[90px] px-4 py-3">Mã món</th>
                  <th className="w-[120px] px-4 py-3">Danh mục</th>
                  <th className="w-[130px] px-4 py-3">Giá bán</th>
                  <th className="w-[110px] px-4 py-3">Loại món</th>
                  <th className="w-[130px] px-4 py-3">Trạng thái</th>
                  <th className="w-[150px] px-4 py-3">Badge</th>
                  <th className="w-[90px] px-4 py-3">Đã bán</th>
                  <th className="w-[110px] px-4 py-3">Đánh giá</th>
                  <th className="w-[130px] px-4 py-3">Cập nhật</th>

                  <th className="w-[130px] px-4 py-3 text-center sticky right-0 bg-[#fbfcfb] z-20">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentFoods.map((food) => (
                  <tr
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`border-t border-gray-100 cursor-pointer hover:bg-green-50/30 ${selectedFood?.id === food.id ? "bg-green-50/50" : ""}`}
                  >
                    <td className="w-[50px] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFoodIds.includes(food.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelectFood(food.id)}
                        className="w-4 h-4 accent-green-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <span className="font-black text-gray-700 leading-snug line-clamp-2">
                          {food.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-black text-green-700">
                      {food.id}
                    </td>
                    <td className={`px-4 py-3`}>{food.category}</td>
                    <td className="px-4 py-3 font-black text-green-950">
                      {formatPrice(food.price)}
                    </td>
                    <td className={` px-4 py-3`}>{food.type}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center min-w-[92px] px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap ${getStatusStyle(
                          food.status,
                        )}`}
                      >
                        {getStatusText(food.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {food.badge ? (
                        <span className="inline-flex items-center justify-center max-w-[120px] px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-black whitespace-nowrap overflow-hidden text-ellipsis">
                          {food.badge}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-bold">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-bold">{food.sold}</td>

                    <td className={`px-4 py-3`}>
                      <div className="font-black text-gray-700 flex items-center gap-1">
                        <Star
                          size={15}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        {food.rating}
                      </div>
                      <p className="text-xs text-gray-400">({food.reviews})</p>
                    </td>

                    <td className={`px-4 py-3 font-semibold text-gray-600`}>
                      {food.updatedAt}
                    </td>

                    <td className="px-4 py-3 sticky right-0 bg-white z-20 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.25)]">
                      <div className="flex items-center justify-center gap-2">
                        <ActionButton
                          icon={<Eye size={16} />}
                          color="green"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFood(food);
                          }}
                        />

                        <ActionButton
                          icon={<Pencil size={16} />}
                          color="emerald"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditFoodModal(food);
                          }}
                        />

                        <ActionButton
                          icon={<Trash2 size={16} />}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFood(food);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">
              Hiển thị {filteredFoods.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredFoods.length)}{" "}
              trong tổng số {filteredFoods.length} món ăn
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
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
                ),
              )}

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
          </div>
        </section>

        {selectedFood && (
          <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden 2xl:sticky 2xl:top-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-green-950">
                Chi tiết món ăn
              </h3>
              <button
                onClick={() => setSelectedFood(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <img
                src={selectedFood.image}
                alt={selectedFood.name}
                className="w-full h-[150px] 2xl:h-[170px] rounded-xl object-cover bg-gray-100"
              />

              <div>
                <h2 className="text-2xl font-black text-green-950">
                  {selectedFood.name}
                </h2>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Mã món: {selectedFood.id}
                </p>
              </div>

              <DetailBlock title="Thông tin chung">
                <DetailRow label="Danh mục" value={selectedFood.category} />
                <DetailRow label="Loại món" value={selectedFood.type} />
                <DetailRow
                  label="Giá bán"
                  value={formatPrice(selectedFood.price)}
                />
                <DetailRow
                  label="Trạng thái"
                  value={getStatusText(selectedFood.status)}
                />
                <DetailRow label="Đã bán" value={`${selectedFood.sold} phần`} />
                <DetailRow
                  label="Đánh giá"
                  value={`${selectedFood.rating} (${selectedFood.reviews} đánh giá)`}
                />
                <DetailRow label="Cập nhật" value={selectedFood.updatedAt} />
              </DetailBlock>

              <DetailBlock title="Mô tả ngắn">
                <p>{selectedFood.shortDescription || "Chưa có mô tả ngắn"}</p>
              </DetailBlock>

              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => openEditFoodModal(selectedFood)}
                  className="h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-sm font-black hover:bg-blue-100 transition w-full"
                >
                  Chỉnh sửa
                </button>

                <button
                  onClick={() => toggleFoodStatus(selectedFood)}
                  className={`h-11 rounded-xl text-sm font-black border transition ${
                    selectedFood.status === "stopped"
                      ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                      : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                  }`}
                >
                  {selectedFood.status === "stopped" ? "Bán lại" : "Ngừng bán"}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
      {/* modal thêm món */}
      {isAddFoodOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-[#064e2f]">
                  {editingFood ? "Chỉnh sửa món ăn" : "Thêm món ăn"}
                </h3>

                {editingFood && (
                  <p className="text-sm text-gray-500 font-bold mt-1">
                    {editingFood.id}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setIsAddFoodOpen(false);
                  setEditForm(emptyFoodForm);
                  setEditingFood(null);
                }}
                className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-6">
                {/* Cột trái: ảnh */}
                <div className="space-y-4">
                  <label className="relative block rounded-2xl border-2 border-[#d6a84f] bg-gray-50 overflow-hidden h-[290px] cursor-pointer group">
                    {editForm.image ? (
                      <>
                        <img
                          src={editForm.image}
                          alt="Ảnh món ăn"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white text-green-800 text-4xl font-bold flex items-center justify-center shadow-lg">
                            +
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-bold text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-4xl text-green-800 shadow-sm">
                          +
                        </div>

                        <p className="mt-4">Thêm ảnh món ăn</p>

                        <p className="text-xs mt-1 font-semibold">
                          Có thể chọn nhiều ảnh cùng lúc
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFoodImagesChange}
                      className="hidden"
                    />
                  </label>

                  {editForm.images?.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {editForm.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <button
                            type="button"
                            onClick={() =>
                              setEditForm((prev) => ({
                                ...prev,
                                image: img,
                              }))
                            }
                            className={`h-16 w-full rounded-xl overflow-hidden border-2 ${
                              index === 0
                                ? "border-[#d6a84f]"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />

                            {/* thêm badge ảnh chính */}
                            {index === 0 && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-green-800 text-white text-[10px] font-black">
                                Chính
                              </div>
                            )}

                            <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(index, -1);
                                }}
                                className="w-6 h-6 rounded-full bg-white shadow text-xs font-black disabled:opacity-30"
                              >
                                ←
                              </button>

                              <button
                                type="button"
                                disabled={index === editForm.images.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(index, 1);
                                }}
                                className="w-6 h-6 rounded-full bg-white shadow text-xs font-black disabled:opacity-30"
                              >
                                →
                              </button>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEditForm((prev) => {
                                const newImages = prev.images.filter(
                                  (_, i) => i !== index,
                                );

                                return {
                                  ...prev,
                                  images: newImages,
                                  image:
                                    prev.image === img
                                      ? newImages[0] || ""
                                      : prev.image,
                                };
                              })
                            }
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <MiniInfoInput
                      label="Khẩu phần"
                      value={editForm.portion}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, portion: value }))
                      }
                      placeholder="2 - 3 người"
                    />

                    <MiniInfoInput
                      label="Chế biến"
                      value={editForm.cooking}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, cooking: value }))
                      }
                      placeholder="Nóng hổi"
                    />

                    <MiniInfoInput
                      label="Thời gian"
                      value={editForm.time}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, time: value }))
                      }
                      placeholder="15 - 20 phút"
                    />
                  </div>
                </div>

                {/* Cột phải: thông tin */}
                <div className="space-y-5">
                  <div>
                    <InputBox
                      label="Tên món"
                      value={editForm.name}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, name: value }))
                      }
                    />
                  </div>

                  <label>
                    <span className="text-sm font-black text-gray-500">
                      Giá bán
                    </span>

                    <input
                      type="text"
                      value={formatMoneyInput(editForm.price)}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          price: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="399.000"
                      className="mt-2 w-full h-14 rounded-xl border border-gray-100 px-4 text-2xl font-black text-[#c89b3c] outline-none shadow-sm"
                    />
                  </label>

                  <TextAreaBox
                    label="Mô tả ngắn"
                    value={editForm.shortDescription}
                    onChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        shortDescription: value,
                      }))
                    }
                    placeholder="Hiển thị dưới giá món ăn ở trang người dùng"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <SelectField
                        label="Danh mục"
                        value={editForm.category}
                        onChange={(value) => {
                          setEditForm((prev) => ({
                            ...prev,
                            category: value,
                            subCategory:
                              value === "Món khác" ? prev.subCategory : "",
                          }));

                          setShowOtherCategories(value === "Món khác");
                        }}
                        options={[
                          "Món khai vị",
                          "Dê hấp",
                          "Dê nướng",
                          "Dê xào",
                          "Dê lẩu",
                          "Sườn dê",
                          "Dồi dê",
                          "Ngọc dương",
                          "Lòng dê",
                          "Món hầm",
                          "Món khác",
                          "Đồ uống",
                        ]}
                      />

                      {editForm.category === "Món khác" && (
                        <div className="rounded-xl border border-green-100 bg-green-50/40 p-3">
                          <button
                            type="button"
                            onClick={() =>
                              setShowOtherCategories((prev) => !prev)
                            }
                            className="w-full flex items-center justify-between text-sm font-black text-green-800"
                          >
                            <span>Chọn mục con</span>
                            <span>{showOtherCategories ? "▲" : "▼"}</span>
                          </button>

                          {showOtherCategories && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {[
                                "Hải sản",
                                "Bò",
                                "Heo",
                                "Gà",
                                "Vịt",
                                "Ếch",
                                "Cá",
                                "Món chay",
                              ].map((child) => (
                                <button
                                  type="button"
                                  key={child}
                                  onClick={() =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      subCategory: child,
                                    }))
                                  }
                                  className={`h-9 rounded-lg text-sm font-bold border transition ${
                                    editForm.subCategory === child
                                      ? "bg-green-800 text-white border-green-800"
                                      : "bg-white text-gray-600 border-gray-100 hover:bg-green-50 hover:text-green-800"
                                  }`}
                                >
                                  {child}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <SelectField
                      label="Loại món"
                      value={editForm.type}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, type: value }))
                      }
                      options={[
                        "Món chính",
                        "Món khai vị",
                        "Món phụ",
                        "Đồ uống",
                      ]}
                    />

                    <SelectField
                      label="Trạng thái"
                      value={editForm.status}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, status: value }))
                      }
                      options={[
                        { label: "Đang bán", value: "selling" },
                        { label: "Tạm ngưng", value: "paused" },
                        { label: "Ngừng bán", value: "stopped" },
                      ]}
                    />

                    <SelectField
                      label="Badge"
                      value={editForm.badge}
                      onChange={(value) =>
                        setEditForm((prev) => ({ ...prev, badge: value }))
                      }
                      options={[
                        { label: "Không có", value: "" },
                        { label: "Bán chạy", value: "Bán chạy" },
                        { label: "Đặc sản", value: "Đặc sản" },
                        {
                          label: "Món ăn tâm huyết",
                          value: "Món ăn tâm huyết",
                        },
                        { label: "Món mới", value: "Món mới" },
                        { label: "Sắp hết", value: "Sắp hết" },
                      ]}
                    />
                  </div>

                  <div className="rounded-2xl border border-green-900/30 overflow-hidden">
                    <div className="grid grid-cols-3 border-b border-green-900/30 text-sm font-black">
                      <button
                        type="button"
                        onClick={() => setAddFormTab("description")}
                        className={`py-3 text-center transition ${
                          addFormTab === "description"
                            ? "text-green-800 border-b-2 border-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        MÔ TẢ
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddFormTab("ingredients")}
                        className={`py-3 text-center transition ${
                          addFormTab === "ingredients"
                            ? "text-green-800 border-b-2 border-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        THÀNH PHẦN
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddFormTab("flavor")}
                        className={`py-3 text-center transition ${
                          addFormTab === "flavor"
                            ? "text-green-800 border-b-2 border-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        HƯƠNG VỊ
                      </button>
                    </div>

                    <div className="p-5 min-h-[220px]">
                      {addFormTab === "description" && (
                        <>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Ví dụ: Thịt dê hấp cùng lá tía tô, giữ trọn vị ngọt tự nhiên..."
                            className="w-full min-h-[140px] bg-transparent outline-none resize-none text-lg text-gray-600 leading-8"
                          />
                        </>
                      )}

                      {addFormTab === "ingredients" && (
                        <>
                          <textarea
                            value={editForm.ingredients}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                ingredients: e.target.value,
                              }))
                            }
                            placeholder="Mỗi dòng là một thành phần"
                            className="w-full min-h-[140px] bg-transparent outline-none resize-none text-lg text-gray-600 leading-8"
                          />
                        </>
                      )}

                      {addFormTab === "flavor" && (
                        <>
                          <textarea
                            value={editForm.flavor}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                flavor: e.target.value,
                              }))
                            }
                            placeholder="Ví dụ: Hương vị đậm đà, thơm nhẹ, thịt mềm ngọt tự nhiên..."
                            className="w-full min-h-[140px] bg-transparent outline-none resize-none text-lg text-gray-600 leading-8"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => {
                  setIsAddFoodOpen(false);
                  setEditForm(emptyFoodForm);
                  setEditingFood(null);
                }}
                className="h-11 px-6 rounded-xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
              >
                Đóng
              </button>

              <button
                onClick={saveAddFood}
                className="h-11 px-7 rounded-xl bg-green-800 text-white font-black hover:bg-green-900"
              >
                {editingFood ? "Lưu thay đổi" : "Thêm món"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 min-h-[96px] hover:bg-green-50/40 hover:border-green-100 hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-500 font-bold text-sm">{title}</p>
          <h3 className="text-2xl font-black text-green-950 mt-1">{value}</h3>
          <p className="text-green-600 text-[11px] font-black mt-1">
            ↑ so với tuần trước
          </p>
        </div>
      </div>
    </div>
  );
}

function SelectBox({ label, value, onChange, children }) {
  return (
    <label className="h-12 rounded-xl border border-gray-100 bg-white px-3 flex flex-col justify-center shadow-sm min-w-0">
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

function ActionButton({ icon, color, onClick }) {
  const colors = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
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

function InputBox({ label, value, onChange, type = "text" }) {
  return (
    <label>
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

function MiniInfoInput({ label, value, onChange, placeholder }) {
  return (
    <label className="rounded-xl bg-[#f8f3e8] px-3 py-3 text-center">
      <span className="block text-xs font-black text-gray-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-center text-sm font-black text-green-800 outline-none placeholder:text-green-800/40"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label>
      <span className="text-sm font-black text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 rounded-xl border border-gray-100 px-4 font-bold outline-none shadow-sm"
      >
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
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
    <div className="grid grid-cols-[95px_1fr] gap-3 text-sm">
      <span className="text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-800 font-bold break-words">{value}</span>
    </div>
  );
}

function TextAreaBox({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="md:col-span-2">
      <span className="text-sm font-black text-gray-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full h-24 rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold outline-none resize-none shadow-sm"
      />
    </label>
  );
}

export default AdminMenuPage;
