// Seed MongoDB with the storefront's launch content.
// Idempotent: wipes each collection and re-inserts, so `npm run seed` always
// yields a known-good dataset. Mirrors the frontend's fallback data (lib/data.ts).
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
  Admin,
} from "./models.js";

const U = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const img = (...ids) => ids.map((id) => ({ url: U(id, 1400) }));
const withOrder = (arr) => arr.map((x, i) => ({ ...x, order: i, isActive: true }));

/* ── Hero slides ─────────────────────────────────────────────────────── */
const BANNERS = [
  {
    image: { url: U("photo-1618221195710-dd6b41faaea6") },
    badge: "Timeless · Natural · Considered",
    title: "Room for better *living.*",
    subtitle:
      "Furniture for a calmer tomorrow — sculptural forms, honest materials and quiet detail, made to belong in your home.",
    buttonText: "Explore the collection",
    buttonLink: "/collection",
  },
  {
    image: { url: U("photo-1616486338812-3dadae4b4ace") },
    badge: "The Autumn Edit",
    title: "Warmth, *considered.*",
    subtitle:
      "Soft bouclé, oiled walnut and honed stone. A palette built to age beautifully alongside you.",
    buttonText: "Shop new arrivals",
    buttonLink: "/collection",
  },
  {
    image: { url: U("photo-1524758631624-e2822e304c36") },
    badge: "Made to Belong",
    title: "Spaces for *real life.*",
    subtitle:
      "Designed to feel effortless, enduring and entirely yours — from the first coffee to the last light of day.",
    buttonText: "Discover spaces",
    buttonLink: "/spaces",
  },
];

