/**
 * Utility functions cho AdminMenuPage
 */

export const formatDateTimeMenu = (value) => {
  if (!value) return "Chưa cập nhật";
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(String(value))) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
};

export const formatPriceMenu = (price) =>
  Number(price || 0).toLocaleString("vi-VN") + "đ";

export const formatMoneyInputMenu = (value) => {
  if (!value) return "";
  return Number(String(value).replace(/\D/g, "")).toLocaleString("vi-VN");
};

export const getStatusTextMenu = (status) => {
  switch (status) {
    case "selling": return "Đang bán";
    case "paused": return "Tạm ngưng";
    case "stopped": return "Ngừng bán";
    default: return "Đang bán";
  }
};

export const getStatusStyleMenu = (status) => {
  if (status === "selling") return "bg-green-50 text-green-700";
  if (status === "paused") return "bg-orange-50 text-orange-600";
  return "bg-red-50 text-red-600";
};

export const createSearchTextMenu = (food) => {
  return [
    food.id, food.name, food.category, food.type,
    getStatusTextMenu(food.status), food.badge, food.price, food.description,
  ].filter(Boolean).join(" ");
};
