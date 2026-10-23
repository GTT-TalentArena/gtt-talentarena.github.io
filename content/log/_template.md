---
# TEMPLATE · copy this file as content/log/YYYY-MM-DD-short-slug.md
# The log records the work on the POSSESSION MODEL (in the challenge fork), never changes to this website.
# The long study (the notebook) lives separately, in the fork's docs/: here it is summarised and linked.
# Full instructions at the top of lib/log.ts. Files starting with _ are not published.
# Write everything in English (see CONTRIBUTING.md).
title: "Hysteresis on possession changes"
date: 2026-10-24
type: experiment # study | code | experiment | iteration | data | decision
outcome: failure # success | failure | mixed | open (required for experiment and iteration)
authors: [hxst1, n1co2611] # squad GitHub handles
summary: "Requiring the other team to hold the ball for 0.8 s before switching the label removed flicker, but merged two short real possessions into one."
model: rules-hysteresis # model measured: one line on the /log chart (same name across all its versions)
version: v1 # version: one point on that line
metrics:
  - name: spellF1
    value: 0.3110
    before: 0.3256 # baseline_smooth50 on the public window (the fork's EVALUATION.md)
    split: public-5min # only points from the same split are compared
    low: 0.2480 # optional: bootstrap interval (run_evaluation.py --bootstrap 1000)
    high: 0.3790
tags: [hysteresis, possession-change, temporal-continuity]
links:
  - label: "Study"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/<study>.md
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
