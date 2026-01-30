import { useEffect, useState } from "react";
import api from "../api";
import "./stories.css";

/* Default Images */
import maleDefault from "../assets/male1.webp";
import femaleDefault from "../assets/female1.webp";

const API_URL = import.meta.env.VITE_API_URL;


export default function Stories() {

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [preview, setPreview] = useState(null);


  const [form, setForm] = useState({
    name: "",
    crop: "",
    profit: "",
    story: "",
    image: null,
  });


  /* ================= LOAD ================= */

  useEffect(() => {
    loadStories();
  }, []);


  const loadStories = async () => {

    const res = await api.get("/api/stories/");

    setStories(res.data);
  };


  /* ================= FORM ================= */

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  /* ================= FILE ================= */

  const handleFile = (e) => {

    const file = e.target.files[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {
      alert("Please select image file");
      return;
    }


    setForm({
      ...form,
      image: file,
    });


    setPreview(URL.createObjectURL(file));
  };


  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("crop", form.crop);
      fd.append("profit", form.profit);
      fd.append("story", form.story);

      if (form.image) {
        fd.append("image", form.image);
      }


      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };


      if (editId) {

        await api.put(`/api/stories/${editId}`, fd, config);

        alert("Updated ✅");

      } else {

        await api.post("/api/stories/", fd, config);

        alert("Added ✅");
      }


      resetForm();
      loadStories();


    } catch {

      alert("Upload failed ❌");

    } finally {

      setLoading(false);
    }
  };


  /* ================= EDIT ================= */

  const startEdit = (s) => {

    setEditId(s._id);

    setForm({
      name: s.name,
      crop: s.crop,
      profit: s.profit,
      story: s.story,
      image: null,
    });


    setPreview(getImage(s.image, s.name));

    window.scrollTo({ top: 0 });
  };


  /* ================= DELETE ================= */

  const deleteStory = async (id) => {

    if (!window.confirm("Delete this story?")) return;


    await api.delete(`/api/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    loadStories();
  };


  /* ================= RESET ================= */

  const resetForm = () => {

    setEditId(null);

    setPreview(null);

    setForm({
      name: "",
      crop: "",
      profit: "",
      story: "",
      image: null,
    });
  };


  /* ================= GENDER LOGIC ================= */

  const femaleNames = [
    "sunita", "kavita", "pooja", "seema",
    "rekha", "anita", "priya", "sneha",
    "neha", "swati", "rupa", "komal",
    "monika", "deepa", "shital"
  ];


  const isFemale = (name) => {

    if (!name) return false;

    const n = name.toLowerCase();

    return femaleNames.some(f => n.includes(f));
  };


  /* ================= IMAGE ================= */

  const getImage = (img, name) => {

    // If uploaded image exists
    if (img) {

      if (img.startsWith("http")) return img;

      return `${API_URL}${img}`;
    }

    // No image → gender default
    if (isFemale(name)) {
      return femaleDefault;
    }

    return maleDefault;
  };


  /* ================= UI ================= */

  return (
    <div className="admin-stories">


      {/* ================= FORM ================= */}

      <div className="story-form">

        <h2>
          {editId ? "✏️ Edit Story" : "➕ Add Story"}
        </h2>


        <form onSubmit={handleSubmit}>


          {/* IMAGE PREVIEW */}
          {preview && (

            <div className="image-preview">

              <img src={preview} alt="Preview" />

            </div>

          )}


          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
          />


          <input
            name="name"
            placeholder="Farmer Name"
            value={form.name}
            onChange={handleChange}
            required
          />


          <input
            name="crop"
            placeholder="Crop"
            value={form.crop}
            onChange={handleChange}
            required
          />


          <input
            name="profit"
            type="number"
            placeholder="Profit"
            value={form.profit}
            onChange={handleChange}
            required
          />


          <textarea
            name="story"
            placeholder="Story"
            value={form.story}
            onChange={handleChange}
            required
          />


          <div className="form-buttons">

            <button
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editId
                ? "Update"
                : "Add"}
            </button>


            {editId && (

              <button
                type="button"
                className="btn-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>

            )}

          </div>

        </form>

      </div>


      {/* ================= LIST ================= */}

      <h2 className="list-title">📚 Success Stories</h2>


      <div className="story-list">


        {stories.map((s) => (

          <div key={s._id} className="story-card">


            <img
              src={getImage(s.image, s.name)}
              alt={s.name}
            />


            <div className="story-content">

              <h4>{s.name}</h4>

              <p><b>Crop:</b> {s.crop}</p>

              <p><b>Profit:</b> ₹{s.profit}</p>

              <p>{s.story}</p>

            </div>


            <div className="story-actions">

              <button
                className="btn-edit"
                onClick={() => startEdit(s)}
              >
                Edit
              </button>


              <button
                className="btn-delete"
                onClick={() => deleteStory(s._id)}
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
