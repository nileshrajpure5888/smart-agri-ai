import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function RequestInbox() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/orders/inbox");
      setRequests(res.data?.requests || []);
    } catch {
      alert("Failed to load inbox ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const accept = async (id) => {
    try {
      await api.patch(`/api/orders/${id}/accept`);
      alert("Accepted ✅");
      loadInbox();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed ❌");
    }
  };

  const reject = async (id) => {
    try {
      await api.patch(`/api/orders/${id}/reject`);
      alert("Rejected ✅");
      loadInbox();
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed ❌");
    }
  };

  return (
    <Layout>
      <h3 className="fw-bold mb-3">📥 Seller Inbox (Buy Requests)</h3>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-muted">No requests yet.</p>
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

                <div className="text-muted mt-2" style={{ fontSize: 14 }}>
                  👤 Buyer: <b>{r.buyer_name}</b> ({r.buyer_email})
                </div>

                <div className="mt-2">
                  📝 <b>Message:</b>
                  <div className="text-muted">{r.message}</div>
                </div>

                {r.status === "pending" && (
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success w-100" onClick={() => accept(r._id)}>
                      ✅ Accept
                    </button>

                    <button className="btn btn-danger w-100" onClick={() => reject(r._id)}>
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
