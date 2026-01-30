import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import "./publicContact.css";

export default function PublicContact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Public Contact:", form);

    setSent(true);

    setTimeout(() => {
      setSent(false);
      setForm({
        name: "",
        email: "",
        subject: "General",
        message: "",
      });
    }, 2000);
  };

  return (
    <div className="public-contact">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="contact-card"
      >

        {/* LEFT SIDE */}
        <div className="contact-left">

          <h2>Get in Touch</h2>

          <p>
            Have questions about SmartAgri AI? We’re here to help farmers grow better.
          </p>

          <div className="contact-info">

            <div>
              <Mail size={20} />
              <span>nileshrajpure037@gmail.com</span>
            </div>

            <div>
              <Phone size={20} />
              <span>+91 83902 54545 </span>
            </div>

            <div>
              <MapPin size={20} />
              <span>Maharashtra, India</span>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="contact-right">

          <h3>Send Message</h3>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Subject */}
            <div className="form-group">
              <label>Subject</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
              >
                <option>General</option>
                <option>Technical Support</option>
                <option>Partnership</option>
              </select>
            </div>

            {/* Message */}
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {/* Button */}
            <button type="submit" className="submit-btn">

              {sent ? (
                "Sent ✅"
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}

            </button>

          </form>

        </div>

      </motion.div>

    </div>
  );
}
