/** NFC/NFKC + trim — görünmez boşluk ve birleşik karakter tutarsızlığını azaltır. */
export function normalizeLoginPasswordInput(raw: string): string {
  return raw.normalize("NFKC").trim();
}

/**
 * Giriş şifresinde Türkçe harf ↔ ASCII uyumu (ör. "savaşay" → "savasay").
 * Seed/personel şifreleri ASCII saklanırken kullanıcı Türkçe klavye kullanabiliyor.
 */
export function foldTurkishCharsForPassword(input: string): string {
  const map: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    I: "i",
    İ: "i",
    i: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u"
  };
  let out = "";
  for (const ch of input) {
    out += map[ch] ?? ch;
  }
  return out;
}
