// Media library — browses everything already uploaded to Cloudinary under
// Interior-design/, using the Search API (folder-scoped, cursor-paginated),
// plus a delete action. Backs the admin's "Media Library" page and the
// reusable image picker used across every content form.

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT = "Interior-design";

export async function listMedia(req, res) {
  try {
    const { folder, cursor } = req.query;
    const prefix = folder && folder !== "all" ? `${ROOT}/${folder}` : ROOT;

    const query = cloudinary.search
      .expression(`folder:${prefix}*`)
      .sort_by("created_at", "desc")
      .max_results(40);
    if (cursor) query.next_cursor(cursor);

    const result = await query.execute();
    res.json({
      items: (result.resources || []).map((r) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        format: r.format,
        folder: r.folder,
        createdAt: r.created_at,
      })),
      nextCursor: result.next_cursor || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to list media" });
  }
}

export async function deleteMedia(req, res) {
  try {
    const publicId = req.body?.publicId || req.query.publicId;
    if (!publicId) return res.status(400).json({ error: "publicId is required" });
    // Only ever allow deleting assets inside our own managed folder.
    if (!String(publicId).startsWith(`${ROOT}/`)) {
      return res.status(400).json({ error: "Invalid publicId" });
    }
    await cloudinary.uploader.destroy(publicId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete media" });
  }
}
