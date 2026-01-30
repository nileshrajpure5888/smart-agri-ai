import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { Link } from "react-router-dom";
import { buildImgUrl } from "../utils/img";

export default function MyListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/products/my");
      setProducts(res.data?.products || []);
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert("Failed to load my listings ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProducts();
  }, []);

  const markSold = async (id) => {
    if (!window.confirm("Mark as SOLD?")) return;

    try {
      await api.patch(`/api/products/${id}/mark-sold`);
      alert("Marked as sold ✅");
      loadMyProducts();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed ❌");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;

    try {
      await api.delete(`/api/products/${id}`);
      alert("Deleted ✅");
      loadMyProducts();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed ❌");
    }
  };

  return (
    <Layout>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">📦 My Listings</h3>

        <Link to="/sell-product" className="btn btn-success">
          ➕ Sell Product
        </Link>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : products.length === 0 ? (
        <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
          <h5 className="fw-bold mb-1">No products listed yet</h5>
          <p className="text-muted mb-0">
            Click “Sell Product” to add your first listing.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {products.map((p) => {
            const img = p.images?.length ? buildImgUrl(p.images[0]) : null;

            return (
              <div key={p._id} className="col-md-4">
                <div className="card shadow-sm p-3" style={{ borderRadius: 18 }}>
                  {/* ✅ IMAGE */}
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
                    📍 {p.district || "Unknown"} | {p.category}
                  </div>

                  <div className="mt-2">
                    💰 <b>₹{p.price}</b> / {p.unit}
                  </div>

                  <div className="text-muted" style={{ fontSize: 13 }}>
                    Quantity: <b>{p.quantity}</b> {p.unit}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-warning w-100"
                      disabled={p.status !== "available"}
                      onClick={() => markSold(p._id)}
                    >
                      ✅ Mark Sold
                    </button>

                    <button
                      className="btn btn-danger w-100"
                      onClick={() => deleteProduct(p._id)}
                    >
                      🗑 Delete
                    </button>
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
