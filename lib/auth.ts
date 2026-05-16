import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getJwtSecretKey } from "@/lib/jwt-secret";
import { JWT_AUDIENCE, JWT_ISSUER, getJwtVerifyOptions } from "@/lib/jwt-claims";

const COOKIE_NAME = "session";

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Öğrenci / öğretmen hesaplarında şifre doğrulaması kullanılmadığında User kaydı için rastgele hash. */
export async function hashPlaceholderUserPassword() {
  return hashPassword(`__disabled__${randomUUID()}`);
}

export async function createSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecretKey(), getJwtVerifyOptions());
  return payload as unknown as SessionPayload;
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.VERCEL_ENV === "preview";
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    path: "/",
    maxAge: 0
  });
}
