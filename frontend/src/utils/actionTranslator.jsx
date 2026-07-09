import React from "react";

export const translateAction = (action) => {
  if (!action) return "";
  
  // Chuẩn hóa action về chữ thường để dễ map nếu backend gửi lộn xộn
  const normalizedAction = action.toLowerCase();
  
  const map = {
    // Role & Auth
    "change_role": "Thay đổi vai trò",
    "role_changed": "Thay đổi vai trò",
    "lock_user": "Khóa tài khoản",
    "unlock_user": "Mở khóa tài khoản",
    "create_user": "Tạo tài khoản mới",
    "change_password": "Thay đổi mật khẩu",
    "update_profile": "Cập nhật hồ sơ",
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    
    // Status
    "status_changed": "Thay đổi trạng thái",
    
    // Tables
    "add_table": "Thêm bàn mới",
    "update_table": "Cập nhật thông tin bàn",
    "delete_table": "Xóa bàn",
    
    // Orders
    "create_order": "Tạo đơn hàng",
    "update_order": "Cập nhật đơn hàng",
    "cancel_order": "Hủy đơn hàng",
    
    // Menu
    "create_menu": "Thêm món mới",
    "update_menu": "Cập nhật món ăn",
    "delete_menu": "Xóa món ăn",
    
    // Payment
    "payment": "Thanh toán",
  };
  
  // Nếu action gốc là UPPERCASE (như CHANGE_ROLE) mà map chỉ có chữ thường thì vẫn map được
  return map[normalizedAction] || action;
};

const ROLE_COLORS = {
  "Quản trị viên": "text-red-600 font-black",
  "Quản lý": "text-amber-500 font-black",
  "Nhân viên": "text-blue-600 font-black",
  "Khách hàng": "text-gray-500 font-black",
  "admin": "text-red-600 font-black",
  "manager": "text-amber-500 font-black",
  "staff": "text-blue-600 font-black",
  "user": "text-gray-500 font-black",
  "khóa tài khoản": "text-red-600 font-black",
  "bị khóa": "text-red-600 font-black",
  "mở khóa tài khoản": "text-green-700 font-black",
  "được mở khóa": "text-green-700 font-black",
};

export const renderColoredMessage = (message) => {
  if (!message) return "";

  // Tìm các cụm từ cần tô màu (không phân biệt hoa thường)
  const regex = /(Quản trị viên|Quản lý|Nhân viên|Khách hàng|khóa tài khoản|bị khóa|mở khóa tài khoản|được mở khóa)/gi;
  const parts = message.split(regex);

  return parts.map((part, index) => {
    const lowerPart = part.toLowerCase();
    
    // Tìm key tương ứng trong map ROLE_COLORS
    const matchedKey = Object.keys(ROLE_COLORS).find(
      (key) => key.toLowerCase() === lowerPart
    );

    if (matchedKey) {
      return (
        <span key={index} className={ROLE_COLORS[matchedKey]}>
          {part}
        </span>
      );
    }
    return part;
  });
};