/* ── Products ────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { slug: "vera-lounge-chair", title: "Vera Lounge Chair", tagline: "Sculptural comfort", category: "seating", price: 1890, isNewArrival: true, images: img("photo-1567016432779-094069958ea5", "photo-1567016376408-0226e4d0c1ea", "photo-1616627561950-9f746e330187"), colours: ["#e8e2d6", "#8f8574", "#3f4130"], materials: "Bouclé wool, solid oiled walnut frame", dimensions: "W 78 · D 82 · H 74 cm", description: "A quiet statement piece. Vera pairs a deep bouclé shell with a hand-finished walnut frame that curves to meet the body — sculptural from every angle, yet built for the long, slow evenings." },
  { slug: "linden-sofa", title: "Linden Sofa", tagline: "Inviting by design", category: "sofas", price: 3450, images: img("photo-1493663284031-b7e3aefcae8e", "photo-1503602642458-232111445657", "photo-1555041469-a586c61ea9bc"), colours: ["#ded7c8", "#c2b6a1", "#6f675c"], materials: "Feather-down cushions, kiln-dried hardwood", dimensions: "W 232 · D 98 · H 82 cm", description: "Generous, low and endlessly sink-in-able. Linden's rounded arms and feather-wrapped cushions make it the natural centre of a room — the place everyone drifts back to." },
  { slug: "alden-sideboard", title: "Alden Sideboard", tagline: "Natural character", category: "storage", price: 2950, images: img("photo-1595428774223-ef52624120d2", "photo-1524758631624-e2822e304c36", "photo-1616137466211-f939a420be84"), colours: ["#8a6a49", "#c9bda6"], materials: "Solid walnut, brushed-brass hardware", dimensions: "W 180 · D 45 · H 72 cm", description: "Storage with presence. Alden's fluted walnut doors and slim brass pulls hide generous space within — grain matched by hand so each piece carries its own signature." },
  { slug: "noa-armchair", title: "Noa Armchair", tagline: "Softly grounded", category: "seating", price: 1650, isNewArrival: true, images: img("photo-1584622650111-993a426fbf0a", "photo-1615874959474-d609969a20ed"), colours: ["#e8e2d6", "#a89a84"], materials: "Brushed cotton weave, powder-coated steel", dimensions: "W 72 · D 76 · H 78 cm", description: "A rounded, welcoming form on a fine tapered base. Noa is light enough to move with the seasons, substantial enough to anchor a reading corner for years." },
  { slug: "sol-dining-table", title: "Sol Dining Table", tagline: "Gather, slowly", category: "tables", price: 2780, images: img("photo-1617806118233-18e1de247200", "photo-1600210492486-724fe5c67fb0"), colours: ["#b79a76", "#e5ddcd"], materials: "Solid oak, hand-oiled finish", dimensions: "L 220 · W 100 · H 75 cm", description: "Built around long lunches and longer conversations. A single plank-matched oak top rests on soft cylindrical legs — honest, tactile and made to be marked by a life well lived." },
  { slug: "mira-floor-lamp", title: "Mira Floor Lamp", tagline: "Warm, low light", category: "lighting", price: 640, images: img("photo-1524758870432-af57e54afa26", "photo-1567538096630-e0c55bd6374c"), colours: ["#d9cdb6", "#3f4130"], materials: "Linen shade, oak stem, cast base", dimensions: "Ø 40 · H 150 cm", description: "A pool of soft, diffuse light to close the day by. Mira's hand-rolled linen shade warms every room it stands in — the last light you turn off at night." },
  { slug: "elin-coffee-table", title: "Elin Coffee Table", tagline: "Quiet centrepiece", category: "tables", price: 980, images: img("photo-1533090161767-e6ffed986c88", "photo-1594026112284-02bb6f3352fe"), colours: ["#c9bda6", "#8f8574"], materials: "Honed travertine, oak plinth", dimensions: "Ø 90 · H 32 cm", description: "A rounded travertine top on a low oak plinth. Elin grounds a seating group without ever asking for attention — stone that softens the more you live with it." },
  { slug: "faro-bookshelf", title: "Faro Bookshelf", tagline: "Considered storage", category: "storage", price: 2200, images: img("photo-1616594039964-ae9021a400a0", "photo-1522708323590-d24dbb6b0267"), colours: ["#b79a76", "#e5ddcd"], materials: "Solid ash, adjustable shelving", dimensions: "W 120 · D 38 · H 190 cm", description: "An open ash frame for the things you return to. Faro's adjustable shelves keep books, objects and quiet spaces in easy balance." },
  { slug: "otto-pouf", title: "Otto Pouf", tagline: "Softly versatile", category: "accents", price: 420, images: img("photo-1583847268964-b28dc8f51f92", "photo-1560448204-e02f11c3d0e2"), colours: ["#e8e2d6", "#a6795a", "#6f675c"], materials: "Wool-blend upholstery, feather fill", dimensions: "Ø 55 · H 40 cm", description: "Extra seat, footrest, or side perch — Otto goes wherever the evening needs it. A tactile wool shell over a soft, resilient fill." },
  { slug: "luna-pendant", title: "Luna Pendant", tagline: "Sculptural glow", category: "lighting", price: 780, isNewArrival: true, images: img("photo-1513694203232-719a280e022f", "photo-1531835551805-16d864c8d311"), colours: ["#f0ead9", "#d9cdb6"], materials: "Rice-paper shade, brass fitting", dimensions: "Ø 55 · H 40 cm", description: "A softly glowing paper moon for above the table. Luna casts a warm, even light and a gentle shadow — quiet drama, gently done." },
  { slug: "elmwood-bench", title: "Elmwood Bench", tagline: "Honest simplicity", category: "seating", price: 890, images: img("photo-1598300042247-d088f8ab3a91", "photo-1631049307264-da0ec9d70304"), colours: ["#b79a76", "#8a6a49"], materials: "Solid elm, mortise-and-tenon joinery", dimensions: "L 140 · W 35 · H 45 cm", description: "A single, beautiful plank on hand-cut joinery. Elmwood works at the foot of a bed, along a hallway, or wherever a room needs a calm horizontal line." },
  { slug: "terra-vase", title: "Terra Vase", tagline: "Handmade warmth", category: "accents", price: 180, images: img("photo-1631049035182-249067d7618e", "photo-1615529182904-14819c35db37"), colours: ["#a6795a", "#c9bda6"], materials: "Hand-thrown stoneware, matte glaze", dimensions: "Ø 22 · H 34 cm", description: "Thrown by hand and finished in a soft matte glaze, Terra brings a quiet, earthen warmth to a shelf or table — beautiful full, empty, or holding a single branch." },
];

/* ── Projects ────────────────────────────────────────────────────────── */
const PROJECTS = [
  { slug: "modern-living-room-bashundhara", title: "Modern Living Room Design in Bashundhara R/A, Dhaka", category: "living-room", area: "2100 ft²", location: "Bashundhara R/A, Dhaka", year: "2025", duration: "9 weeks", cover: { url: U("photo-1618221195710-dd6b41faaea6", 1200) }, gallery: img("photo-1618221195710-dd6b41faaea6", "photo-1616486338812-3dadae4b4ace", "photo-1555041469-a586c61ea9bc", "photo-1550581190-9c1c48d21d6c"), overview: "A calm, contemporary living room for a young family — warm neutrals, a full-height TV feature wall, cove lighting and a bespoke media unit that keeps everyday clutter out of sight.", scope: ["Full-height TV feature wall with fluted panelling", "False ceiling with cove & spot lighting", "Custom low media console in oak veneer", "Layered lighting scheme", "Soft furnishing & styling"] },
  { slug: "luxury-master-bedroom-dhanmondi", title: "Luxury Master Bedroom Design in Dhanmondi-10A, Dhaka", category: "bedroom", area: "3600 ft²", location: "Dhanmondi-10A, Dhaka", year: "2025", duration: "12 weeks", cover: { url: U("photo-1540574163026-643ea20ade25", 1200) }, gallery: img("photo-1540574163026-643ea20ade25", "photo-1586023492125-27b2c045efd7", "photo-1616627561950-9f746e330187", "photo-1584622650111-993a426fbf0a"), overview: "An opulent master suite with an upholstered headboard wall, concealed wardrobe, and a soft gold-and-cream palette designed for rest and quiet luxury.", scope: ["Upholstered headboard feature wall", "Full wall-to-wall wardrobe with glass shutters", "Ambient & task lighting", "Dressing unit with backlit mirror", "Premium drapery & bedding"] },
  { slug: "modern-dining-area-bashundhara", title: "Modern Dining Area Design in Bashundhara R/A, Dhaka", category: "dining-room", area: "2100 ft²", location: "Bashundhara R/A, Dhaka", year: "2024", duration: "7 weeks", cover: { url: U("photo-1617806118233-18e1de247200", 1200) }, gallery: img("photo-1617806118233-18e1de247200", "photo-1449247709967-d4461a6a6103", "photo-1600210492486-724fe5c67fb0", "photo-1522708323590-d24dbb6b0267"), overview: "A refined dining space anchored by a statement chandelier and a crockery display wall — built for long family dinners with easy, everyday elegance.", scope: ["Crockery & display cabinetry", "Statement pendant lighting", "Accent panelling with mirror inlay", "8-seat dining configuration", "Ceiling & cove detailing"] },
  { slug: "modern-living-room-keraniganj", title: "Modern Living Room Design in Keraniganj, Dhaka", category: "living-room", area: "4500 ft²", location: "Keraniganj, Dhaka", year: "2024", duration: "10 weeks", cover: { url: U("photo-1616486338812-3dadae4b4ace", 1200) }, gallery: img("photo-1616486338812-3dadae4b4ace", "photo-1615874959474-d609969a20ed", "photo-1503602642458-232111445657", "photo-1519710164239-da123dc03ef4"), overview: "A spacious formal living room with a grand feature wall, sculptural chandelier and a warm grey-and-gold scheme — grand in scale, calm in character.", scope: ["Grid-panelled feature wall with sconces", "Sculptural chandelier", "Floating media & display unit", "Layered ceiling with gold trims", "Custom rug & seating layout"] },
  { slug: "contemporary-kitchen-gulshan", title: "Contemporary Kitchen Design in Gulshan-2, Dhaka", category: "kitchen", area: "1800 ft²", location: "Gulshan-2, Dhaka", year: "2025", duration: "8 weeks", cover: { url: U("photo-1556228453-efd6c1ff04f6", 1200) }, gallery: img("photo-1556228453-efd6c1ff04f6", "photo-1600607687939-ce8a6c25118c", "photo-1600585154340-be6161a56a0c", "photo-1616137466211-f939a420be84"), overview: "A functional, handleless modular kitchen with a breakfast island, tall pantry units and quartz worktops — designed around real cooking and easy upkeep.", scope: ["Handleless modular cabinetry", "Breakfast island with seating", "Tall pantry & appliance towers", "Quartz worktop & backsplash", "Under-cabinet task lighting"] },
  { slug: "serene-guest-bedroom-uttara", title: "Serene Guest Bedroom Design in Uttara Sector 7, Dhaka", category: "bedroom", area: "1600 ft²", location: "Uttara Sector 7, Dhaka", year: "2024", duration: "6 weeks", cover: { url: U("photo-1616627561950-9f746e330187", 1200) }, gallery: img("photo-1616627561950-9f746e330187", "photo-1615529182904-14819c35db37", "photo-1584622650111-993a426fbf0a", "photo-1618220179428-22790b461013"), overview: "A restful guest bedroom in soft earth tones with a slatted headboard wall, compact study nook and warm, low lighting.", scope: ["Slatted timber headboard wall", "Compact study & reading nook", "Two-door wardrobe", "Warm ambient lighting", "Textured soft furnishings"] },
  { slug: "walk-in-closet-banani", title: "Walk-in Closet & Wardrobe Design in Banani, Dhaka", category: "closet", area: "1500 ft²", location: "Banani, Dhaka", year: "2025", duration: "5 weeks", cover: { url: U("photo-1616137466211-f939a420be84", 1200) }, gallery: img("photo-1616137466211-f939a420be84", "photo-1616594039964-ae9021a400a0", "photo-1522708323590-d24dbb6b0267", "photo-1631049035182-249067d7618e"), overview: "A boutique-style walk-in closet with open hanging, glass-front drawers, a central island and backlit shelving — luxury organisation, beautifully lit.", scope: ["Open & concealed hanging zones", "Glass-front drawer units", "Central dresser island", "Backlit display shelving", "Full-height mirror"] },
  { slug: "family-common-area-mirpur", title: "Family Common Area Design in Mirpur DOHS, Dhaka", category: "common-area", area: "2800 ft²", location: "Mirpur DOHS, Dhaka", year: "2024", duration: "9 weeks", cover: { url: U("photo-1524758631624-e2822e304c36", 1200) }, gallery: img("photo-1524758631624-e2822e304c36", "photo-1538688525198-9b88f6f53126", "photo-1567538096630-e0c55bd6374c", "photo-1594026112284-02bb6f3352fe"), overview: "A multi-use family lounge connecting living and dining — flexible seating, a feature bookshelf and warm layered lighting for everyday togetherness.", scope: ["Feature bookshelf & storage wall", "Flexible lounge seating", "Connected living–dining layout", "Layered lighting design", "Custom joinery & styling"] },
  { slug: "full-luxury-apartment-gulshan", title: "Full Luxury Apartment Interior in Gulshan-1, Dhaka", category: "luxury", area: "4200 ft²", location: "Gulshan-1, Dhaka", year: "2025", duration: "16 weeks", cover: { url: U("photo-1586023492125-27b2c045efd7", 1200) }, gallery: img("photo-1586023492125-27b2c045efd7", "photo-1618221195710-dd6b41faaea6", "photo-1540574163026-643ea20ade25", "photo-1617806118233-18e1de247200"), overview: "A complete turnkey interior across a 4,200 ft² apartment — a cohesive luxury language of marble, brass and warm oak carried from the foyer to every private room.", scope: ["Turnkey design across all rooms", "Marble & brass detailing", "Custom joinery throughout", "Integrated smart lighting", "Full furnishing & art curation"] },
  { slug: "minimal-modern-studio-bashundhara", title: "Minimal Modern Studio Design in Bashundhara R/A, Dhaka", category: "modern", area: "1200 ft²", location: "Bashundhara R/A, Dhaka", year: "2024", duration: "5 weeks", cover: { url: U("photo-1493809842364-78817add7ffb", 1200) }, gallery: img("photo-1493809842364-78817add7ffb", "photo-1533090161767-e6ffed986c88", "photo-1524758870432-af57e54afa26", "photo-1560448204-e02f11c3d0e2"), overview: "A compact modern studio that does more with less — a multifunctional wall unit, hidden storage and a bright, uncluttered material palette.", scope: ["Multifunctional wall unit", "Concealed storage solutions", "Space-saving furniture layout", "Bright minimal palette", "Integrated lighting"] },
];

