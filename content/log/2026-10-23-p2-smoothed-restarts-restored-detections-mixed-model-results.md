---
title: "P2 smoothed restarts: restored detections, mixed model results"
date: 2026-10-23
type: iteration
outcome: mixed
authors: [PabloCordoba3]
summary: "A bounded wait restores preparation detection on smoothed tracks, but does not improve candidate A on five synthetic matches. P2 remains disabled by default in A."
metrics:
  - name: preparation_candidates
    value: 17
    before: 0
    split: local-match-diagnostics-without-GT
  - name: spellF1
    value: 0.7879801091509687
    before: 0.7885652794327763
    split: synthetic-five-matches-smoothed-half12
  - name: restart_error_p50_frames
    value: 10
    before: 7
    split: synthetic-five-matches-smoothed-half12
    better: lower
tags: [p2, dead-ball, restarts, smoothing, regression, docker]
links:
  - label: "Issue 14: P2 and the reported smoothing blind spot"
    href: "https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/14#issuecomment-6347255554"
  - label: "Implementation and reproducible experiment report"
    href: "https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/experimentos/P2_SMOOTHED_RESTARTS.md"
---

## Context

Jimy reported that P2 required three moving frames immediately after a stationary ball. Smoothed tracks accelerate gradually through intermediate speeds, so this rule found no general preparations in 59 local set-piece windows. This change addresses that detection regression in issue #14.

## What changed

P2 now searches for the first sustained-motion start within one second after stillness ends, bounded by the event and half. It dates the restart at the first moving frame and stops searching across missing or implausible tracking evidence. Setting `restart_search_s=0` preserves the previous rule. Speed, zone and confidence thresholds are unchanged.

Both P2 configurations include the new setting. Ten invented regression tests cover smoothing, the search deadline, event and half boundaries, gaps, invalid jumps and set-piece zones. A reproducible comparison script and experiment report document the evidence. Candidate A's implementation and P2-disabled default are unchanged.

## Validation

- [x] Reproduced the gradual-acceleration failure before changing the detector; the regression passes after the fix.
- [x] Shared suite in Docker: 77 tests passed, including all ten new regressions.
- [x] Candidate A's full synthetic suite in Docker: 11 checks passed.
- [x] Local bundle: both P1 and temporal consumers run twice with each rule; all eight CSV files contain 199,319 valid rows and are byte-identical within repetition pairs.
- [x] The zero-wait setting reproduces the previously validated P1 and temporal output hashes.
- [x] Compared five independently generated synthetic matches, seeds 0-4, all with `--ball-style real --smooth-half 12`; no real-match ground truth was read or scored for this fix.
- [x] `git diff --check` passed.

## Results: did it improve?

The detection blind spot improved: local general preparation candidates increased from **0 to 17** across the same 59 set-piece windows. These are candidates, not verified correct restarts or a recall estimate. Across 445 synthetic set-piece windows, general preparation candidates increased from **4 to 269**.

Candidate A's overall synthetic results did **not** improve:

| Candidate A profile | Mean spellF1 | Mean macroF1 | False possessions under 2 seconds | Restart error p50 / p90, frames |
|---|---:|---:|---:|---:|
| P2 off | 0.788565 | 0.924313 | 26 | 7 / 82 |
| P2 on, previous immediate rule | 0.788565 | 0.924291 | 26 | 7 / 82 |
| P2 on, bounded search | 0.787980 | 0.922931 | 26 | 10 / 81.1 |

Each profile misses 10 synthetic restarts under the existing comparison's reach definition. Scores are means over the five matches; restart-error percentiles are pooled. The bounded rule lowers spellF1 by about **0.000585** compared with the immediate rule and increases median restart error by three frames. These matches all use the same severe smoothing setting; they are not Jimy's exact five-match mixture.

The outcome is **mixed**: the detector recovers gradually accelerating preparations, but there is no demonstrated improvement in candidate A or real-match accuracy. Keep P2 disabled by default in A. Private match rows and predictions remain local; the repository contains aggregate findings and reproduction instructions.

## Next

Review candidate boundaries locally before adoption. The unresolved second-half initial kick-off uses a separate rule and remains open; this PR does not close issue #14. No thresholds were tuned after these results and no further public-window evaluation was consumed.
