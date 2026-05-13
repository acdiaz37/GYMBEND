const fs = require("fs");

const d = require("../data/exercises.json");
const workouts = d.filter((e) => e.type === "workout");

const wordMap = {
  // Core actions
  "balanceo": "swing",
  "swing": "swing",
  "sentadilla": "squat",
  "peso muerto": "deadlift",
  "remo": "row",
  "curl": "curl",
  "press": "press",
  "elevación": "raise",
  "extension": "extension",
  "extensión": "extension",
  "flexión": "curl",
  "flexion": "curl",
  "zancada": "lunge",
  "estocada": "lunge",
  "puente": "bridge",
  "giro": "twist",
  "abdominal": "crunch",
  "plancha": "plank",
  "caminata": "walk",
  "paseo": "walk",
  "encogimiento": "shrug",
  "arrancada": "clean",
  "arranque": "snatch",
  "levantamiento": "raise",
  "patada": "kick",
  "apertura": "fly",
  "aperturas": "fly",
  "pullover": "pullover",
  "subida": "step-up",
  "step-up": "step-up",
  "molino": "windmill",
  "superman": "superman",
  "buenos días": "good-morning",
  "buenos dias": "good-morning",
  // Body parts / descriptors
  "bíceps": "bicep",
  "biceps": "bicep",
  "tríceps": "tricep",
  "triceps": "tricep",
  "hombro": "shoulder",
  "hombros": "shoulder",
  "pecho": "chest",
  "espalda": "back",
  "pierna": "leg",
  "piernas": "legs",
  "glúteo": "glute",
  "gluteo": "glute",
  "glúteos": "glute",
  "cuádriceps": "quad",
  "quadriceps": "quad",
  "isquiotibiales": "hamstring",
  "gemelos": "calf",
  "pantorrilla": "calf",
  "pantorrillas": "calf",
  "deltoides": "delt",
  "deltoides posteriores": "rear-delt",
  "deltoides posteriores": "rear-delt",
  "muñeca": "wrist",
  "muneca": "wrist",
  "cadera": "hip",
  "tronco": "torso",
  // Variations
  "concentrado": "concentration",
  "predicador": "preacher",
  "unilateral": "single-arm",
  "a un brazo": "single-arm",
  "a una mano": "single-arm",
  "a un brazo": "single-arm",
  "a una mano": "single-arm",
  "de un solo brazo": "single-arm",
  "alterno": "alternating",
  "alterna": "alternating",
  "alternada": "alternating",
  "doble": "double",
  "dobles": "double",
  "completo": "full",
  "completa": "full",
  "escalonado": "staggered",
  "escalonada": "staggered",
  "rumano": "romanian",
  "rumana": "romanian",
  "convencional": "conventional",
  "sumo": "sumo",
  "tipo maleta": "suitcase",
  "tipo maleta": "suitcase",
  "a una pierna": "single-leg",
  "a una pierna": "single-leg",
  "en copa": "goblet",
  "goblet": "goblet",
  "en rack frontal": "front-rack",
  "rack frontal": "front-rack",
  "rack frontal": "front-rack",
  "frontal": "front",
  "front": "front",
  "lateral": "lateral",
  "inversa": "reverse",
  "inverso": "reverse",
  "inversa": "reverse",
  "declinada": "decline",
  "declinado": "decline",
  "inclinado": "incline",
  "inclinada": "incline",
  "sentado": "seated",
  "sentada": "seated",
  "de pie": "standing",
  "parado": "standing",
  "en banco": "bench",
  "en banco inclinado": "incline-bench",
  "en posición de copa": "goblet",
  "en posición de rodillas": "kneeling",
  "media rodilla": "half-kneeling",
  "arrodillado": "kneeling",
  "en posición invertida": "upside-down",
  "bottoms up": "bottoms-up",
  "por encima de la cabeza": "overhead",
  "encima de la cabeza": "overhead",
  "al mentón": "to-chin",
  "al menton": "to-chin",
  "drag": "drag",
  "gorila": "gorilla",
  "pendlay": "pendlay",
  "silverback": "silverback",
  "camarero": "waiter",
  "reverencia": "curtsy",
  "figura de cuatro": "figure-four",
  "figura de 4": "figure-four",
  "hueca": "hollow",
  "deficit": "deficit",
  "déficit": "deficit",
  "cargada y press": "clean-and-press",
  "clean and press": "clean-and-press",
  "clean and jerk": "clean-and-jerk",
  "hang clean": "hang-clean",
  "hang squat": "hang-squat",
  "squat clean": "squat-clean",
  "spinal": "spinal",
  "jefferson": "jefferson",
  "larsen": "larsen",
  "tibialis": "tibialis",
  "granjero": "farmer",
  "farmer": "farmer",
  "giro ruso": "russian-twist",
  "russian twist": "russian-twist",
  "thruster": "thruster",
  "tate": "tate",
  "guillotina": "guillotine",
  "guillotine": "guillotine",
  "francés": "french",
  "frances": "french",
  "piso": "floor",
  "suelo": "floor",
  "push press": "push-press",
  "militar": "military",
  "shoulder extension": "shoulder-extension",
  "high incline": "high-incline",
  "step up knee drive": "step-up-knee-drive",
  "knee drive": "knee-drive",
  "somersault": "somersault",
  "vertical": "upright",
  "jalón": "pull",
  "jalon": "pull",
  "remo vertical": "upright-row",
  "paso sobre": "step-over",
  "caja": "box",
  "cajón": "box",
  "soporte": "supported",
  "asistida": "assisted",
  "asistido": "assisted",
  "equilibrio": "balance",
};

