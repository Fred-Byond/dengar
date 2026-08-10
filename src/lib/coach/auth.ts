/**
 * Signed-cookie session for advisors. HMAC-SHA256 over a base64url JSON
 * payload — no external dependency, server-side verification on every API
 * route. Not a full auth system; access codes gate entry (pilot scope).
 */

import crypto from "node:crypto";
import type { AdvisorContext } from "./types";

const COOKIE_NAME = "coach_session";
const MAX_AGE_S = 60 * 60 * 12; // 12 hours

function secret(): string {
  return process.env["COACH_SESSION_SECRET"] || "dev-secret-change-in-prod";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export interface SessionPayload extends AdvisorContext {
  exp: number;
}

export function createSessionCookie(ctx: AdvisorContext): {
  name: string;
  value: string;
  maxAge: number;
} {
  const payload: SessionPayload = {
    ...ctx,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_S,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { name: COOKIE_NAME, value: `${body}.${sign(body)}`, maxAge: MAX_AGE_S };
}

export function verifySessionCookie(
  cookieValue: string | undefined
): SessionPayload | null {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 0) return null;
  const body = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
