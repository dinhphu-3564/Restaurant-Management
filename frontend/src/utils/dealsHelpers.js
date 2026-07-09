export const EMPTY_DEAL_FORM = {
  code: "", name: "", subtitle: "", type: "Combo", discount: "", condition: "",
  conditionItems: [], serviceConditionItems: { dinein: [], delivery: [], pickup: [] },
  startDate: "", endDate: "", status: "active", usageLimit: "", used: 0,
  totalDiscount: 0, usageHistory: [], desc: "", cardImage: "", detailImage: "",
  bannerImage: "", serviceTypes: ["dinein", "delivery", "pickup"],
};

export const formatMoneyDeal = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ";

export const formatNumberDeal = (value) => Number(value || 0).toLocaleString("vi-VN");

export const formatDateDeal = (value) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

export const getStatusTextDeal = (status) => {
  if (status === "active") return "Đang áp dụng";
  if (status === "upcoming") return "Sắp diễn ra";
  if (status === "paused") return "Tạm dừng";
  return "Đã kết thúc";
};

export const getStatusStyleDeal = (status) => {
  if (status === "active") return "bg-green-50 text-green-700";
  if (status === "upcoming") return "bg-orange-50 text-orange-600";
  if (status === "paused") return "bg-gray-100 text-gray-600";
  return "bg-slate-100 text-slate-500";
};

export const getTypeStyleDeal = (type) => {
  if (type === "Combo") return "bg-green-50 text-green-700";
  if (type === "Sinh nhật") return "bg-red-50 text-red-500";
  if (type === "Đặt món") return "bg-blue-50 text-blue-600";
  if (type === "Đặt bàn") return "bg-orange-50 text-orange-600";
  if (type === "Ngày lễ") return "bg-rose-50 text-rose-700 font-bold";
  if (type === "Thành viên") return "bg-cyan-50 text-cyan-700";
  return "bg-purple-50 text-purple-600";
};

export const getServiceTypeTextDeal = (type) => {
  if (type === "dinein") return "Tại bàn";
  if (type === "delivery") return "Giao hàng";
  if (type === "pickup") return "Mang đi";
  return type;
};
