/** Soyad (son boşlukla ayrılmış parça) Türkçe kurallarıyla büyük harf. Tek kelimede dokunulmaz. */
function surnameUpperTr(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1]!;
  const upperLast = last.toLocaleUpperCase("tr-TR");
  return [...parts.slice(0, -1), upperLast].join(" ");
}

/** Karşılama metinleri: Main Admin sonekini siler, soyadı AYDOĞDU biçiminde gösterir. */
export function greetingDisplayName(fullName: string | null | undefined): string {
  const safe = typeof fullName === "string" ? fullName : "";
  const cleaned = safe.replace(/\s*\(\s*Main Admin(?:\s*\d+)?\s*\)\s*$/i, "").trim();
  return surnameUpperTr(cleaned);
}
