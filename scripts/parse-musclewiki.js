const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "musclewiki-input.txt");
const raw = fs.readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

const difficultyMap = {
  Novato: "beginner",
  Principiante: "beginner",
  Intermedio: "intermediate",
  Avanzado: "advanced",
};

const exercises = new Map();

let currentMuscle = "";
let pendingTitle = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Skip gender/equipment lines
  if (line === "Hombre|Mujer" || line === "Kettlebells") continue;

  // Difficulty line -> finalize exercise
  if (difficultyMap[line]) {
    if (pendingTitle) {
      const key = pendingTitle.toLowerCase();
      const existing = exercises.get(key);
      if (existing) {
        existing.muscles.add(currentMuscle);
        // Keep hardest difficulty
        const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        if (diffOrder[difficultyMap[line]] > diffOrder[existing.difficulty]) {
          existing.difficulty = difficultyMap[line];
        }
      } else {
        const muscleSet = new Set();
        if (currentMuscle) muscleSet.add(currentMuscle);
        exercises.set(key, {
          title: pendingTitle,
          muscles: muscleSet,
          difficulty: difficultyMap[line],
        });
      }
      pendingTitle = null;
    }
    continue;
  }

  // If next line is Hombre|Mujer, then current line is a title
  if (lines[i + 1] === "Hombre|Mujer") {
    pendingTitle = line;
    continue;
  }

  // Otherwise it's a muscle category
  currentMuscle = line;
}

// Convert to Exercise array
const newExercises = Array.from(exercises.values()).map((ex, idx) => {
  const slug = ex.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
  return {
    id: slug || `kettlebell_${idx}`,
    title: ex.title,
    type: "workout",
    duration: 45,
    image: `/illustrations/${slug}.svg`,
    muscles: Array.from(ex.muscles),
    difficulty: ex.difficulty,
    instructions: [
      "Maintain proper form throughout the movement",
      "Breathe steadily and avoid holding your breath",
      "Control the weight on both eccentric and concentric phases",
      "Stop if you feel any sharp pain",
    ],
  };
});

// Load existing exercises
const jsonPath = path.join(__dirname, "..", "data", "exercises.json");
const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Merge and deduplicate
const all = [...existing];
const seen = new Set(existing.map((e) => e.title.toLowerCase()));

for (const ex of newExercises) {
  if (!seen.has(ex.title.toLowerCase())) {
    seen.add(ex.title.toLowerCase());
    all.push(ex);
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(all, null, 2));
console.log(`Added ${all.length - existing.length} new exercises. Total: ${all.length}`);

// Generate SVGs for new ones
const illusDir = path.join(__dirname, "..", "public", "illustrations");
if (!fs.existsSync(illusDir)) fs.mkdirSync(illusDir, { recursive: true });

const colors = [
  "#5ac8fa", "#ff2d55", "#af52de", "#d4c5a9", "#007aff",
];

let generated = 0;
for (const ex of newExercises) {
  const svgPath = path.join(illusDir, `${ex.id}.svg`);
  if (fs.existsSync(svgPath)) continue;
  const c = colors[ex.title.length % colors.length];
  const svg = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="60" fill="${c}" fill-opacity="0.25"/>
  <circle cx="60" cy="60" r="56" fill="${c}" fill-opacity="0.12"/>
  <text x="60" y="74" text-anchor="middle" font-size="44" font-weight="bold" fill="white" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${ex.title.charAt(0)}</text>
</svg>`;
  fs.writeFileSync(svgPath, svg);
  generated++;
}

console.log(`Generated ${generated} new SVG placeholders`);
