import { useState } from "react";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useNavigate} from "react-router-dom";

import Dashboard from "./Dashboard";

const F = "'Inter', sans-serif";
const inp = {
  fontFamily: F, fontSize: "15px", width: "100%",
  padding: "13px 46px 13px 16px", borderRadius: "12px",
  border: "1.5px solid #e8c0e4", outline: "none",
  color: "#3d0a38", background: "#fff",
  WebkitBoxShadow: "0 0 0px 1000px #fff inset",
  WebkitTextFillColor: "#3d0a38",
  transition: "border .2s, box-shadow .2s", boxSizing: "border-box",
};

function Field({ id, label, type = "text", value, onChange, placeholder, right, onFocus, onBlur })
{
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontFamily: F, fontSize: "13px", fontWeight: 600, color: "#701366" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete="off" style={inp}
      onFocus={(e) => {
  e.target.style.borderColor = "#701366";
  e.target.style.boxShadow = "0 0 0 3px rgba(112,19,102,.1)";
  onFocus && onFocus(e); 
}}
onBlur={(e) => {
  e.target.style.borderColor = "#e8c0e4";
  e.target.style.boxShadow = "none";
  onBlur && onBlur(e); 
}} />
        {right && (
          <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      background: "linear-gradient(155deg,#8a1a7e 0%,#701366 55%,#4a0d45 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
      color: "white",
    }}>
      {/* bg circles */}
      <div style={{ position:"absolute", top:"-70px", right:"-70px", width:"280px", height:"280px", borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />
      <div style={{ position:"absolute", bottom:"-50px", left:"-50px", width:"240px", height:"240px", borderRadius:"50%", background:"rgba(255,255,255,.05)" }} />
      <div style={{ position:"absolute", top:"40%", right:"-20px", width:"160px", height:"160px", borderRadius:"50%", background:"rgba(248,178,234,.12)" }} />

      {/* Logo centered top */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"40px", position:"relative", zIndex:1 }}>
        <span style={{ fontFamily:F, fontSize:"3.2rem", fontWeight:200, letterSpacing:"-0.02em", lineHeight:1 }}>ZKY</span>
        <span style={{ fontFamily:F, fontSize:"10px", fontWeight:600, letterSpacing:"0.42em", color:"#f8b2ea", marginTop:"4px" }}>LINGUA</span>
      </div>

      {/* Illustration + text */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"24px", padding:"0 40px", position:"relative", zIndex:1 }}>
        <svg viewBox="0 0 220 180" style={{ width:"62%", maxWidth:"220px", opacity:.9 }} fill="none">
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
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:F, fontSize:"1.6rem", fontWeight:700, margin:0, lineHeight:1.25 }}>Learn Without Limits</h2>
          <p style={{ fontFamily:F, fontSize:"13px", color:"rgba(255,255,255,.5)", marginTop:"10px", lineHeight:1.65, maxWidth:"200px" }}>
            Manage your language school with ease and elegance.
          </p>
        </div>
        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
          <span style={{ width:"24px", height:"4px", borderRadius:"2px", background:"white", display:"block" }} />
          <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:"rgba(255,255,255,.35)", display:"block" }} />
          <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:"rgba(255,255,255,.35)", display:"block" }} />
        </div>
      </div>

      {/* Footer */}
      <p style={{ fontFamily:F, fontSize:"11px", color:"rgba(255,255,255,.3)", paddingBottom:"28px", position:"relative", zIndex:1 }}>
        © 2025 ZKY Lingua · All rights reserved
      </p>
    </div>
  );
}

export default function LoginPage() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ setCurrentUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const USERS = [
  { email: "admin@zkyli.com", password: "admin123", role: "admin" },
  { email: "teacher@zkyli.com", password: "teacher123", role: "teacher" },
  { email: "student@zkyli.com", password: "student123", role: "student" },
];

const submit = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    return setError("Please fill in all fields.");
  }

  setError("");
  setLoading(true);

  //await new Promise(r => setTimeout(r, 1000));

  const user = USERS.find(
    (u) => u.email === email && u.password === password
  );

  setLoading(false);

  if (!user) {
    return setError("Invalid email or password");
  }
  localStorage.setItem("user", JSON.stringify(user));
