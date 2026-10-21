/**
 * Todo el texto de la landing. Los campos vacíos ("") se muestran como «Pending: …»
 * hasta el lanzamiento (ver lib/launch.ts).
 */

export const site = {
  name: "GTT — TalentArena",
  short: "GTT",
  title: "GTT — Football, understood through data",
  description:
    "GTT is a five-person football analytics team competing in More than a Hack 2027 at Talent Arena, Barcelona. Tracking data in, possession out — reproducible, measured, explained.",
  url: "https://gtt-talentarena.github.io",
  location: "Barcelona",
  timezone: "Europe/Madrid",
  github: "https://github.com/GTT-TalentArena",
  repo: "https://github.com/GTT-TalentArena/more-than-a-hack-2027",
  challenge: "https://landing.mobileworldcapital.com/more-than-a-hack-2027",
  since: 2026,
}

export const hero = {
  kicker: "Football analytics · Data science",
  motto: { lead: "Més que", accent: "dades." },
  mottoGloss: "More than data",
  intro: {
    before: "Five people, one question:",
    accent: "who has the ball?",
    after: "We turn raw tracking data into possession, frame by frame — reproducible, measured, explained.",
  },
}

export const now = {
  status: "Live · Phase 1",
  title: "Ball possession",
  detail: "Initial Challenge · online",
  target: { label: "spellF1 to beat", value: "0.2433" },
  // Fin del plazo de la fase 1. La hora exacta no está publicada: se usa el final del día en Barcelona.
  deadline: "2026-11-17T23:59:59+01:00",
  window: "20 Oct — 17 Nov",
}

export const disciplines = [
  "Tracking data",
  "Homography",
  "Possession",
  "spellF1",
  "Smart Tagging",
  "Python",
  "Reproducible science",
  "Barcelona",
]

export const challenge = {
  intro:
    "For every frame of a full LaLiga match, say which team has the ball. One CSV, one row per frame, scored against a private frame-by-frame ground truth — no jury, just a number.",
  note: "The tracking is automatic and uncorrected: gaps, identity switches, and a ball nobody can see for long stretches. That is the game.",
  stats: [
    { value: "199,319", label: "frames to label" },
    { value: "H·A·D·X", label: "home, away, dead, no answer" },
    { value: "41%", label: "scored frames with the ball unseen" },
    { value: "0.2433", label: "baseline spellF1 to beat" },
  ],
  labels: [
    { id: "H", text: "Home in possession" },
    { id: "A", text: "Away in possession" },
    { id: "D", text: "Dead ball" },
    { id: "X", text: "No answer" },
  ],
}

export type Position = "Goalkeeper" | "Defender" | "Forward"

export type Player = {
  number: string
  name: string
  /** Los roles están sujetos a cambios: vacío = «Pending». */
  role: string
  /** Formación 1-2-2 en medio campo (propuesta de Alejandro). */
  position: Position
  /** Sitio en el medio campo, en metros: x desde la banda izquierda (0–68), y desde el medio campo (0–52.5). */
  spot: [number, number]
  github?: string
  portfolio?: string
  linkedin?: string
}

// 1-2-2: Alejandro en la portería; Nico y Jimy atrás; Edu y Pablo arriba.
export const squad: Player[] = [
  {
    number: "01",
    name: "Jimy",
    role: "",
    position: "Defender",
    spot: [48, 31],
    github: "jimy-k4",
    portfolio: "https://jimy-portfolio.vercel.app/en",
    linkedin: "https://www.linkedin.com/in/juan-llinares-mauri",
  },
  {
    number: "02",
    name: "Edu",
    role: "",
    position: "Forward",
    spot: [22, 13],
    github: "hxst1",
    portfolio: "https://edu-ruiz-portfolio.vercel.app/",
    linkedin: "https://www.linkedin.com/in/edu-ruiz-cantos",
  },
  {
    number: "03",
    name: "Alejandro",
    role: "",
    position: "Goalkeeper",
    spot: [34, 45.5],
    github: "AlejandroMolines",
    linkedin: "https://www.linkedin.com/in/alejandro-molines-00524822b/",
  },
  {
    number: "04",
    name: "Nico",
    role: "",
    position: "Defender",
    spot: [20, 31],
    github: "n1co2611",
    portfolio: "https://nicolashidalgo.es/",
    linkedin: "https://www.linkedin.com/in/nicolashidalgosalinas/",
  },
  {
    number: "05",
    name: "Pablo",
    role: "",
    position: "Forward",
    spot: [46, 13],
    github: "PabloCordoba3",
    linkedin: "https://www.linkedin.com/in/pablo-cordoba-simarro/",
  },
]

export const approach = {
  intro:
    "Our goal is not just to build a solution, but to understand why it works, how it can fail, and how to improve it.",
  principles: [
    {
      title: "Reproducible",
      accent: "by default.",
      text: "Every number we report regenerates from the repository with one command. If it can't be rebuilt, it isn't a result.",
    },
    {
      title: "Measure",
      accent: "before we believe.",
      text: "spellF1 and macroF1 on the public window, plus our own validation — before any claim leaves the team.",
    },
    {
      title: "Know why",
      accent: "it fails.",
      text: "Tracking gaps, identity switches, an invisible ball. We study the failure modes, not just the score.",
    },
    {
      title: "Built",
      accent: "together.",
      text: "Small pull requests, written decisions, shared notebooks. Five people, one codebase.",
    },
  ],
  pillars: ["Data analysis", "Algorithm development", "Evaluation & validation", "Engineering"],
}

export type Fixture = {
  start: string
  end?: string
  title: string
  detail: string
  who: string
}

export const fixtures: Fixture[] = [
  {
    start: "2026-10-20",
    title: "Kick-off",
    detail: "Match data released. The Initial Challenge opens online.",
    who: "All teams",
  },
  {
    start: "2026-11-17",
    title: "Phase 1 deadline",
    detail: "Possession CSV, public repository and technical write-up.",
    who: "All teams",
  },
  {
    start: "2026-11-26",
    end: "2027-01-14",
    title: "Innovation Challenge",
    detail: "Open analytical and tactical questions on the same data.",
    who: "Top 20",
  },
  {
    start: "2027-03-02",
    title: "Final Pitch",
    detail: "On stage at Talent Arena, in front of a professional jury.",
    who: "Top 5",
  },
]

export const follow = {
  title: "Follow the",
  accent: "build.",
  text: "We share our approach, code and write-up as the competition allows. Star the repository, or just say hola.",
  links: [
    { label: "Challenge fork", href: site.repo },
    { label: "More than a Hack 2027", href: site.challenge },
  ],
}

export const disclaimer =
  "Independent team. Not affiliated with FC Barcelona, Metrica Sports or Mobile World Capital Barcelona."
