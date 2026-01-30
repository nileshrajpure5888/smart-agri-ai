import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api";
import { buildImgUrl } from "../utils/img";

export default function FarmerPublicProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/farmer/profile/${id}`);
        setProfile(res.data?.profile || null);
      } catch (err) {
        console.log(err?.response?.data || err?.message);
        alert(err?.response?.data?.detail || "Farmer profile not found ❌");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const openWhatsApp = () => {
    let number = (profile?.whatsapp || profile?.phone || "")
      .replace(/\D/g, "")
      .trim();

    if (!number) return alert("WhatsApp not available ❌");

    // ✅ auto add India code
    if (number.length === 10) number = "91" + number;

    const msg = encodeURIComponent(
      `नमस्कार 🙏 मी Smart Agri Marketplace मधून संपर्क करत आहे.`
    );

    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  const callFarmer = () => {
    const number = (profile?.phone || "").replace(/\D/g, "").trim();
    if (!number) return alert("Phone not available ❌");
    window.open(`tel:${number}`);
  };

  return (
    <Layout>
      {/* ✅ Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">👨‍🌾 Farmer Profile</h3>
        <Link to="/marketplace" className="btn btn-outline-secondary">
          ← Back
        </Link>
      </div>

      {/* ✅ Body */}
      {loading ? (
        <p className="text-muted">Loading profile...</p>
      ) : !profile ? (
        <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
          <h5 className="fw-bold mb-1">Profile not found</h5>
          <p className="text-muted mb-0">This farmer profile does not exist.</p>
        </div>
      ) : (
        <>
          {/* ✅ Top Card */}
          <div className="card shadow-sm p-4 mb-3" style={{ borderRadius: 18 }}>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <img
                src={
                  profile.profile_photo
                    ? buildImgUrl(profile.profile_photo)
                    : "https://via.placeholder.com/110?text=Farmer"
                }
                alt="farmer"
                width={110}
                height={110}
                style={{ borderRadius: "50%", objectFit: "cover" }}
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/110?text=Farmer")
                }
              />

              <div className="flex-grow-1">
                <h4 className="fw-bold mb-1">{profile.full_name || "Farmer"}</h4>
                <div className="text-muted">
                  📍 {profile.village || "-"}{" "}
                  {profile.taluka ? `, ${profile.taluka}` : ""}{" "}
                  {profile.district ? `, ${profile.district}` : ""}
                </div>

                {profile.about ? (
                  <div className="mt-2" style={{ fontSize: 14 }}>
                    <b>About:</b> {profile.about}
                  </div>
                ) : (
                  <div className="mt-2 text-muted" style={{ fontSize: 14 }}>
                    Farmer has not added about info.
                  </div>
                )}
              </div>

              <div className="d-flex flex-column gap-2" style={{ minWidth: 180 }}>
                <button className="btn btn-success w-100" onClick={openWhatsApp}>
                  💬 WhatsApp
                </button>
                <button className="btn btn-primary w-100" onClick={callFarmer}>
                  📞 Call
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Details cards */}
          <div className="row g-3">
            {/* Farm Info */}
            <div className="col-lg-6">
              <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
                <h5 className="fw-bold mb-3">🌾 Farm Details</h5>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-muted">Farm Size</div>
                    <div className="fw-bold">{profile.farm_size || "-"}</div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted">Experience</div>
                    <div className="fw-bold">
                      {profile.experience_years ? `${profile.experience_years} yrs` : "-"}
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted">Farm Type</div>
                    <div className="fw-bold">{profile.farm_type || "-"}</div>
                  </div>

                  <div className="col-6">
                    <div className="text-muted">Language</div>
                    <div className="fw-bold">{profile.language || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crops */}
            <div className="col-lg-6">
              <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
                <h5 className="fw-bold mb-3">🌱 Crops</h5>

                {profile.crops?.length ? (
                  <div className="d-flex flex-wrap gap-2">
                    {profile.crops.map((c, idx) => (
                      <span key={idx} className="badge bg-light text-dark border">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No crops added</p>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="col-12">
              <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
                <h5 className="fw-bold mb-3">📞 Contact Info</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="text-muted">Phone</div>
                    <div className="fw-bold">{profile.phone || "-"}</div>
                  </div>

                  <div className="col-md-6">
                    <div className="text-muted">WhatsApp</div>
                    <div className="fw-bold">{profile.whatsapp || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
