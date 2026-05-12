/** Ad soyad → küçük harf Latin, boşluksuz; Türkçe harfler yakın ASCII karşılıklarına çevrilir. */
export function slugAsciiFromFullName(fullName: string): string {
  const lower = fullName.trim().toLocaleLowerCase("tr-TR");
  const map: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u"
  };
  let acc = "";
  for (const char of lower) {
    if (/\s/.test(char)) continue;
    acc += map[char] ?? char;
  }
  return acc.replace(/[^a-z]/g, "");
}

/** Örnek: Ahmet Yılmaz → ahmetyilmaz123; kısa/isimsiz ise null. */
export function suggestPasswordFromFullName(fullName: string): string | null {
  const slug = slugAsciiFromFullName(fullName);
  if (slug.length < 2) return null;
  return `${slug}123`;
}