/* ── Services ────────────────────────────────────────────────────────── */
const SERVICES = [
  { slug: "home-interior-design", name: "Home Interior Design", tagline: "Complete turnkey homes", summary: "End-to-end interior design for apartments, flats and houses — one team, from first sketch to final handover.", intro: "A single, coherent design language carried through every room of your home. We handle space planning, materials, joinery, lighting and styling so the whole space feels considered and complete.", image: { url: U("photo-1618221195710-dd6b41faaea6", 1200) }, includes: ["Full space planning & 3D visualisation", "Material & finish selection", "Custom joinery throughout", "Lighting & electrical layout", "Furnishing, styling & handover"] },
  { slug: "bedroom-interior-design", name: "Bedroom Interior Design", tagline: "Master, kids & guest rooms", summary: "Restful bedrooms with smart storage, headboard features and warm, low lighting tailored to how you sleep and live.", intro: "From master suites to kids' and guest rooms — bedrooms designed for rest, with generous storage and a calm, tactile material palette.", image: { url: U("photo-1540574163026-643ea20ade25", 1200) }, includes: ["Headboard & feature wall design", "Wardrobe & concealed storage", "Dressing & study zones", "Ambient & task lighting", "Drapery & soft furnishings"] },
  { slug: "living-room-design", name: "Living Room Design", tagline: "The heart of the home", summary: "Living rooms planned around real life — layouts, feature walls, media units and layered lighting that bring a room together.", intro: "The room everyone gathers in. We plan the layout, design the feature wall and media unit, and layer the lighting so it works for quiet evenings and full houses alike.", image: { url: U("photo-1616486338812-3dadae4b4ace", 1200) }, includes: ["TV / feature wall design", "Media & display joinery", "Seating layout planning", "False ceiling & cove lighting", "Rug, art & styling"] },
  { slug: "dining-room-design", name: "Dining Room Design", tagline: "Made for gathering", summary: "Coordinated dining spaces with custom crockery cabinetry, statement lighting and seating built for long meals.", intro: "Dining rooms designed for lingering — crockery display cabinetry, a statement pendant and a table setting that invites long, slow meals.", image: { url: U("photo-1617806118233-18e1de247200", 1200) }, includes: ["Crockery & display cabinetry", "Statement pendant lighting", "Accent wall panelling", "Seating configuration", "Ceiling detailing"] },
  { slug: "modular-kitchen-design", name: "Modular Kitchen Design", tagline: "Modern & handleless", summary: "Sleek modular kitchens with integrated appliances, tall pantry units and hard-wearing worktops built around real cooking.", intro: "Efficient, beautiful modular kitchens with handleless cabinetry, integrated appliances and durable worktops — planned around the way you actually cook.", image: { url: U("photo-1556228453-efd6c1ff04f6", 1200) }, includes: ["Handleless modular cabinetry", "Integrated appliance planning", "Tall pantry & storage towers", "Quartz / stone worktops", "Task & under-cabinet lighting"] },
  { slug: "open-kitchen-design", name: "Open Kitchen Design", tagline: "Cook, connected", summary: "Open-concept kitchens that flow into living areas — breakfast islands, smart zoning and seamless materials.", intro: "Open kitchens that connect to the living space without losing function — an island to gather around, clever zoning and a material palette that ties the two rooms together.", image: { url: U("photo-1600607687939-ce8a6c25118c", 1200) }, includes: ["Breakfast island with seating", "Open-plan zoning", "Continuous material palette", "Concealed storage", "Layered lighting"] },
  { slug: "traditional-kitchen-design", name: "Traditional Kitchen Design", tagline: "Classic & warm", summary: "Timeless kitchens with shaker cabinetry, warm timber and classic detailing for a homely, enduring feel.", intro: "Warm, classic kitchens with shaker-style cabinetry and natural timber — timeless detailing that never dates.", image: { url: U("photo-1600585154340-be6161a56a0c", 1200) }, includes: ["Shaker-style cabinetry", "Natural timber finishes", "Classic hardware & detailing", "Larder & pantry storage", "Warm ambient lighting"] },
  { slug: "bathroom-design", name: "Bathroom Design", tagline: "Calm & considered", summary: "Spa-like bathrooms with coordinated fixtures, honed stone finishes and clever, clutter-free storage.", intro: "Bathrooms designed as a retreat — coordinated fixtures, natural stone and tile, and concealed storage that keeps everything calm and clutter-free.", image: { url: U("photo-1600210492486-724fe5c67fb0", 1200) }, includes: ["Fixture & sanitaryware selection", "Tile & stone finishes", "Vanity & storage joinery", "Waterproofing & MEP coordination", "Lighting & mirror design"] },
  { slug: "common-space-design", name: "Common Space Design", tagline: "Flexible shared zones", summary: "Formal sitting rooms and multi-use common areas designed to flex between family time and entertaining.", intro: "Shared spaces that adapt — formal sitting rooms, family lounges and multi-use zones that move easily between quiet days and busy gatherings.", image: { url: U("photo-1524758631624-e2822e304c36", 1200) }, includes: ["Flexible seating layouts", "Feature storage walls", "Connected living–dining flow", "Layered lighting", "Custom joinery & styling"] },
  { slug: "custom-furniture-design", name: "Custom Furniture Design", tagline: "Made to measure", summary: "Bespoke wardrobes, cabinetry and furniture, designed for your space and built in our own workshop.", intro: "Furniture made to fit your space exactly — wardrobes, cabinetry and standalone pieces, designed with you and crafted in our own workshop.", image: { url: U("photo-1595428774223-ef52624120d2", 1200) }, includes: ["Bespoke wardrobes & cabinetry", "Standalone furniture pieces", "Material & finish sampling", "In-house manufacturing", "Precise on-site fitting"] },
  { slug: "landscape-design", name: "Landscape Design", tagline: "Outdoor living", summary: "Balconies, terraces and gardens planned as living spaces — greenery, seating and warm outdoor lighting.", intro: "Outdoor spaces designed to be lived in — balconies, terraces and gardens with considered planting, comfortable seating and soft evening light.", image: { url: U("photo-1512212621149-107ffe572d2f", 1200) }, includes: ["Planting & greenery scheme", "Terrace / balcony seating", "Decking & surface finishes", "Outdoor lighting", "Weatherproof materials"] },
];

