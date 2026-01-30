function AdminRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" replace />;

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
