/**
 * Geometría del balón: un icosaedro truncado (12 pentágonos + 20 hexágonos, el balón clásico)
 * sobre la esfera unidad. Sin dependencias: se usa en la web (animado) y al renderizar en estático.
 */

type V = [number, number, number]

const PHI = (1 + Math.sqrt(5)) / 2

const cyclic = ([x, y, z]: V): V[] => [
  [x, y, z],
  [y, z, x],
  [z, x, y],
]

/** Todas las combinaciones de signo, sin repetir las de los ceros. */
function signs([x, y, z]: V): V[] {
  const out: V[] = []
  for (const a of x ? [x, -x] : [0])
    for (const b of y ? [y, -y] : [0])
      for (const c of z ? [z, -z] : [0]) out.push([a, b, c])
  return out
}

const norm = (v: V) => Math.hypot(...v)
const unit = (v: V): V => {
  const n = norm(v)
  return [v[0] / n, v[1] / n, v[2] / n]
}
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

function unique(list: V[]) {
  const seen = new Set<string>()
  return list.filter((v) => {
    const key = v.map((n) => n.toFixed(5)).join(",")
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// 60 vértices: permutaciones pares de (0, ±1, ±3φ), (±1, ±(2+φ), ±2φ) y (±φ, ±2, ±(2φ+1))
export const vertices: V[] = unique(
  ([[0, 1, 3 * PHI], [1, 2 + PHI, 2 * PHI], [PHI, 2, 2 * PHI + 1]] as V[]).flatMap((b) => signs(b).flatMap(cyclic)),
).map(unit)

export type Face = { idx: number[]; kind: "pent" | "hex"; tone: 0 | 1 }

function faceAround(dir: V, n: number, kind: Face["kind"], tone: 0 | 1): Face {
  const d = unit(dir)
  const idx = vertices
    .map((v, i) => ({ i, s: dot(v, d) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.i)
  // ordenar los vértices alrededor de la normal de la cara
  const c = unit(idx.reduce<V>((acc, i) => [acc[0] + vertices[i][0], acc[1] + vertices[i][1], acc[2] + vertices[i][2]], [0, 0, 0]))
  // base ortonormal (u, w) en el plano perpendicular a la normal c
  const inPlane = (v: V): V => {
    const p = sub(v, c)
    const k = dot(p, c)
    return [p[0] - k * c[0], p[1] - k * c[1], p[2] - k * c[2]]
  }
  const u = unit(inPlane(vertices[idx[0]]))
  const w = cross(c, u)
  const angle = (i: number) => {
    const p = inPlane(vertices[i])
    return Math.atan2(dot(p, w), dot(p, u))
  }
  idx.sort((a, b) => angle(a) - angle(b))
  return { idx, kind, tone }
}

// pentágonos alrededor de los vértices del icosaedro; hexágonos, de los del dodecaedro
const pentDirs = unique(signs([0, 1, PHI]).flatMap(cyclic))
const hexDirs = unique([...signs([1, 1, 1]), ...signs([0, PHI, 1 / PHI]).flatMap(cyclic)])

// Blau o grana para cada pentágono: de los repartos 6/6, el que más vecinos alterna de color.
// (Los vecinos de un vértice del icosaedro forman un ángulo con coseno 1/√5.)
const pentTones = (() => {
  const dirs = pentDirs.map(unit)
  const edges: [number, number][] = []
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) if (dot(dirs[a], dirs[b]) > 0.4) edges.push([a, b])
  let best = 0
  let bestCut = -1
  for (let mask = 0; mask < 1 << 12; mask++) {
    let ones = 0
    for (let i = 0; i < 12; i++) ones += (mask >> i) & 1
    if (ones !== 6) continue
    const cut = edges.filter(([a, b]) => ((mask >> a) & 1) !== ((mask >> b) & 1)).length
    if (cut > bestCut) {
      bestCut = cut
      best = mask
    }
  }
  return dirs.map((_, i) => ((best >> i) & 1) as 0 | 1)
})()

export const faces: Face[] = [
  ...pentDirs.map((d, i) => faceAround(d, 5, "pent", pentTones[i])),
  ...hexDirs.map((d) => faceAround(d, 6, "hex", 0)),
]

/** Matriz de rotación 3×3 por filas. Ejes de pantalla: x a la derecha, y hacia abajo, z hacia quien mira. */
export type M = [number, number, number, number, number, number, number, number, number]

export function mul(a: M, b: M): M {
  const r = new Array(9).fill(0) as M
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j]
  return r
}

/** Rotación de `angle` radianes alrededor de `axis` (Rodrigues). */
export function rotation(axis: V, angle: number): M {
  const [x, y, z] = unit(axis)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const t = 1 - c
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c]
}

/** Gira primero `spin` sobre el eje vertical y luego `tilt` sobre el horizontal. */
export function fromSpinTilt(spin: number, tilt: number): M {
  return mul(rotation([1, 0, 0], tilt), rotation([0, 1, 0], spin))
}

/** Vuelve a hacer ortonormal la matriz (tras muchos giros se acumula error). */
export function orthonormalize(m: M): M {
  const a = unit([m[0], m[3], m[6]])
  const b0: V = [m[1], m[4], m[7]]
  const b = unit(sub(b0, [a[0] * dot(a, b0), a[1] * dot(a, b0), a[2] * dot(a, b0)]))
  const c = cross(a, b)
  return [a[0], b[0], c[0], a[1], b[1], c[1], a[2], b[2], c[2]]
}

export function apply(m: M): V[] {
  return vertices.map(([x, y, z]) => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z])
}

/** Gira el balón (eje vertical `spin`, inclinación `tilt`) y lo proyecta en ortográfica. */
export function project(spin: number, tilt: number): V[] {
  return apply(fromSpinTilt(spin, tilt))
}

/** `d` de cada cara y si mira hacia delante. */
export function facePaths(p: V[]) {
  return faces.map((f) => {
    const pts = f.idx.map((i) => p[i])
    const z = pts.reduce((s, v) => s + v[2], 0) / pts.length
    const d = `M${pts.map((v) => `${v[0].toFixed(3)} ${v[1].toFixed(3)}`).join("L")}Z`
    return { d, front: z > 0, face: f }
  })
}
