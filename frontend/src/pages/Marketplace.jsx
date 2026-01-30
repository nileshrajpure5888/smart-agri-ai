import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { Link } from "react-router-dom";
import { buildImgUrl } from "../utils/img";
import FarmerMiniCard from "../components/FarmerMiniCard";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [maxPrice, setMaxPrice] = useState(50000);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/products", {
        params: {
          search,
          category,
          district,
          max_price: maxPrice,
        },
      });

      setProducts(res.data?.products || []);
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert("Failed to load marketplace ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      {/* ✅ Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">🛒 Marketplace</h3>

        <div className="d-flex gap-2">
          <Link to="/sell-product" className="btn btn-success">
            ➕ Sell Product
          </Link>

          <Link to="/my-listings" className="btn btn-dark">
            📦 My Listings
          </Link>
        </div>
      </div>

      {/* ✅ Filters */}
      <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: 18 }}>
        <div className="row g-2">
          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-3">
            <input
              className="form-control"
              placeholder="District..."
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="col-md-1 d-grid">
            <button className="btn btn-primary" onClick={loadProducts}>
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Listing */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : products.length === 0 ? (
        <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
          <h5 className="fw-bold mb-1">No products found</h5>
          <p className="text-muted mb-0">Try changing filters or add products.</p>
        </div>
      ) : (
        <div className="row g-3">
          {products.map((p) => {
            const img = p.images?.length ? buildImgUrl(p.images[0]) : null;

            return (
              <div key={p._id} className="col-md-4">
                <div className="card shadow-sm p-3" style={{ borderRadius: 18 }}>
                  {/* ✅ product image */}
                  {img && (
                    <img
                      src={img}
                      alt={p.title}
                      className="w-100 mb-2"
                      style={{
                        height: 180,
                        objectFit: "cover",
                        borderRadius: 14,
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}

                  <div className="d-flex justify-content-between">
                    <h5 className="fw-bold mb-0">{p.title}</h5>

                    <span
                      className={`badge ${
                        p.status === "available" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="text-muted mt-2" style={{ fontSize: 14 }}>
                    📍 {p.district || "Unknown"} | {p.category || "Other"}
                  </div>

                  <div className="mt-2">
                    💰 <b>₹{p.price}</b> / {p.unit}
                  </div>

                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Quantity: <b>{p.quantity}</b> {p.unit}
                  </div>

                  {/* ✅ Farmer Info (NEW PROFESSIONAL FEATURE) */}
                  <FarmerMiniCard farmer={p.farmer} />

                  <div className="d-grid mt-3">
                    {/* ✅ correct route */}
                    <Link className="btn btn-outline-dark" to={`/marketplace/${p._id}`}>
                      👁 View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
