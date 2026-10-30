---
title: "Football acceptance scenarios and control/restart review for issue 47"
date: 2026-10-30
type: experiment
outcome: mixed
authors: [PabloCordoba3]
summary: "Reproducible synthetic football cases and baseline findings, with external validation dependencies recorded before comparing A and the variant."
metrics: []
tags: [football-validation, synthetic-tests]
links: ["https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/47"]
---

## Context

Pablo's #47 checklist needs reproducible football acceptance cases and a review of control and restart rules before comparing A with the proposed variant.

This contributes to #47; it does not close the issue. A, P2, model configurations, DFL conversion and the evaluator are unchanged. There is no A-versus-variant result or adoption claim.

## What we did

Add 17 invented worlds covering FA01-FA10, 68 full-pipeline probes and a separate rule-review runner that verifies its observer preserves A's output byte for byte. Extend the [common report](docs/experimentos/ISSUE_47_ALTERNATIVE_TO_A.md) with control versus contact, neutral-D scoring, interpolation, supported/late/unknown restart boundaries, external-data readiness and team handoff dependencies.

## Result

- Docker: 122 shared tests and 17 held-out harness tests pass; A's original 11 full synthetic checks pass.
- Recorded acceptance/review source and configuration hashes still match the final implementation; the 199,319-row synthetic smoke output reproduced byte for byte.
- Football acceptance is intentionally reported separately: unchanged A has 12 passes, 20 failures, 36 diagnostic-only cases and two team-swap flags in unsupported conditions. `football_acceptance --check` therefore exits 1.
- No model inference on external reserved games or challenge-data access was performed in this work. Generated reports stay in ignored `salidas/`.

## Next

Jimy's frozen variant and acknowledgement; Edu's real-file reader/conversion audit and split-history confirmation; paired external evaluation. IDSSE's lack of video leaves independent blind football review unavailable unless a permitted source is supplied. These limitations are explicit in the common report rather than marked complete.
