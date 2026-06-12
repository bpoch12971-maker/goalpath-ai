import { useState } from "react";
import GoalPath from "./GoalPath";
import Planner from "./Planner";
import ProblemAnalysis from "./ProblemAnalysis";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [job, setJob] = useState("");
  const [recommendedCareer, setRecommendedCareer] = useState("");

  const userData = { name, age, education, job };

  function goMenu() {
    setRecommendedCareer("");
    setPage("menu");
  }

  function goNextFromRegister() {
    const textOnly = /^[A-Za-zก-๙\s]+$/;
    if (name.trim() === "") return alert("กรุณากรอกชื่อ");
    if (!textOnly.test(name)) return alert("ชื่อต้องเป็นตัวอักษรเท่านั้น");
    if (age.trim() === "") return alert("กรุณากรอกอายุ");
    if (!/^\d+$/.test(age)) return alert("อายุต้องเป็นตัวเลข");
    if (Number(age) < 9 || Number(age) > 100) return alert("อายุต้องอยู่ระหว่าง 9–100 ปี");
    if (education === "") return alert("กรุณาเลือกระดับการศึกษา");
    if (education === "อาชีพ") {
      if (job.trim() === "") return alert("กรุณากรอกอาชีพ");
      if (!textOnly.test(job)) return alert("อาชีพต้องเป็นตัวอักษรเท่านั้น");
    }
    setPage("tutorialChoice");
  }

  return (
    <div style={s.wrap}>
      {/* BG decoration */}
      <div style={s.bgBlob1} />
      <div style={s.bgBlob2} />

      <div style={s.container}>

        {/* HOME */}
        {page === "home" && (
          <div style={s.card}>
            <div style={s.logoMark}>
              <span style={{ fontSize: 28 }}>🎯</span>
            </div>
            <h1 style={{ ...s.title, fontSize: "clamp(24px, 7vw, 32px)" }}>FuturePath AI</h1>
            <p style={s.subtitle}>
              AI วิเคราะห์ตัวตน วิเคราะห์ปัญหา<br />
              และวางแผนเป้าหมายสำหรับทุกวัย
            </p>
            <div style={s.featureRow}>
              {[
                { icon: "🧭", label: "วิเคราะห์อาชีพ" },
                { icon: "🔍", label: "วิเคราะห์ปัญหา" },
                { icon: "📋", label: "วางแผนเป้าหมาย" },
              ].map((f) => (
                <div key={f.label} style={s.featurePill}>
                  <span>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{f.label}</span>
                </div>
              ))}
            </div>
            <button style={s.btnPrimary} onClick={() => setPage("register")}>
              เริ่มใช้งาน →
            </button>
          </div>
        )}

        {/* REGISTER */}
        {page === "register" && (
          <div style={s.card}>
            <button style={s.btnBack} onClick={() => setPage("home")}>← กลับ</button>
            <div style={s.stepBadge}>ขั้นตอนที่ 1 / 2</div>
            <h2 style={s.cardTitle}>ข้อมูลของคุณ</h2>
            <p style={s.cardDesc}>กรอกข้อมูลเพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น</p>

            <div style={s.fieldGroup}>
              <label style={s.label}>ชื่อ</label>
              <input
                style={s.input}
                placeholder="เช่น สมชาย"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>อายุ</label>
              <input
                style={s.input}
                placeholder="เช่น 15"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>ระดับการศึกษา / สถานะ</label>
              <select
                style={s.input}
                value={education}
                onChange={(e) => {
                  setEducation(e.target.value);
                  if (e.target.value !== "อาชีพ") setJob("");
                }}
              >
                <option value="">— เลือกระดับการศึกษา —</option>
                <option value="ป.4-6">ประถมศึกษา ป.4–6</option>
                <option value="ม.1-3">มัธยมต้น ม.1–3</option>
                <option value="ม.4-6">มัธยมปลาย ม.4–6</option>
                <option value="อาชีพ">มีอาชีพแล้ว</option>
              </select>
            </div>
            {education === "อาชีพ" && (
              <div style={s.fieldGroup}>
                <label style={s.label}>อาชีพปัจจุบัน</label>
                <input
                  style={s.input}
                  placeholder="เช่น ครู, วิศวกร"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                />
              </div>
            )}
            <button style={{ ...s.btnPrimary, width: "100%", marginTop: 8 }} onClick={goNextFromRegister}>
              ถัดไป →
            </button>
          </div>
        )}

        {/* TUTORIAL CHOICE */}
        {page === "tutorialChoice" && (
          <div style={s.card}>
            <div style={s.logoMark}>👋</div>
            <h2 style={s.cardTitle}>สวัสดี, {name}!</h2>
            <p style={s.cardDesc}>ต้องการดูวิธีใช้งานก่อนไหม?</p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => setPage("tutorial")}>
                ดู Tutorial
              </button>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => setPage("menu")}>
                เข้าใช้งานเลย →
              </button>
            </div>
          </div>
        )}

        {/* TUTORIAL */}
        {page === "tutorial" && (
          <div style={s.card}>
            <button style={s.btnBack} onClick={() => setPage("tutorialChoice")}>← กลับ</button>
            <h2 style={s.cardTitle}>วิธีใช้งาน</h2>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { n: "1", t: "เลือกฟีเจอร์", d: "เลือกจาก GoalPath, Problem Analysis หรือ AI Planner" },
                { n: "2", t: "กรอกข้อมูล", d: "ตอบคำถามหรือพิมพ์เป้าหมายของคุณ" },
                { n: "3", t: "ให้ AI วิเคราะห์", d: "AI จะประมวลผลและสร้างคำแนะนำให้" },
                { n: "4", t: "ดูผลและวางแผน", d: "ดาวน์โหลด PDF หรือต่อยอดใน AI Planner" },
              ].map((step) => (
                <div key={step.n} style={s.tutorialStep}>
                  <div style={s.stepNum}>{step.n}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{step.t}</div>
                    <div style={{ color: "var(--text-2)", fontSize: 14, marginTop: 2 }}>{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ ...s.btnPrimary, width: "100%", marginTop: 20 }} onClick={() => setPage("menu")}>
              เข้าใช้งาน →
            </button>
          </div>
        )}

        {/* MENU */}
        {page === "menu" && (
          <div style={{ ...s.card, maxWidth: 520 }}>
            <div style={s.userChip}>
              <span style={s.avatar}>{name.charAt(0)}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{name} · {age} ปี · {education}</span>
            </div>
            <h2 style={{ ...s.cardTitle, marginTop: 16 }}>เลือกฟีเจอร์</h2>
            <p style={s.cardDesc}>ต้องการให้ AI ช่วยด้านไหน?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              {[
                {
                  page: "goalpath",
                  icon: "🧭",
                  title: "GoalPath AI",
                  desc: "แบบทดสอบ 8 ด้าน วิเคราะห์อาชีพที่เหมาะกับคุณ",
                  tag: "สำหรับนักเรียน ป.–ม.",
                  color: "#4f46e5",
                  bg: "#eef2ff",
                },
                {
                  page: "problem",
                  icon: "🔍",
                  title: "Problem Analysis AI",
                  desc: "วิเคราะห์ปัญหา หาสาเหตุ และแนวทางแก้ไข",
                  tag: "ทุกวัย",
                  color: "#0891b2",
                  bg: "#ecfeff",
                },
                {
                  page: "planner",
                  icon: "📋",
                  title: "AI Planner",
                  desc: "วางแผนเป้าหมายระยะสั้น กลาง และยาว",
                  tag: "ทุกประเภทเป้าหมาย",
                  color: "#059669",
                  bg: "#ecfdf5",
                },
              ].map((f) => (
                <button key={f.page} style={s.menuCard} onClick={() => setPage(f.page)}>
                  <div style={{ ...s.menuIcon, background: f.bg, color: f.color }}>{f.icon}</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text)" }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{f.desc}</div>
                  </div>
                  <span style={{ ...s.tag, background: f.bg, color: f.color }}>{f.tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {page === "goalpath" && (
          <GoalPath goHome={goMenu} userData={userData} setRecommendedCareer={setRecommendedCareer} goPlanner={() => setPage("planner")} />
        )}
        {page === "problem" && (
          <ProblemAnalysis goHome={goMenu} userData={userData} />
        )}
        {page === "planner" && (
          <Planner goHome={goMenu} userData={userData} recommendedCareer={recommendedCareer} />
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(16px, 5vw, 32px) clamp(12px, 4vw, 16px)",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #f0f1ff 0%, #faf5ff 50%, #eff6ff 100%)",
  },
  bgBlob1: {
    position: "fixed", top: -160, right: -160,
    width: 500, height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "fixed", bottom: -120, left: -120,
    width: 400, height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
    position: "relative",
    zIndex: 1,
  },
  card: {
    background: "#ffffff",
    borderRadius: 24,
    padding: "clamp(20px, 6vw, 32px) clamp(16px, 5vw, 28px)",
    boxShadow: "0 8px 40px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid rgba(99,102,241,0.10)",
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
  },
  logoMark: {
    width: 56, height: 56,
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, margin: "0 auto 16px",
    border: "1px solid rgba(99,102,241,0.15)",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    color: "#1e1b4b",
    textAlign: "center",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: "clamp(13px, 3.5vw, 15px)",
    lineHeight: 1.7,
    marginTop: 10,
  },
  featureRow: {
    display: "flex", gap: 8, justifyContent: "center",
    marginTop: 20, flexWrap: "wrap",
  },
  featurePill: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#f8f9ff",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 99,
    padding: "6px 12px",
    fontSize: 13,
    color: "#4b5563",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    marginTop: 24,
    display: "block",
    margin: "24px auto 0",
    boxShadow: "0 4px 16px rgba(79,70,229,0.30)",
    transition: "all 0.18s ease",
  },
  btnSecondary: {
    background: "#f8f9ff",
    color: "#4f46e5",
    border: "1px solid rgba(99,102,241,0.20)",
    borderRadius: 12,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  btnBack: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    padding: 0,
    marginBottom: 16,
    display: "block",
    transition: "color 0.15s",
  },
  stepBadge: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 99,
    marginBottom: 10,
    letterSpacing: "0.3px",
  },
  cardTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#1e1b4b",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  fieldGroup: {
    marginTop: 16,
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 15,
    color: "#1e1b4b",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  userChip: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "#eef2ff",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 99,
    padding: "6px 14px 6px 6px",
  },
  avatar: {
    width: 28, height: 28,
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    borderRadius: "50%",
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700,
    lineHeight: "28px", textAlign: "center",
  },
  tutorialStep: {
    display: "flex", alignItems: "flex-start", gap: 14,
    background: "#f8f9ff",
    border: "1px solid rgba(99,102,241,0.08)",
    borderRadius: 12, padding: "14px 16px",
  },
  stepNum: {
    width: 28, height: 28, minWidth: 28,
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    borderRadius: "50%",
    color: "#fff", fontWeight: 700, fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  menuCard: {
    display: "flex", alignItems: "center", gap: 14,
    background: "#fafbff",
    border: "1.5px solid #e5e7eb",
    borderRadius: 16, padding: "16px",
    cursor: "pointer", width: "100%",
    transition: "all 0.18s ease",
    textAlign: "left",
  },
  menuIcon: {
    width: 44, height: 44, minWidth: 44,
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22,
  },
  tag: {
    fontSize: 11, fontWeight: 600,
    padding: "3px 8px", borderRadius: 99,
    whiteSpace: "nowrap",
  },
};

export default App;
