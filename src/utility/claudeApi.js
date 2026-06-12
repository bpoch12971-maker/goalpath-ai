const API_KEY = "AQ.Ab8RN6JiZU-YL40MxxiPhT372q9EFVCCOQtMPCF0MItj2uTWmg";

// โมเดลหลัก + โมเดลสำรอง (ถ้าโมเดลแรกโดน overload / error 503 จะลองตัวถัดไป)
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

// จำนวนครั้งที่ลองใหม่ต่อโมเดล เมื่อเจอ error ที่เกิดจาก server ชั่วคราว (429 / 503)
const MAX_RETRIES_PER_MODEL = 2;
// หน่วงเวลาก่อน retry (ms) เพิ่มขึ้นทีละครั้ง (exponential backoff)
const RETRY_DELAY_MS = 1200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// error ที่เกิดจากระบบของ Google ชั่วคราว ลองใหม่ได้
function isRetryableStatus(status) {
  return status === 429 || status === 503 || status === 500;
}

async function callModel(model, systemPrompt, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        { role: "user", parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err?.error?.message || `API error ${response.status}`;
    const e = new Error(message);
    e.status = response.status;
    throw e;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip ```json fences if present
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    // Try to extract the largest valid JSON object from the text
    const match = clean.match(/\{[\s\S]*/);
    if (match) {
      // Find the last complete field by trimming incomplete trailing content
      let attempt = match[0];
      // Remove trailing incomplete key-value and close the object
      attempt = attempt.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, "");
      attempt = attempt.replace(/,\s*"[^"]*"\s*$/, "");
      if (!attempt.endsWith("}")) attempt += "}";
      return JSON.parse(attempt);
    }
    throw new Error("ไม่สามารถอ่านผลลัพธ์จาก AI ได้ กรุณาลองใหม่อีกครั้ง");
  }
}

export async function callClaude(systemPrompt, userMessage) {
  let lastError = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        return await callModel(model, systemPrompt, userMessage);
      } catch (e) {
        lastError = e;

        // ถ้า error เกิดจาก server overload/ชั่วคราว -> รอแล้วลองใหม่ (โมเดลเดิมก่อน แล้วค่อยสลับโมเดล)
        if (isRetryableStatus(e.status) && attempt < MAX_RETRIES_PER_MODEL) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        // ถ้าไม่ใช่ error ชั่วคราว (เช่น API key ผิด, prompt ผิด) ไม่ต้องลองโมเดลอื่น หยุดทันที
        if (!isRetryableStatus(e.status)) {
          throw new Error(friendlyMessage(e));
        }

        // error ชั่วคราวแต่ลองครบจำนวนรอบของโมเดลนี้แล้ว -> ไปลองโมเดลถัดไป
        break;
      }
    }
  }

  // ลองทุกโมเดลแล้วยังไม่สำเร็จ
  throw new Error(friendlyMessage(lastError));
}

function friendlyMessage(e) {
  if (!e) return "เกิดข้อผิดพลาดไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง";
  if (isRetryableStatus(e.status)) {
    return "ระบบ AI มีผู้ใช้งานหนาแน่นในขณะนี้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
  }
  return e.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
