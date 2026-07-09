import { removeVietnameseTones } from "./string";

export const TABLE_STATUS = {
  available: "Trống",
  holding: "Đang giữ",
  booked: "Đã đặt",
  serving: "Đang phục vụ",
  maintenance: "Bảo trì",
  disabled: "Ngừng sử dụng",
};

export const STATUS_STYLE = {
  available: "bg-green-50 text-green-700 border-green-100",
  holding: "bg-orange-50 text-orange-600 border-orange-100",
  booked: "bg-red-50 text-red-600 border-red-100",
  serving: "bg-blue-50 text-blue-600 border-blue-100",
  maintenance: "bg-gray-100 text-gray-600 border-gray-200",
  disabled: "bg-gray-50 text-gray-400 border-gray-100",
};

export const STATUS_DOT = {
  available: "bg-green-600",
  holding: "bg-orange-500",
  booked: "bg-red-500",
  serving: "bg-blue-500",
  maintenance: "bg-gray-500",
  disabled: "bg-gray-300",
};

export const TABLE_STATUS_STYLE = {
  available: "border-green-200 bg-green-50 text-green-700",
  holding: "border-orange-200 bg-orange-50 text-orange-600",
  booked: "border-red-200 bg-red-50 text-red-600",
  serving: "border-blue-200 bg-blue-50 text-blue-600",
  maintenance: "border-gray-200 bg-gray-100 text-gray-500",
  disabled: "border-gray-200 bg-gray-50 text-gray-400",
};

export const TABLE_DOT_STYLE = {
  available: "bg-green-600",
  holding: "bg-orange-500",
  booked: "bg-red-500",
  serving: "bg-blue-500",
  maintenance: "bg-gray-500",
  disabled: "bg-gray-300",
};

// Sắp xếp khu vực theo độ ưu tiên (VIP > tầng cao nhất > tầng trệt > các khu khác)
const getAreaPriority = (area) => {
  const name = removeVietnameseTones(area.name);
  if (name.includes("vip")) return 0;
  const floorMatch = name.match(/tang\s*(\d+)/);
  if (floorMatch) return Number(floorMatch[1]);
  if (name.includes("tret")) return 1;
  return 99;
};

export const sortAreasByPriority = (areas) => {
  return [...areas].sort((a, b) => {
    const priorityA = getAreaPriority(a);
    const priorityB = getAreaPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return String(a.name || "").localeCompare(String(b.name || ""), "vi");
  });
};

export const formatDate = (value) => {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (value) => {
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

export const parsePriceNumber = (val) => {
  if (typeof val === "number") return val;
  const cleaned = String(val || "").replace(/[^0-9]/g, "");
  return parseFloat(cleaned) || 0;
};
