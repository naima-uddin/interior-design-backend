// Team (admin/moderator) account management — admin-role only. Lets the
// primary admin invite moderators (content + media access, no settings/team)
// or other admins, and manage existing accounts.

import bcrypt from "bcryptjs";
import { Admin } from "./models.js";

const safe = (a) => ({
  _id: a._id,
  email: a.email,
  name: a.name,
  role: a.role,
  createdAt: a.createdAt,
});

export async function listTeam(req, res, next) {
  try {
    const items = await Admin.find().sort({ createdAt: 1 }).lean();
    res.json({ items: items.map(safe) });
  } catch (err) {
    next(err);
  }
}

export async function createTeamMember(req, res, next) {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await Admin.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: "That email is already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      email: normalizedEmail,
      passwordHash,
      name: name || "Team member",
      role: role === "admin" ? "admin" : "moderator",
    });
    res.status(201).json({ item: safe(admin) });
  } catch (err) {
    next(err);
  }
}

export async function updateTeamMember(req, res, next) {
  try {
    const { name, role, password } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name;
    if (role !== undefined) update.role = role === "admin" ? "admin" : "moderator";
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      update.passwordHash = await bcrypt.hash(password, 10);
    }

    // Prevent removing the last remaining admin's admin role.
    if (update.role === "moderator") {
      const target = await Admin.findById(req.params.id);
      if (target?.role === "admin") {
        const adminCount = await Admin.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
          return res.status(400).json({ error: "At least one admin account must remain" });
        }
      }
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!admin) return res.status(404).json({ error: "Not found" });
    res.json({ item: safe(admin) });
  } catch (err) {
    next(err);
  }
}

export async function deleteTeamMember(req, res, next) {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ error: "You can't delete your own account" });
    }
    const target = await Admin.findById(req.params.id);
    if (!target) return res.status(404).json({ error: "Not found" });
    if (target.role === "admin") {
      const adminCount = await Admin.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "At least one admin account must remain" });
      }
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
