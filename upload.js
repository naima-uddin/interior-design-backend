// Cloudinary image upload. Files arrive as multipart/form-data (memory
// storage, multer), then are streamed straight to Cloudinary — no temp files
// on disk. Every asset lands under Interior-design/<folder>, one subfolder per
// content type, so the media library stays organised in the Cloudinary UI too.

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Subfolders allowed under Interior-design/ — one per content type. Keeps
// arbitrary client input from writing to an unexpected Cloudinary path.
const ALLOWED_FOLDERS = new Set([
  "banners",
  "products",
  "projects",
  "services",
  "posts",
  "testimonials",
  "rooms",
  "spaces",
  "branding",
  "misc",
]);

function streamUpload(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `Interior-design/${folder}` },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const uploadMiddleware = upload.single("image");

export async function handleUpload(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });
    const folder = ALLOWED_FOLDERS.has(req.body.folder) ? req.body.folder : "misc";
    const result = await streamUpload(req.file.buffer, folder);
    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
}
