import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";

export default function FarmerProfile() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    farm_size: "",
    crops: [],
    language: "mr",

    about: "",
    experience_years: 0,
    farm_type: "mixed",
    profile_photo: "",
  });

  const API_BASE = "http://127.0.0.1:8000"; // ✅ change for production

  // ✅ Load profile
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfile(true);
        const res = await api.get("/api/farmer/profile/me");
        if (res.data?.profile) setProfile(res.data.profile);
      } catch (err) {
        console.log("Profile load:", err?.response?.data || err?.message);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  // ✅ Completion %
  const completion = useMemo(() => {
    const fields = [
      { key: "full_name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "district", label: "District" },
      { key: "village", label: "Village" },
      { key: "farm_size", label: "Farm Size" },
      { key: "about", label: "About" },
      { key: "profile_photo", label: "Photo" },
    ];

    const missing = [];
    let filled = 0;

    fields.forEach((f) => {
      const v = profile?.[f.key];
      const ok = v !== null && v !== undefined && String(v).trim() !== "";
      if (ok) filled++;
      else missing.push(f.label);
    });

    return {
      percent: Math.round((filled / fields.length) * 100),
      missing,
      filled,
      total: fields.length,
    };
  }, [profile]);

  const fmtLastSaved = () => {
    if (!lastSavedAt) return "Not saved yet";
    return lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const badge = (text) => (
    <span
      style={{
        fontSize: 12,
        fontWeight: 800,
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.20)",
        color: "#16a34a",
      }}
    >
      {text}
    </span>
  );

  // ✅ Upload photo
  const uploadPhoto = async (file) => {
    try {
      setUploading(true);

      const form = new FormData();
      form.append("file", file);

      const res = await api.post("/api/upload/profile-photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.url) {
        setProfile((p) => ({ ...p, profile_photo: res.data.url }));
      }
    } catch (err) {
      alert(err?.response?.data?.detail || "Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save profile (manual only)
  const save = async () => {
    try {
      setSaving(true);
      setSaveMsg("");

      const res = await api.post("/api/farmer/profile", profile);
      if (res.data?.profile) setProfile(res.data.profile);

      setLastSavedAt(new Date());
      setSaveMsg("Saved ✅");
      setTimeout(() => setSaveMsg(""), 1500);
    } catch (err) {
      console.log(err);
      setSaveMsg("Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <Layout>
        <div className="text-muted">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ✅ Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h3 className="fw-bold mb-1">👤 Farmer Profile</h3>
          <div className="text-muted" style={{ fontSize: 14 }}>
            Manage your farmer profile and build trust in marketplace.
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          {badge(`${completion.percent}% Complete`)}

          <span className="text-muted" style={{ fontSize: 13 }}>
            Last saved: <b>{fmtLastSaved()}</b>
          </span>

          <button
            className={`btn ${editMode ? "btn-outline-dark" : "btn-dark"} fw-bold`}
            onClick={() => setEditMode((x) => !x)}
          >
            {editMode ? "Exit Edit" : "Edit Profile"}
          </button>

          <button className="btn btn-success fw-bold" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ✅ Profile Completion Bar */}
      <div
        className="mb-3"
        style={{
          borderRadius: 18,
          padding: 14,
          background: "linear-gradient(90deg, rgba(34,197,94,0.12), rgba(59,130,246,0.06))",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">Profile Completion</div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            {completion.filled}/{completion.total} fields filled
          </div>
        </div>

        <div className="progress mt-2" style={{ height: 12, borderRadius: 999 }}>
          <div
            className="progress-bar bg-success"
            style={{
              width: `${completion.percent}%`,
              borderRadius: 999,
            }}
          />
        </div>

        {completion.missing.length > 0 && (
          <div className="text-muted mt-2" style={{ fontSize: 13 }}>
            Missing: <b>{completion.missing.slice(0, 4).join(", ")}</b>
            {completion.missing.length > 4 ? " ..." : ""}
          </div>
        )}
      </div>

      {/* ✅ Profile Header Card */}
      <div className="card shadow-sm p-4 mb-3" style={{ borderRadius: 18 }}>
        <div className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center">
          {/* Photo */}
          <div style={{ position: "relative" }}>
            <img
              src={
                profile.profile_photo
                  ? `${API_BASE}${profile.profile_photo}`
                  : "https://via.placeholder.com/110?text=Photo"
              }
              alt="profile"
              width="110"
              height="110"
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />

            {/* Upload overlay */}
            {editMode && (
              <label
                className="btn btn-sm btn-dark"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  borderRadius: 999,
                  padding: "6px 10px",
                }}
              >
                {uploading ? "..." : "📷"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* Main info */}
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: 22 }}>
              {profile.full_name || "Farmer"}
            </div>

            <div className="text-muted mt-1">
              📍 {profile.village || "-"}
              {profile.district ? `, ${profile.district}` : ""}
              {profile.state ? `, ${profile.state}` : ""}
            </div>

            <div className="d-flex gap-2 flex-wrap mt-2">
              {badge(profile.farm_type?.toUpperCase() || "FARM")}
              {badge(`${profile.experience_years || 0}+ yrs exp`)}
              {profile.language ? badge(profile.language.toUpperCase()) : null}
            </div>
          </div>

          {/* Save status */}
          <div className="text-end">
            {saveMsg && <div className="fw-bold text-success">{saveMsg}</div>}
          </div>
        </div>
      </div>

      {/* ✅ Main Content */}
      <div className="row g-3">
        {/* About / Contact */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold m-0">About</h5>
              {badge("Public")}
            </div>

            {editMode ? (
              <>
                <label className="fw-bold">Full Name</label>
                <input
                  className="form-control mb-3"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />

                <label className="fw-bold">About (Intro)</label>
                <textarea
                  className="form-control mb-3"
                  rows={5}
                  value={profile.about || ""}
                  placeholder="उदा: मी 10 वर्षांपासून शेती करतो..."
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                />

                <label className="fw-bold">Phone</label>
                <input
                  className="form-control mb-3"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />

                <label className="fw-bold">WhatsApp</label>
                <input
                  className="form-control"
                  value={profile.whatsapp || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, whatsapp: e.target.value })
                  }
                />
              </>
            ) : (
              <>
                <p className="text-muted" style={{ lineHeight: 1.7 }}>
                  {profile.about?.trim()
                    ? profile.about
                    : "No bio added yet. Click Edit Profile to add introduction."}
                </p>

                <div className="d-flex gap-2 flex-wrap">
                  <span className="badge text-bg-light">📞 {profile.phone || "-"}</span>
                  <span className="badge text-bg-light">💬 {profile.whatsapp || "-"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Farm Details */}
        <div className="col-lg-6">
          <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold m-0">🌾 Farm Details</h5>
              {badge("Verified-ready")}
            </div>

            {editMode ? (
              <>
                <label className="fw-bold">Farm Size</label>
                <input
                  className="form-control mb-3"
                  value={profile.farm_size || ""}
                  onChange={(e) => setProfile({ ...profile, farm_size: e.target.value })}
                />

                <label className="fw-bold">Experience (Years)</label>
                <input
                  type="number"
                  className="form-control mb-3"
                  value={profile.experience_years || 0}
                  onChange={(e) =>
                    setProfile({ ...profile, experience_years: Number(e.target.value) })
                  }
                />

                <label className="fw-bold">Farm Type</label>
                <select
                  className="form-select mb-3"
                  value={profile.farm_type}
                  onChange={(e) => setProfile({ ...profile, farm_type: e.target.value })}
                >
                  <option value="mixed">Mixed</option>
                  <option value="organic">Organic</option>
                  <option value="horticulture">Horticulture</option>
                  <option value="dairy">Dairy</option>
                </select>

                {/* ✅ Advanced Crops Add (NO comma needed) */}
                <label className="fw-bold">Crops</label>

                <div className="d-flex gap-2 flex-wrap mb-2">
                  {profile.crops?.length ? (
                    profile.crops.map((c, i) => (
                      <span
                        key={i}
                        className="badge text-bg-success d-flex align-items-center gap-2"
                        style={{ padding: "8px 10px", borderRadius: 999 }}
                      >
                        {c}
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          style={{
                            borderRadius: 999,
                            padding: "0px 6px",
                            fontWeight: 900,
                          }}
                          onClick={() =>
                            setProfile((p) => ({
                              ...p,
                              crops: p.crops.filter((x) => x !== c),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      No crops added
                    </span>
                  )}
                </div>

                <select
                  className="form-select mb-3"
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;

                    setProfile((p) => ({
                      ...p,
                      crops: p.crops.includes(value) ? p.crops : [...p.crops, value],
                    }));
                  }}
                >
                  <option value="">+ Add crop</option>
                  <option value="Onion">Onion</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>

                <label className="fw-bold">Language</label>
                <select
                  className="form-select"
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                >
                  <option value="mr">Marathi</option>
                  <option value="hi">Hindi</option>
                  <option value="en">English</option>
                </select>
              </>
            ) : (
              <>
                <div className="d-grid gap-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Farm Size</span>
                    <b>{profile.farm_size || "-"}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Experience</span>
                    <b>{profile.experience_years || 0} years</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Farm Type</span>
                    <b>{profile.farm_type || "-"}</b>
                  </div>
                </div>

                <hr />

                <div className="fw-bold mb-2">Crops</div>
                <div className="d-flex gap-2 flex-wrap">
                  {profile.crops?.length ? (
                    profile.crops.map((c, i) => (
                      <span key={i} className="badge text-bg-success">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">No crops added</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="col-12">
          <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold m-0">📍 Address</h5>
              {badge("Private")}
            </div>

            {editMode ? (
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="fw-bold">State</label>
                  <input
                    className="form-control"
                    value={profile.state || ""}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="fw-bold">District</label>
                  <input
                    className="form-control"
                    value={profile.district || ""}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="fw-bold">Taluka</label>
                  <input
                    className="form-control"
                    value={profile.taluka || ""}
                    onChange={(e) => setProfile({ ...profile, taluka: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="fw-bold">Village</label>
                  <input
                    className="form-control"
                    value={profile.village || ""}
                    onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge text-bg-light">State: {profile.state || "-"}</span>
                <span className="badge text-bg-light">
                  District: {profile.district || "-"}
                </span>
                <span className="badge text-bg-light">
                  Taluka: {profile.taluka || "-"}
                </span>
                <span className="badge text-bg-light">
                  Village: {profile.village || "-"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Bottom Save */}
      {editMode && (
        <div className="mt-3">
          <button className="btn btn-success w-100 fw-bold" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "✅ Save Profile"}
          </button>
        </div>
      )}
    </Layout>
  );
}