/* ── Posts ───────────────────────────────────────────────────────────── */
const POSTS = [
  { slug: "warm-minimalism-guide", title: "Warm minimalism: less clutter, more feeling", excerpt: "How to strip a room back without making it feel cold — the case for warm materials, soft light and a considered palette.", category: "Design Notes", date: "2026-08-14", author: "Velor Studio", readingTime: "5 min read", cover: { url: U("photo-1493809842364-78817add7ffb", 1400) }, body: ["Minimalism gets a bad name when it tips into the clinical — bare walls, hard edges and nothing to hold onto. Warm minimalism is different. It keeps the calm of an uncluttered room but brings back the feeling through material, texture and light.", "Start with a narrow, warm palette: creams, oatmeal, soft clay and the honey of natural oak. When everything sits within a few close tones, the eye relaxes and the room feels whole.", "Then layer texture instead of colour — bouclé against smooth plaster, linen against oiled timber, honed stone against wool. The interest comes from how surfaces feel, not from visual noise.", "Finally, light it low and in layers. A single bright ceiling light flattens a room; several warm, low sources give it depth and make even a spare space feel generous."] },
  { slug: "choosing-the-right-sofa", title: "Choosing a sofa you'll still love in ten years", excerpt: "Frame, fill and fabric — the three things that decide whether a sofa lasts a decade or sags in a season.", category: "Buying Guide", date: "2026-07-30", author: "Velor Studio", readingTime: "6 min read", cover: { url: U("photo-1493663284031-b7e3aefcae8e", 1400) }, body: ["A sofa is one of the few pieces you touch every single day, so it repays getting right. Three things decide how well it ages: the frame, the fill and the fabric.", "The frame is everything. Look for kiln-dried hardwood, joined and glued rather than stapled. It's hidden, but it's the difference between a sofa that holds its shape for years and one that loosens in months.", "For the fill, feather-wrapped foam gives the best balance — the plushness of down with the support of a foam core. Pure foam is firmer and lower-maintenance; pure down is luxurious but needs regular plumping.", "Fabric is where comfort meets real life. Performance weaves and tight bouclés wear beautifully and clean easily. If you have children or pets, choose a removable, washable cover."] },
  { slug: "small-apartment-storage", title: "Smart storage ideas for a small Dhaka apartment", excerpt: "Ten ways to build in storage that disappears — so a compact flat feels open, calm and twice its size.", category: "Ideas", date: "2026-07-11", author: "Velor Studio", readingTime: "4 min read", cover: { url: U("photo-1533090161767-e6ffed986c88", 1400) }, body: ["In a compact apartment, storage is the difference between calm and chaos — but bulky cabinets can make small rooms feel smaller. The trick is to build storage in, so it disappears into the architecture.", "Go full height. Wardrobes and units that run floor to ceiling use otherwise-wasted space and draw the eye up, making the room feel taller.", "Use the in-between spaces — under beds, over doors, the sides of a kitchen island. A little bespoke joinery in these gaps adds up to a lot of hidden storage.", "And keep the fronts calm: handleless, in the same tone as the wall, so storage recedes and the room stays open and quiet."] },
  { slug: "lighting-layers-explained", title: "The three layers of light every room needs", excerpt: "Ambient, task and accent — get the mix right and any room can shift from bright and busy to soft and restful.", category: "Design Notes", date: "2026-06-22", author: "Velor Studio", readingTime: "5 min read", cover: { url: U("photo-1524758870432-af57e54afa26", 1400) }, body: ["Good lighting is rarely one bright light — it's several, working together. Think in three layers: ambient, task and accent.", "Ambient is your base wash of light — cove lighting, downlights or a soft ceiling fixture. It should be gentle and, ideally, dimmable.", "Task light is focused where you do things — reading, cooking, working. A floor lamp beside a chair or under-cabinet strips in a kitchen.", "Accent light adds mood and drama — a wall light grazing a textured surface, a picture light, a low table lamp. Together, these layers let one room feel completely different at breakfast and at midnight."] },
];

