import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useParams, Link } from "react-router-dom";
import { buildImgUrl } from "../utils/img";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [imgIndex, setImgIndex] = useState(0);

  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data?.product || null);
      setImgIndex(0);
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert("Failed to load product ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const nextImg = () => {
    if (!product?.images?.length) return;
    setImgIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImg = () => {
    if (!product?.images?.length) return;
    setImgIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const openWhatsApp = () => {
    const number = (product?.whatsapp || product?.contact_phone || "")
      .replace(/\D/g, "")
      .trim();

    if (!number) return alert("WhatsApp not available ❌");

    const msg = encodeURIComponent(
      `नमस्कार 🙏 मी Smart Agri Marketplace मधून ${product?.title} साठी संपर्क करत आहे.`
    );

    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  const callSeller = () => {
    if (!product?.contact_phone) return alert("Phone not available ❌");
    window.open(`tel:${product.contact_phone}`);
  };

  return (
    <Layout>
      <Link to="/marketplace" className="btn btn-light mb-3">
        ⬅ Back to Marketplace
      </Link>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : !product ? (
        <p className="text-danger">Product not found ❌</p>
      ) : (
        <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
          {/* ✅ IMAGE FULL VIEW (NO CROP) */}
          {product.images?.length > 0 && (
            <div className="position-relative mb-3">
              {/* ✅ Image container */}
              <div
                className="w-100"
                style={{
                  height: 380,
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "#fff",
                  border: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={buildImgUrl(product.images[imgIndex])}
                  alt={product.title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* ✅ Slider buttons */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="btn btn-dark position-absolute"
                    style={{ top: "45%", left: 14, borderRadius: 14 }}
                    onClick={prevImg}
                  >
                    ◀
                  </button>

                  <button
                    type="button"
                    className="btn btn-dark position-absolute"
                    style={{ top: "45%", right: 14, borderRadius: 14 }}
                    onClick={nextImg}
                  >
                    ▶
                  </button>

                  {/* ✅ Counter */}
                  <div
                    className="position-absolute"
                    style={{
                      bottom: 12,
                      right: 16,
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      padding: "5px 12px",
                      borderRadius: 16,
                      fontSize: 13,
                    }}
                  >
                    {imgIndex + 1}/{product.images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✅ Title + Status */}
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3 className="fw-bold mb-1">{product.title}</h3>
              <div className="text-muted">
                📍 {product.district || "Unknown"} | {product.category}
              </div>
            </div>

            <span
              className={`badge ${
                product.status === "available" ? "bg-success" : "bg-secondary"
              }`}
              style={{ fontSize: 14 }}
            >
              {product.status}
            </span>
          </div>

          {/* ✅ Price */}
          <div className="mt-3" style={{ fontSize: 18 }}>
            💰 <b>₹{product.price}</b> / {product.unit}
          </div>

          {/* ✅ Quantity */}
          <div className="text-muted mt-1">
            Quantity: <b>{product.quantity}</b> {product.unit}
          </div>

          <hr />

          {/* ✅ Description */}
          <div>
            <h6 className="fw-bold mb-1">📌 Description</h6>
            <p className="mb-0">{product.description || "No description"}</p>
          </div>

          <hr />

          {/* ✅ Seller info */}
          <div>
            <h6 className="fw-bold mb-1">👨‍🌾 Seller</h6>

            <p className="mb-1">
              Name: <b>{product.seller_name || "Farmer"}</b>
            </p>

            <p className="mb-1">📞 Phone: {product.contact_phone || "N/A"}</p>
            <p className="mb-1">💬 WhatsApp: {product.whatsapp || "N/A"}</p>

            {/* ✅ WhatsApp + Call Buttons */}
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-success w-100" onClick={openWhatsApp}>
                💬 WhatsApp
              </button>

              <button className="btn btn-primary w-100" onClick={callSeller}>
                📞 Call
              </button>
            </div>

            {/* ✅ Public Farmer profile */}
            {product.seller_id && (
              <Link
                to={`/farmer/${product.seller_id}`}
                className="btn btn-outline-primary mt-3 w-100"
              >
                👤 View Farmer Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
