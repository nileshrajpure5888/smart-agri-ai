import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import "./home.css";

/* Assets */
import farmerImg from "../../assets/farmer.webp";

/* FEATURES */
const features = [
  { icon: "🌱", title: "AI Crop Recommendation", desc: "Best crop suggestions" },
  { icon: "🧪", title: "Fertilizer Guidance", desc: "Accurate dosage" },
  { icon: "📊", title: "Market Prediction", desc: "Price forecasting" },
  { icon: "🌦️", title: "Live Weather", desc: "Instant alerts" },
  { icon: "🛒", title: "Marketplace", desc: "Buy & Sell crops" },
  { icon: "📍", title: "Nearby Mandis", desc: "Find markets" },
];

export default function Home() {

  const navigate = useNavigate();

  /* STATES */
  const [scrolled, setScrolled] = useState(false);
  const [stories, setStories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [message, setMessage] = useState("");

  const [reviewForm, setReviewForm] = useState({
    name: "",
    place: "",
    review: "",
    rating: 5,
  });

  /* NAV SCROLL (OPTIMIZED) */
  useEffect(() => {
    let timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setScrolled(window.scrollY > 50);
      }, 100);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* DELAYED API LOAD (CRITICAL FIX) */
  useEffect(() => {
    const loadData = () => {
      fetchStories();
      fetchReviews();
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadData);
    } else {
      setTimeout(loadData, 1000);
    }
  }, []);

  /* FETCH STORIES */
  const fetchStories = async () => {
    try {
      setLoadingStories(true);

      const res = await api.get("/api/stories/", {
        timeout: 5000,
      });

      setStories(res.data.slice(0, 3)); // reduced load

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load stories");
    } finally {
      setLoadingStories(false);
    }
  };

  /* FETCH REVIEWS */
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);

      const res = await api.get("/api/reviews/approved/", {
        timeout: 5000,
      });

      setReviews(res.data.slice(0, 3)); // reduced load

    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  /* FORM HANDLER */
  const handleChange = (e) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.value,
    });
  };

  /* SUBMIT REVIEW (OPTIMIZED) */
  const submitReview = async (e) => {
    e.preventDefault();

    try {
      setMessage("⏳ Submitting...");

      const res = await api.post("/api/reviews", reviewForm, {
        timeout: 5000,
      });

      setMessage("✅ Review submitted");

      // instant UI update (no refetch)
      setReviews((prev) => [res.data, ...prev]);

      setReviewForm({
        name: "",
        place: "",
        review: "",
        rating: 5,
      });

    } catch {
      setMessage("❌ Submission failed");
    }
  };

  /* AVATAR HELPER */
  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="home">

      {/* NAVBAR */}
      <header className={`home-nav ${scrolled ? "scrolled" : ""}`}>
        <h2 className="logo">SmartAgri AI</h2>

        <div className="nav-actions">
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Login
          </button>

          <button className="btn-primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-text"
        >
          <span className="badge">🚀 Trusted by Farmers</span>

          <h1>
            AI Powered <span>Smart Farming</span>
          </h1>

          <p>Grow better crops. Earn more profit.</p>

          <button
            className="btn-primary large"
            onClick={() => navigate("/register")}
          >
            Start Free
          </button>
        </motion.div>

        {/* ✅ FIXED IMAGE (NO MOTION) */}
        <img
          src={farmerImg}
          alt="Farmer"
          className="hero-image"
          width="500"
          height="400"
          loading="eager"
        />

      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Our Features</h2>

        <div className="feature-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="feature-card" whileHover={{ y: -8 }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {message && <p className="message">{message}</p>}

      {/* STORIES */}
      <section className="stories">
        <h2>🌾 Farmer Success Stories</h2>

        {loadingStories ? (
          <p>Loading stories...</p>
        ) : (
          <div className="stories-grid">
            {stories.map((s) => (
              <div key={s._id} className="story-card">

                <div className="avatar-circle">
                  {getInitial(s.name)}
                </div>

                <div className="story-body">
                  <h4>{s.name}</h4>
                  <span>🌱 Crop: {s.crop}</span>
                  <p>{s.story}</p>
                  <span>💰 ₹{s.profit}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <section className="testimonials">
        <h2>⭐ Farmer Reviews</h2>

        {loadingReviews ? (
          <p>Loading reviews...</p>
        ) : (
          <div className="testimonial-grid">
            {reviews.map((r) => (
              <div key={r._id} className="testimonial-card">
                <h4>{r.name}</h4>
                <span>{r.place}</span>
                <div>{"⭐".repeat(r.rating)}</div>
                <p>{r.review}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FORM */}
      <section className="cta">
        <h2>Submit Your Review</h2>

        <form onSubmit={submitReview} className="review-form-card">

          <input name="name" value={reviewForm.name} onChange={handleChange} required />
          <input name="place" value={reviewForm.place} onChange={handleChange} required />
          <textarea name="review" value={reviewForm.review} onChange={handleChange} required />

          <select name="rating" value={reviewForm.rating} onChange={handleChange}>
            {[5,4,3,2,1].map(r => (
              <option key={r} value={r}>{"⭐".repeat(r)}</option>
            ))}
          </select>

          <button className="btn-primary large">
            Submit Review
          </button>

        </form>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} SmartAgri AI 🇮🇳</p>
      </footer>

    </div>
  );
}