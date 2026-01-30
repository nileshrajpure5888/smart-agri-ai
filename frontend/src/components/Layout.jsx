import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const NAV_H = 64;
  const SIDEBAR_W = 270;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      {/* ✅ Full width navbar */}
      <Navbar onMenuClick={() => setMobileSidebar(true)} />

      {/* ✅ Body below navbar */}
      <div className="d-flex" style={{ minHeight: `calc(100vh - ${NAV_H}px)` }}>
        {/* ✅ Desktop Sidebar sticky */}
        <aside
          className="d-none d-lg-block"
          style={{
            width: SIDEBAR_W,
            flexShrink: 0,
            position: "sticky",
            top: NAV_H,
            height: `calc(100vh - ${NAV_H}px)`,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Sidebar />
        </aside>

        {/* ✅ Mobile Sidebar Drawer */}
        {mobileSidebar && (
          <div
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
            style={{
              zIndex: 9999,
              background: "rgba(0,0,0,0.55)",
            }}
            onClick={() => setMobileSidebar(false)}
          >
            <div
              style={{
                width: 280,
                height: "100%",
                background: "#111827",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}

        {/* ✅ Main content */}
        <main
          className="flex-grow-1"
          style={{
            minWidth: 0,
            height: `calc(100vh - ${NAV_H}px)`,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* ✅ Sticky footer wrapper */}
          <div
            style={{
              minHeight: `calc(100vh - ${NAV_H}px)`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ✅ Main page content */}
            <div style={{ flex: 1 }}>
              <div
                className="p-3 p-md-4"
                style={{
                  maxWidth: 1400,
                  margin: "0 auto",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                {children}
              </div>
            </div>

            {/* ✅ Footer full width */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
