import express from "express";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const app = express();

// IMPORTANT: set this env var in your AI builder / hosting platform
// Example: SKETCHFAB_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
const TOKEN = process.env.SKETCHFAB_TOKEN;

const PORT = Number(process.env.PORT || 5178);
const __dirnameResolved = path.resolve();
const PUBLIC_DIR = path.join(__dirnameResolved, "public");
const CACHE_DIR = path.join(__dirnameResolved, "cache");

if (!TOKEN) {
  console.error("❌ Missing SKETCHFAB_TOKEN env var.");
  process.exit(1);
}

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use("/cache", express.static(CACHE_DIR));

function safeName(s) {
  return String(s).replace(/[^a-z0-9-_]/gi, "_").toLowerCase();
}

async function sketchfabFetch(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Token ${TOKEN}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sketchfab API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res;
}

// Search: downloadable models only
app.get("/api/search", async (req, res) => {
  try {
    const q = String(req.query.q || "modern kitchen").trim();
    const limit = Math.min(Number(req.query.limit || 12), 24);

    const url =
      `https://api.sketchfab.com/v3/search?type=models` +
      `&q=${encodeURIComponent(q)}` +
      `&downloadable=true` +
      `&sort_by=-relevance` +
      `&per_page=${limit}`;

    const apiRes = await sketchfabFetch(url);
    const data = await apiRes.json();

    const results = (data.results || []).map(m => ({
      uid: m.uid,
      name: m.name,
      user: m.user?.displayName || m.user?.username || "",
      thumb: m.thumbnails?.images?.slice(-1)?.[0]?.url || "",
      faceCount: m.faceCount || null
    }));

    res.json({ q, results });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Download + cache: requires glTF package containing a .glb
app.post("/api/ensure-model", async (req, res) => {
  try {
    const uid = String(req.body?.uid || "").trim();
    if (!uid) return res.status(400).json({ error: "uid is required" });

    const outName = `${safeName(uid)}.glb`;
    const glbPath = path.join(CACHE_DIR, outName);

    if (fs.existsSync(glbPath)) {
      return res.json({ uid, url: `/cache/${outName}`, cached: true });
    }

    // 1) Get download links
    const dlRes = await sketchfabFetch(`https://api.sketchfab.com/v3/models/${uid}/download`);
    const dl = await dlRes.json();

    const gltfUrl = dl?.gltf?.url;
    if (!gltfUrl) {
      return res.status(400).json({ error: "No glTF download available for this model." });
    }

    // 2) Download zip
    const zipRes = await sketchfabFetch(gltfUrl);
    const buf = Buffer.from(await zipRes.arrayBuffer());

    const zipFilePath = path.join(CACHE_DIR, `${safeName(uid)}.zip`);
    fs.writeFileSync(zipFilePath, buf);

    // 3) Extract
    const extractDir = path.join(CACHE_DIR, safeName(uid));
    if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractDir, true);

    // 4) Find .glb
    let foundGlb = null;
    const walk = dir => {
      for (const entry of fs.readdirSync(dir)) {
        const p = path.join(dir, entry);
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p);
        else if (p.toLowerCase().endsWith(".glb")) foundGlb = p;
      }
    };
    walk(extractDir);

    if (!foundGlb) {
      return res.status(400).json({
        error:
          "This download has no .glb (only .gltf + textures). Pick another downloadable model that includes a .glb."
      });
    }

    fs.copyFileSync(foundGlb, glbPath);

    // cleanup zip to save space
    try { fs.unlinkSync(zipFilePath); } catch {}

    res.json({ uid, url: `/cache/${outName}`, cached: false });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ MARACA demo: http://localhost:${PORT}`);
});