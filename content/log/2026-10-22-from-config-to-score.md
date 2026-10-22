---
title: "From a config file to a logged score"
date: 2026-10-22
type: code
authors: [AlejandroMolines]
summary: "P0 is in: any model is a JSON config, and one command generates its 199,319 labels, validates them, scores them on the public window and logs which commit and configuration produced them."
tags: [reproducibility]
links:
  - label: "Execution guide (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/EJECUCION.md
  - label: "Data contract (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/CONTRATO_DATOS.md
  - label: "Issue #12"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/12
  - label: "PR #31"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/31
---

## Context

The study ends with a list of experiments (P1–P8). Each one is only worth something if it runs the same
way as the others: same inputs, same scorer, same record. P0 is that common path, built on top of the
Docker pipeline instead of beside it.

## What we did

- **A model is a config.** `configs/<name>.json` names the module, its parameters and a seed. Adding a
  model means adding a module and a config, nothing else.
- **One command**, with or without Docker: generate → official validation → public evaluation →
  comparison with `baseline_smooth50` → record.

```bash
python docker/pipeline.py modelo --config configs/baseline_smooth50.json --data-dir <local data> --repetir
```

- **A written data contract**: frame index of the tactical video, units, masks for missing data, and
  `H`/`A`/`D`/`X` out. Every module reads and writes the same thing.
- **Each run gets its own folder** with the effective configuration, its hash, the commit, the
  environment and the CSV hash, so any result on this log can be traced back and repeated.
- **17 tests** on invented data: alignment, format, configuration, the four public references, a full
  synthetic run, errors and concurrent runs. CI runs them without match data.

## Result

The pipeline reproduces the official baseline unchanged and is the entry point for P1 and for both
candidates. A low score is a warning by default, and a hard failure only when asked
(`--exigir-referencia`).

## Next

A clean install by a second member, and the first experiment through it: P1.
