---
title: "Candidato A (Claude Opus 5.5): posesión por decodificación exacta H/A/D"
date: 2026-10-22
type: iteration
outcome: open
authors: [jimy-k4]
summary: "Candidato A de la confrontación (#26): evidencia por frame y decodificación exacta H/A/D, autocalibrada sin etiquetas. spellF1 público 0.5250 frente a 0.3256 del baseline_smooth50."
metrics:
  - name: spellF1
    value: 0.5250
    before: 0.3256
    split: public-5min
  - name: macroF1
    value: 0.8391
    before: 0.6207
    split: public-5min
tags: [candidato-a, confrontacion, viterbi, posesion]
links: []
---

> **No fusionar hasta que termine la comparación (A10).** @hxst1, por A10: no revises esta rama hasta la
> congelación del 29-O.

## Context

Esta PR entrega el candidato A de la confrontación (#26) para la evaluación neutral de @AlejandroMolines.

- **Autoría:** @jimy-k4, con Claude Opus 5.5 (effort max), a partir del brief común.
- **Datos:** el LLM no vio ningún dato del partido. Solo recibió agregados (A7): logs sin filas ni frames y
  métricas.

## What we did

- `solution/a_opus/`: el candidato.
  - Evidencia por frame y decodificación exacta de la mitad entera (Viterbi H/A/D con coste por cambio y paradas
    de al menos 2 s).
  - Equipo: zona de control con compuerta de velocidad, toques, Smart Tagging con polaridad calibrada y un modelo
    sin balón con validación cruzada por mitades.
  - Balón muerto: fuera de campo, balón quieto, velocidad colectiva, formación de saque, ventanas `SET PIECES` y
    ausencia larga del balón.
  - Todo se autocalibra con el propio partido, sin etiquetas.
  - Método, decisiones, pruebas descartadas y limitaciones: `solution/a_opus/README.md`.
- `configs/candidate_a.json`: lo enchufa a la vía común (#12/#24) con `"model": "module"`.
- `prompts/confrontacion/a-opus/`: el registro del protocolo.
  - Prompts 001–013, ejecuciones 1–12 y desviaciones (ya rellenas).
  - `resultados.csv`, con una fila por versión, para la gráfica.
- `main` está fusionado en la rama (sin conflictos), así que corre con Docker tal cual.

**Reproducción (A11)**, desde la raíz con `MTAH_DATA_DIR` apuntando a la carpeta con `tactical/`:

```powershell
python -m solution.a_opus --out salidas/candidato_a.csv --log salidas/candidato_a_log.txt
```

o por la vía común:

```powershell
docker compose run --rm modelo modelo --config configs/candidate_a.json --repetir
```

- Tarda unos 15 s en CPU y escribe 199.319 filas que pasan `validate_submission.py`.
- Es determinista: dos ejecuciones dan el mismo fichero.
- CSV de referencia de la v1.6 (Python 3.11.3, numpy 2.4.6, pandas 3.0.6, Windows 11):
  `ab640ee8694f259697393d822b0a6665a017878b5b29d12715f59ec8a4dbc6d5`.
- `python -m solution.a_opus.tests --full` pasa: comprueba el decodificador contra fuerza bruta, el lector y un
  partido sintético de punta a punta.

## Result

Ventana pública: 17 posesiones; las 5 evaluaciones del presupuesto A8 están usadas y registradas.

| Versión | spellF1 | macroF1 | Pos. ventana | % D partido | Pos. partido |
|---|---|---|---|---|---|
| baseline_smooth50 | 0.3256 | 0.6207 | — | — | — |
| v1.0 | 0.4414 | 0.7997 | 12 | 54.7 % | 162 |
| v1.1 | 0.4800 | 0.8318 | 13 | 47.2 % | 184 |
| v1.2 | 0.4800 | 0.8331 | 13 | 49.1 % | 185 |
| v1.3 | 0.4800 | 0.8331 | 13 | 49.0 % | 197 |
| **v1.6** | **0.5250** | **0.8391** | 15 | 49.3 % | 219 |

- **Partido completo, sin etiquetas (v1.6):** 219 posesiones (mediana 10,4 s), 113 paradas, 106 cambios H↔A
  directos y 63,6 % de posesión viva para H. 54 de 59 ventanas `SET PIECES` contienen un saque decodificado.
- **Ventana pública, v1.6:** spellF1 a IoU 0,7 de 0,375, acierto de equipo de 0,899 y latencia mediana de −1 frame.
- **El intervalo bootstrap de la v1.6 (0,34–0,71) solapa con el de las versiones anteriores.** Con 17 posesiones,
  la ventana sirve para comprobar el pipeline, no para decidir (criterios C del protocolo).

## Next

- **@AlejandroMolines:**
  - reproducir dos veces y comparar el hash (C1);
  - comparar plausibilidad y discrepancias con B (C2–C3);
  - la ventana pública solo cuenta si los intervalos no solapan (C4).
- **@jimy-k4:** rellenar `horas.md` (A3).
- **Limitaciones conocidas:**
  - casi no detecta posesiones de menos de 2 s;
  - en faltas y fueras de juego la parada empieza tarde, porque el tracking no tiene pitido;
  - el balón del ATD viene suavizado a ~1 s, lo que limita la precisión de toques y fronteras.

Relacionado: #26, #17, #15, #16, #18. No cierra ninguna issue.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
