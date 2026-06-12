import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "scramble_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE)?.value;

  return verifySessionCookie(cookie);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);

  cookieStore.set(ADMIN_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export function verifyAdminPassword(value: string) {
  const expected = getAdminPassword();

  if (!expected) {
    return false;
  }

  return safeEqual(value, expected);
}

function verifySessionCookie(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [expiresAt, signature] = value.split(".");

  if (!expiresAt || !signature || sign(expiresAt) !== signature) {
    return false;
  }

  return Number(expiresAt) > Math.floor(Date.now() / 1000);
}

function sign(value: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(value).digest("hex");
}

function getAdminPassword() {
  return process.env.SCRAMBLE_ADMIN_PASSWORD ?? getLocalFallback("1436");
}

function getAdminSessionSecret() {
  return process.env.SCRAMBLE_ADMIN_SESSION_SECRET ?? getLocalFallback("scramble-local-secret");
}

function getLocalFallback(value: string) {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "";
  }

  return value;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
