import { useEffect, useState } from "react";
import { downloadPDF } from "./utility/pdfExport";
import { callClaude } from "./utility/claudeApi";

const EXAMPLES = [
  "อยากเป็น Computer Engineer",
  "อยากเป็นหมอ",
  "อยากเปิดร้านกาแฟ",
  "อยากลดน้ำหนัก 10 กิโล",
];

function Planner({ goHome, userData, recommendedCareer }) {
  const [goal, setGoal] = useState(
    recommendedCareer || localStorage.getItem("goalpathCareer") || ""
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (recommendedCareer) setGoal(recommendedCareer);
  }, [recommendedCareer]);

  async function createPlan() {
    if (goal.trim() === "") return alert("กรุณาพิมพ์เป้าหมายก่อน");
    setLoading(true);
    setError("");

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการวางแผนเป้าหมายและการพัฒนาตนเอง ตอบเป็นภาษาไทยเสมอ
ตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น ไม่มี markdown fences`;

    const userMessage = `วางแผนเป้าหมายให้กับ ${userData.name} อายุ ${userData.age} ปี ระดับ ${userData.education}${userData.job ? ` อาชีพ: ${userData.job}` : ""}
เป้าหมาย: "${goal}"

ตอบเป็น JSON รูปแบบนี้:
{
  "goal": "ชื่อเป้าหมายที่ชัดเจน",
  "overview": "สรุปภาพรวมแผน 2 ประโยค",
  "short": ["งาน 1", "งาน 2", "งาน 3", "งาน 4"],
  "mid": ["งาน 1", "งาน 2", "งาน 3", "งาน 4"],
  "long": ["งาน 1", "งาน 2", "งาน 3"],
  "today": ["ทำวันนี้ 1", "ทำวันนี้ 2", "ทำวันนี้ 3"],
  "color": "#4f46e5",
  "bg": "#eef2ff"
}

กำหนด color และ bg ให้เหมาะกับประเภทเป้าหมาย:
- เทคโนโลยี/วิศวกรรม: color #4f46e5, bg #eef2ff
- สุขภาพ/แพทย์: color #059669, bg #ecfdf5
- ธุรกิจ/การเงิน: color #d97706, bg #fffbeb
- ศิลปะ/ครีเอทีฟ: color #db2777, bg #fdf2f8
- อื่นๆ: color #7c3aed, bg #f5f3ff`;

    try {
      const data = await callClaude(systemPrompt, userMessage);
      setResult(data);
    } catch (e) {
      setError("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const phases = result ? [
    { label: "ระยะสั้น", sub: "1–3 เดือน", icon: "⚡", items: result.short, color: "#0891b2", bg: "#ecfeff" },
    { label: "ระยะกลาง", sub: "6–12 เดือน", icon: "📈", items: result.mid, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "ระยะยาว", sub: "1–3 ปี", icon: "🏆", items: result.long, color: "#059669", bg: "#ecfdf5" },
  ] : [];

  if (loading) {
    return (
      <div style={s.card}>
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#7c3aed", marginTop: 16 }}>AI กำลังวางแผน...</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>สร้างแผนระยะสั้น กลาง และยาว</div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={s.card}>
        <button style={s.btnBack} onClick={() => setResult(null)}>← วางแผนใหม่</button>
        <div id="planner-report">
          {/* Header */}
          <div style={{ ...s.resultHeader, background: result.bg, borderColor: `${result.color}22` }}>
            <div style={{ ...s.resultIcon, background: `linear-gradient(135deg, ${result.color}, ${result.color}cc)` }}>📋</div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>แผนเป้าหมายโดย AI</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e1b4b", fontFamily: "'Sora',sans-serif", lineHeight: 1.4, marginTop: 2 }}>
                {result.goal}
              </div>
            </div>
          </div>

          {/* Overview */}
          {result.overview && (
            <div style={s.overviewBox}>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{result.overview}</div>
            </div>
          )}

          {/* Phases */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phases.map((ph) => (
              <div key={ph.label} style={{ ...s.phaseCard, background: ph.bg, borderColor: `${ph.color}20` }}>
                <div style={s.phaseHeader}>
                  <span style={{ fontSize: 18 }}>{ph.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>{ph.label}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{ph.sub}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                  {ph.items.map((item, i) => (
                    <div key={i} style={s.phaseItem}>
                      <span style={{ ...s.phaseDot, background: ph.color }} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Today */}
          <div style={s.todayBox}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 10 }}>🌅 เริ่มวันนี้เลย</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.today.map((t, i) => (
                <div key={i} style={s.todayItem}>
                  <div style={s.todayNum}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: "#78350f" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User info */}
          <div style={s.userInfo}>
            <span>👤 {userData.name}</span><span>·</span>
            <span>{userData.age} ปี</span><span>·</span>
            <span>{userData.education}</span>
          </div>
        </div>

        <button style={{ ...s.btnOutline, width: "100%", marginTop: 20 }} onClick={() => downloadPDF("planner-report", "Planner_Report.pdf")}>
          ดาวน์โหลด PDF
        </button>
        <button style={s.btnGhost} onClick={goHome}>← กลับเมนู</button>
      </div>
    );
  }

  return (
    <div style={s.card}>
      <button style={s.btnBack} onClick={goHome}>← กลับเมนู</button>
      <div style={s.header}>
        <div style={s.iconBox}>📋</div>
        <div>
          <h2 style={s.title}>AI Planner</h2>
          <p style={s.desc}>วางแผนเป้าหมายระยะสั้น กลาง และยาว</p>
        </div>
      </div>

      <div style={s.userChip}>
        <span style={s.avatar}>{userData.name.charAt(0)}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#4f46e5" }}>
          {userData.name} · {userData.age} ปี · {userData.education}
        </span>
      </div>

      {recommendedCareer && (
        <div style={s.fromGoalPath}>
          <span style={{ fontSize: 12, color: "#065f46" }}>✅ ส่งมาจาก GoalPath AI:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}> {recommendedCareer}</span>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <label style={s.label}>เป้าหมายของคุณคืออะไร?</label>
        <textarea
          style={s.textarea}
          placeholder="พิมพ์เป้าหมายของคุณ..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>ตัวอย่าง</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} style={s.exampleChip} onClick={() => setGoal(ex)}>{ex}</button>
          ))}
        </div>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <button
        style={{ ...s.btnPrimary, width: "100%", marginTop: 20, opacity: goal.trim() ? 1 : 0.6 }}
        onClick={createPlan}
      >
        สร้างแผน →
      </button>
    </div>
  );
}

const s = {
  card: { background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 8px 40px rgba(79,70,229,0.10)", border: "1px solid rgba(99,102,241,0.10)", width: "100%", maxWidth: 520, margin: "0 auto" },
  btnBack: { background: "none", border: "none", color: "#9ca3af", fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", padding: 0, marginBottom: 16, display: "block" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  iconBox: { width: 48, height: 48, background: "#f5f3ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid rgba(124,58,237,0.15)" },
  title: { fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#1e1b4b", margin: 0 },
  desc: { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
  userChip: { display: "inline-flex", alignItems: "center", gap: 8, background: "#eef2ff", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 99, padding: "6px 14px 6px 6px" },
  avatar: { width: 28, height: 28, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, lineHeight: "28px", textAlign: "center" },
  fromGoalPath: { marginTop: 14, padding: "10px 14px", background: "#ecfdf5", borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)", fontSize: 13 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  textarea: { width: "100%", height: 100, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", background: "#fafafa", resize: "vertical", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7, outline: "none" },
  exampleChip: { background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 99, padding: "5px 12px", fontSize: 12, color: "#4f46e5", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  btnPrimary: { background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.28)" },
  btnOutline: { background: "#f8f9ff", color: "#4f46e5", border: "1.5px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" },
  btnGhost: { background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", padding: 0, display: "block", margin: "12px auto 0" },
  errorBox: { background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginTop: 12 },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" },
  spinner: { width: 48, height: 48, border: "4px solid #e5e7eb", borderTop: "4px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  resultHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "16px", borderRadius: 14, border: "1px solid" },
  resultIcon: { width: 48, height: 48, borderRadius: 14, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" },
  overviewBox: { background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 },
  phaseCard: { borderRadius: 14, padding: "14px 16px", border: "1px solid" },
  phaseHeader: { display: "flex", alignItems: "center", gap: 10 },
  phaseItem: { display: "flex", alignItems: "center", gap: 10 },
  phaseDot: { width: 7, height: 7, minWidth: 7, borderRadius: "50%" },
  todayBox: { background: "#fffbeb", border: "1px solid rgba(245,158,11,0.20)", borderRadius: 14, padding: "16px", marginTop: 12 },
  todayItem: { display: "flex", alignItems: "center", gap: 10 },
  todayNum: { width: 22, height: 22, minWidth: 22, background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#fff", borderRadius: "50%", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  userInfo: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10, fontSize: 13, color: "#6b7280" },
};

export default Planner;
