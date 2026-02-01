import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH ================= */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* ================= PUBLIC ================= */
import Home from "./pages/Home/home";
import PublicContact from "./pages/PublicContact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

/* ================= USER DASHBOARD ================= */
import Dashboard from "./pages/Dashboard";
import CropRecommendation from "./pages/CropRecommendation";
import FertilizerRecommendation from "./pages/FertilizerRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import MarketPrediction from "./pages/MarketPrediction";

/* ================= MARKETPLACE ================= */
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import SellProduct from "./pages/SellProduct";
import MyListings from "./pages/MyListings";

/* ================= FARMER ================= */
import FarmerProfile from "./pages/FarmerProfile";
import FarmerPublicProfile from "./pages/FarmerPublicProfile";

/* ================= ORDERS ================= */
import RequestInbox from "./pages/RequestInbox";
import MyBuyRequests from "./pages/MyBuyRequests";

/* ================= ADMIN ================= */
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminEntry from "./pages/AdminEntry";

import Reviews from "./admin/Reviews";
import Stories from "./admin/Stories";
import Users from "./admin/users";

/* ================= PROTECTED ROUTE ================= */
function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}


/* ================= ADMIN ROUTE ================= */
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


/* ================= APP ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact-us" element={<PublicContact />} />


        {/* ================= USER DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crop"
          element={
            <ProtectedRoute>
              <CropRecommendation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fertilizer"
          element={
            <ProtectedRoute>
              <FertilizerRecommendation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/disease"
          element={
            <ProtectedRoute>
              <DiseaseDetection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <MarketPrediction />
            </ProtectedRoute>
          }
        />


        {/* ================= MARKETPLACE ================= */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell-product"
          element={
            <ProtectedRoute>
              <SellProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />


        {/* ================= FARMER ================= */}
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <FarmerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/:id"
          element={
            <ProtectedRoute>
              <FarmerPublicProfile />
            </ProtectedRoute>
          }
        />


        {/* ================= ORDERS ================= */}
        <Route
          path="/seller-inbox"
          element={
            <ProtectedRoute>
              <RequestInbox />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-buy-requests"
          element={
            <ProtectedRoute>
              <MyBuyRequests />
            </ProtectedRoute>
          }
        />


        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="stories" element={<Stories />} />
        </Route>

        <Route path="/admin-entry" element={<AdminEntry />} />  
        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
