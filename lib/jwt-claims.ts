/** Oturum JWT için sabit issuer / audience (token başka amaçla kullanılamasın). */
export const JWT_ISSUER = "oyku-music-center";
export const JWT_AUDIENCE = "oyku-music-center-session";

export function getJwtVerifyOptions() {
  return { issuer: JWT_ISSUER, audience: JWT_AUDIENCE } as const;
}
