---
title: "Hysteresis on possession changes"
date: 2026-10-20
type: experiment
outcome: failure
summary: "Requiring the other team to hold the ball for 0.8 s before switching the label removed flicker, but merged two short real possessions into one."
metrics:
  - name: spellF1
    value: 0.2410
    before: 0.2433
    split: public-5min
tags: [hysteresis, possession-change, temporal-continuity]
links:
  - label: "Study (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/hysteresis.md
authors: [AlejandroMolines]
---

## Context

Probamos exigir que el otro equipo tenga la pelota 0.8 s antes de cambiar la etiqueta, para reducir el parpadeo entre posesiones.

## What we did

Ejecutamos `python evaluation/run_evaluation.py` sobre el split público de cinco minutos, con el umbral de 0.8 s.

## Result

El parpadeo bajó, pero dos posesiones reales cortas se fusionaron en una. spellF1 pasó de 0.2433 a 0.2410, así que empeoró ligeramente.

## Next

Probar un umbral menor, por ejemplo 0.4 s, y validar en el resto del partido antes de decidir.
