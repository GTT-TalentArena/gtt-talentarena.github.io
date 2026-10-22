---
title: "P1: holding the last team through ball gaps barely moves the score"
date: 2026-10-22
type: experiment
outcome: mixed
authors: [AlejandroMolines]
summary: "Keeping the last team for up to 1 s when the ball is missing lifts macroF1 a little and leaves spellF1 untouched. The reason is in the gaps: 88% of them last over five seconds, so a one-second hold covers only 5% of the missing frames."
model: baseline-hold
version: v1
metrics:
  - name: spellF1
    value: 0.0441
    before: 0.0441
    split: public-5min
  - name: macroF1
    value: 0.4604
    before: 0.4573
    split: public-5min
tags: [temporal-continuity, possession-change]
links:
  - label: "Experiment (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/experimentos/P1_HOLD.md
  - label: "Issue #13"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/13
  - label: "PR #32"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/32
---

## Context

The study's first idea, P1: **no ball is not a dead ball.** When the tracking loses the ball, keep the
last team instead of inventing a stoppage.

Hypothesis, written before any real run: a short hold avoids artificial breaks, but may delay real
turnovers. Limit fixed at **25 frames (1 s)**, not tuned on the public window.

## What we did

- A causal nearest-player reader with a hold: after the last valid team, repeat it for at most 25
  frames, then answer `X` until new evidence. The state resets at each half, and a half that starts
  with no evidence starts with `X`.
- No smoothing, so the only difference between the two runs is the hold.
- A controlled comparison: **hold 25** against **hold 0**, same commit, inputs and Docker environment,
  each run twice with identical output.
- An aggregate diagnosis of the ball gaps over both halves.

```bash
python docker/pipeline.py modelo --config configs/baseline_hold.json --data-dir <local data> --repetir
python docker/pipeline.py modelo --config configs/baseline_hold_disabled.json --data-dir <local data> --repetir
```

## Result

Public window (17 true possessions):

| variant | spellF1 | macroF1 | predicted possessions | `X` frames |
|---|---|---|---|---|
| `baseline_smooth50` (reference) | 0.3256 | 0.6207 | 26 | 0% |
| hold 0 | 0.0441 | 0.4573 | 128 | 11.8% |
| hold 25 | 0.0441 | 0.4604 | 128 | 10.4% |

The ball gaps explain why:

```stats
40.7% | of the frames in both halves have no ball
150 | gaps in the ball tracking
88% | of them last more than five seconds
5% | of the missing frames covered by a 1 s hold
```

- **A one-second hold fixes the short gaps, and there are very few of them.** Almost all the missing ball
  comes in long stretches, which belong to P6.
- **The scorer already holds for us.** It fills every `X` with the previous letter before counting
  possessions, so a hold and an abstention end up almost the same for spellF1.
- **Flicker is the real problem.** 128 predicted possessions against 17 true ones caps spellF1 at
  2 × 17 ÷ 145 ≈ 0.23 before a single possession is matched — the count ceiling from the study.

> Not every frame without a ball needs fixing. The tracking flickers far more than it disappears.

## Decision

Keep the hold as a reproducible building block. Do not replace `baseline_smooth50` with it, and do not
tune the limit on the public window. The comparison with `smooth50` is not controlled: smoothing and
masks change too.

## Next

Stability belongs to P4 (temporal decoding) and control events to P3; real stoppages to P2. Long gaps
stay for P6.
