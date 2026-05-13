const fs = require("fs");
const path = require("path");

const MUSCLE_KEYWORDS = [
  "calves", "glutes", "hamstrings", "hips", "lower back", "shoulders",
  "spine", "upper back", "groin", "core", "neck", "arms", "quadriceps",
  "chest", "abs", "obliques", "triceps", "biceps", "forearms", "wrists",
  "ankles", "feet", "adductors", "abductors", "lats", "traps", "psoas",
  "shins", "knees", "toes", "fingers", "hands", "it band",
];

function decodeHtml(str) {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

function isMuscleList(text) {
  const lower = text.toLowerCase();
  const parts = lower.split(",").map((s) => s.trim());
  if (parts.length < 2) return false;
  const matches = parts.filter((p) =>
    MUSCLE_KEYWORDS.some((m) => p.includes(m))
  );
  return matches.length >= 2;
}

function extractImageUrl(imgTag) {
  // Look for url parameter in src or srcSet
  const urlMatch = imgTag.match(/url=([^&"]+)/);
  if (!urlMatch) return null;
  try {
    return decodeURIComponent(urlMatch[1]);
  } catch {
    return null;
  }
}

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function getRoutineUrls() {
  const html = await fetchHtml("https://bend.com/routines");
  const matches = html.matchAll(/href="(\/routines\/[^"]+)"/g);
  const urls = [...new Set([...matches].map((m) => m[1]))].filter(
    (u) => u !== "/routines" && !u.includes("\\")
  );
  return urls;
}

function parseRoutine(html) {
  const exercises = [];

  // Extract exercise images and names from img tags
  const imgMatches = [...html.matchAll(/<img[^>]*alt="([^"]*)"[^>]*>/g)];
  const exerciseMap = new Map(); // name -> imageUrl

  for (const match of imgMatches) {
    const fullTag = match[0];
    const alt = decodeHtml(match[1]).trim();
    if (!alt || alt === "Bend") continue;
    if (alt.toLowerCase().includes("demonstration")) continue;
    if (alt.toLowerCase().includes("exercise")) continue;

    const imgUrl = extractImageUrl(fullTag);
    if (!imgUrl) continue;

    // Keep the first (thumbnail) image found for each exercise
    if (!exerciseMap.has(alt)) {
      exerciseMap.set(alt, imgUrl);
    }
  }

  // Extract all text-neutral-700 paragraphs
  const paraMatches = [...html.matchAll(/<p[^>]*text-neutral-700[^>]*>([^<]+)<\/p>/g)];
  const paragraphs = paraMatches.map((m) => m[1].trim()).filter((t) => t.length > 3);

  // Split paragraphs into groups using muscle lists as delimiters
  let currentGroup = [];
  const groups = [];

  for (const para of paragraphs) {
    currentGroup.push(para);
    if (isMuscleList(para)) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
  }
  if (currentGroup.length > 0 && groups.length > 0) {
    groups[groups.length - 1].push(...currentGroup);
  }

  // Get exercise names in order from the img tags (non-demonstration)
  const names = [...exerciseMap.keys()];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const imageUrl = exerciseMap.get(name);
    const group = groups[i] || [];
    const muscleLine = group.find((p) => isMuscleList(p));
    const muscles = muscleLine
      ? muscleLine.split(",").map((s) => s.trim().toLowerCase())
      : [];

    const instructions = group.filter(
      (p) => !isMuscleList(p) && p.length > 10
    );

    const slug = slugify(name);
    exercises.push({
      id: slug,
      title: name,
      type: "stretch",
      duration: 60,
      image: `/illustrations/${slug}.png`,
      imageUrl,
      muscles,
      difficulty: "beginner",
      instructions: instructions.slice(0, 6),
    });
  }

  return exercises;
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Fetching routine URLs...");
  const urls = await getRoutineUrls();
  console.log(`Found ${urls.length} routines`);

  const allExercises = [];

  for (const url of urls) {
    try {
      console.log(`Fetching ${url}...`);
      const html = await fetchHtml(`https://bend.com${url}`);
      const exercises = parseRoutine(html);
      console.log(`  -> ${exercises.length} exercises`);
      allExercises.push(...exercises);
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`  -> ERROR: ${err.message}`);
    }
  }

  // Deduplicate by title
  const seen = new Map();
  for (const ex of allExercises) {
    const key = ex.title.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, ex);
    }
  }
  const unique = [...seen.values()];
  console.log(`\nTotal unique exercises: ${unique.length}`);

  // Clean up old illustrations
  const illusDir = path.join(__dirname, "..", "public", "illustrations");
  if (fs.existsSync(illusDir)) {
    const oldFiles = fs.readdirSync(illusDir);
    for (const f of oldFiles) {
      fs.unlinkSync(path.join(illusDir, f));
    }
  } else {
    fs.mkdirSync(illusDir, { recursive: true });
  }

  // Download images
  let downloaded = 0;
  for (const ex of unique) {
    const destPath = path.join(__dirname, "..", "public", ex.image);
    const success = await downloadImage(ex.imageUrl, destPath);
    if (success) {
      downloaded++;
    } else {
      console.warn(`  Failed to download image for ${ex.title}`);
    }
    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log(`Downloaded ${downloaded} images`);

  // Remove imageUrl from final JSON
  const finalJson = unique.map((ex) => {
    const { imageUrl, ...rest } = ex;
    // Clean up ID
    rest.id = rest.id.replace(/_+/g, "_").replace(/(^_|_$)/g, "");
    rest.image = rest.image.replace(/_+/g, "_").replace(/(\/[^/]+)_$/, "$1");
    rest.instructions = rest.instructions.length > 0 ? rest.instructions : [
      "Hold the stretch for 60 seconds",
      "Breathe deeply and relax into the position",
      "Keep your core engaged and maintain good posture",
      "Do not bounce; ease into the stretch gradually"
    ];
    return rest;
  });

  // Write JSON
  const jsonPath = path.join(__dirname, "..", "data", "exercises.json");
  fs.writeFileSync(jsonPath, JSON.stringify(finalJson, null, 2));
  console.log(`Written ${jsonPath}`);
}

main().catch(console.error);
