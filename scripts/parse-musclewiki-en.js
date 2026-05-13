const fs = require("fs");

const raw = fs.readFileSync(__dirname + "/musclewiki-list.txt", "utf8");
const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

const difficultyMap = {
  Novice: "beginner",
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advanced: "advanced",
};

const exercises = [];
let currentMuscle = "";
let i = 0;

while (i < lines.length) {
  const line = lines[i];

  // If this line + next 3 form an exercise block pattern
  if (
    i + 4 < lines.length &&
    lines[i + 1] === "Male" &&
    lines[i + 2] === "Female" &&
    lines[i + 3] === "Kettlebells" &&
    difficultyMap[lines[i + 4]]
  ) {
    const title = line;
    const difficulty = difficultyMap[lines[i + 4]];
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if we already have this exact title
    const existing = exercises.find((e) => e.title === title);
    if (existing) {
      // Add muscle if new
      if (!existing.muscles.includes(currentMuscle)) {
        existing.muscles.push(currentMuscle);
      }
      // Keep hardest difficulty
      const order = { beginner: 1, intermediate: 2, advanced: 3 };
      if (order[difficulty] > order[existing.difficulty]) {
        existing.difficulty = difficulty;
      }
    } else {
      exercises.push({
        title,
        slug,
        difficulty,
        muscles: [currentMuscle],
      });
    }
    i += 5;
    continue;
  }

  // Otherwise it's a muscle group header
  if (line !== "Male" && line !== "Female" && line !== "Kettlebells" && !difficultyMap[line]) {
    currentMuscle = line;
  }
  i++;
}

console.log(`Parsed ${exercises.length} unique exercises`);

// Generate Exercise objects
const newExercises = exercises.map((ex, idx) => ({
  id: ex.slug || `kb_${idx}`,
  title: ex.title,
  type: "workout",
  duration: 45,
  image: `/illustrations/${ex.slug}.svg`,
  muscles: ex.muscles,
  difficulty: ex.difficulty,
  videoSlug: ex.slug,
  instructions: [
    "Maintain proper form throughout the movement",
    "Breathe steadily and avoid holding your breath",
    "Control the weight on both eccentric and concentric phases",
    "Stop if you feel any sharp pain",
  ],
}));

// Load existing
const jsonPath = __dirname + "/../data/exercises.json";
const existing = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const stretches = existing.filter((e) => e.type === "stretch");

const all = [...stretches, ...newExercises];
fs.writeFileSync(jsonPath, JSON.stringify(all, null, 2));
console.log(`Total exercises: ${all.length} (${stretches.length} stretches + ${newExercises.length} workouts)`);

// Generate SVGs
const illusDir = __dirname + "/../public/illustrations";
if (!fs.existsSync(illusDir)) fs.mkdirSync(illusDir, { recursive: true });

const colors = ["#5ac8fa", "#ff2d55", "#af52de", "#d4c5a9", "#007aff"];
let generated = 0;
for (const ex of newExercises) {
  const svgPath = illusDir + "/" + ex.id + ".svg";
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
console.log(`Generated ${generated} SVG placeholders`);
