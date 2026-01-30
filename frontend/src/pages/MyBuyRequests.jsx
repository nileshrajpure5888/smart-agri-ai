import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { Link } from "react-router-dom";

export default function MyBuyRequests() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders/my-requests");
      setRequests(res.data?.requests || []);
    } catch {
      alert("Failed to load requests ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout>
      <h3 className="fw-bold mb-3">🧾 My Buy Requests</h3>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-muted">No requests created yet.</p>
      ) : (
        <div className="row g-3">
          {requests.map((r) => (
            <div key={r._id} className="col-md-6">
              <div className="card shadow-sm p-3" style={{ borderRadius: 18 }}>
                <div className="d-flex justify-content-between">
                  <h6 className="fw-bold mb-0">{r.product_title}</h6>

                  <span
                    className={`badge ${
                      r.status === "pending"
                        ? "bg-warning text-dark"
                        : r.status === "accepted"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                  Seller: <b>{r.seller_name}</b>
                </div>

                <div className="mt-2 text-muted">{r.message}</div>

                <Link
                  to={`/marketplace/${r.product_id}`}
                  className="btn btn-outline-success w-100 mt-3"
                >
                  View Product →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
