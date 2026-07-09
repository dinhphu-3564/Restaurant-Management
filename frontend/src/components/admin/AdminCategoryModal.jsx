import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Plus, Edit2, Trash2, Check, X as Cancel, GripVertical } from "lucide-react";
import { getAuthToken } from "../../utils/auth";
import { showAdminToast } from "./AdminToast";

const ICONS = [
  { value: "Utensils", label: "Dụng cụ ăn (Chung)" },
  { value: "Salad", label: "Món rau/Salad" },
  { value: "Soup", label: "Món lẩu/Súp" },
  { value: "Flame", label: "Món nướng" },
  { value: "CookingPot", label: "Món hầm/Xào" },
  { value: "Beef", label: "Thịt đỏ/Bò" },
  { value: "CircleDot", label: "Dồi/Chả" },
  { value: "Gem", label: "Đặc sản" },
  { value: "Circle", label: "Khác/Món viên" },
  { value: "Fish", label: "Cá/Hải sản" },
  { value: "Drumstick", label: "Thịt gia cầm" },
  { value: "Coffee", label: "Đồ uống" },
  { value: "Leaf", label: "Món chay" },
  { value: "Waves", label: "Đồ tươi sống" }
];

function AdminCategoryModal({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", parent_id: "", icon: "Utensils" });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const isChildDrag = flatCategories.find(c => c.id === active.id)?.parent_id;

      if (isChildDrag) {
        const parentId = flatCategories.find(c => c.id === active.id).parent_id;
        const parent = categories.find(c => c.id === parentId);
        const oldIndex = parent.children.findIndex(c => c.id === active.id);
        const newIndex = parent.children.findIndex(c => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newChildren = arrayMove(parent.children, oldIndex, newIndex);
          const newCategories = categories.map(c => c.id === parentId ? { ...c, children: newChildren } : c);
          setCategories(newCategories);

          const order = newChildren.map((c, i) => ({ id: c.id, display_order: i }));
          fetch("http://localhost:5001/api/categories/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
            body: JSON.stringify({ order })
          }).then(() => window.dispatchEvent(new Event("categoriesUpdated")));
        }
      } else {
        const oldIndex = categories.findIndex(c => c.id === active.id);
        const newIndex = categories.findIndex(c => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newCategories = arrayMove(categories, oldIndex, newIndex);
          setCategories(newCategories);

          const order = newCategories.map((c, i) => ({ id: c.id, display_order: i }));
          fetch("http://localhost:5001/api/categories/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
            body: JSON.stringify({ order })
          }).then(() => window.dispatchEvent(new Event("categoriesUpdated")));
        }
      }
    }
  };


  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/categories");
      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
        setFlatCategories(result.flatData);
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      showAdminToast({ title: "Lỗi", message: "Vui lòng nhập tên danh mục", type: "error" });
      return;
    }

    try {
      const token = getAuthToken();
      const method = editingId === "new" ? "POST" : "PUT";
      const url = editingId === "new"
        ? "http://localhost:5001/api/categories"
        : `http://localhost:5001/api/categories/${editingId}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          parent_id: editForm.parent_id || null,
          icon: editForm.icon
        })
      });

      const result = await res.json();
      if (result.success) {
        showAdminToast({ title: "Thành công", message: result.message });
        setEditingId(null);
        fetchCategories();

        // Notify other components that categories changed
        window.dispatchEvent(new Event("categoriesUpdated"));
      } else {
        showAdminToast({ title: "Lỗi", message: result.message, type: "error" });
      }
    } catch (error) {
      console.error("Lỗi lưu danh mục:", error);
      showAdminToast({ title: "Lỗi", message: "Lỗi kết nối", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá danh mục này?")) return;

    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:5001/api/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const result = await res.json();
      if (result.success) {
        showAdminToast({ title: "Thành công", message: result.message });
        fetchCategories();
        window.dispatchEvent(new Event("categoriesUpdated"));
      } else {
        showAdminToast({ title: "Lỗi", message: result.message, type: "error" });
      }
    } catch (error) {
      showAdminToast({ title: "Lỗi", message: "Lỗi kết nối", type: "error" });
    }
  };

  if (!isOpen) return null;

  const parentOptions = flatCategories.filter(c => !c.parent_id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-primary">Quản lý danh mục</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Đang tải...</div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEditingId("new");
                  setEditForm({ name: "", parent_id: "", icon: "Utensils" });
                }}
                className="w-full py-3 mb-4 border-2 border-dashed border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-50 transition"
              >
                <Plus size={18} />
                Thêm danh mục mới
              </button>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {categories.map((category) => (
                      <div key={category.id} className="border-b border-gray-100 last:border-0">
                        <CategoryRow
                          category={category}
                          editingId={editingId}
                          editForm={editForm}
                          setEditForm={setEditForm}
                          setEditingId={setEditingId}
                          handleSave={handleSave}
                          handleDelete={handleDelete}
                          parentOptions={parentOptions}
                        />

                        <SortableContext items={(category.children || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                          {category.children?.map(child => (
                            <CategoryRow
                              key={child.id}
                              category={child}
                              isChild
                              editingId={editingId}
                              editForm={editForm}
                              setEditForm={setEditForm}
                              setEditingId={setEditingId}
                              handleSave={handleSave}
                              handleDelete={handleDelete}
                              parentOptions={parentOptions}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    ))}

                  </SortableContext>
                  {editingId === "new" && (
                    <CategoryEditRow
                      editForm={editForm}
                      setEditForm={setEditForm}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                      parentOptions={parentOptions}
                    />
                  )}
                </div>
              </DndContext>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ category, isChild, editingId, editForm, setEditForm, setEditingId, handleSave, handleDelete, parentOptions }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  if (editingId === category.id) {
    return (
      <CategoryEditRow
        isChild={isChild}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSave}
        onCancel={() => setEditingId(null)}
        parentOptions={parentOptions}
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition ${isChild ? "pl-12" : ""}`}>
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 mr-2">
          <GripVertical size={16} />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
          {category.icon ? category.icon.substring(0, 2) : "I"}
        </div>
        <div>
          <p className="font-bold text-gray-800">{category.name}</p>
          {isChild && <p className="text-xs text-gray-400">Danh mục con</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setEditingId(category.id);
            setEditForm({ name: category.name, parent_id: category.parent_id || "", icon: category.icon || "Utensils" });
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => handleDelete(category.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function CategoryEditRow({ isChild, editForm, setEditForm, onSave, onCancel, parentOptions }) {
  return (
    <div className={`p-4 bg-blue-50 border-y border-blue-100 ${isChild ? "pl-12" : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          placeholder="Tên danh mục..."
          className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary text-sm"
          autoFocus
        />

        <select
          value={editForm.parent_id}
          onChange={(e) => setEditForm({ ...editForm, parent_id: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white"
        >
          <option value="">(Không có mục cha)</option>
          {parentOptions.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={editForm.icon}
          onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-white"
        >
          {ICONS.map(i => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:-translate-y-0.5"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-[#0f4022] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5"
          >
            <Check size={16} />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryModal;
