export const getAuthToken = () => {
  return (
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
};

export const getCurrentUser = () => {
  const localUser = localStorage.getItem("currentUser");
  const sessionUser = sessionStorage.getItem("currentUser");

  try {
    return localUser
      ? JSON.parse(localUser)
      : sessionUser
        ? JSON.parse(sessionUser)
        : null;
  } catch {
    return null;
  }
};

export const checkLogin = () => {
  return Boolean(getAuthToken() && getCurrentUser());
};

export const isAdmin = () => {
  return getCurrentUser()?.role === "admin";
};

export const saveAuthSession = ({ token, user, remember = false }) => {
  const storage = remember ? localStorage : sessionStorage;

  storage.setItem("authToken", token);
  storage.setItem("currentUser", JSON.stringify(user));
  storage.setItem("isLoggedIn", "true");

  window.dispatchEvent(new Event("loginStatusChanged"));
};

export const clearAuthSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("adminToken");

  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("isLoggedIn");

  window.dispatchEvent(new Event("loginStatusChanged"));
};
