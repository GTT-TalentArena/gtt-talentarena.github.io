---
title: "P3/P4: decodificadores alternativos, escenarios de prueba y evidencia por frame"
date: 2026-10-22
type: iteration
outcome: success
authors: [jimy-k4]
summary: "Viterbi frente a histéresis y votación sobre la misma evidencia: Viterbi gana en sintético (spellF1 0.783 frente a 0.761 y 0.659) sin borrar posesiones cortas; escenarios explícitos de P3/P4 y exportación de evidencia con los nombres del contrato P0."
metrics:
  - name: spellF1
    value: 0.783
    before: 0.659
    split: synthetic-5-matches
tags: [p3, p4, viterbi, histeresis, pruebas]
links: []
---

## Context

Ni el candidato A (#33) ni su CSV cambian: Viterbi sigue siendo el decodificador por defecto y la salida es la misma
byte a byte. Este PR cierra trabajo pendiente de #15 (P3) y #16 (P4) mientras llega la P2 (#14).

## What we did

- **Decodificadores alternativos (#16).** `decode.method=hysteresis` (CUSUM con retrofechado y los mismos costes)
  y `decode.method=vote` (mayoría en ±1 s sobre la misma evidencia). Se comparan con
  `python -m solution.a_opus.compare_decoders`, sobre partidos sintéticos.
- **Escenarios explícitos (#15, #16)** en `python -m solution.a_opus.tests`:
  - P3: pase que roza a un defensor, recepción, duelo, rebote e intercepción;
  - P4: ruido aislado, recuperación corta real, cambio a través de un hueco del balón y primeros frames de cada
    parte.
- **Evidencia por frame (#15, contrato P0 §6).** `--evidence salidas/evidencia.npz` con `control_H_score`,
  `control_A_score`, `control_valid`, `nearest_H_m`, `nearest_A_m` y `distance_valid`, más toques y la evidencia
  en nats. Es solo para uso local: lleva datos frame a frame y no va al repositorio.

## Result

Sobre 5 partidos sintéticos (3 ruidosos y 2 con el balón suavizado como el ATD real):

| decodificador | spellF1 | posesiones / reales | fragmentación | cortas reales (< 5 s) conservadas | falsas de menos de 2 s |
|---|---|---|---|---|---|
| **Viterbi** | **0.783** | 1580 / 1915 | 0.88 | 214 / 627 | **17** |
| histéresis | 0.761 | 2010 / 1915 | 1.11 | 298 / 627 | 195 |
| votación | 0.659 | 2560 / 1915 | 1.42 | 267 / 627 | 722 |

Viterbi elimina el ruido sin imponer una duración mínima. La histéresis recupera más posesiones cortas, pero
inventa 11 veces más falsas. Todos los tests pasan, y los 29 de `tests/` siguen igual.

## Next

- #15: reutilizar las señales de distancia de Nico cuando estén.
- #16: comparar mediante #12 con configuraciones registradas.
- P3: integrar las señales de reinicio de la P2 (#14) cuando Pablo la cierre.

Relacionado: #15, #16, #12, #33.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