/* ── Testimonials / FAQs / Rooms / Spaces ────────────────────────────── */
const TESTIMONIALS = [
  { name: "Farhana Rahman", role: "Apartment · Bashundhara R/A", quote: "They understood exactly the calm, warm home we wanted. Every deadline was met and the finish quality is genuinely beautiful.", avatar: { url: U("photo-1556228453-efd6c1ff04f6", 200) } },
  { name: "Tanvir Ahmed", role: "Duplex · Gulshan-1", quote: "From the 3D visuals to the final handover, nothing was left to guesswork. The itemised pricing built real trust.", avatar: { url: U("photo-1584622650111-993a426fbf0a", 200) } },
  { name: "Nusrat Jahan", role: "Master bedroom · Dhanmondi", quote: "The custom wardrobe and headboard wall completely transformed the room. It feels like a five-star hotel suite.", avatar: { url: U("photo-1554995207-c18c203602cb", 200) } },
];

const FAQS = [
  { q: "How does a project start?", a: "It begins with a free consultation — in person or online. We talk through your taste, needs and budget, then arrange a site survey to measure and assess the space." },
  { q: "How long does an interior project take?", a: "Most single rooms take 5–8 weeks; full apartments run 10–16 weeks depending on scope. We agree a schedule up front and manage it end to end." },
  { q: "How is pricing worked out?", a: "Every quotation is fully itemised — you see the cost of each element, from joinery to lighting, with no hidden charges." },
  { q: "Do you make the furniture yourselves?", a: "Yes. We run our own furniture workshop, which gives us tight quality control, better pricing and a direct line from design to production." },
  { q: "Can I see the design before work begins?", a: "Always. We produce photoreal 3D visualisations so you can walk through the space and approve every detail before anything is built." },
  { q: "Which areas do you serve?", a: "We work across Bangladesh — Dhaka, Chattogram, Sylhet, Khulna, Rajshahi, Barishal, Rangpur and Mymensingh." },
  { q: "Do you handle small or single-room projects?", a: "Yes — from a single bedroom or kitchen to a complete home. The same process and care applies at every scale." },
  { q: "What about after handover?", a: "We stand behind our work with a service warranty and are only a call away for any adjustments after you move in." },
];

