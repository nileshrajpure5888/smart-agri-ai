import { useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { buildImgUrl } from "../utils/img";

export default function SellProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Vegetables",
    description: "",
    price: "",
    quantity: "",
    unit: "kg",
    district: "",
    taluka: "",
    village: "",
    contact_phone: "",
    whatsapp: "",
    images: [], // ✅ will store uploaded urls like "/uploads/products/abc.jpg"
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Upload multiple images (matches backend)
  const uploadImages = async (files) => {
    const fd = new FormData();

    // ✅ backend expects "files"
    files.forEach((f) => fd.append("files", f));

    const res = await api.post("/api/upload/product-images", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data?.urls || [];
  };

  // ✅ Select & upload images
  const onSelectImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const remaining = 5 - (form.images?.length || 0);
      if (remaining <= 0) {
        alert("Max 5 images allowed ❌");
        e.target.value = "";
        return;
      }

      const limitedFiles = files.slice(0, remaining);

      setUploading(true);

      const urls = await uploadImages(limitedFiles);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls].slice(0, 5),
      }));
    } catch (err) {
      console.log("UPLOAD ERROR:", err?.response?.data || err?.message);
      alert(err?.response?.data?.detail || "Image upload failed ❌");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const submit = async () => {
    try {
      if (!form.title || !form.price || !form.quantity) {
        alert("Title, Price, Quantity required ❌");
        return;
      }

      setLoading(true);

      await api.post("/api/products/create", {
        ...form,
        price: parseFloat(form.price),
        quantity: parseFloat(form.quantity),
      });

      alert("Product listed ✅");
      navigate("/my-listings");
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert(err?.response?.data?.detail || "Failed to list product ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h3 className="fw-bold mb-3">➕ Sell Product</h3>

      <div className="card shadow-sm p-4" style={{ borderRadius: 18 }}>
        <div className="row g-3">
          {/* ✅ Images Upload */}
          <div className="col-12">
            <label className="fw-bold">Product Images</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              multiple
              onChange={onSelectImages}
              disabled={uploading}
            />
            <div className="text-muted mt-1" style={{ fontSize: 13 }}>
              Upload up to 5 images (jpg/png/webp)
            </div>
          </div>

          {/* ✅ Preview */}
          {form.images.length > 0 && (
            <div className="col-12">
              <div className="d-flex flex-wrap gap-2">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="position-relative"
                    style={{ width: 130 }}
                  >
                    <img
                      src={buildImgUrl(img)}
                      alt="product"
                      className="w-100"
                      style={{
                        height: 95,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid #ddd",
                      }}
                    />

                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute"
                      style={{ top: 6, right: 6, borderRadius: 10 }}
                      onClick={() => removeImage(idx)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="col-12">
              <p className="text-primary mb-0">Uploading images...</p>
            </div>
          )}

          {/* ✅ Product Title */}
          <div className="col-md-6">
            <label className="fw-bold">Product Title *</label>
            <input
              name="title"
              className="form-control"
              value={form.title}
              onChange={onChange}
              placeholder="e.g. Fresh Onion"
            />
          </div>

          {/* ✅ Category */}
          <div className="col-md-6">
            <label className="fw-bold">Category</label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={onChange}
            >
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Dairy">Dairy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* ✅ Description */}
          <div className="col-md-12">
            <label className="fw-bold">Description</label>
            <textarea
              name="description"
              rows={3}
              className="form-control"
              value={form.description}
              onChange={onChange}
              placeholder="Quality, pesticide-free, etc..."
            />
          </div>

          {/* ✅ Price */}
          <div className="col-md-4">
            <label className="fw-bold">Price *</label>
            <input
              type="number"
              name="price"
              className="form-control"
              value={form.price}
              onChange={onChange}
              placeholder="₹"
            />
          </div>

          {/* ✅ Quantity */}
          <div className="col-md-4">
            <label className="fw-bold">Quantity *</label>
            <input
              type="number"
              name="quantity"
              className="form-control"
              value={form.quantity}
              onChange={onChange}
              placeholder="e.g. 50"
            />
          </div>

          {/* ✅ Unit */}
          <div className="col-md-4">
            <label className="fw-bold">Unit</label>
            <select
              name="unit"
              className="form-select"
              value={form.unit}
              onChange={onChange}
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
              <option value="liter">liter</option>
              <option value="piece">piece</option>
            </select>
          </div>

          {/* ✅ District */}
          <div className="col-md-4">
            <label className="fw-bold">District</label>
            <input
              name="district"
              className="form-control"
              value={form.district}
              onChange={onChange}
            />
          </div>

          {/* ✅ Taluka */}
          <div className="col-md-4">
            <label className="fw-bold">Taluka</label>
            <input
              name="taluka"
              className="form-control"
              value={form.taluka}
              onChange={onChange}
            />
          </div>

          {/* ✅ Village */}
          <div className="col-md-4">
            <label className="fw-bold">Village</label>
            <input
              name="village"
              className="form-control"
              value={form.village}
              onChange={onChange}
            />
          </div>

          {/* ✅ Phone */}
          <div className="col-md-6">
            <label className="fw-bold">Phone</label>
            <input
              name="contact_phone"
              className="form-control"
              value={form.contact_phone}
              onChange={onChange}
            />
          </div>

          {/* ✅ WhatsApp */}
          <div className="col-md-6">
            <label className="fw-bold">WhatsApp</label>
            <input
              name="whatsapp"
              className="form-control"
              value={form.whatsapp}
              onChange={onChange}
            />
          </div>

          {/* ✅ Submit */}
          <div className="col-md-12 d-grid">
            <button
              className="btn btn-success"
              onClick={submit}
              disabled={loading || uploading}
            >
              {loading ? "Posting..." : "✅ Post Listing"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
