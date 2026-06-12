// đăng nhập “Ghi nhớ” hay không ghi nhớ đều hoạt động giống nhau.
export const checkLogin = () => {
  return (
    localStorage.getItem("isLoggedIn") === "true" ||
    sessionStorage.getItem("isLoggedIn") === "true"
  );
};

export const getCurrentUser = () => {
  const localUser = localStorage.getItem("currentUser");
  const sessionUser = sessionStorage.getItem("currentUser");

  return localUser
    ? JSON.parse(localUser)
    : sessionUser
      ? JSON.parse(sessionUser)
      : null;
};
