/** Santimetre → Word twip (1 inç = 1440 twip; 1 inç = 2,54 cm). */
export function cmToTwips(cm: number): number {
  return Math.round((1440 * cm) / 2.54);
}

function clampCm(n: number, fallback: number): number {
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(5, Math.max(0.4, n));
}

export type TeacherContractDocxTheme = {
  font: string;
  fontSizeHalfPt: number;
  marginTwips: { top: number; right: number; bottom: number; left: number };
  tabTwips: number;
};

/**
 * `.env` ile iş sözleşmesi .docx sayfa düzeni (orijinal Word ile yaklaştırmak için).
 * Tanımsız ise Times New Roman 12 pt, 2,5 cm kenar, 3 cm sekme.
 */
export function readTeacherContractDocxTheme(): TeacherContractDocxTheme {
  const fontRaw = process.env.TEACHER_CONTRACT_DOCX_FONT?.trim();
  const fontSanitized =
    fontRaw && fontRaw.length <= 120
      ? fontRaw.replace(/[\x00-\x1f\\]/g, "").trim() || "Times New Roman"
      : "Times New Roman";
  const font = fontSanitized.length ? fontSanitized : "Times New Roman";

  const sizePt = Number(process.env.TEACHER_CONTRACT_DOCX_FONT_SIZE_PT);
  const fontSizeHalfPt =
    Number.isFinite(sizePt) && sizePt >= 6 && sizePt <= 72 ? Math.round(sizePt * 2) : 24;

  let topCm = 2.5;
  let rightCm = 2.5;
  let bottomCm = 2.5;
  let leftCm = 2.5;
  const marginsRaw = process.env.TEACHER_CONTRACT_DOCX_MARGINS_CM?.trim();
  if (marginsRaw) {
    const parts = marginsRaw.split(",").map((s) => Number(s.trim()));
    if (parts.length === 1 && Number.isFinite(parts[0])) {
      const u = clampCm(parts[0], 2.5);
      topCm = rightCm = bottomCm = leftCm = u;
    } else if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      topCm = clampCm(parts[0], 2.5);
      rightCm = clampCm(parts[1], 2.5);
      bottomCm = clampCm(parts[2], 2.5);
      leftCm = clampCm(parts[3], 2.5);
    }
  }

  // İstek gereği kolon hizası sabit: 3 cm.
  const tabTwips = cmToTwips(3);

  return {
    font,
    fontSizeHalfPt,
    marginTwips: {
      top: cmToTwips(topCm),
      right: cmToTwips(rightCm),
      bottom: cmToTwips(bottomCm),
      left: cmToTwips(leftCm),
    },
    tabTwips,
  };
}