const ROOMS = [
  { name: "Living", image: { url: U("photo-1550581190-9c1c48d21d6c", 1000) }, href: "/collection?room=living" },
  { name: "Dining", image: { url: U("photo-1617806118233-18e1de247200", 1000) }, href: "/collection?room=dining" },
  { name: "Bedroom", image: { url: U("photo-1540574163026-643ea20ade25", 1000) }, href: "/collection?room=bedroom" },
  { name: "Workspace", image: { url: U("photo-1524758870432-af57e54afa26", 1000) }, href: "/collection?room=workspace" },
];

const SPACES = [
  { title: "The Quiet Apartment", location: "Copenhagen, DK", blurb: "A pared-back city home where every object earns its place — warm neutrals, honest oak and light that moves through the day.", image: { url: U("photo-1586023492125-27b2c045efd7") }, tall: true },
  { title: "Slow Mornings", location: "Lisbon, PT", blurb: "A sunlit breakfast nook built around bouclé and stone.", image: { url: U("photo-1493809842364-78817add7ffb") }, tall: false },
  { title: "The Long Table", location: "Provence, FR", blurb: "A dining room made for lingering — solid oak, soft linen, low light.", image: { url: U("photo-1449247709967-d4461a6a6103") }, tall: false },
  { title: "Reading Corner", location: "London, UK", blurb: "A single armchair, a floor lamp and a view — proof that a room needs very little to feel complete.", image: { url: U("photo-1519710164239-da123dc03ef4") }, tall: true },
  { title: "Coastal Calm", location: "Byron Bay, AU", blurb: "Bleached timber and off-white linen, opened to the sea air.", image: { url: U("photo-1512212621149-107ffe572d2f") }, tall: false },
  { title: "The Warm Studio", location: "Kyoto, JP", blurb: "A maker's space where craft and calm live side by side.", image: { url: U("photo-1554995207-c18c203602cb") }, tall: false },
];

