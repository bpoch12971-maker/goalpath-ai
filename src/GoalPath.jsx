import { useState } from "react";
import { downloadPDF } from "./utility/pdfExport";
import { callClaude } from "./utility/claudeApi";

const sections = [
  { title: "ความสนใจด้านเทคโนโลยี", icon: "💻", questions: ["ฉันชอบคอมพิวเตอร์","ฉันชอบเขียนโปรแกรม","ฉันชอบ AI","ฉันชอบ Cyber Security","ฉันชอบคณิตศาสตร์","ฉันชอบวิทยาศาสตร์","ฉันชอบธุรกิจ","ฉันชอบศิลปะ"] },
  { title: "RIASEC", icon: "🔬", questions: ["ฉันชอบซ่อมหรือประกอบอุปกรณ์","ฉันชอบวิเคราะห์ปัญหา","ฉันชอบทดลองค้นคว้า","ฉันชอบคิดไอเดียใหม่","ฉันชอบช่วยเหลือผู้อื่น","ฉันชอบเป็นผู้นำ","ฉันชอบโน้มน้าวคน","ฉันชอบจัดระเบียบข้อมูล"] },
  { title: "รูปแบบการเรียนรู้", icon: "📚", questions: ["ฉันชอบเรียนรู้สิ่งใหม่ด้วยตัวเอง","ฉันชอบค้นคว้าข้อมูลนอกห้องเรียน","ฉันชอบแก้โจทย์ยาก","ฉันชอบวิเคราะห์ข้อมูล","ฉันชอบทดลองและพิสูจน์","ฉันชอบวิชาเทคโนโลยี","ฉันชอบการเรียนแบบลงมือทำ","ฉันชอบแข่งขันทางวิชาการ"] },
  { title: "บุคลิกภาพ", icon: "🌟", questions: ["ฉันกล้าตัดสินใจ","ฉันชอบเป็นผู้นำ","ฉันชอบทำงานเป็นทีม","ฉันรับฟังความคิดเห็นของผู้อื่น","ฉันสามารถปรับตัวได้ดี","ฉันมีความรับผิดชอบ","ฉันทำงานจนเสร็จตามเป้าหมาย","ฉันชอบวางแผนก่อนลงมือทำ"] },
  { title: "รูปแบบการทำงาน", icon: "⚡", questions: ["ฉันชอบทำงานคนเดียว","ฉันชอบทำงานเป็นทีม","ฉันชอบความมั่นคง","ฉันชอบความท้าทาย","ฉันชอบทำงานอิสระ","ฉันชอบทำงานภายใต้แรงกดดัน","ฉันชอบแก้ปัญหาเฉพาะหน้า","ฉันชอบเรียนรู้ตลอดเวลา"] },
  { title: "จุดแข็ง", icon: "💪", questions: ["ฉันเก่งคณิตศาสตร์","ฉันเก่งการสื่อสาร","ฉันเก่งการคิดวิเคราะห์","ฉันเก่งการแก้ปัญหา","ฉันเก่งการใช้เทคโนโลยี","ฉันเก่งการนำเสนอ","ฉันเก่งการบริหารเวลา","ฉันเก่งการทำงานร่วมกับผู้อื่น"] },
  { title: "เป้าหมายชีวิต", icon: "🎯", questions: ["ฉันอยากเข้ามหาวิทยาลัย","ฉันสนใจสายอาชีพ","ฉันอยากทำธุรกิจส่วนตัว","ฉันอยากทำงานด้านเทคโนโลยี","ฉันอยากทำงานต่างประเทศ","ฉันอยากมีรายได้สูง","ฉันอยากสร้างนวัตกรรมใหม่","ฉันอยากช่วยเหลือสังคม"] },
  { title: "ทักษะอนาคต", icon: "🚀", questions: ["ฉันใช้คอมพิวเตอร์ได้ดี","ฉันเรียนรู้โปรแกรมใหม่ได้เร็ว","ฉันสื่อสารได้ดี","ฉันคิดอย่างเป็นระบบ","ฉันชอบทำโครงการระยะยาว","ฉันสามารถเรียนรู้จากความผิดพลาดได้","ฉันสนใจเทคโนโลยีใหม่","ฉันชอบสร้างผลงานของตัวเอง"] },
];

