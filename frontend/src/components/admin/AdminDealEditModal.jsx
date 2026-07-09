import React from "react";
import { X } from "lucide-react";
import {
  InputField,
  SelectField,
  ServiceTypeCheckboxGroup,
  ServiceConditionItemsField,
  ImageUploadBox,
} from "./AdminDealsComponents";

export default function AdminDealEditModal({
  isOpen,
  editingDeal,
  form,
  setForm,
  formErrors,
  areas,
  handleImageChange,
  removeImage,
  onClose,
  onSave,
  title,
  subtitle,
}) {
  if (!isOpen) return null;

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-6 text-left"
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
            <h3 className="text-2xl font-black text-primary">{title}</h3>
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
                <option value="Ngày lễ">Ngày lễ</option>
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
