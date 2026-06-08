import { useState } from "react";
import { downloadPDF } from "./utility/pdfExport";
import { callClaude } from "./utility/claudeApi";

function ProblemAnalysis({ goHome, userData }) {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeProblem() {
    if (problem.trim() === "") return alert("กรุณาพิมพ์ปัญหาก่อน");
    setLoading(true);
    setError("");

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการแก้ปัญหาและการโค้ชชีวิต ตอบเป็นภาษาไทยเสมอ
ตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น ไม่มี markdown fences`;

    const userMessage = `วิเคราะห์ปัญหาของ ${userData.name} อายุ ${userData.age} ปี ระดับ ${userData.education}${userData.job ? ` อาชีพ: ${userData.job}` : ""}
ปัญหา: "${problem}"

ตอบเป็น JSON รูปแบบนี้:
{
  "problem": "สรุปปัญหาให้กระชับ",
  "severity": "ต่ำ/ปานกลาง/สูง",
  "rootCause": "สาเหตุหลักที่แท้จริง 1-2 ประโยค",
  "causes": ["สาเหตุ 1", "สาเหตุ 2", "สาเหตุ 3", "สาเหตุ 4"],
  "impacts": ["ผลกระทบ 1", "ผลกระทบ 2", "ผลกระทบ 3"],
  "solutions": [
    {"n": "1", "t": "ชื่อวิธีแก้ 1", "d": "รายละเอียดที่เฉพาะเจาะจงกับปัญหานี้"},
    {"n": "2", "t": "ชื่อวิธีแก้ 2", "d": "รายละเอียดที่เฉพาะเจาะจงกับปัญหานี้"},
    {"n": "3", "t": "ชื่อวิธีแก้ 3", "d": "รายละเอียดที่เฉพาะเจาะจงกับปัญหานี้"},
    {"n": "4", "t": "ชื่อวิธีแก้ 4", "d": "รายละเอียดที่เฉพาะเจาะจงกับปัญหานี้"},
    {"n": "5", "t": "ชื่อวิธีแก้ 5", "d": "รายละเอียดที่เฉพาะเจาะจงกับปัญหานี้"}
  ],
  "firstStep": "สิ่งที่ควรทำภายใน 24 ชั่วโมงนี้ (เฉพาะเจาะจงมาก)"
}`;

    try {
      const data = await callClaude(systemPrompt, userMessage);
      setResult({ ...data, originalProblem: problem });
    } catch (e) {
      setError("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const severityColor = {
    "ต่ำ": { bg: "#ecfdf5", color: "#059669", border: "rgba(16,185,129,0.2)" },
    "ปานกลาง": { bg: "#fffbeb", color: "#d97706", border: "rgba(245,158,11,0.2)" },
    "สูง": { bg: "#fef2f2", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
  };

  if (loading) {
    return (
      <div style={s.card}>
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0891b2", marginTop: 16 }}>AI กำลังวิเคราะห์ปัญหา...</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>ค้นหาสาเหตุและแนวทางแก้ไข</div>
        </div>
      </div>
    );
  }

  if (result) {
    const sv = severityColor[result.severity] || severityColor["ปานกลาง"];
    return (
      <div style={s.card}>
        <button style={s.btnBack} onClick={() => setResult(null)}>← วิเคราะห์ใหม่</button>
        <div id="problem-report">
          {/* Header */}
          <div style={s.resultHeader}>
            <div style={s.resultIcon}>🔍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>ผลวิเคราะห์ปัญหาโดย AI</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b", fontFamily: "'Sora',sans-serif", lineHeight: 1.4, marginTop: 2 }}>
                {result.problem}
              </div>
            </div>
            {result.severity && (
              <span style={{ ...s.severityBadge, background: sv.bg, color: sv.color, borderColor: sv.border }}>
                {result.severity === "ต่ำ" ? "🟢" : result.severity === "สูง" ? "🔴" : "🟡"} {result.severity}
              </span>
            )}
          </div>

          {/* Root cause */}
          {result.rootCause && (
            <div style={s.rootCauseBox}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 6 }}>🔎 สาเหตุหลักที่แท้จริง</div>
              <div style={{ fontSize: 13, color: "#1d4ed8", lineHeight: 1.7 }}>{result.rootCause}</div>
            </div>
          )}

          {/* Causes */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🧩 สาเหตุที่เป็นไปได้</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.causes.map((c, i) => (
                <div key={i} style={s.causeItem}>
                  <div style={s.causeDot} />
                  <span style={{ fontSize: 14, color: "#374151" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impacts */}
          <div style={{ ...s.section, background: "#fff7ed", borderColor: "rgba(251,146,60,0.15)", marginTop: 12 }}>
            <div style={{ ...s.sectionTitle, color: "#92400e" }}>⚠️ ผลกระทบ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.impacts.map((imp, i) => (
                <div key={i} style={s.causeItem}>
                  <div style={{ ...s.causeDot, background: "#f97316" }} />
                  <span style={{ fontSize: 14, color: "#7c2d12" }}>{imp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e1b4b", marginBottom: 12 }}>✅ แนวทางแก้ไข</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.solutions.map((sol) => (
                <div key={sol.n} style={s.solutionCard}>
                  <div style={s.solutionNum}>{sol.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b" }}>{sol.t}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{sol.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* First step today */}
          {result.firstStep && (
            <div style={s.actionBox}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 6 }}>💡 เริ่มต้นวันนี้</div>
              <div style={{ fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>{result.firstStep}</div>
            </div>
          )}

          {/* User info */}
          <div style={s.userInfo}>
            <span>👤 {userData.name}</span><span>·</span>
            <span>{userData.age} ปี</span><span>·</span>
            <span>{userData.education}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => downloadPDF("problem-report", "ProblemAnalysis_Report.pdf")}>
            ดาวน์โหลด PDF
          </button>
        </div>
        <button style={s.btnGhost} onClick={goHome}>← กลับเมนู</button>
      </div>
    );
  }

  return (
    <div style={s.card}>
      <button style={s.btnBack} onClick={goHome}>← กลับเมนู</button>
      <div style={s.header}>
        <div style={s.iconBox}>🔍</div>
        <div>
          <h2 style={s.title}>Problem Analysis AI</h2>
          <p style={s.desc}>วิเคราะห์ปัญหา หาสาเหตุ และแนวทางแก้ไข</p>
        </div>
      </div>

      <div style={s.userChip}>
        <span style={s.avatar}>{userData.name.charAt(0)}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#4f46e5" }}>
          {userData.name} · {userData.age} ปี · {userData.education}
        </span>
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={s.label}>อธิบายปัญหาของคุณ</label>
        <textarea
          style={s.textarea}
          placeholder={"เช่น\n• เรียนไม่ทันเพื่อน ไม่รู้จะเริ่มยังไง\n• ไม่รู้จะเลือกคณะอะไรดี\n• อยากเปิดร้านแต่ไม่รู้จะเริ่มจากตรงไหน"}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "right", marginTop: 4 }}>
          {problem.length} ตัวอักษร
        </div>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <button
        style={{ ...s.btnPrimary, width: "100%", marginTop: 16, opacity: problem.trim() ? 1 : 0.6 }}
        onClick={analyzeProblem}
      >
        วิเคราะห์ปัญหา →
      </button>
    </div>
  );
}

const s = {
  card: { background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 8px 40px rgba(79,70,229,0.10)", border: "1px solid rgba(99,102,241,0.10)", width: "100%", maxWidth: 520, margin: "0 auto" },
  btnBack: { background: "none", border: "none", color: "#9ca3af", fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", padding: 0, marginBottom: 16, display: "block" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  iconBox: { width: 48, height: 48, background: "#ecfeff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid rgba(6,182,212,0.15)" },
  title: { fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#1e1b4b", margin: 0 },
  desc: { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
  userChip: { display: "inline-flex", alignItems: "center", gap: 8, background: "#eef2ff", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 99, padding: "6px 14px 6px 6px" },
  avatar: { width: 28, height: 28, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, lineHeight: "28px", textAlign: "center" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  textarea: { width: "100%", height: 140, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1e1b4b", background: "#fafafa", resize: "vertical", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7, outline: "none" },
  btnPrimary: { background: "linear-gradient(135deg,#0891b2,#0e7490)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(8,145,178,0.28)" },
  btnOutline: { background: "#f8f9ff", color: "#4f46e5", border: "1.5px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" },
  btnGhost: { background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", padding: 0, display: "block", margin: "12px auto 0" },
  errorBox: { background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginTop: 12 },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" },
  spinner: { width: 48, height: 48, border: "4px solid #e5e7eb", borderTop: "4px solid #0891b2", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  resultHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "16px", background: "#ecfeff", borderRadius: 14, border: "1px solid rgba(6,182,212,0.15)" },
  resultIcon: { width: 48, height: 48, background: "linear-gradient(135deg,#0891b2,#0e7490)", borderRadius: 14, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" },
  severityBadge: { fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, border: "1px solid", whiteSpace: "nowrap" },
  rootCauseBox: { background: "#eff6ff", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 },
  section: { background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 14, padding: "16px" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#1e1b4b", marginBottom: 12 },
  causeItem: { display: "flex", alignItems: "center", gap: 10 },
  causeDot: { width: 8, height: 8, minWidth: 8, background: "#4f46e5", borderRadius: "50%" },
  solutionCard: { display: "flex", alignItems: "flex-start", gap: 12, background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 12, padding: "12px 14px" },
  solutionNum: { width: 26, height: 26, minWidth: 26, background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", borderRadius: "50%", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  actionBox: { background: "#eff6ff", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "14px 16px", marginTop: 16 },
  userInfo: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10, fontSize: 13, color: "#6b7280" },
};

export default ProblemAnalysis;
