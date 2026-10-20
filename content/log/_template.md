---
# PLANTILLA · copia este fichero como content/log/AAAA-MM-DD-slug-corto.md
# Instrucciones completas al principio de lib/log.ts. Los ficheros que empiezan por _ no se publican.
title: "Ball-gap interpolation with a constant-velocity model"
date: 2026-10-24
type: experiment # study | code | experiment | iteration | data | decision
outcome: failure # success | failure | mixed | open (obligatorio en experiment e iteration)
authors: [hxst1, n1co2611] # handles de GitHub del squad
summary: "Filling the ball's tracking gaps with constant velocity did not move spellF1: most gaps start on contact, exactly where the velocity changes."
metrics:
  - name: spellF1
    value: 0.2410
    before: 0.2433
    split: public-5min
tags: [ball, tracking-gaps]
links:
  - label: "PR #7"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/7
---

## Context

Why we tried this, in two or three sentences.

## What we did

Enough detail to repeat it: the command, the parameters, the data split.

```bash
python evaluation/run_evaluation.py
```

## Result

What happened, with numbers. If it failed, why we think it failed.

## Next

What we try now.
