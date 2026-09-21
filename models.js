// ─────────────────────────────────────────────────────────────────────────
// Mongoose models for the Velor interior-design storefront.
// One file keeps the (many, small) content schemas easy to scan. Every content
// type carries `order` + `isActive` so the storefront can sort and hide items.
// ─────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const image = { url: { type: String, default: "" } };
const base = { order: { type: Number, default: 0 }, isActive: { type: Boolean, default: true } };

/* Hero slides */
const BannerSchema = new Schema(
  {
    image,
    badge: String,
    title: { type: String, required: true }, // *asterisks* → serif italic accent
    subtitle: String,
    buttonText: String,
    buttonLink: String,
    ...base,
  },
  { timestamps: true },
);

/* Shop products */
const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    tagline: String,
    category: { type: String, index: true },
    price: { type: Number, default: 0 },
    compareAtPrice: Number,
    // Avoid Mongoose's reserved `isNew` document flag — served to the client as `isNew`.
    isNewArrival: { type: Boolean, default: false },
    images: [image],
    colours: [String],
    materials: String,
    dimensions: String,
    description: String,
    ...base,
  },
  { timestamps: true },
);

/* Portfolio projects */
const ProjectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, index: true },
    area: String,
    location: String,
    year: String,
    duration: String,
    cover: image,
    gallery: [image],
    overview: String,
    scope: [String],
    ...base,
  },
  { timestamps: true },
);

/* Services offered */
const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: String,
    summary: String,
    intro: String,
    image,
    includes: [String],
    ...base,
  },
  { timestamps: true },
);

/* Journal / blog posts */
const PostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: String,
    category: String,
    date: String,
    author: String,
    readingTime: String,
    cover: image,
    body: [String],
    ...base,
  },
  { timestamps: true },
);

/* Client testimonials */
const TestimonialSchema = new Schema(
  { name: String, role: String, quote: String, avatar: image, ...base },
  { timestamps: true },
);

/* FAQs */
const FaqSchema = new Schema(
  { q: String, a: String, ...base },
  { timestamps: true },
);

/* Homepage "Shop by Room" tiles */
const RoomSchema = new Schema(
  { name: String, image, href: String, ...base },
  { timestamps: true },
);

/* Spaces lookbook */
const SpaceSchema = new Schema(
  { title: String, location: String, blurb: String, image, tall: Boolean, ...base },
  { timestamps: true },
);

/* Singleton site settings: company/contact, categories, why-choose, process,
   hotspot scene, and misc homepage copy. Only one document is ever stored. */
const SettingSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    company: {
      founded: String,
      stats: [{ value: String, label: String }],
      contact: {
        office: String,
        factory: String,
        phones: [String],
        email: String,
        hours: String,
        cities: [String],
      },
    },
    productCategories: [{ slug: String, name: String }],
    projectCategories: [{ slug: String, name: String }],
    whyChoose: [{ title: String, body: String }],
    process: [{ step: String, title: String, body: String }],
    hotspot: {
      eyebrow: String,
      title: String,
      intro: String,
      image,
      points: [{ x: Number, y: Number, title: String, body: String }],
    },
    spacesImage: image,
  },
  { timestamps: true },
);

/* Admin user (single/few accounts, no public signup) */
const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Admin" },
  },
  { timestamps: true },
);

export const Banner = models.Banner || model("Banner", BannerSchema);
export const Product = models.Product || model("Product", ProductSchema);
export const Project = models.Project || model("Project", ProjectSchema);
export const Service = models.Service || model("Service", ServiceSchema);
export const Post = models.Post || model("Post", PostSchema);
export const Testimonial = models.Testimonial || model("Testimonial", TestimonialSchema);
export const Faq = models.Faq || model("Faq", FaqSchema);
export const Room = models.Room || model("Room", RoomSchema);
export const Space = models.Space || model("Space", SpaceSchema);
export const Setting = models.Setting || model("Setting", SettingSchema);

// Registry used by the generic CRUD router (name → model).
export const MODELS = {
  banners: Banner,
  products: Product,
  projects: Project,
  services: Service,
  posts: Post,
  testimonials: Testimonial,
  faqs: Faq,
  rooms: Room,
  spaces: Space,
};
