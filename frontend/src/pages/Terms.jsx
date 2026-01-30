import Layout from "../components/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="container py-4">
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          <h1 className="fw-bold mb-2">Terms & Conditions</h1>
          <p className="text-muted">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <hr />

          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            By using Smart Agri AI Platform, you agree to these Terms &
            Conditions. If you do not agree, please do not use the platform.
          </p>

          <h5 className="fw-bold mt-4">1) Platform Usage</h5>
          <ul className="text-secondary" style={{ lineHeight: 1.7 }}>
            <li>You must provide correct information during registration.</li>
            <li>You are responsible for protecting your login credentials.</li>
            <li>You must not misuse the platform for illegal activities.</li>
          </ul>

          <h5 className="fw-bold mt-4">2) Marketplace Rules</h5>
          <ul className="text-secondary" style={{ lineHeight: 1.7 }}>
            <li>Product listings must be genuine and accurate.</li>
            <li>No fake pricing or misleading crop/product details.</li>
            <li>Transactions between buyer and seller are their responsibility.</li>
          </ul>

          <h5 className="fw-bold mt-4">3) AI Prediction Disclaimer</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            AI crop price predictions are estimates based on historical and
            available real-time data. We do not guarantee profit or exact prices.
            Please use predictions as guidance only.
          </p>

          <h5 className="fw-bold mt-4">4) Data Availability</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            Mandi prices and other government data may change or be unavailable.
            We are not responsible for delays or missing updates from data
            sources.
          </p>

          <h5 className="fw-bold mt-4">5) Termination</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            We may suspend accounts that violate rules, attempt abuse, or harm
            the platform.
          </p>

          <h5 className="fw-bold mt-4">6) Contact</h5>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            For any questions, contact:
            <br />
            <b>Email:</b> support@smartagri.ai
          </p>
        </div>
      </div>
    </Layout>
  );
}
