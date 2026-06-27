const safeParseUser = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const removeAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("avatar");
  localStorage.removeItem("adminToken");

  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("isLoggedIn");
};

export const getAuthToken = () => {
  const localToken = localStorage.getItem("authToken");
  const sessionToken = sessionStorage.getItem("authToken");

  if (localToken && localToken !== "undefined" && localToken !== "null") {
    return localToken;
  }

  if (sessionToken && sessionToken !== "undefined" && sessionToken !== "null") {
    return sessionToken;
  }

  return "";
};

export const getCurrentUser = () => {
  const localUser = safeParseUser(localStorage.getItem("currentUser"));
  const sessionUser = safeParseUser(sessionStorage.getItem("currentUser"));

  return localUser || sessionUser;
};

export const checkLogin = () => {
  return Boolean(getAuthToken() && getCurrentUser());
};

export const isAdmin = () => {
  return getCurrentUser()?.role === "admin";
};

export const saveAuthSession = ({ token, user, remember = true }) => {
  removeAuthData();

  const storage = remember ? localStorage : sessionStorage;

  storage.setItem("authToken", token);
  storage.setItem("currentUser", JSON.stringify(user));
  storage.setItem("isLoggedIn", "true");

  if (user?.avatar) {
    localStorage.setItem("avatar", user.avatar);
  }

  window.dispatchEvent(new Event("loginStatusChanged"));
  window.dispatchEvent(new Event("avatarUpdated"));
};

export const clearAuthSession = () => {
  removeAuthData();

  window.dispatchEvent(new Event("loginStatusChanged"));
  window.dispatchEvent(new Event("avatarUpdated"));
};
