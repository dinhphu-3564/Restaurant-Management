export const ROLE_TEXT = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  staff: "Nhân viên",
  cashier: "Thu ngân",
  waiter: "Phục vụ",
  chef: "Bếp",
  user: "Khách hàng",
};

export const canAccessAdminRoute = (user, path) => {
  if (!user) return false;
  const role = user.role || "user";
  
  // Normalize path
  let cleanPath = String(path).replace(/^\/admin/, "").replace(/^\//, "").split("?")[0].split("/")[0];
  if (cleanPath === "") cleanPath = "dashboard";

  switch (cleanPath) {
    case "dashboard":
    case "orders":
      return ["admin", "manager", "staff", "cashier", "waiter", "chef"].includes(role);
    case "bookings":
    case "tables":
      return ["admin", "manager", "staff", "cashier", "waiter"].includes(role);
    case "menu":
      return ["admin", "manager", "staff", "chef"].includes(role);
    case "spaces":
    case "deals":
    case "users":
    case "revenue":
    case "reports":
      return ["admin", "manager", "cashier"].includes(role);
    case "settings":
    case "roles":
      return ["admin"].includes(role);
    default:
      return ["admin", "manager", "staff", "cashier", "waiter", "chef"].includes(role);
  }
};

export const canUseAction = (user, action) => {
  if (!user) return false;
  const role = user.role || "user";

  const PERMISSIONS = {
    admin: [
      "orders:update",
      "bookings:create",
      "bookings:update",
      "bookings:delete",
      "menu:create",
      "menu:update",
      "menu:delete",
      "tables:create",
      "tables:update",
      "tables:delete",
      "customers:lock",
      "promotions:create",
      "promotions:update",
      "promotions:delete",
      "roles:update",
      "settings:update",
    ],
    manager: [
      "orders:update",
      "bookings:create",
      "bookings:update",
      "bookings:delete",
      "menu:create",
      "menu:update",
      "menu:delete",
      "tables:create",
      "tables:update",
      "tables:delete",
      "promotions:create",
      "promotions:update",
      "promotions:delete",
    ],
    staff: [
      "orders:update",
      "bookings:create",
      "bookings:update",
    ],
    cashier: [
      "orders:update",
      "bookings:create",
      "bookings:update",
      "bookings:delete",
      "tables:update",
    ],
    waiter: [
      "orders:update",
      "bookings:create",
      "bookings:update",
      "tables:update",
    ],
    chef: [
      "orders:update",
    ],
    user: [],
  };

  const allowedActions = PERMISSIONS[role] || [];
  return allowedActions.includes(action);
};