navigate("/Dashboard");

  // SAVE USER
  setCurrentUser(user);
};

  return (
    <div style={{ display:"flex", width:"100vw", height:"100vh", overflow:"hidden", background:"#faf0fa", fontFamily:F }}>

      {/* Left */}
      <div style={{ width:"44%", height:"100%", flexShrink:0, display:"none" }} className="lg-panel">
        <LeftPanel />
      </div>
      <style>{`.lg-panel { display: none; } @media(min-width:1024px){ .lg-panel { display: block !important; } }`}</style>

      {/* Divider */}
      <div style={{ width:"1px", height:"100%", background:"rgba(248,178,234,.3)", flexShrink:0 }} className="lg-panel" />

      {/* Right */}
      <div style={{ flex:1, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", overflowY:"auto", background:"rgba(253,244,253,.5)", position:"relative" }}>

        {/* blob */}
        <div style={{ position:"fixed", top:"-60px", right:"-60px", width:"280px", height:"280px", borderRadius:"50%", background:"#f8b2ea", opacity:.15, filter:"blur(60px)", pointerEvents:"none" }} />

        <div style={{ width:"100%", maxWidth:"420px", padding:"48px 40px", position:"relative", zIndex:1 }}>

          {/* Header */}
          <div style={{ marginBottom:"32px" }}>
            <h1 style={{ fontFamily:F, fontSize:"2rem", fontWeight:300, color:"#2d0828", margin:0, lineHeight:1.2 }}>
              Welcome!
            </h1>
            <p style={{ fontFamily:F, fontSize:"14px", color:"#9c5094", fontWeight:500, marginTop:"6px" }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom:"18px", padding:"11px 14px", background:"#fff0f0", border:"1.5px solid #fca5a5", color:"#dc2626", fontSize:"13px", borderRadius:"10px", fontWeight:500 }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

            <div style={{ position: "relative" }}>
  <Field
    id="email"
    label="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
  />
  {showSuggestions && (
  <div style={{
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    marginTop: 5,
    zIndex: 1000
  }}>
    {USERS.map((user) => (
      <div
        key={user.role}
onMouseDown={() => {
  setEmail(user.email);
  setPassword(user.password);
  setShowSuggestions(false);
}}
        style={{
          padding: 10,
          cursor: "pointer",
          borderBottom: "1px solid #eee"
        }}
      >
        <strong>{user.role}</strong> — {user.email}
      </div>
    ))}
  </div>
)} </div>
            <Field id="password" label="Password" type={show ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              right={
                <button type="button" onClick={() => setShow(v => !v)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#c87dbe", padding:0, display:"flex" }} tabIndex={-1}>
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

            {/* Row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", userSelect:"none" }}>
                <div onClick={() => setRemember(v => !v)} style={{
                  width:"18px", height:"18px", borderRadius:"5px",
                  border:`1.5px solid ${remember ? "#701366" : "#dda8d8"}`,
                  background: remember ? "#701366" : "white",
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s", flexShrink:0,
                }}>
                  {remember && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.8L8.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontFamily:F, fontSize:"13px", fontWeight:500, color:"#9c5094" }}>Remember me</span>
              </label>
              <a href="#" style={{ fontFamily:F, fontSize:"13px", fontWeight:600, color:"#701366", textDecoration:"none" }}>
                Forgot password?
              </a>
            </div>

            {/* Button */}
            <button type="submit" disabled={loading}
              style={{
                marginTop:"4px", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                background: loading ? "#5a0f52" : "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)",
                boxShadow:"0 6px 22px rgba(112,19,102,.32)", color:"white",
                fontFamily:F, fontSize:"15px", fontWeight:700, letterSpacing:".02em",
                padding:"14px", borderRadius:"12px", border:"none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? .75 : 1, transition:"all .2s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg,#701366 0%,#4a0d45 100%)"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg,#8a1a7e 0%,#701366 100%)"; }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", margin:"24px 0" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(248,178,234,.5)" }} />
            <span style={{ fontFamily:F, fontSize:"11px", color:"#c87dbe", fontWeight:500 }}>or</span>
            <div style={{ flex:1, height:"1px", background:"rgba(248,178,234,.5)" }} />
          </div>

          {/* Footer */}
          <p style={{ textAlign:"center", fontFamily:F, fontSize:"13px", color:"#9c5094" }}>
            Don't have an account?{" "}
            <a href="#" style={{ color:"#701366", fontWeight:700, textDecoration:"none" }}>Contact admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}