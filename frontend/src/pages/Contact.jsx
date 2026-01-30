import { useState } from "react";
import Layout from "../components/Layout";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    // ✅ basic validation
    if (!form.name || !form.email || !form.message) {
      setStatus({
        type: "danger",
        msg: "Please fill Name, Email and Message.",
      });
      return;
    }

    try {
      setLoading(true);

      // ✅ you can later connect backend here
      // await api.post("/api/contact", form);

      setStatus({
        type: "success",
        msg: "Message sent successfully ✅ We will contact you soon!",
      });

      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.log(err);
      setStatus({
        type: "danger",
        msg: "Failed to send message ❌ Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = "919999999999"; // ✅ change to your number
  const whatsappMsg = encodeURIComponent(
    "Hello Smart Agri AI Team! I need support."
  );

  return (
    <Layout>
      <div className="container py-4">
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          {/* Header */}
          <div className="mb-4">
            <h1 className="fw-bold mb-1">Contact Us</h1>
            <p className="text-muted m-0">
              Need help? Reach us anytime — we respond fast 🚀
            </p>
          </div>

          {/* Alert */}
          {status.msg && (
            <div className={`alert alert-${status.type}`} role="alert">
              {status.msg}
            </div>
          )}

          <div className="row g-4">
            {/* Contact Form */}
            <div className="col-12 col-lg-7">
              <div className="border rounded-4 p-4">
                <h5 className="fw-bold mb-3">Send Message</h5>

                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Example: Marketplace issue / Prediction doubt"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      rows="5"
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Write your message..."
                    />
                  </div>

                  <div className="col-12 d-flex gap-2 flex-wrap">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-success px-4 fw-bold"
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>

                    <a
                      className="btn btn-outline-success fw-bold"
                      href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp Support
                    </a>
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-12 col-lg-5">
              <div className="border rounded-4 p-4 h-100">
                <h5 className="fw-bold mb-3">Support Details</h5>

                <div className="d-grid gap-3">
                  <div>
                    <div className="fw-semibold">📍 Address</div>
                    <div className="text-muted">Maharashtra, India</div>
                  </div>

                  <div>
                    <div className="fw-semibold">📞 Phone</div>
                    <a className="text-decoration-none" href="tel:+919999999999">
                      +91 99999 99999
                    </a>
                  </div>

                  <div>
                    <div className="fw-semibold">✉️ Email</div>
                    <a
                      className="text-decoration-none"
                      href="mailto:support@smartagri.ai"
                    >
                      support@smartagri.ai
                    </a>
                  </div>

                  <div>
                    <div className="fw-semibold">🕒 Working Hours</div>
                    <div className="text-muted">Mon – Sat (9:00 AM – 7:00 PM)</div>
                  </div>

                  <div className="bg-light rounded-4 p-3">
                    <div className="fw-bold">✅ Support Promise</div>
                    <div className="text-muted" style={{ fontSize: 14 }}>
                      We usually respond within 24 hours.
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-4">
                  <h6 className="fw-bold mb-2">Social</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <a className="btn btn-sm btn-outline-dark" href="#" target="_blank" rel="noreferrer">
                      🌐 Website
                    </a>
                    <a className="btn btn-sm btn-outline-dark" href="#" target="_blank" rel="noreferrer">
                      🐙 GitHub
                    </a>
                    <a className="btn btn-sm btn-outline-dark" href="#" target="_blank" rel="noreferrer">
                      💼 LinkedIn
                    </a>
                    <a className="btn btn-sm btn-outline-dark" href="#" target="_blank" rel="noreferrer">
                      ▶ YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Map */}
          <div className="mt-4">
            <div className="border rounded-4 overflow-hidden">
              <iframe
                title="map"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps?q=Maharashtra,%20India&output=embed"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
