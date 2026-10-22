---
title: "One environment for everyone: Docker that reproduces the baselines byte for byte"
date: 2026-10-21
type: code
authors: [hxst1]
summary: "A pinned Docker environment validates and scores any CSV with the official scripts, compares it with baseline_smooth50 and logs what produced it. With the match data mounted locally, it regenerates the four published baselines byte-identical, twice."
tags: [reproducibility]
links:
  - label: "Guide (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/DOCKER.md
  - label: "Issue #24"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/24
  - label: "PR #29"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/29
  - label: "PR #30"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/30
---

## Context

Five people, three operating systems, one score that must be regenerated from public code. Before
comparing any model we needed every member to get **the same number from the same CSV**, and a run that
cannot quietly skip a broken file.

## What we did

- **An environment, not a bundle.** Python and its libraries pinned by digest and lock file. The image
  carries no code and no data: the repository and the match data are mounted read-only from the host.
- **One pipeline** that calls the official `validate_submission.py` and `run_evaluation.py` — no metric
  reimplemented — and writes a comparison against `baseline_smooth50`: spellF1, macroF1, number and mean
  duration of possessions, and how `X` was counted.
- **Every run is logged**: commit, uncommitted changes, versions, configuration, split, SHA-256 of each
  CSV and aggregate metrics.
- **Failures have names.** Exit code `2` for an invalid CSV, `3` for missing data, `4` if two runs
  differ, and `5` when a valid candidate scores below `baseline_smooth50` on the public window.
- CI builds the image, checks it is empty and requires a broken CSV to fail.

```bash
docker compose run --rm evaluar
```

## Result

| check | result |
|---|---|
| public table from the published CSVs | reproduced: `baseline_smooth50` spellF1 0.3256, macroF1 0.6207 |
| four baselines regenerated from the local match data | **byte-identical** to the published ones |
| two runs | same SHA-256 |
| image contents | no code, no data |

The same table also shows the trade-off the study predicted: from `raw` to `smooth125`, the public
possession count drops from 131 to 16 (the truth has 17) while spellF1 climbs from 0.04 to 0.42.

## Next

Plug in the common model entry point from P0, so a candidate is run and scored with one command.
