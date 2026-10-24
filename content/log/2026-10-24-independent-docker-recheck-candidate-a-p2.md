---
title: "Independent Docker recheck of candidate A and P2"
date: 2026-10-24
type: experiment
outcome: mixed
authors: [PabloCordoba3]
summary: "Default candidate A is unchanged. Across six new synthetic matches, bounded P2 raises mean spellF1 by only 0.000176, slightly lowers macroF1 and adds one false short possession: a mixed result."
model: candidate-a
version: v1.6-p2-bounded-recheck
metrics:
  - name: spellF1
    value: 0.810296067822469
    before: 0.8101196110545513
    split: synthetic-independent-seeds101-106
  - name: macroF1
    value: 0.9315221824657764
    before: 0.9316639461443835
    split: synthetic-independent-seeds101-106
  - name: restart_error_p50_frames
    value: 4.0
    before: 4.0
    split: synthetic-independent-seeds101-106
    better: lower
tags: [log, candidate-a, p2, smoothing, dead-ball, regression, docker]
links:
  - label: "Candidate A snapshot on main"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/tree/65c3c70b3c64f91063f619a712ee6f760a24caf9/solution/a_opus
  - label: "Bounded restart search under review (PR 44)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/44
  - label: "Detector study and reproducible comparison script"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/82c8c25e5cd915eab84f6f4f57669a3c88e61bf1/docs/experimentos/P2_SMOOTHED_RESTARTS.md
---

## Context

Recheck the model actually present in the challenge fork, independently of the previous five-seed experiment. The main snapshot is `65c3c70`; candidate A is v1.6 and P2 is disabled by default. The bounded-search correction is `82c8c25`, still under review in PR #44. This experiment does not merge it or change model defaults.

Before running, freeze three profiles (A with P2 off, A with the old immediate rule, A with the bounded rule) and six new full-length synthetic fixtures: seeds 101-102 with `--ball-style noisy`; 103-104 with `--ball-style real --smooth-half 3`; 105-106 with `--ball-style real --smooth-half 12`. These seeds were not used in the previous P2 experiment. Every profile sees exactly the same fixtures. Do not tune thresholds after looking at scores.

## What we did

Use the repository's pinned Docker environment: Python 3.11.17, NumPy 2.4.6, pandas 3.0.6 and Docker Engine 29.9.2. Mount source and real match assets read-only; keep generated bundles, predictions and detailed reports local and ignored by Git. The shared image contains no match data.

- Run the shared test suite: **77 tests passed**, including the ten smoothed-restart regressions.
- Run candidate A's full synthetic suite: **11 checks passed**, including its P2 adapter and end-to-end pipeline.
- Generate six independent synthetic matches and evaluate each of the three profiles with the official metric functions through `scripts/compare_p2_restart_search.py`.
- Generate A's real-match output with P2 off twice, the old P2 rule once and the bounded rule once. All four files validate with 199,319 rows.
- Independently run the exact `main` snapshot with P2 off and on: its output hashes match the correction's default and zero-wait outputs, respectively. The default repetition is byte-identical too.

Reproduce at the correction commit, using fresh output directories. Generate each of the six seeds with its style and smoothing setting above:

```bash
docker compose build evaluar
docker compose run --rm --pull never --entrypoint python evaluar -m unittest discover -s tests -v
docker compose run --rm --pull never --entrypoint python evaluar -m solution.a_opus.tests --full
# Example for the strongly smoothed seed 105; repeat with the other five declared settings.
docker compose run --rm --pull never --entrypoint python evaluar -m solution.a_opus.synth --out-dir /salidas/independent/seed-105 --seed 105 --ball-style real --smooth-half 12
docker compose run --rm --pull never --entrypoint python evaluar scripts/compare_p2_restart_search.py /salidas/independent/seed-101 /salidas/independent/seed-102 /salidas/independent/seed-103 /salidas/independent/seed-104 /salidas/independent/seed-105 /salidas/independent/seed-106 --synthetic --candidate-a --out /salidas/independent/report.json
```

## Result

Synthetic scores below are means across the six matches. Restart-error percentiles are pooled; false-short and missed-restart counts are totals. These scores belong to **this synthetic split**, not the public window or private full-match leaderboard.

| Profile | Mean spellF1 | Mean macroF1 | False possessions under 2 s | Missed restarts | Restart error p50 / p90, frames |
|---|---:|---:|---:|---:|---:|
| A, P2 off (default) | 0.810120 | 0.931664 | 25 | 16 | 4 / 77 |
| A + P2, immediate rule | 0.810120 | 0.931663 | 25 | 16 | 4 / 77 |
| A + P2, bounded rule | 0.810296 | 0.931522 | 26 | 16 | 4 / 76 |

The mean spellF1 change is tiny, while macroF1 decreases and false short possessions increase from 25 to 26. The median restart error stays at 4 frames. This is a mixed result, not a demonstrated consistent improvement. The previous five-match experiment used different seeds and only strong smoothing; absolute scores from these different splits must not be compared as a version gain.

The bounded rule's mean spellF1 is **higher** than P2 off: delta **+0.000176457**. Compared with the immediate rule, the delta is **+0.000176457**. Against P2 off it wins on 2 seeds, loses on 1 and ties on 3; against the immediate rule, the corresponding counts are 2/1/3.

| Synthetic condition | A, P2 off spellF1 | Immediate P2 spellF1 | Bounded P2 spellF1 |
|---|---:|---:|---:|
| noisy (2 seeds) | 0.827981 | 0.827981 | 0.827981 |
| light-smoothing (2 seeds) | 0.817993 | 0.817993 | 0.817414 |
| strong-smoothing (2 seeds) | 0.784385 | 0.784385 | 0.785493 |

Across 452 synthetic set-piece windows, the detector finds **0** general preparation candidates with the old rule and **116** with bounded search. Candidates are not verified correct detections or a recall estimate.

Real-match **diagnostics only**, without reading or scoring real ground truth:

| Profile | Predicted possessions | Predicted stoppages | Dead share of active-half frames |
|---|---:|---:|---:|
| A, P2 off (default) | 219 | 113 | 49.263% |
| A + P2, immediate rule | 216 | 111 | 49.946% |
| A + P2, bounded rule | 214 | 111 | 49.974% |

On the real bundle the bounded detector finds 17 preparation candidates versus zero before, within the same 59 set-piece windows. These changes cannot establish whether real-match accuracy improves. The default A output remains exactly the same, with SHA-256 `ab640ee8694f259697393d822b0a6665a017878b5b29d12715f59ec8a4dbc6d5`. The old-rule output is `1ef48487dcb80180ce8d53721766d7457a4cb905110bf3555c02386969fb6f71` and the bounded output is `6e24432b0cb73a74d8b7fa42a55b0047cb04529a91dffb3182a04dd9f64401b5`.

## Next

Keep P2 disabled by default in A while the correction is reviewed. A detector regression can be fixed without improving the complete model; more preparations alone do not justify adoption. This small six-match synthetic check is not a statistically established real-match gain or loss. No real ground truth or further public-window scoring was used, no match rows are published, no thresholds were changed after viewing results, and no new model PR was created. The second-half initial kick-off boundary remains a separate open issue.
