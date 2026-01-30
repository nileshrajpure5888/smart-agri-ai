import Layout from "../components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="container py-4">
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          <h1 className="fw-bold mb-2">Privacy Policy</h1>
          <p className="text-muted">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <hr />

          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            Smart Agri AI Platform ("we", "our", "us") respects your privacy.
            This Privacy Policy explains what data we collect, how we use it,
            and how we protect it.
          </p>

          <h5 className="fw-bold mt-4">1) Information We Collect</h5>
          <ul className="text-secondary" style={{ lineHeight: 1.7 }}>
            <li>
              <b>Account Information:</b> name, email, phone number.
            </li>
            <li>
              <b>Usage Data:</b> pages visited, time spent, interactions.
            </li>
            <li>
              <b>Location Data (optional):</b> only if you enable it for mandi
              distance and weather features.
            </li>
            <li>
              <b>Marketplace Data:</b> product listings, images, price, district.
            </li>
          </ul>

          <h5 className="fw-bold mt-4">2) How We Use Your Information</h5>
          <ul className="text-secondary" style={{ lineHeight: 1.7 }}>
            <li>To provide real-time mandi rates & AI prediction features.</li>
            <li>To improve accuracy of services and user experience.</li>
            <li>To prevent fraud and maintain platform security.</li>
            <li>To communicate important updates and support.</li>
          </ul>

          <h5 className="fw-bold mt-4">3) Data Sharing</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            We do not sell your personal information. We may share limited data
            with trusted services (hosting, analytics) only to operate the
            platform securely.
          </p>

          <h5 className="fw-bold mt-4">4) Cookies</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            We may use cookies to keep you logged in and improve user experience.
            You can disable cookies in your browser, but some features may not
            work properly.
          </p>

          <h5 className="fw-bold mt-4">5) Security</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            We follow industry best practices to protect your data, but no system
            is 100% secure. Please keep your password confidential.
          </p>

          <h5 className="fw-bold mt-4">6) Contact Us</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            If you have questions about this Privacy Policy, contact us at:
            <br />
            <b>Email:</b> support@smartagri.ai
          </p>
        </div>
      </div>
    </Layout>
  );
}
