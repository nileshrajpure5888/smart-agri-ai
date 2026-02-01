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


  /* NAV SCROLL */
  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);

  }, []);


  /* LOAD DATA */
  useEffect(() => {
    fetchStories();
    fetchReviews();
  }, []);


  /* FETCH STORIES */
  const fetchStories = async () => {

    try {

      setLoadingStories(true);

      const res = await api.get("/api/stories/");

      setStories(res.data.slice(0, 6));

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

      const res = await api.get("/api/reviews/approved/");

      setReviews(res.data.slice(0, 6));

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


  /* SUBMIT REVIEW */
  const submitReview = async (e) => {

    e.preventDefault();

    try {

      setMessage("⏳ Submitting...");

      await api.post("/api/reviews", reviewForm);

      setMessage("✅ Review submitted for approval");

      setReviewForm({
        name: "",
        place: "",
        review: "",
        rating: 5,
      });

      fetchReviews();

    } catch {

      setMessage("❌ Submission failed");

    }
  };


  /* AVATAR HELPER */
  const getInitial = (name) => {

    if (!name) return "?";

    return name.charAt(0).toUpperCase();
  };


  /* UI */
  return (
    <div className="home">


      {/* ================= NAVBAR ================= */}

      <header className={`home-nav ${scrolled ? "scrolled" : ""}`}>

        <h2 className="logo">SmartAgri AI</h2>

        <div className="nav-actions">

          <button
            className="btn-outline"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

        </div>

      </header>


      {/* ================= HERO ================= */}

      <section className="hero-section">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-text"
        >

          <span className="badge">🚀 Trusted by Farmers</span>

          <h1>
            AI Powered <span>Smart Farming</span>
          </h1>

          <p>
            Grow better crops. Earn more profit.
          </p>

          <button
            className="btn-primary large"
            onClick={() => navigate("/register")}
          >
            Start Free
          </button>

        </motion.div>

        <motion.img
          src={farmerImg}
          alt="Farmer"
          className="hero-image"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />

      </section>


      {/* ================= FEATURES ================= */}

      <section className="features">

        <h2>Our Features</h2>

        <div className="feature-grid">

          {features.map((f, i) => (

            <motion.div
              key={i}
              className="feature-card"
              whileHover={{ y: -8 }}
            >

              <div className="feature-icon">{f.icon}</div>

              <h3>{f.title}</h3>

              <p>{f.desc}</p>

            </motion.div>

          ))}

        </div>

      </section>


      {/* ================= MESSAGE ================= */}

      {message && <p className="message">{message}</p>}


      {/* ================= STORIES ================= */}

      <section className="stories">

        <h2>🌾 Farmer Success Stories</h2>

        <p className="section-subtitle">
          Real farmers. Real growth. Real profit.
        </p>

        {loadingStories ? (

          <p>Loading stories...</p>

        ) : stories.length === 0 ? (

          <p>No success stories yet 🚜</p>

        ) : (

          <div className="stories-grid">

            {stories.map((s) => (

              <div key={s._id} className="story-card">


                {/* AVATAR */}
                <div className="avatar-circle">
                  {getInitial(s.name)}
                </div>


                <div className="story-body">

                  <h4>{s.name}</h4>

                  <span className="story-crop">
                    🌱 Crop: {s.crop}
                  </span>

                  <p>{s.story}</p>

                  <div className="story-footer">

                    <span className="profit-badge">
                      💰 ₹{s.profit}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ================= REVIEWS ================= */}

      <section className="testimonials">

        <h2>⭐ Farmer Reviews</h2>

        {loadingReviews ? (

          <p>Loading reviews...</p>

        ) : reviews.length === 0 ? (

          <p>No reviews yet 🌱</p>

        ) : (

          <div className="testimonial-grid">

            {reviews.map((r) => (

              <div key={r._id} className="testimonial-card">

                <h4>{r.name}</h4>

                <span>{r.place}</span>

                <div className="stars">
                  {"⭐".repeat(r.rating)}
                </div>

                <p>“{r.review}”</p>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ================= ADD REVIEW ================= */}

      <section className="cta">

        <h2>Submit Your Review</h2>

        <form
          onSubmit={submitReview}
          className="review-form-card"
        >

          <input
            name="name"
            placeholder="Your Name"
            required
            value={reviewForm.name}
            onChange={handleChange}
          />

          <input
            name="place"
            placeholder="Village / City"
            required
            value={reviewForm.place}
            onChange={handleChange}
          />

          <textarea
            name="review"
            placeholder="Your Experience"
            required
            value={reviewForm.review}
            onChange={handleChange}
          />

          <select
            name="rating"
            value={reviewForm.rating}
            onChange={handleChange}
          >
            {[5,4,3,2,1].map((r) => (
              <option key={r} value={r}>
                {"⭐".repeat(r)}
              </option>
            ))}
          </select>

          <button className="btn-primary large">
            Submit Review
          </button>

        </form>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <p>
          © {new Date().getFullYear()} SmartAgri AI 🇮🇳
        </p>

      </footer>

    </div>
  );
}
