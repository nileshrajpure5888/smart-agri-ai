import FarmerMiniCard from "./FarmerMiniCard";

const API_BASE = "http://127.0.0.1:8000";

export default function ProductCard({ p }) {
  const img =
    p.images?.length > 0 ? `${API_BASE}${p.images[0]}` : "https://via.placeholder.com/320x200";

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 18 }}>
      <img
        src={img}
        alt={p.title}
        style={{
          height: 200,
          width: "100%",
          objectFit: "cover",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
        }}
      />

      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">{p.title}</h5>
          <span className="badge bg-success">{p.category}</span>
        </div>

        <div className="text-muted mt-1" style={{ fontSize: 13 }}>
          {p.description?.slice(0, 80)}...
        </div>

        <div className="fw-bold mt-2" style={{ fontSize: 18 }}>
          ₹ {p.price} / {p.unit || "kg"}
        </div>

        {/* ✅ Farmer info section (Professional) */}
        <FarmerMiniCard farmer={p.farmer} />
      </div>
    </div>
  );
}
