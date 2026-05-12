/**
 * UTF-8 metin şablonda `{alanAdı}` yer tutucularını veriyle değiştirir.
 * Anahtarlar uzun olandan kısaya sıralanır (ör. `{x}` ile `{xx}` çakışması azalır).
 */
export function fillTeacherContractTemplate(template: string, data: Record<string, string>): string {
  const keys = Object.keys(data).sort((a, b) => b.length - a.length);
  let out = template;
  for (const key of keys) {
    const val = data[key] ?? "";
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\{${escaped}\\}`, "g"), val);
  }
  return out;
}
