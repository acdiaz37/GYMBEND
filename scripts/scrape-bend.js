const fs = require("fs");
const path = require("path");

const MUSCLE_KEYWORDS = [
  "calves", "glutes", "hamstrings", "hips", "lower back", "shoulders",
  "spine", "upper back", "groin", "core", "neck", "arms", "quadriceps",
  "chest", "abs", "obliques", "triceps", "biceps", "forearms", "wrists",
  "ankles", "feet", "adductors", "abductors", "lats", "traps",
];

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

function isTipOrMod(text) {
  const lower = text.toLowerCase();
  const tipStarters = [
    "if you", "use a", "use your", "to deepen", "to increase",
    "keep a slight", "bend your", "place your", "try to",
    "don\'t", "avoid", "focus on", "for a deeper", "if reaching",
    "if the stretch", "use blocks", "use a strap", "you can",
  ];
  return tipStarters.some((s) => lower.startsWith(s));
}

function generateSvg(name) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    { bg: "#5ac8fa", fill: "0.2" },
    { bg: "#ff2d55", fill: "0.2" },
    { bg: "#af52de", fill: "0.2" },
    { bg: "#d4c5a9", fill: "0.2" },
    { bg: "#007aff", fill: "0.2" },
  ];
  const c = colors[name.length % colors.length];
  return `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="60" fill="${c.bg}" fill-opacity="${c.fill}"/>
  <text x="60" y="72" text-anchor="middle" font-size="36" font-weight="bold" fill="white" font-family="sans-serif">${initial}</text>
</svg>`;
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

  // Extract exercise names from breadcrumb-like spans with font-medium
  const nameMatches = [...html.matchAll(/<span[^>]*font-medium[^>]*>([^<]+)<\/span>/g)];
  const names = nameMatches.map((m) => m[1].trim()).filter((n) => n.length > 1);

  // If no names found, fallback to h3 sections
  if (names.length === 0) return exercises;

  // Extract all text-neutral-700 paragraphs
  const paraMatches = [...html.matchAll(/<p[^>]*text-neutral-700[^>]*>([^<]+)<\/p>/g)];
  const paragraphs = paraMatches.map((m) => m[1].trim()).filter((t) => t.length > 5);

  // Skip the first paragraph if it's a routine description (contains routine name or generic description)
  // The structure is: for each exercise, there are several paragraphs: instructions, tips, modifications, muscles
  // We need to split paragraphs into groups per exercise.

  // Strategy: use muscle lists as delimiters. Each exercise ends with a muscle list.
  let currentGroup = [];
  const groups = [];

  for (const para of paragraphs) {
    currentGroup.push(para);
    if (isMuscleList(para)) {
      groups.push([...currentGroup]);
      currentGroup = [];
    }
  }

  // If there are leftover paragraphs without muscle list, add them to last group or discard
  if (currentGroup.length > 0 && groups.length > 0) {
    groups[groups.length - 1].push(...currentGroup);
  }

  // Match groups to names
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const group = groups[i] || [];
    const muscleLine = group.find((p) => isMuscleList(p));
    const muscles = muscleLine
      ? muscleLine.split(",").map((s) => s.trim().toLowerCase())
      : [];

    const instructions = group.filter(
      (p) => !isMuscleList(p) && !isTipOrMod(p) && p.length > 10
    );

    // If instructions are empty but we have tips, include tips as instructions
    const finalInstructions = instructions.length > 0 ? instructions : group.filter((p) => !isMuscleList(p));

    const slug = slugify(name);
    exercises.push({
      id: slug,
      title: name,
      type: "stretch",
      duration: 60,
      image: `/illustrations/${slug}.svg`,
      muscles,
      difficulty: "beginner",
      instructions: finalInstructions.slice(0, 6), // cap to keep it minimal
    });
  }

  return exercises;
}

async function main() {
  console.log("Fetching routine URLs...");
  const urls = await getRoutineUrls();
  console.log(`Found ${urls.length} routines:`, urls);

  const allExercises = [];

  for (const url of urls) {
    try {
      console.log(`Fetching ${url}...`);
      const html = await fetchHtml(`https://bend.com${url}`);
      const exercises = parseRoutine(html);
      console.log(`  -> ${exercises.length} exercises`);
      allExercises.push(...exercises);
      // Small delay to be polite
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`  -> ERROR: ${err.message}`);
    }
  }

  // Deduplicate by title (case-insensitive)
  const seen = new Set();
  const unique = [];
  for (const ex of allExercises) {
    const key = ex.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(ex);
    }
  }

  console.log(`\nTotal unique exercises: ${unique.length}`);

  // Write JSON
  const jsonPath = path.join(__dirname, "..", "data", "exercises.json");
  fs.writeFileSync(jsonPath, JSON.stringify(unique, null, 2));
  console.log(`Written ${jsonPath}`);

  // Generate SVGs
  const illusDir = path.join(__dirname, "..", "public", "illustrations");
  if (!fs.existsSync(illusDir)) fs.mkdirSync(illusDir, { recursive: true });

  for (const ex of unique) {
    const svgPath = path.join(__dirname, "..", "public", ex.image);
    fs.writeFileSync(svgPath, generateSvg(ex.title));
  }
  console.log(`Generated ${unique.length} SVG placeholders`);
}

main().catch(console.error);
