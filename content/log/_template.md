---
# PLANTILLA · copia este fichero como content/log/AAAA-MM-DD-slug-corto.md
# El log es el cuaderno del MODELO DE POSESIÓN (trabajo en el fork del reto), nunca de esta web.
# Instrucciones completas al principio de lib/log.ts. Los ficheros que empiezan por _ no se publican.
title: "Hysteresis on possession changes"
date: 2026-10-24
type: experiment # study | code | experiment | iteration | data | decision
outcome: failure # success | failure | mixed | open (obligatorio en experiment e iteration)
authors: [hxst1, n1co2611] # handles de GitHub del squad
summary: "Requiring the other team to hold the ball for 0.8 s before switching the label removed flicker, but merged two short real possessions into one."
metrics:
  - name: spellF1
    value: 0.2410
    before: 0.2433
    split: public-5min
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
