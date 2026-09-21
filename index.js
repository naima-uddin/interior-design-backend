// dotenv/config first so process.env is populated before anything reads it.
import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import {
  Banner,
  Product,
  Project,
  Service,
  Post,
  Testimonial,
  Faq,
  Room,
  Space,
  Setting,
  MODELS,
} from "./models.js";
import { login, logout, me, requireAuth } from "./auth.js";
import { uploadMiddleware, handleUpload } from "./upload.js";

const app = express();
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

// CORS — allow the storefront + admin origins from env (comma-separated).
// credentials:true is required so the httpOnly auth cookie round-trips.
const ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / curl (no origin) and whitelisted origins
      if (!origin || ORIGINS.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Sort helper: active items, by order then newest.
const listActive = (Model, filter = {}) =>
  Model.find({ isActive: true, ...filter }).sort({ order: 1, createdAt: 1 }).lean();

// Expose the stored `isNewArrival` flag to clients as `isNew`.
const mapProduct = (p) => (p ? { ...p, isNew: !!p.isNewArrival } : p);
const mapProducts = (arr) => arr.map(mapProduct);

/* ── Health ────────────────────────────────────────────────────────────── */
app.get("/", (req, res) => res.json({ ok: true, service: "velor-api" }));

/* ── Admin auth ────────────────────────────────────────────────────────── */
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", requireAuth, me);

/* ── Image upload (Cloudinary, folder: Interior-design/<folder>) ────────── */
app.post("/api/upload", requireAuth, uploadMiddleware, handleUpload);

/* ── Batched homepage payload (one request for the whole home page) ─────── */
app.get("/api/homepage", async (req, res, next) => {
  try {
    const [
      banners,
      services,
      products,
      rooms,
      projects,
      testimonials,
      setting,
    ] = await Promise.all([
      listActive(Banner),
      listActive(Service),
      listActive(Product),
      listActive(Room),
      listActive(Project),
      listActive(Testimonial),
      Setting.findOne({ key: "site" }).lean(),
    ]);

    res.json({
      banners,
      services: services.slice(0, 6),
      featured: mapProducts(products.slice(0, 3)),
      rooms,
      hotspot: setting?.hotspot || null,
      projects: projects.slice(0, 8),
      whyChoose: setting?.whyChoose || [],
      process: setting?.process || [],
      testimonials,
      company: setting?.company || null,
      spacesImage: setting?.spacesImage || null,
    });
  } catch (err) {
    next(err);
  }
});

/* ── Settings (company/contact, categories, why-choose, process, hotspot) ─ */
app.get("/api/settings", async (req, res, next) => {
  try {
    const setting = await Setting.findOne({ key: "site" }).lean();
    res.json(setting || {});
  } catch (err) {
    next(err);
  }
});

/* ── Products ──────────────────────────────────────────────────────────── */
app.get("/api/products", async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const [items, setting] = await Promise.all([
      listActive(Product, filter),
      Setting.findOne({ key: "site" }).lean(),
    ]);
    res.json({ items: mapProducts(items), categories: setting?.productCategories || [] });
  } catch (err) {
    next(err);
  }
});
app.get("/api/products/:slug", async (req, res, next) => {
  try {
    const item = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item: mapProduct(item) });
  } catch (err) {
    next(err);
  }
});

/* ── Projects (with category counts for nav/filters) ───────────────────── */
app.get("/api/projects", async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const [items, all, setting] = await Promise.all([
      listActive(Project, filter),
      listActive(Project),
      Setting.findOne({ key: "site" }).lean(),
    ]);
    const cats = (setting?.projectCategories || [])
      .map((c) => ({ ...c, count: all.filter((p) => p.category === c.slug).length }))
      .filter((c) => c.count > 0);
    res.json({ items, categories: cats });
  } catch (err) {
    next(err);
  }
});
app.get("/api/projects/:slug", async (req, res, next) => {
  try {
    const item = await Project.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

/* ── Services ──────────────────────────────────────────────────────────── */
app.get("/api/services", async (req, res, next) => {
  try {
    res.json({ items: await listActive(Service) });
  } catch (err) {
    next(err);
  }
});
app.get("/api/services/:slug", async (req, res, next) => {
  try {
    const item = await Service.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

/* ── Posts / Journal ───────────────────────────────────────────────────── */
app.get("/api/posts", async (req, res, next) => {
  try {
    res.json({ items: await listActive(Post) });
  } catch (err) {
    next(err);
  }
});
app.get("/api/posts/:slug", async (req, res, next) => {
  try {
    const item = await Post.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

/* ── Simple collections ────────────────────────────────────────────────── */
app.get("/api/testimonials", async (req, res, next) => {
  try {
    res.json({ items: await listActive(Testimonial) });
  } catch (err) {
    next(err);
  }
});
app.get("/api/faqs", async (req, res, next) => {
  try {
    res.json({ items: await listActive(Faq) });
  } catch (err) {
    next(err);
  }
});
app.get("/api/spaces", async (req, res, next) => {
  try {
    const [items, setting] = await Promise.all([
      listActive(Space),
      Setting.findOne({ key: "site" }).lean(),
    ]);
    res.json({ items, spacesImage: setting?.spacesImage || null });
  } catch (err) {
    next(err);
  }
});
app.get("/api/rooms", async (req, res, next) => {
  try {
    res.json({ items: await listActive(Room) });
  } catch (err) {
    next(err);
  }
});

/* ── Contact form intake ───────────────────────────────────────────────── */
app.post("/api/contact", (req, res) => {
  // No persistence yet — accept and log. Wire to email / DB later.
  console.log("[contact]", req.body);
  res.status(201).json({ ok: true });
});

/* ── Generic CRUD for every collection (admin dashboard) ────────────────────
   POST /api/<resource>            create        \
   PUT  /api/<resource>/:id        update         } all require admin auth
   DELETE /api/<resource>/:id      delete        /
   GET  /api/admin/<resource>      list ALL (incl. inactive) — admin auth */
for (const [name, Model] of Object.entries(MODELS)) {
  app.get(`/api/admin/${name}`, requireAuth, async (req, res, next) => {
    try {
      res.json({ items: await Model.find().sort({ order: 1, createdAt: 1 }).lean() });
    } catch (err) {
      next(err);
    }
  });
  app.post(`/api/${name}`, requireAuth, async (req, res, next) => {
    try {
      res.status(201).json({ item: await Model.create(req.body) });
    } catch (err) {
      next(err);
    }
  });
  app.put(`/api/${name}/:id`, requireAuth, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).lean();
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json({ item });
    } catch (err) {
      next(err);
    }
  });
  app.delete(`/api/${name}/:id`, requireAuth, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id).lean();
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
}

// Settings is a singleton — allow updating it in place (admin only).
app.put("/api/settings", requireAuth, async (req, res, next) => {
  try {
    const item = await Setting.findOneAndUpdate({ key: "site" }, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).lean();
    res.json({ item });
  } catch (err) {
    next(err);
  }
});

/* ── Error handler ─────────────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

/* ── Start ─────────────────────────────────────────────────────────────── */
async function start() {
  if (!MONGODB_URI) {
    console.error("FATAL: MONGODB_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Velor API running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});

export default app;
