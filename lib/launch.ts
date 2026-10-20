/**
 * Hasta el lanzamiento se ve el selector de tipografía (abajo a la derecha).
 * Al lanzar, pon NEXT_PUBLIC_LAUNCHED: "1" en .github/workflows/deploy.yml.
 */
export const isLaunched = process.env.NEXT_PUBLIC_LAUNCHED === "1"
