import { Link } from "react-router-dom";
import { buildImgUrl } from "../utils/img";

export default function FarmerMiniCard({ farmer }) {
  if (!farmer) return null;

  const img = farmer.profile_photo ? buildImgUrl(farmer.profile_photo) : null;

  return (
    <div className="d-flex gap-2 align-items-center mt-3 p-2 border rounded">
      <img
        src={img || "https://via.placeholder.com/40?text=F"}
        width={40}
        height={40}
        style={{ borderRadius: "50%", objectFit: "cover" }}
        alt="farmer"
        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40?text=F")}
      />

      <div className="flex-grow-1">
        <div className="fw-bold" style={{ fontSize: 14 }}>
          {farmer.full_name || "Farmer"}
        </div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          📍 {farmer.village || "-"} {farmer.district ? `, ${farmer.district}` : ""}
        </div>
      </div>

      <Link to={`/farmer/${farmer._id}`} className="btn btn-sm btn-outline-primary">
        View
      </Link>
    </div>
  );
}