/* ── Settings (singleton) ────────────────────────────────────────────── */
const SETTING = {
  key: "site",
  company: {
    founded: "2014",
    stats: [
      { value: "500+", label: "Projects delivered" },
      { value: "10+", label: "Years of craft" },
      { value: "50+", label: "In-house makers" },
      { value: "8", label: "Cities served" },
    ],
    contact: {
      office: "House 127 (2nd floor), Road 05, Mohakhali New DOHS, Dhaka 1206",
      factory: "1920 Koborsthan Road, East Badda, Dhaka 1212",
      phones: ["+880 1633 033033", "+880 1971 968888"],
      email: "hello@velor.studio",
      hours: "Sat–Thu, 10:00 – 19:00",
      cities: ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"],
    },
  },
  productCategories: [
    { slug: "seating", name: "Seating" },
    { slug: "sofas", name: "Sofas" },
    { slug: "tables", name: "Tables" },
    { slug: "storage", name: "Storage" },
    { slug: "lighting", name: "Lighting" },
    { slug: "accents", name: "Accents" },
  ],
  projectCategories: [
    { slug: "living-room", name: "Living Room" },
    { slug: "bedroom", name: "Bedroom" },
    { slug: "dining-room", name: "Dining Room" },
    { slug: "kitchen", name: "Kitchen" },
    { slug: "common-area", name: "Common Area" },
    { slug: "closet", name: "Closet & Wardrobe" },
    { slug: "luxury", name: "Luxury Interior" },
    { slug: "modern", name: "Modern Interior" },
  ],
  whyChoose: [
    { title: "A decade of craft", body: "More than ten years designing and building interiors — experience that shows in every detail and every deadline met." },
    { title: "Transparent pricing", body: "Clear, itemised quotations with no surprises. You always know exactly what you are paying for and why." },
    { title: "One team, end to end", body: "A single dedicated point of contact manages your project from first consultation through to final handover." },
    { title: "On-time delivery", body: "Coordinated schedules and our own production line mean we hand over when we say we will." },
    { title: "In-house workshop", body: "Our own furniture factory connects design to production — better quality control, better prices, fewer middlemen." },
  ],
  process: [
    { step: "01", title: "Free consultation", body: "We start by listening — your taste, how you live, and what the space needs to do." },
    { step: "02", title: "Site survey", body: "A detailed measure and assessment of your space, light and existing conditions." },
    { step: "03", title: "Concept & 3D", body: "Layouts, materials and photoreal 3D visuals so you can see the space before we build it." },
    { step: "04", title: "Approval & quote", body: "We refine the design together and lock in a clear, itemised quotation." },
    { step: "05", title: "Execution", body: "Manufacturing in our workshop and coordinated on-site work, managed end to end." },
    { step: "06", title: "Handover", body: "A final walkthrough, styling and the keys to a space that's ready to live in." },
  ],
  hotspot: {
    eyebrow: "Explore the space",
    title: "Every detail, thoughtfully placed.",
    intro: "Move across the room to see how each element comes together — the materials, the light and the pieces that make a space feel considered. Tap a point to explore.",
    image: { url: U("photo-1616486338812-3dadae4b4ace", 1800) },
    points: [
      { x: 50, y: 20, title: "Layered lighting", body: "Cove, spot and pendant lighting combined for a warm, adjustable glow at every hour of the day." },
      { x: 26, y: 60, title: "Bouclé lounge seating", body: "Sculptural, deep-seated comfort in a soft, hard-wearing bouclé weave." },
      { x: 74, y: 52, title: "Fluted feature wall", body: "Hand-finished oak fluting adds quiet texture and depth behind the seating." },
      { x: 55, y: 84, title: "Warm oak flooring", body: "Wide-plank engineered oak, oiled by hand to age beautifully underfoot." },
    ],
  },
  spacesImage: { url: U("photo-1617806118233-18e1de247200") },
};

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("FATAL: MONGODB_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected — seeding…");

  await Promise.all([
    Banner.deleteMany({}),
    Product.deleteMany({}),
    Project.deleteMany({}),
    Service.deleteMany({}),
    Post.deleteMany({}),
    Testimonial.deleteMany({}),
    Faq.deleteMany({}),
    Room.deleteMany({}),
    Space.deleteMany({}),
    Setting.deleteMany({}),
    // NOTE: Admin is intentionally NOT wiped here — re-running the content
    // seed must never reset a password an admin has since changed.
  ]);

  await Promise.all([
    Banner.insertMany(withOrder(BANNERS)),
    Product.insertMany(withOrder(PRODUCTS)),
    Project.insertMany(withOrder(PROJECTS)),
    Service.insertMany(withOrder(SERVICES)),
    Post.insertMany(withOrder(POSTS)),
    Testimonial.insertMany(withOrder(TESTIMONIALS)),
    Faq.insertMany(withOrder(FAQS)),
    Room.insertMany(withOrder(ROOMS)),
    Space.insertMany(withOrder(SPACES)),
    Setting.create(SETTING),
  ]);

  // Seed the admin account only if none exists yet, so reseeding content
  // never resets a password already changed via the dashboard.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@velor.studio").toLowerCase();
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "changeme", 10);
    await Admin.create({ email: adminEmail, passwordHash, name: "Velor Admin", role: "admin" });
    console.log(`Admin account created: ${adminEmail}`);
  } else {
    // Migration: accounts created before the `role` field existed have none
    // stored — make sure the primary seeded account is always "admin".
    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`Admin account role backfilled to "admin": ${adminEmail}`);
    } else {
      console.log(`Admin account already exists: ${adminEmail}`);
    }
  }

  const counts = {
    banners: BANNERS.length,
    products: PRODUCTS.length,
    projects: PROJECTS.length,
    services: SERVICES.length,
    posts: POSTS.length,
    testimonials: TESTIMONIALS.length,
    faqs: FAQS.length,
    rooms: ROOMS.length,
    spaces: SPACES.length,
    settings: 1,
  };
  console.log("Seeded:", counts);
  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
