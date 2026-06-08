const API_KEY = "AQ.Ab8RN6JiZU-YL40MxxiPhT372q9EFVCCOQtMPCF0MItj2uTWmg";
const MODEL = "gemini-2.5-flash";

export async function callClaude(systemPrompt, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

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
    throw new Error(err?.error?.message || `API error ${response.status}`);
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
