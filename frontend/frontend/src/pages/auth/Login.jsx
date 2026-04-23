import { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const F = "'Inter', sans-serif";

const getInpStyle = (hasError) => ({
  fontFamily: F, fontSize: "14px", width: "100%",
  padding: "13px 46px 13px 16px", borderRadius: "12px",
  border: `1.5px solid ${hasError ? "#dc2626" : "#e8c0e4"}`,
  outline: "none", color: "#3d0a38", background: "#fff",
  WebkitBoxShadow: "0 0 0px 1000px #fff inset",
  WebkitTextFillColor: "#3d0a38",
  transition: "border .2s, box-shadow .2s", boxSizing: "border-box",
  boxShadow: hasError ? "0 0 0 3px rgba(220,38,38,.1)" : "none",
});

function Field({ id, label, type = "text", value, onChange, placeholder, right, hasError, onFocus, onBlur }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontFamily: F, fontSize: "14px", fontWeight: 500, color: "#701366" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete="off"
          style={getInpStyle(hasError)}
          onFocus={(e) => {
            if (!hasError) {
              e.target.style.borderColor = "#701366";
              e.target.style.boxShadow = "0 0 0 3px rgba(112,19,102,.1)";
            }
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            if (!hasError) {
              e.target.style.borderColor = "#e8c0e4";
              e.target.style.boxShadow = "none";
            }
            onBlur && onBlur(e);
          }}
        />
        {right && (
          <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LEFT PANEL ───────────────────────────────────────────────
function LeftPanel() {
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      background: "linear-gradient(155deg,#8a1a7e 0%,#701366 55%,#4a0d45 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
      color: "white",
    }}>
      <div style={{ position: "absolute", top: "-70px", right: "-70px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
      <div style={{ position: "absolute", bottom: "-50px", left: "-50px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
      <div style={{ position: "absolute", top: "40%", right: "-20px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(248,178,234,.12)" }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "48px", gap: "0", position: "relative", zIndex: 1, width: "100%" }}>

        <svg viewBox="0 0 220 180" style={{ width: "62%", maxWidth: "220px", opacity: .9 }} fill="none">
          <rect x="8" y="18" width="110" height="54" rx="14" fill="white" fillOpacity=".13"/>
          <rect x="8" y="18" width="110" height="54" rx="14" stroke="white" strokeOpacity=".35" strokeWidth="1.5"/>
          <circle cx="32" cy="45" r="8" fill="white" fillOpacity=".38"/>
          <rect x="48" y="36" width="55" height="7" rx="3.5" fill="white" fillOpacity=".42"/>
          <rect x="48" y="49" width="38" height="7" rx="3.5" fill="white" fillOpacity=".25"/>
          <polygon points="20,72 32,72 26,84" fill="white" fillOpacity=".13"/>
          <rect x="102" y="98" width="110" height="54" rx="14" fill="#f8b2ea" fillOpacity=".16"/>
          <rect x="102" y="98" width="110" height="54" rx="14" stroke="#f8b2ea" strokeOpacity=".42" strokeWidth="1.5"/>
          <circle cx="126" cy="125" r="8" fill="white" fillOpacity=".32"/>
          <rect x="142" y="116" width="55" height="7" rx="3.5" fill="white" fillOpacity=".36"/>
          <rect x="142" y="129" width="40" height="7" rx="3.5" fill="white" fillOpacity=".2"/>
          <polygon points="192,152 204,152 198,164" fill="#f8b2ea" fillOpacity=".16"/>
          <circle cx="188" cy="26" r="3" fill="#f8b2ea" fillOpacity=".7"/>
          <circle cx="58" cy="155" r="2" fill="white" fillOpacity=".45"/>
          <circle cx="16" cy="134" r="2.5" fill="#f8b2ea" fillOpacity=".45"/>
        </svg>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          position: "relative", zIndex: 1,
          margin: "18px 0 20px",
          padding: "14px 36px",
          borderTop: "1px solid rgba(255,255,255,.12)",
          borderBottom: "1px solid rgba(255,255,255,.12)",
          width: "62%",
        }}>
          <span style={{ fontFamily: F, fontSize: "3.2rem", fontWeight: 200, letterSpacing: "-0.02em", lineHeight: 1 }}>A to Z</span>
          <span style={{ fontFamily: F, fontSize: "10px", fontWeight: 600, letterSpacing: "0.42em", color: "#f8b2ea", marginTop: "4px" }}>LINGUA</span>
        </div>

        <div style={{ textAlign: "center", padding: "0 40px" }}>
          <h2 style={{ fontFamily: F, fontSize: "1.6rem", fontWeight: 350, margin: 0, lineHeight: 1.25 }}>
            Zeal Knowledge Youth
          </h2>
          <p style={{ fontFamily: F, fontSize: "13px", color: "rgba(255,255,255,.5)", lineHeight: 1.65, maxWidth: "200px", margin: "10px auto 0" }}>
            Learn Without Limits
          </p>
        </div>

      </div>

      <p style={{ fontFamily: F, fontSize: "11px", color: "rgba(255,255,255,.3)", paddingBottom: "28px", position: "relative", zIndex: 1 }}>
        © 2025 ZKY Lingua · All rights reserved
      </p>
    </div>
  );
}

// ─── BUTTON STYLES ────────────────────────────────────────────
const btnStyle = {
  marginTop: "4px", width: "100%",
  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  background: "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)",
  boxShadow: "0 6px 22px rgba(112,19,102,.32)", color: "white",
  fontFamily: F, fontSize: "14px", fontWeight: 400, letterSpacing: ".02em",
  padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer",
  transition: "background .2s",
};

// ─── ROLE → ROUTE MAP ─────────────────────────────────────────
const roleRoutes = {
  admin:       "/Dashboard",
  teacher:     "/Teacher",
  student:     "/Student",
  secretariat: "/Dashboard_secretary",
};

const USERS = [
  { email: "admin@zkyli.com",       password: "admin123",       role: "admin"       },
  { email: "teacher@zkyli.com",     password: "teacher123",     role: "teacher"     },
  { email: "student@zkyli.com",     password: "student123",     role: "student"     },
  { email: "secretariat@zkyli.com", password: "secretariat123", role: "secretariat" },
];

// Gmail compose URL
const GMAIL_COMPOSE = "https://mail.google.com/mail/?view=cm&fs=1&to=yousraztn.contact@gmail.com";

// ─── MAIN LOGIN ───────────────────────────────────────────────
export default function LoginPage() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [show, setShow]                 = useState(false);
  const [remember, setRemember]         = useState(false);
  const [emailError, setEmailError]     = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  // ✅ Always clear session when landing on login page
  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (val) => {
    if (!emailRegex.test(val)) { setEmailError("Please enter a valid email address."); return false; }
    setEmailError(""); return true;
  };

  const submit = (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!validateEmail(email)) return;
    if (!password) { setPasswordError("Please enter your password."); return; }

    const user = USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      const emailExists = USERS.find((u) => u.email === email);
      if (emailExists) setPasswordError("Incorrect password. Please try again.");
      else setEmailError("No account found with this email.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    navigate(roleRoutes[user.role] || "/Dashboard");
  };

  return (
    <>
      {/* ── Responsive styles ── */}
      <style>{`
        * { box-sizing: border-box; }

        .login-wrapper {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #faf0fa;
          font-family: ${F};
        }

        /* Left panel: visible on large screens */
        .login-left {
          width: 42%;
          min-width: 320px;
          max-width: 520px;
          height: 100%;
          flex-shrink: 0;
          display: none;
        }
        .login-divider {
          width: 1px;
          height: 100%;
          background: rgba(248,178,234,.3);
          flex-shrink: 0;
          display: none;
        }
        @media (min-width: 900px) {
          .login-left    { display: block; }
          .login-divider { display: block; }
        }

        /* Right panel */
        .login-right {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow-y: auto;
          background: rgba(253,244,253,.5);
          position: relative;
          padding: 24px 16px;
        }

        /* Form card */
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 48px 40px;
          position: relative;
          z-index: 1;
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 32px 20px;
          }
        }

        /* Suggestion dropdown item hover */
        .suggestion-item:hover {
          background: #fdf0fc;
        }
      `}</style>

      <div className="login-wrapper">

        {/* Left panel */}
        <div className="login-left">
          <LeftPanel />
        </div>
        <div className="login-divider" />

        {/* Right panel */}
        <div className="login-right">

          {/* Decorative blur */}
          <div style={{
            position: "fixed", top: "-60px", right: "-60px",
            width: "280px", height: "280px", borderRadius: "50%",
            background: "#f8b2ea", opacity: .15, filter: "blur(60px)", pointerEvents: "none",
          }} />

          <div className="login-card">

            {/* Heading */}
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontFamily: F, fontSize: "32px", fontWeight: 450, color: "#701366", margin: 0, lineHeight: 1.2 }}>
                Log in to your account
              </p>
              <p style={{ fontFamily: F, fontSize: "14px", color: "#9c5094", fontWeight: 350, marginTop: "6px" }}>
                Welcome back! Please enter your details
              </p>
            </div>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Email */}
              <div style={{ position: "relative" }}>
                <Field
                  id="email" label="Email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="you@example.com" hasError={!!emailError}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {emailError && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", fontFamily: F, fontWeight: 500 }}>
                    {emailError}
                  </p>
                )}
                {showSuggestions && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, width: "100%",
                    background: "#fff", border: "1px solid #ddd",
                    borderRadius: 8, marginTop: 5, zIndex: 1000,
                    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                  }}>
                    {USERS.map((user) => (
                      <div
                        key={user.role}
                        className="suggestion-item"
                        onMouseDown={() => { setEmail(user.email); setPassword(user.password); setShowSuggestions(false); }}
                        style={{
                          padding: "10px 14px", cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          fontFamily: F, fontSize: "13px",
                          transition: "background .12s",
                        }}
                      >
                        <strong style={{ color: "#701366" }}>{user.role}</strong> — {user.email}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <Field
                  id="password" label="Password"
                  type={show ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  placeholder="••••••••" hasError={!!passwordError}
                  right={
                    <button
                      type="button" onClick={() => setShow(v => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#c87dbe", padding: 0, display: "flex" }}
                      tabIndex={-1}
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
                {passwordError && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", fontFamily: F, fontWeight: 500 }}>
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                  <div
                    onClick={() => setRemember(v => !v)}
                    style={{
                      width: "18px", height: "18px", borderRadius: "5px",
                      border: `1.5px solid ${remember ? "#701366" : "#dda8d8"}`,
                      background: remember ? "#701366" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .2s", flexShrink: 0,
                    }}
                  >
                    {remember && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.8L8.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontFamily: F, fontSize: "13px", fontWeight: 500, color: "#9c5094" }}>Remember me</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={btnStyle}
                onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg,#701366 0%,#4a0d45 100%)"}
                onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)"}
              >
                <LogIn size={16} /> Sign In
              </button>

            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(248,178,234,.5)" }} />
              <span style={{ fontFamily: F, fontSize: "11px", color: "#c87dbe", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(248,178,234,.5)" }} />
            </div>

            <p style={{ textAlign: "center", fontFamily: F, fontSize: "13px", color: "#9c5094" }}>
              Don't have an account?{" "}
              {/* ✅ Opens Gmail compose window directly */}
              <a
                href={GMAIL_COMPOSE}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#701366", fontWeight: 700, textDecoration: "none" }}
              >
                Contact admin
              </a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}