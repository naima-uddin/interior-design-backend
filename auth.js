// Admin authentication — admin/moderator accounts, JWT in an httpOnly cookie.
// No public signup: accounts are created via seed.js or the Team page.

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Admin } from "./models.js";

const COOKIE_NAME = "velor_admin_token";
const TOKEN_TTL = "7d";

export function signToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), email: admin.email, name: admin.name, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL },
  );
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

// Protects mutating/admin routes. Accepts the token from the httpOnly cookie
// OR an `Authorization: Bearer <token>` header (the admin SPA sends the header
// since it runs on a different origin/port than the API in dev).
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearer || req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

// Gate a route to specific role(s), e.g. requireRole("admin"). Must run after
// requireAuth so req.admin is populated.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: "You don't have permission to do that" });
    }
    next();
  };
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  if (!admin) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(admin);
  setAuthCookie(res, token);
  res.json({ token, admin: { email: admin.email, name: admin.name, role: admin.role } });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}

export function me(req, res) {
  res.json({ admin: req.admin });
}

export { COOKIE_NAME };