const LABELS = ["ไม่ชอบเลย", "ไม่ค่อยชอบ", "ปานกลาง", "ค่อนข้างชอบ", "ชอบมาก"];

function GoalPath({ goHome, userData, setRecommendedCareer, goPlanner }) {
  const totalQ = sections.reduce((s, sec) => s + sec.questions.length, 0);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(totalQ).fill(3));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sec = sections[step];

  function getIdx(si, qi) {
    let idx = 0;
    for (let i = 0; i < si; i++) idx += sections[i].questions.length;
    return idx + qi;
  }

  function handleRate(idx, val) {
    const a = [...answers];
    a[idx] = val;
    setAnswers(a);
  }

  async function analyze() {
    setLoading(true);
    setError("");

    // Build a structured summary of answers for the AI
    const answerSummary = sections.map((sec, si) =>
      `[${sec.title}]\n` +
      sec.questions.map((q, qi) => `  ${q}: ${answers[getIdx(si, qi)]}/5 (${LABELS[answers[getIdx(si, qi)] - 1]})`).join("\n")
    ).join("\n\n");

    const totalScore = answers.reduce((s, v) => s + v, 0);

    const systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการแนะนำอาชีพและการวางแผนชีวิต ตอบเป็นภาษาไทยเสมอ
ตอบกลับเป็น JSON เท่านั้น ไม่มีข้อความอื่น ไม่มี markdown fences`;

    const userMessage = `วิเคราะห์ผลแบบทดสอบของ ${userData.name} อายุ ${userData.age} ปี ระดับ ${userData.education}${userData.job ? ` อาชีพ: ${userData.job}` : ""}
คะแนนรวม: ${totalScore}/${totalQ * 5}

ผลการทำแบบทดสอบ 8 ด้าน:
${answerSummary}

วิเคราะห์และตอบเป็น JSON รูปแบบนี้:
{
  "career": "ชื่ออาชีพหลักที่เหมาะที่สุด",
  "percent": ตัวเลขเปอร์เซ็นต์ความเหมาะสม (60-98),
  "summary": "สรุปโปรไฟล์ของผู้ใช้ 2-3 ประโยค",
  "topCareers": [
    {"name": "อาชีพที่ 1", "percent": ตัวเลข},
    {"name": "อาชีพที่ 2", "percent": ตัวเลข},
    {"name": "อาชีพที่ 3", "percent": ตัวเลข}
  ],
  "strengths": ["จุดแข็ง 1", "จุดแข็ง 2", "จุดแข็ง 3", "จุดแข็ง 4"],
  "improve": ["ควรพัฒนา 1", "ควรพัฒนา 2", "ควรพัฒนา 3", "ควรพัฒนา 4"],
  "lifemap": [
    {"yr": "ปีที่ 1", "steps": ["ขั้นตอน 1", "ขั้นตอน 2", "ขั้นตอน 3"]},
    {"yr": "ปีที่ 2", "steps": ["ขั้นตอน 1", "ขั้นตอน 2", "ขั้นตอน 3"]},
    {"yr": "ปีที่ 3", "steps": ["ขั้นตอน 1", "ขั้นตอน 2", "ขั้นตอน 3"]}
  ],
  "score": ${totalScore}
}`;

    try {
      const data = await callClaude(systemPrompt, userMessage);
      if (typeof setRecommendedCareer === "function") setRecommendedCareer(data.career);
      localStorage.setItem("goalpathCareer", data.career);
      setResult(data);
    } catch (e) {
      setError("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={s.card}>
        <div style={s.loadingBox}>
          <div style={s.spinner} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#4f46e5", marginTop: 16 }}>AI กำลังวิเคราะห์...</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>ประมวลผลข้อมูลจากแบบทดสอบ 8 ด้าน</div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div style={s.card}>
        <button style={s.btnBack} onClick={() => setResult(null)}>← แก้คำตอบ</button>
        <div id="goalpath-report">
          {/* Header */}
          <div style={s.resultHeader}>
            <div style={s.resultIcon}>🎯</div>
            <div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>ผลวิเคราะห์อาชีพโดย AI</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b", fontFamily: "'Sora',sans-serif" }}>{result.career}</div>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div style={s.summaryBox}>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{result.summary}</div>
            </div>
          )}

          {/* Match score */}
          <div style={s.matchCard}>
            <div style={s.matchPercent}>{result.percent}%</div>
            <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, marginBottom: 10 }}>Career Match</div>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${result.percent}%` }} />
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
              คะแนนรวม {result.score} / {totalQ * 5} คะแนน
            </div>
          </div>

          {/* Top careers */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🏆 Top Career Match</div>
            {result.topCareers.map((c, i) => (
              <div key={i} style={s.rankRow}>
                <div style={s.rankBadge}>#{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b" }}>{c.name}</div>
                  <div style={{ ...s.miniBar, marginTop: 4 }}>
                    <div style={{ ...s.miniBarFill, width: `${c.percent}%`, opacity: 1 - i * 0.15 }} />
                  </div>
                </div>
                <div style={s.rankPct}>{c.percent}%</div>
              </div>
            ))}
          </div>

          {/* Strengths & improve */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div style={s.infoCard}>
              <div style={s.infoTitle}>⭐ จุดแข็ง</div>
              {result.strengths.map((t) => (
                <div key={t} style={s.infoItem}>
                  <span style={s.dot} />{t}
                </div>
              ))}
            </div>
            <div style={{ ...s.infoCard, background: "#fff7ed", borderColor: "rgba(251,146,60,0.15)" }}>
              <div style={{ ...s.infoTitle, color: "#c2410c" }}>📈 ควรพัฒนา</div>
              {result.improve.map((t) => (
                <div key={t} style={{ ...s.infoItem, color: "#7c2d12" }}>
                  <span style={{ ...s.dot, background: "#f97316" }} />{t}
                </div>
              ))}
            </div>
          </div>

          {/* LifeMap */}
          <div style={{ ...s.section, marginTop: 16 }}>
            <div style={s.sectionTitle}>🗺️ LifeMap เบื้องต้น</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.lifemap.map((yr) => (
                <div key={yr.yr} style={s.lifemapRow}>
                  <div style={s.yearBadge}>{yr.yr}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {yr.steps.map((st) => (
                      <span key={st} style={s.stepChip}>{st}</span>
                    ))}
                  </div>
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

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button style={{ ...s.btnPrimary, flex: 1 }} onClick={goPlanner}>
            สร้างแผนใน AI Planner →
          </button>
          <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => downloadPDF("goalpath-report", "GoalPath_Report.pdf")}>
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

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={s.secIcon}>{sec.icon}</div>
        <div>
          <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>ขั้นตอน {step + 1} / {sections.length}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1e1b4b", fontFamily: "'Sora',sans-serif" }}>{sec.title}</div>
        </div>
      </div>

      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${((step + 1) / sections.length) * 100}%`, transition: "width 0.4s ease" }} />
      </div>

      <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8, marginBottom: 20 }}>
        ให้คะแนน 1–5 ตามความรู้สึกของคุณ
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sec.questions.map((q, qi) => {
          const idx = getIdx(step, qi);
          const val = answers[idx];
          return (
            <div key={idx} style={s.questionCard}>
              <div style={s.questionText}>
                <span style={s.questionNum}>{idx + 1}</span>{q}
              </div>
              <div style={s.ratingRow}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    style={{ ...s.ratingBtn, ...(val === v ? s.ratingBtnActive : {}) }}
                    onClick={() => handleRate(idx, v)}
                    title={LABELS[v - 1]}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div style={s.ratingLabel}>{LABELS[val - 1]}</div>
            </div>
          );
        })}
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {step > 0 && (
          <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => setStep(step - 1)}>← ย้อนกลับ</button>
        )}
        {step < sections.length - 1 ? (
          <button style={{ ...s.btnPrimary, flex: 1, margin: 0 }} onClick={() => setStep(step + 1)}>ถัดไป →</button>
        ) : (
          <button style={{ ...s.btnPrimary, flex: 1, margin: 0 }} onClick={analyze}>วิเคราะห์ผล 🎯</button>
        )}
      </div>
    </div>
  );
}

const s = {
  card: { background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 8px 40px rgba(79,70,229,0.10)", border: "1px solid rgba(99,102,241,0.10)", width: "100%", maxWidth: 560, margin: "0 auto" },
  btnBack: { background: "none", border: "none", color: "#9ca3af", fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", padding: 0, marginBottom: 16, display: "block" },
  secIcon: { width: 44, height: 44, background: "#eef2ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  progressTrack: { width: "100%", height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 99 },
  questionCard: { background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 14, padding: "14px 16px" },
  questionText: { fontSize: 14, color: "#1e1b4b", fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 },
  questionNum: { minWidth: 22, height: 22, background: "#4f46e5", color: "#fff", borderRadius: "50%", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 },
  ratingRow: { display: "flex", gap: 8 },
  ratingBtn: { flex: 1, height: 36, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#6b7280", cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" },
  ratingBtnActive: { background: "linear-gradient(135deg,#4f46e5,#6366f1)", border: "1.5px solid #4f46e5", color: "#fff", boxShadow: "0 2px 8px rgba(79,70,229,0.30)" },
  ratingLabel: { fontSize: 11, color: "#9ca3af", marginTop: 6, textAlign: "right" },
  btnPrimary: { background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(79,70,229,0.28)" },
  btnOutline: { background: "#f8f9ff", color: "#4f46e5", border: "1.5px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "13px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" },
  btnGhost: { background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", padding: 0, display: "block", margin: "12px auto 0" },
  errorBox: { background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginTop: 12 },
  loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" },
  spinner: { width: 48, height: 48, border: "4px solid #e5e7eb", borderTop: "4px solid #4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  resultHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "16px", background: "#eef2ff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.12)" },
  resultIcon: { width: 48, height: 48, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 14, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" },
  summaryBox: { background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 },
  matchCard: { background: "#fafbff", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 16 },
  matchPercent: { fontSize: 52, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: "#4f46e5", lineHeight: 1, marginBottom: 4 },
  section: { background: "#f8f9ff", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 14, padding: "16px" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#1e1b4b", marginBottom: 12 },
  rankRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(99,102,241,0.06)" },
  rankBadge: { width: 28, height: 28, background: "#eef2ff", color: "#4f46e5", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  rankPct: { fontSize: 14, fontWeight: 700, color: "#4f46e5", minWidth: 38 },
  miniBar: { height: 4, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" },
  miniBarFill: { height: "100%", background: "linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius: 99 },
  infoCard: { background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.12)", borderRadius: 12, padding: "14px" },
  infoTitle: { fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 8 },
  infoItem: { fontSize: 13, color: "#064e3b", display: "flex", alignItems: "center", gap: 6, padding: "3px 0" },
  dot: { width: 6, height: 6, minWidth: 6, background: "#10b981", borderRadius: "50%" },
  lifemapRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  yearBadge: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap" },
  stepChip: { background: "#fff", fontSize: 12, border: "1px solid rgba(99,102,241,0.15)", color: "#4f46e5", padding: "3px 10px", borderRadius: 99, fontWeight: 500 },
  userInfo: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, padding: "10px 14px", background: "#f8f9ff", borderRadius: 10, fontSize: 13, color: "#6b7280" },
};

export default GoalPath;
