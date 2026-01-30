import { useEffect, useState } from "react";
import api from "../api";


export default function Reviews() {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadReviews();
  }, []);


  // ======================
  // LOAD REVIEWS (PENDING)
  // ======================
  const loadReviews = async () => {

    try {

      const res = await api.get("/api/reviews/pending");

      setReviews(res.data);

    } catch (err) {

      console.error("Review load error:", err);
      alert("Failed to load reviews");

    } finally {
      setLoading(false);
    }
  };


  // ======================
  // APPROVE
  // ======================
  const approveReview = async (id) => {

    try {

      await api.put(`/api/reviews/${id}/approve`);

      alert("Approved ✅");

      loadReviews();

    } catch (err) {

      console.error(err);
      alert("Approve failed");

    }
  };


  // ======================
  // DELETE
  // ======================
  const deleteReview = async (id) => {

    if (!window.confirm("Delete this review?")) return;

    try {

      await api.delete(`/api/reviews/${id}`);

      alert("Deleted ✅");

      loadReviews();

    } catch (err) {

      console.error(err);
      alert("Delete failed");

    }
  };


  // ======================
  // UI
  // ======================
  if (loading) {
    return <p>Loading reviews...</p>;
  }


  return (
    <div>

      <h2>⭐ Review Management</h2>


      {reviews.length === 0 && (
        <p>No pending reviews</p>
      )}


      {reviews.map((r) => (

        <div
          key={r._id}
          style={{
            background: "white",
            padding: "15px",
            margin: "12px 0",
            borderRadius: "8px",
            boxShadow: "0 0 5px #ddd"
          }}
        >

          <h4>
            {r.name} ({r.rating} ⭐)
          </h4>

          <p><b>Place:</b> {r.place}</p>

          <p>{r.review}</p>


          <div style={{ marginTop: "10px" }}>

            <button
              onClick={() => approveReview(r._id)}
              style={{
                background: "green",
                color: "white",
                border: "none",
                padding: "6px 12px",
                marginRight: "10px",
                cursor: "pointer"
              }}
            >
              ✅ Approve
            </button>


            <button
              onClick={() => deleteReview(r._id)}
              style={{
                background: "crimson",
                color: "white",
                border: "none",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              ❌ Delete
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}
