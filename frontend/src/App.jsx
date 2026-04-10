import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

/* ================= LAZY IMPORTS ================= */
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home/home"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const PublicContact = lazy(() => import("./pages/PublicContact"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CropRecommendation = lazy(() => import("./pages/CropRecommendation"));
const FertilizerRecommendation = lazy(() => import("./pages/FertilizerRecommendation"));
const DiseaseDetection = lazy(() => import("./pages/DiseaseDetection"));
const MarketPrediction = lazy(() => import("./pages/MarketPrediction"));

const Marketplace = lazy(() => import("./pages/Marketplace"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const SellProduct = lazy(() => import("./pages/SellProduct"));
const MyListings = lazy(() => import("./pages/MyListings"));

const FarmerProfile = lazy(() => import("./pages/FarmerProfile"));
const FarmerPublicProfile = lazy(() => import("./pages/FarmerPublicProfile"));

const RequestInbox = lazy(() => import("./pages/RequestInbox"));
const MyBuyRequests = lazy(() => import("./pages/MyBuyRequests"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const Reviews = lazy(() => import("./admin/Reviews"));
const Stories = lazy(() => import("./admin/Stories"));
const Users = lazy(() => import("./admin/users"));

/* ================= SELF KEEP-ALIVE ================= */
function useKeepAlive() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://smart-agri-ai-2.onrender.com")
        .then(() => console.log("🔄 Server pinged"))
        .catch(() => console.log("⚠️ Ping failed"));
    }, 4 * 60 * 1000); // every 4 minutes

    return () => clearInterval(interval);
  }, []);
}

/* ================= ROUTE GUARDS ================= */
function ProtectedRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== "admin")
    return <Navigate to="/dashboard" replace />;

  return children;
}

/* ================= APP ================= */
export default function App() {

  useKeepAlive(); // ✅ IMPORTANT

  return (
    <BrowserRouter>
      <Suspense fallback={<h2 style={{ textAlign: "center" }}>Loading...</h2>}>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-us" element={<PublicContact />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/crop" element={<ProtectedRoute><CropRecommendation /></ProtectedRoute>} />
          <Route path="/fertilizer" element={<ProtectedRoute><FertilizerRecommendation /></ProtectedRoute>} />
          <Route path="/disease" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/market" element={<ProtectedRoute><MarketPrediction /></ProtectedRoute>} />

          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/sell-product" element={<ProtectedRoute><SellProduct /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />

          <Route path="/my-profile" element={<ProtectedRoute><FarmerProfile /></ProtectedRoute>} />
          <Route path="/farmer/:id" element={<ProtectedRoute><FarmerPublicProfile /></ProtectedRoute>} />

          <Route path="/seller-inbox" element={<ProtectedRoute><RequestInbox /></ProtectedRoute>} />
          <Route path="/my-buy-requests" element={<ProtectedRoute><MyBuyRequests /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="stories" element={<Stories />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}