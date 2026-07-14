import React from "react";
import { X } from "lucide-react";
import { InputBox, TextAreaBox, SelectField, MiniInfoInput } from "./AdminMenuComponents";

export default function AdminFoodFormModal({
  isAddFoodOpen,
  setIsAddFoodOpen,
  editingFood,
  setEditingFood,
  editForm,
  setEditForm,
  emptyFoodForm,
  categoryOptions,
  showOtherCategories,
  setShowOtherCategories,
  addFormTab,
  setAddFormTab,
  handleFoodImagesChange,
  moveImage,
  saveAddFood,
  isLoading
}) {
  if (!isAddFoodOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-primary">
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
              <label className="relative block rounded-2xl border-2 border-secondary bg-gray-50 overflow-hidden h-[290px] cursor-pointer group">
                {editForm.image ? (
                  <>
                    <img
                      src={editForm.image}
                      alt="Ảnh món ăn"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white text-primary text-4xl font-bold flex items-center justify-center shadow-lg">
                        +
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-bold text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-4xl text-primary shadow-sm">
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
                    <div key={index} className="relative group text-left">
                      <div
                        className={`h-16 w-full rounded-xl overflow-hidden border-2 relative ${
                          index === 0
                            ? "border-secondary"
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
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-black">
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
                            className="w-6 h-6 rounded-full bg-white shadow text-xs font-black disabled:opacity-30 flex items-center justify-center"
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
                            className="w-6 h-6 rounded-full bg-white shadow text-xs font-black disabled:opacity-30 flex items-center justify-center"
                          >
                            →
                          </button>
                        </div>
                      </div>

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
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
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
              {isLoading && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary">
                  Đang tải danh sách món ăn...
                </div>
              )}

              <div>
                <InputBox
                  label="Tên món"
                  value={editForm.name}
                  onChange={(value) =>
                    setEditForm((prev) => ({ ...prev, name: value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-left">
                  <span className="text-sm font-black text-gray-500">
                    Giá bán
                  </span>

                  <input
                    type="text"
                    value={
                      editForm.price
                        ? Number(String(editForm.price).replace(/\D/g, "")).toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        price: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="399.000"
                    className="mt-2 w-full h-14 rounded-xl border border-gray-100 px-4 text-2xl font-black text-secondary outline-none shadow-sm"
                  />
                </label>

                <label className="block text-left">
                  <span className="text-sm font-black text-gray-500">
                    Giá vốn
                  </span>

                  <input
                    type="text"
                    value={
                      editForm.costPrice
                        ? Number(String(editForm.costPrice).replace(/\D/g, "")).toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        costPrice: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="199.000"
                    className="mt-2 w-full h-14 rounded-xl border border-gray-100 px-4 text-2xl font-black text-secondary outline-none shadow-sm"
                  />
                </label>
              </div>

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
                <div className="space-y-2 text-left">
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
                    options={categoryOptions}
                  />

                  {editForm.category === "Món khác" && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setShowOtherCategories((prev) => !prev)
                        }
                        className="w-full flex items-center justify-between text-sm font-black text-primary"
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
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-gray-600 border-gray-100 hover:bg-primary/5 hover:text-primary"
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

                <div className="text-left">
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
                </div>

                <div className="text-left md:col-span-2">
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
              </div>

              <div className="rounded-2xl border border-primary/30 overflow-hidden text-left">
                <div className="grid grid-cols-3 border-b border-primary/30 text-sm font-black">
                  <button
                    type="button"
                    onClick={() => setAddFormTab("description")}
                    className={`py-3 text-center transition ${
                      addFormTab === "description"
                        ? "text-primary border-b-2 border-primary"
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
                        ? "text-primary border-b-2 border-primary"
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
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-500"
                    }`}
                  >
                    HƯƠNG VỊ
                  </button>
                </div>

                <div className="p-5 min-h-[220px]">
                  {addFormTab === "description" && (
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
                  )}

                  {addFormTab === "ingredients" && (
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
                  )}

                  {addFormTab === "flavor" && (
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
            className="h-11 px-7 rounded-xl bg-primary text-white font-black hover:bg-primary-dark"
          >
            {editingFood ? "Lưu thay đổi" : "Thêm món"}
          </button>
        </div>
      </div>
    </div>
  );
}
