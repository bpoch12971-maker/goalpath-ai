import html2pdf from "html2pdf.js";

export function downloadPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("ไม่พบข้อมูลสำหรับดาวน์โหลด PDF");
    return;
  }
  html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}
