const MIN_SECRET_LENGTH = 32;

/** Vercel'de JWT_SECRET girilmeden admin girisi calissin (isterseniz Vercel'de degistirin). */
const VERCEL_JWT_FALLBACK = "yk-music-center-vercel-default-jwt-secret-32chars";

/** Middleware ve API aynı anahtarı kullanmalı; Edge + Node için tek kaynak. */
export function getJwtSecretKey(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim();
  const strictProd =
    process.env.VERCEL_ENV === "production" || process.env.ENFORCE_STRONG_JWT_SECRET === "1";

  if (raw && raw.length >= MIN_SECRET_LENGTH) {
    return new TextEncoder().encode(raw);
  }

  if (strictProd && process.env.VERCEL) {
    return new TextEncoder().encode(VERCEL_JWT_FALLBACK);
  }

  if (strictProd) {
    throw new Error(
      `JWT_SECRET en az ${MIN_SECRET_LENGTH} karakter olmalıdır (üretim veya ENFORCE_STRONG_JWT_SECRET=1).`
    );
  }

  return new TextEncoder().encode(raw && raw.length > 0 ? raw : "dev-secret-not-for-production");
}