// Manual overrides for titles that are already in English or have known slugs
const manualMap = {
  "kettlebell drag curl": "kettlebell-drag-curl",
  "kettlebell single arm rear delt row": "kettlebell-single-arm-rear-delt-row",
  "kettlebell single arm pendlay row": "kettlebell-single-arm-pendlay-row",
  "kettlebell hang clean and press": "kettlebell-hang-clean-and-press",
  "kettlebell spinal jefferson curl": "kettlebell-spinal-jefferson-curl",
  "kettlebell clean and jerk": "kettlebell-clean-and-jerk",
  "kettlebell hang clean and jerk": "kettlebell-hang-clean-and-jerk",
  "kettlebell hang squat clean and jerk": "kettlebell-hang-squat-clean-and-jerk",
  "kettlebell single arm clean and jerk": "kettlebell-single-arm-clean-and-jerk",
  "kettlebell single arm hang clean and jerk": "kettlebell-single-arm-hang-clean-and-jerk",
  "kettlebell squat clean and jerk": "kettlebell-squat-clean-and-jerk",
  "kettlebell single arm larsen press": "kettlebell-single-arm-larsen-press",
  "kettlebell larsen press": "kettlebell-larsen-press",
  "kettlebell tibialis raise": "kettlebell-tibialis-raise",
  "kettlebell alternating single arm thruster": "kettlebell-alternating-single-arm-thruster",
  "kettlebell single arm thruster": "kettlebell-single-arm-thruster",
  "kettlebell thruster": "kettlebell-thruster",
  "kettlebell single arm front rack step up knee drive": "kettlebell-single-arm-front-rack-step-up-knee-drive",
  "kettlebell front rack step up knee drive": "kettlebell-front-rack-step-up-knee-drive",
  "kettlebell single arm step up knee drive": "kettlebell-single-arm-step-up-knee-drive",
  "kettlebell somersault squat": "kettlebell-somersault-squat",
  "kettlebell zancada en reverencia alternada": "kettlebell-alternating-curtsy-lunge",
  "kettlebell estocada inversa alternada": "kettlebell-alternating-reverse-lunge",
  "kettlebell single arm shoulder extension": "kettlebell-single-arm-shoulder-extension",
  "kettlebell single arm pullover": "kettlebell-single-arm-pullover",
  "kettlebell single arm push press": "kettlebell-single-arm-push-press",
  "kettlebell single arm high incline chest press": "kettlebell-single-arm-high-incline-chest-press",
  "kettlebell single arm chest press": "kettlebell-single-arm-chest-press",
  "kettlebell single arm floor fly": "kettlebell-single-arm-floor-fly",
  "kettlebell floor fly": "kettlebell-floor-fly",
};

function titleToSlug(title) {
  const lower = title.toLowerCase().trim();
  
  // Check manual map first
  if (manualMap[lower]) return manualMap[lower];
  
  // If already starts with kettlebell and is mostly english, kebab-case it
  if (lower.startsWith("kettlebell ")) {
    return lower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
  }
  
  // Spanish titles - try to translate
  let slug = lower;
  
  // Replace phrases first (longest first)
  const phrases = Object.keys(wordMap).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    slug = slug.replace(regex, wordMap[phrase]);
  }
  
  // Clean up
  slug = slug
    .replace(/con\s+/g, "")
    .replace(/de\s+/g, "")
    .replace(/en\s+/g, "")
    .replace(/y\s+/g, "")
    .replace(/a\s+/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  // Ensure it starts with kettlebell
  if (!slug.startsWith("kettlebell")) {
    slug = "kettlebell-" + slug;
  }
  
  return slug;
}

const results = workouts.map((ex) => ({
  id: ex.id,
  title: ex.title,
  slug: titleToSlug(ex.title),
}));

fs.writeFileSync("slug-candidates.json", JSON.stringify(results, null, 2));
console.log(`Generated ${results.length} slug candidates`);
