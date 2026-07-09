import { useMemo, useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { showAdminToast } from "../../components/admin/AdminToast";
import { removeVietnameseTones } from "../../utils/string";
import { getCurrentUser, getAuthToken } from "../../utils/auth";
import { canUseAction } from "../../utils/permissions";
import {
  Utensils, CheckCircle, PauseCircle, XCircle, Search, RotateCcw, Trash2
} from "lucide-react";
import AdminCategoryModal from "../../components/admin/AdminCategoryModal";
import { StatCard, SelectBox } from "../../components/admin/AdminMenuComponents";
import AdminFoodDetailModal from "../../components/admin/AdminFoodDetailModal";
import AdminFoodFormModal from "../../components/admin/AdminFoodFormModal";
import AdminFoodTable from "../../components/admin/AdminFoodTable";
import GlobalPagination from "../../components/admin/GlobalPagination";
import {
  formatDateTimeMenu, formatPriceMenu, getStatusTextMenu,
  getStatusStyleMenu, createSearchTextMenu
} from "../../utils/menuHelpers";

function AdminMenuPage() {
  const { globalSearch, setHeaderAction } = useOutletContext();
  const [searchParams] = useSearchParams();
  const currentUser = getCurrentUser();

  // ─── State ────────────────────────────────────────────────────────
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [deleteConfirmFood, setDeleteConfirmFood] = useState(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [flatCategoriesList, setFlatCategoriesList] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const API_URL = "http://localhost:5001/api/admin/menu-items";
  const [isLoading, setIsLoading] = useState(false);

  // Add/Edit Food Form State
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [addFormTab, setAddFormTab] = useState("description");
  const [showOtherCategories, setShowOtherCategories] = useState(false);
  const emptyFoodForm = {
    name: "", image: "", images: [], category: "Dê hấp", subCategory: "", price: "",
    type: "Món chính", status: "selling", badge: "", portion: "", cooking: "", time: "",
    shortDescription: "", description: "", ingredients: "", flavor: "",
  };
  const [editForm, setEditForm] = useState(emptyFoodForm);

  // ─── Data Loading ─────────────────────────────────────────────────
  const fetchFoods = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      const result = await res.json();
      if (!result.success) { alert(result.message || "Không thể lấy danh sách món ăn"); return; }
      const foodData = result.data || [];
      setFoods(foodData);
      const viewId = searchParams.get("view");
      if (viewId) {
        const foodToView = foodData.find((f) => String(f.id) === String(viewId));
        if (foodToView) setSelectedFood(foodToView);
      }
    } catch (error) { console.error("Lỗi:", error); alert("Không thể kết nối backend"); } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/categories");
      const result = await res.json();
      if (result.success) { setCategoriesList(result.data); setFlatCategoriesList(result.flatData); }
    } catch (error) { console.error("Lỗi:", error); }
  };

  useEffect(() => {
    fetchFoods(); fetchCategories();
    const handleOpenCategory = () => setIsCategoryModalOpen(true);
    const handleCategoriesUpdate = () => fetchCategories();
    window.addEventListener("openCategoryManagementModal", handleOpenCategory);
    window.addEventListener("categoriesUpdated", handleCategoriesUpdate);
    return () => {
      window.removeEventListener("openCategoryManagementModal", handleOpenCategory);
      window.removeEventListener("categoriesUpdated", handleCategoriesUpdate);
    };
  }, []);

  useEffect(() => {
    const viewId = searchParams.get("view");
    if (viewId && foods.length > 0) {
      const foodToView = foods.find((f) => String(f.id) === String(viewId));
      if (foodToView) setSelectedFood(foodToView);
    }
  }, [searchParams, foods]);

  useEffect(() => {
    if (canUseAction(currentUser, "menu:create")) {
      setHeaderAction({
        label: "Thêm món ăn",
        onClick: () => { setEditForm(emptyFoodForm); setAddFormTab("description"); setShowOtherCategories(false); setIsAddFoodOpen(true); },
      });
    }
    return () => setHeaderAction(null);
  }, [setHeaderAction, currentUser?.role]);

  // ─── Filter Logic ─────────────────────────────────────────────────
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const rawKeyword = String(globalSearch || search).toLowerCase().trim();
      const keyword = removeVietnameseTones(rawKeyword);
      const rawSearchText = createSearchTextMenu(food).toLowerCase();
      const normalizedSearchText = removeVietnameseTones(createSearchTextMenu(food));
      const matchSearch = !keyword || rawSearchText.includes(rawKeyword) || normalizedSearchText.includes(keyword);
      const matchCategory = categoryFilter === "all" || food.category === categoryFilter;
      const matchStatus = statusFilter === "all" || food.status === statusFilter;
      const matchBadge = badgeFilter === "all" || (badgeFilter === "has" && food.badge) || (badgeFilter === "none" && !food.badge);
      return matchSearch && matchCategory && matchStatus && matchBadge;
    });
  }, [foods, search, globalSearch, categoryFilter, statusFilter, badgeFilter]);

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFoods = filteredFoods.slice(startIndex, startIndex + itemsPerPage);
  useEffect(() => setCurrentPage(1), [search, globalSearch, categoryFilter, statusFilter, badgeFilter]);
  const resetFilter = () => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); setBadgeFilter("all"); };

  // ─── Form Actions ─────────────────────────────────────────────────
  const otherSubCategories = ["Hải sản", "Bò", "Heo", "Gà", "Vịt", "Ếch", "Cá", "Món chay"];
  const categoryOptions = useMemo(() => {
    return flatCategoriesList.map((c) => {
      if (c.parent_id) {
        const parent = flatCategoriesList.find((p) => p.id === c.parent_id);
        return { label: `— ${c.name} (${parent ? parent.name : ""})`, value: c.name };
      }
      return { label: c.name, value: c.name };
    });
  }, [flatCategoriesList]);

  const openEditFoodModal = (food) => {
    const isOtherCategory = food.parentCategory === "Món khác" || otherSubCategories.includes(food.category);
    setEditingFood(food);
    setEditForm({ ...emptyFoodForm, ...food, category: isOtherCategory ? "Món khác" : food.category || "Dê hấp", subCategory: isOtherCategory ? food.subCategory || food.category : "", price: String(food.price || ""), images: food.images?.length ? food.images : food.image ? [food.image] : [], image: food.image || food.images?.[0] || "", shortDescription: food.shortDescription || "", description: food.description || "", ingredients: food.ingredients || "", flavor: food.flavor || "" });
    setAddFormTab("description");
    setShowOtherCategories(isOtherCategory);
    setIsAddFoodOpen(true);
  };

  const handleFoodImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.some((file) => file.size > 5 * 1024 * 1024)) { alert("Mỗi ảnh không được vượt quá 5MB."); return; }
    try {
      const formData = new FormData(); files.forEach((file) => formData.append("images", file));
      const res = await fetch(`${API_URL}/upload`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
      const result = await res.json();
      if (!result.success) { alert(result.message || "Upload ảnh thất bại"); return; }
      setEditForm((prev) => {
        const uploadedImages = result.images || [];
        const updatedImages = [...(prev.images || []), ...uploadedImages];
        return { ...prev, image: prev.image || uploadedImages[0] || updatedImages[0] || "", images: updatedImages };
      });
    } catch (error) { console.error("Lỗi:", error); alert("Không thể upload ảnh"); } finally { e.target.value = ""; }
  };

  const moveImage = (index, direction) => {
    setEditForm((prev) => {
      const images = [...prev.images];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= images.length) return prev;
      [images[index], images[newIndex]] = [images[newIndex], images[index]];
      return { ...prev, images, image: images[0] };
    });
  };

  const saveAddFood = async () => {
    if (!editForm.name.trim()) { alert("Vui lòng nhập tên món"); return; }
    if (!editForm.price) { alert("Vui lòng nhập giá bán"); return; }
    if (editForm.category === "Món khác" && !editForm.subCategory) { alert("Vui lòng chọn mục con"); return; }
    try {
      const payload = { ...editForm, price: Number(editForm.price), image: editForm.image || editForm.images?.[0] || "/src/assets/images/Menu/default-food.png", images: editForm.images?.length > 0 ? editForm.images : [editForm.image || "/src/assets/images/Menu/default-food.png"] };
      const res = await fetch(editingFood ? `${API_URL}/${editingFood.id}` : API_URL, { method: editingFood ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getAuthToken()}` }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!result.success) { alert(result.message || "Lưu món ăn thất bại"); return; }
      if (editingFood) {
        setFoods((prev) => prev.map((food) => (food.id === editingFood.id ? result.data : food)));
        setSelectedFood(result.data);
      } else {
        setFoods((prev) => [result.data, ...prev]);
        setSelectedFood(result.data);
      }
      showAdminToast({ title: editingFood ? "Cập nhật món ăn thành công" : "Thêm món ăn thành công", message: `Đã ${editingFood ? "cập nhật" : "thêm"} món ${result.data?.name || editForm.name}.` });
      setEditingFood(null); setIsAddFoodOpen(false); setEditForm(emptyFoodForm);
    } catch (error) { console.error("Lỗi:", error); alert("Không thể kết nối backend"); }
  };

  // ─── Status Actions ───────────────────────────────────────────────
  const toggleFoodStatus = async (food) => {
    const updatedAt = new Date().toLocaleDateString("vi-VN");
    const nextStatus = food.status === "stopped" ? "selling" : "stopped";
    try {
      const res = await fetch(`${API_URL}/${food.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getAuthToken()}` }, body: JSON.stringify({ status: nextStatus }) });
      const result = await res.json();
      if (!result.success) { alert(result.message || "Cập nhật trạng thái thất bại"); return; }
      setFoods((prev) => prev.map((item) => item.id === food.id ? { ...item, status: nextStatus, updatedAt } : item));
      setSelectedFood((prev) => prev?.id === food.id ? { ...prev, status: nextStatus, updatedAt } : prev);
      showAdminToast({ title: "Cập nhật trạng thái món thành công", message: `Đã ${nextStatus === "selling" ? "bán lại" : "ngừng bán"} món ${food.name}.` });
    } catch (error) { console.error("Lỗi:", error); alert("Không thể kết nối backend"); }
  };

  const executeDeleteFood = async (food) => {
    try {
      const res = await fetch(`${API_URL}/${food.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${getAuthToken()}` } });
      const result = await res.json();
      if (!result.success) { showAdminToast({ title: "Thất bại", message: result.message || "Xóa món thất bại", type: "error" }); return; }
      setFoods((prev) => prev.filter((item) => item.id !== food.id));
      if (selectedFood?.id === food.id) setSelectedFood(null);
      showAdminToast({ title: "Xóa món ăn thành công", message: `Đã xóa món ${food.name}.` });
    } catch (error) { console.error("Lỗi:", error); showAdminToast({ title: "Thất bại", message: "Không thể kết nối backend", type: "error" }); }
  };

  const deleteFood = (food) => setDeleteConfirmFood({ food });
  
  const toggleSelectFood = (foodId) => setSelectedFoodIds((prev) => prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]);
  const toggleSelectAllCurrentPage = () => {
    const currentIds = currentFoods.map((food) => food.id);
    const isSelectedAll = currentIds.every((id) => selectedFoodIds.includes(id));
    if (isSelectedAll) setSelectedFoodIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    else setSelectedFoodIds((prev) => [...new Set([...prev, ...currentIds])]);
  };

  const executeDeleteSelectedFoods = async () => {
    try {
      const res = await fetch(`${API_URL}/bulk/delete`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getAuthToken()}` }, body: JSON.stringify({ ids: selectedFoodIds }) });
      const result = await res.json();
      if (!result.success) { showAdminToast({ title: "Thất bại", message: result.message || "Xóa món thất bại", type: "error" }); return; }
      setFoods((prev) => prev.filter((food) => !selectedFoodIds.includes(food.id)));
      if (selectedFoodIds.includes(selectedFood?.id)) setSelectedFood(null);
      showAdminToast({ title: "Xóa hàng loạt thành công", message: `Đã xóa ${selectedFoodIds.length} món đã chọn.` });
      setSelectedFoodIds([]);
    } catch (error) { console.error("Lỗi:", error); showAdminToast({ title: "Thất bại", message: "Không thể kết nối backend", type: "error" }); }
  };

  const deleteSelectedFoods = () => { if (selectedFoodIds.length === 0) return; setDeleteConfirmFood({ bulk: true }); };

  const stopSelectedFoods = async () => {
    if (selectedFoodIds.length === 0) return;
    const updatedAt = new Date().toLocaleDateString("vi-VN");
    try {
      const res = await fetch(`${API_URL}/bulk/stop`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getAuthToken()}` }, body: JSON.stringify({ ids: selectedFoodIds }) });
      const result = await res.json();
      if (!result.success) { alert(result.message || "Ngừng bán thất bại"); return; }
      setFoods((prev) => prev.map((food) => selectedFoodIds.includes(food.id) ? { ...food, status: "stopped", updatedAt } : food));
      setSelectedFood((prev) => prev && selectedFoodIds.includes(prev.id) ? { ...prev, status: "stopped", updatedAt } : prev);
      showAdminToast({ title: "Ngừng bán hàng loạt thành công", message: `Đã ngừng bán ${selectedFoodIds.length} món đã chọn.` });
      setSelectedFoodIds([]);
    } catch (error) { console.error("Lỗi:", error); alert("Không thể kết nối backend"); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={<Utensils />} title="Tổng món ăn" value={foods.length} bg="bg-green-50" color="text-green-700" note="so với tuần trước" />
        <StatCard icon={<CheckCircle />} title="Đang bán" value={foods.filter((f) => f.status === "selling").length} bg="bg-blue-50" color="text-blue-600" note="so với tuần trước" />
        <StatCard icon={<PauseCircle />} title="Tạm ngưng" value={foods.filter((f) => f.status === "paused").length} bg="bg-orange-50" color="text-orange-600" note="so với tuần trước" />
        <StatCard icon={<XCircle />} title="Ngừng bán" value={foods.filter((f) => f.status === "stopped").length} bg="bg-red-50" color="text-red-600" note="so với tuần trước" />
      </div>

      <AdminCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />

      <div className={`grid grid-cols-1 gap-4 items-start ${selectedFood ? "xl:grid-cols-[minmax(0,1fr)_380px]" : ""}`}>
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4">
            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1">
              <div className={`h-12 rounded-xl border border-gray-100 bg-white px-4 flex items-center gap-3 shadow-sm shrink-0 ${selectedFood ? "w-[260px]" : "w-[360px]"}`}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên món, mã món..." className="w-full min-w-0 outline-none text-sm truncate" />
                <Search size={18} className="text-gray-400" />
              </div>
              <SelectBox label="Danh mục" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                {flatCategoriesList.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
              </SelectBox>
              <SelectBox label="Trạng thái" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="selling">Đang bán</option>
                <option value="paused">Tạm ngưng</option>
                <option value="stopped">Ngừng bán</option>
              </SelectBox>
              <SelectBox label="Badge" value={badgeFilter} onChange={(e) => setBadgeFilter(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="has">Có badge</option>
                <option value="none">Không có</option>
              </SelectBox>
              <button onClick={resetFilter} className="h-12 px-2 rounded-xl border border-gray-100 bg-white shadow-sm text-sm font-bold text-gray-600 flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition">
                <RotateCcw size={15} /><span className={selectedFood ? "hidden 2xl:inline" : ""}>Xóa</span>
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedFoodIds.length > 0 && (
            <div className="mx-4 mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-primary">Đã chọn {selectedFoodIds.length} món</p>
              <div className="flex items-center gap-2">
                <button disabled={!canUseAction(currentUser, "menu:update")} onClick={stopSelectedFoods} className={`h-10 px-4 rounded-xl text-sm font-black transition ${!canUseAction(currentUser, "menu:update") ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100"}`} title={!canUseAction(currentUser, "menu:update") ? "Bạn không có quyền chỉnh sửa món ăn." : ""}>Ngừng bán</button>
                <button disabled={!canUseAction(currentUser, "menu:delete")} onClick={deleteSelectedFoods} className={`h-10 px-4 rounded-xl text-sm font-black transition ${!canUseAction(currentUser, "menu:delete") ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"}`} title={!canUseAction(currentUser, "menu:delete") ? "Bạn không có quyền xóa món ăn." : ""}>Xóa món</button>
                <button onClick={() => setSelectedFoodIds([])} className="h-10 px-4 rounded-xl bg-white text-gray-500 border border-gray-100 text-sm font-black hover:bg-gray-50 transition">Bỏ chọn</button>
              </div>
            </div>
          )}

          <AdminFoodTable
            currentFoods={currentFoods} selectedFood={selectedFood} setSelectedFood={setSelectedFood}
            selectedFoodIds={selectedFoodIds} toggleSelectAllCurrentPage={toggleSelectAllCurrentPage} toggleSelectFood={toggleSelectFood}
            formatPrice={formatPriceMenu} getStatusStyle={getStatusStyleMenu} getStatusText={getStatusTextMenu} formatDateTime={formatDateTimeMenu}
            currentUser={currentUser} canUseAction={canUseAction} openEditFoodModal={openEditFoodModal} deleteFood={deleteFood}
          />

          <GlobalPagination
            total={filteredFoods.length}
            page={currentPage}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
            isLoading={isLoading}
            limitOptions={[10, 20, 50, 100]}
          />
        </section>

        <AdminFoodDetailModal
          selectedFood={selectedFood} setSelectedFood={setSelectedFood}
          formatPrice={formatPriceMenu} getStatusText={getStatusTextMenu} formatDateTime={formatDateTimeMenu}
          canUseAction={canUseAction} currentUser={currentUser} openEditFoodModal={openEditFoodModal} toggleFoodStatus={toggleFoodStatus}
        />
      </div>

      <AdminFoodFormModal
        isAddFoodOpen={isAddFoodOpen} setIsAddFoodOpen={setIsAddFoodOpen}
        editingFood={editingFood} setEditingFood={setEditingFood}
        editForm={editForm} setEditForm={setEditForm} emptyFoodForm={emptyFoodForm}
        categoryOptions={categoryOptions} showOtherCategories={showOtherCategories} setShowOtherCategories={setShowOtherCategories}
        addFormTab={addFormTab} setAddFormTab={setAddFormTab}
        handleFoodImagesChange={handleFoodImagesChange} moveImage={moveImage} saveAddFood={saveAddFood} isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmFood && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner"><Trash2 size={28} /></div>
            <div>
              <h4 className="font-black text-gray-900 text-base">{deleteConfirmFood.bulk ? "Xác nhận xóa các món đã chọn" : "Xác nhận xóa món ăn"}</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{deleteConfirmFood.bulk ? `Bạn có chắc chắn muốn xóa ${selectedFoodIds.length} món ăn đã chọn? Hành động này không thể khôi phục.` : `Bạn có chắc chắn muốn xóa món ăn "${deleteConfirmFood.food?.name}"? Hành động này không thể khôi phục.`}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmFood(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
              <button type="button" onClick={() => { const target = deleteConfirmFood; setDeleteConfirmFood(null); if (target.bulk) executeDeleteSelectedFoods(); else executeDeleteFood(target.food); }} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenuPage;
