/**
 * Şablondaki her fiziksel satırı olduğu gibi döndürür (satır sonları hariç hiçbir şeyi birleştirmez;
 * satır başı/sonu boşlukları ve dosyadaki çift boşluklar korunur).
 */
export function plainTextToPhysicalLines(raw: string): string[] {
  return raw.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "").split("\n");
}

type ColonLineParts = { indent: string; label: string; value: string } | null;

function parseAlignableColonLine(line: string): ColonLineParts {
  // Etiket satırlarını hizala: "Etiket : Değer"
  const m = line.match(/^(\s*)([^:\t\n]{1,60}?)(\s*):\s*(.*)$/);
  if (!m) return null;
  const indent = m[1] ?? "";
  const label = (m[2] ?? "").trimEnd();
  const value = m[4] ?? "";
  if (!label) return null;
  if (/https?:\/\//i.test(line)) return null;
  return { indent, label, value };
}

/**
 * İki nokta hizası: her uygun satırı `\t: ` kalıbına dönüştürür.
 * Sekme durakları docx/pdf üretiminde uygulandığı için her indirmede kolonlar alt alta hizalanır.
 */
export function autoAlignColonLines(lines: string[]): string[] {
  return lines.map((line) => {
    const parsed = parseAlignableColonLine(line);
    if (!parsed) return line;
    return `${parsed.indent}${parsed.label}\t: ${parsed.value}`.trimEnd();
  });
}
