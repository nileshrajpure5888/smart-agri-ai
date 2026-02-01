import { useEffect, useState } from "react";
import api from "../api";
import "./stories.css";

const PAGE_SIZE = 6;

export default function Stories() {

  /* ================= STATE ================= */

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    crop: "",
    profit: "",
    story: "",
  });


  /* ================= LOAD ================= */

  useEffect(() => {
    loadStories();
  }, []);


  const loadStories = async () => {

    try {

      const res = await api.get("/api/stories/");
      setStories(res.data);

    } catch {

      alert("Failed to load stories ❌");

    }
  };


  /* ================= FORM ================= */

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!form.name || !form.crop || !form.profit || !form.story) {
      alert("Fill all fields ❌");
      return;
    }


    try {

      setLoading(true);

      const fd = new FormData();

      Object.keys(form).forEach((k) => {
        fd.append(k, form[k]);
      });


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

      window.scrollTo({ top: 400, behavior: "smooth" });


    } catch (err) {

      console.error(err);
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
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  /* ================= DELETE ================= */

  const deleteStory = async (id) => {

    if (!window.confirm("Delete this story?")) return;


    try {

      await api.delete(`/api/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      loadStories();

    } catch {

      alert("Delete failed ❌");

    }
  };


  /* ================= RESET ================= */

  const resetForm = () => {

    setEditId(null);

    setForm({
      name: "",
      crop: "",
      profit: "",
      story: "",
    });
  };


  /* ================= AVATAR ================= */

  const getInitial = (name) => {

    if (!name) return "?";

    return name.charAt(0).toUpperCase();
  };


  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(stories.length / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const visibleStories = stories.slice(start, end);


  /* ================= UI ================= */

  return (
    <div className="admin-stories">


      {/* ================= FORM ================= */}

      <div className="story-form">

        <h2>
          {editId ? "✏️ Edit Story" : "➕ Add Story"}
        </h2>


        <form onSubmit={handleSubmit}>


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
            placeholder="Profit (₹)"
            value={form.profit}
            onChange={handleChange}
            required
          />


          <textarea
            name="story"
            placeholder="Success Story"
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

      <h2 className="list-title">
        📚 Success Stories
      </h2>


      {stories.length === 0 && (

        <p className="empty-msg">
          No stories yet. Add first one 🚜
        </p>

      )}


      <div className="story-list">


        {visibleStories.map((s) => (

          <div key={s._id} className="story-card">


            {/* AVATAR */}
            <div className="avatar-circle">
              {getInitial(s.name)}
            </div>


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


      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (

        <div className="pagination">

          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ◀
          </button>


          <span>
            Page {page} / {totalPages}
          </span>


          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            ▶
          </button>

        </div>

      )}

    </div>
  );
}
