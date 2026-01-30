import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="appFooter">
      <div className="container py-3">
        <div className="row align-items-center gy-3">
          {/* Left */}
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2">
              <span className="footerLogo">🌾</span>

              <div>
                <div className="footerBrandName">Smart Agri AI Platform</div>
                <div className="footerTagline">
                  AI prediction • Real-time mandi • Marketplace
                </div>
              </div>
            </div>
          </div>

          {/* Center Links */}
          <div className="col-12 col-md-4">
            <div className="footerLinksRow justify-content-cente justify-content-md-center">
              <Link className="footerLink" to="/marketplace">
                Marketplace
              </Link>

              <span className="footerDot">•</span>

              <Link className="footerLink" to="/farmerprofile">
                Farmer Profile
              </Link>

              <span className="footerDot">•</span>

              <Link className="footerLink" to="/dashboard">
                Dashboard
              </Link>

              <span className="footerDivider">|</span>

              <Link className="footerSmallLink" to="/contact">
                Contact
              </Link>

              <span className="footerDot">•</span>

              <Link className="footerSmallLink" to="/privacy">
                Privacy
              </Link>

              <span className="footerDot">•</span>

              <Link className="footerSmallLink" to="/terms">
                Terms
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="col-12 col-md-2 text-md-end">
            <div className="footerRight">
              <span className="footerCopy">© {year}</span>
              <span className="footerIndia">Made in India 🇮🇳</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
