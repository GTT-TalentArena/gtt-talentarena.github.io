---
# PLANTILLA · copia este fichero como content/log/AAAA-MM-DD-slug-corto.md
# El log registra el trabajo sobre el MODELO DE POSESIÓN (en el fork del reto), nunca cambios de esta web.
# El estudio largo en español (el cuaderno) va aparte, en docs/ del fork: aquí se resume y se enlaza.
# Instrucciones completas al principio de lib/log.ts. Los ficheros que empiezan por _ no se publican.
title: "Hysteresis on possession changes"
date: 2026-10-24
type: experiment # study | code | experiment | iteration | data | decision
outcome: failure # success | failure | mixed | open (obligatorio en experiment e iteration)
authors: [hxst1, n1co2611] # handles de GitHub del squad
summary: "Requiring the other team to hold the ball for 0.8 s before switching the label removed flicker, but merged two short real possessions into one."
model: rules-hysteresis # modelo medido: una línea en la gráfica de /log (mismo nombre en todas sus versiones)
version: v1 # versión: un punto en esa línea
metrics:
  - name: spellF1
    value: 0.3110
    before: 0.3256 # baseline_smooth50 en la ventana pública (EVALUATION.md del fork)
    split: public-5min # solo se comparan puntos del mismo split
    low: 0.2480 # opcional: intervalo de bootstrap (run_evaluation.py --bootstrap 1000)
    high: 0.3790
tags: [hysteresis, possession-change, temporal-continuity]
links:
  - label: "Study (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/<estudio>.md
  - label: "PR #7"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/7
---

## Context

Why we tried this, in two or three sentences. Link the study in the fork's docs/ if there is one.

## What we did

Enough detail to repeat it: the command, the parameters, the data split.

```bash
python evaluation/run_evaluation.py
```

## Result

What happened, with numbers. If it failed, why we think it failed.

## Next

What we try now.
