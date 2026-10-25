---
title: "Candidate B: Codex v0 plus four Claude iterations on dead balls and touches"
date: 2026-10-22
type: experiment
outcome: mixed
authors: [hxst1]
summary: "Candidate B of the face-off (#26). A deterministic rule-based model written by Codex (v0) and improved in four documented iterations by Claude. The final v4 passes the pre-registered guard on the public window, but every gain is within that window's noise."
model: candidate-b # same name for every version: one line on the /log chart
version: v4
metrics:
  - name: spellF1
    value: 0.4000
    before: 0.3895 # v0
    split: public-5min
    low: 0.2133 # 90 % bootstrap interval
    high: 0.5867
    date: 2026-10-21
  - name: macroF1
    value: 0.6983
    before: 0.6620
    split: public-5min
    date: 2026-10-21
  # earlier versions: points on the chart only (prompts/confrontacion/b-gpt-claude/resultados.csv)
  - { name: spellF1, value: 0.3895, low: 0.2421, high: 0.5368, split: public-5min, version: v0, date: 2026-10-21 }
  - { name: macroF1, value: 0.6620, split: public-5min, version: v0, date: 2026-10-21 }
  - { name: spellF1, value: 0.3895, low: 0.2421, high: 0.5368, split: public-5min, version: v1, date: 2026-10-21 }
  - { name: macroF1, value: 0.6620, split: public-5min, version: v1, date: 2026-10-21 }
  - { name: spellF1, value: 0.3122, low: 0.1854, high: 0.4488, split: public-5min, version: v2, date: 2026-10-21 }
  - { name: macroF1, value: 0.6652, split: public-5min, version: v2, date: 2026-10-21 }
  - { name: spellF1, value: 0.3895, low: 0.2421, high: 0.5368, split: public-5min, version: v3, date: 2026-10-21 }
  - { name: macroF1, value: 0.6901, split: public-5min, version: v3, date: 2026-10-21 }
tags: [rules, possession-change, temporal-continuity, min-duration, state-of-the-art]
links:
  - label: "Face-off protocol (#26)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/26
  - label: "Iterations table"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/cand/b-gpt-claude/prompts/confrontacion/b-gpt-claude/iteraciones.md
  - label: "v4 analysis and decision"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/cand/b-gpt-claude/prompts/confrontacion/b-gpt-claude/analisis-v4.md
---

## Context

This is candidate B of the face-off protocol (#26). On 22 October the neutral evaluator picked **candidate A** (#33). This PR records B so that the comparison is complete. Both candidates stay in `main`, so they can be run side by side with the common Docker pipeline; B's history is also in branch `cand/b-gpt-claude` and tag `b-gpt-v0`.

B was built without ever showing match data to an LLM: the assistant writes code from public documentation and synthetic data, Edu runs it locally and reports aggregates only. It is shown as two versions:

- **v0**, written only by Codex (ChatGPT-6 Astra, high) and frozen as tag `b-gpt-v0`.
- **v4**, v0 plus four iterations by Claude Code (Opus 5.5; effort medium for v1–v3, max for v4), approved by the neutral evaluator as a separate variant.

## What we did

- **v0 (Codex).** Geometric control evidence, stoppage evidence (ball outside the pitch, still ball with quiet players), Smart Tagging as a weak prior, and an exact 3-state Viterbi decoder.
- **v1 · A ball lost right after leaving the pitch is dead.** The occlusion that follows a clear exit counts as a stoppage even with players running, as at throw-ins and goal kicks.
- **v2 · Every long ball-less gap is a stoppage.** GT-free diagnostics showed the ball is almost never missing briefly in this tracking. It is missing in 132 stretches of 5 s or more (~43 min), which matches a match's stoppages in number and length. This version **failed**: D precision dropped, because a ball shielded by a player or lost in flight also disappears while play is live.
- **v3 · Only gaps that start or end like a restart.** A gap counts as a stoppage only if the ball was lost at a line, comes back still or at a line, or is missing for more than 30 s.
- **v4 · A touch is not a change of possession.** A literature review (Vidal-Codina et al. 2022; Link & Hoernig 2017; the Laws of the Game) and GT-free diagnostics with pre-registered decision rules found 70 there-and-back team changes under 3 s, 58 % of all H↔A switches. Following CHALLENGE.md (a touch, deflection or duel without control is not a change), the opponent's spells under 3 s between two spells of the same team go back to that team. Spells next to a stoppage are never touched.
- `configs/candidate_b.json` plugs B into the common P0 pipeline (#12/#24) like candidate A, and `prompts/confrontacion/b-gpt-claude/resultados.csv` has one row per version with the same columns as A.
- Each version is deterministic (same SHA-256 on two runs), runs in ~9 s on CPU, passes `validate_submission.py` and has synthetic tests (46 in v4). Every prompt, hour, run and deviation is in `prompts/confrontacion/b-gpt/` and `prompts/confrontacion/b-gpt-claude/`.

## Result

Public 5-minute window (GT: 17 possessions). Full-match columns use no ground truth.

| Iteration | Version | spellF1 | macroF1 | Possessions (window) | % D (full match) | Possessions (full match) |
|---|---|---|---|---|---|---|
| 1 | v0 (Codex) | 0.3895 | 0.6620 | 21 | 33.4 % | 354 |
| 2 | v1 | 0.3895 | 0.6620 | 21 | 35.2 % | 347 |
| 3 | v2 | 0.3122 | 0.6652 | 24 | 47.8 % | 345 |
| 4 | v3 | 0.3895 | 0.6901 | 21 | 41.0 % | 340 |
| 5 | **v4** | **0.4000** | **0.6983** | 13 | 41.0 % | 220 |
| — | baseline_smooth50 | 0.3256 | 0.6207 | 26 | — | — |
| — | *candidate A v1.6 (winner)* | *0.5250* | *0.8391* | *15* | *49.3 %* | *219* |

- v4 passes the guard fixed before evaluating it (spellF1 ≥ 0.3895 and macroF1 ≥ 0.6901). It is the final version of the variant.
- Team accuracy with the ball alive rises from 0.860 to 0.873. v3/v4 keep v1's near-perfect D precision (0.998) and recover more dead time (D recall 0.257 → 0.317).
- **Limits.** All gains are within the window's noise: one possession moves spellF1 by ~0.06, and 17 possessions cannot rank versions. v4 also produces fewer possessions than the GT (13 vs 17), so the 3 s rule merges some real short possessions as well as flicker. It was not retuned, because no public evaluations were left and doing so would overfit 17 possessions. None of these figures estimates the private full-match score.

## Next

- The team continues with candidate A (B stays in `main` for side-by-side runs) (P2 → P3 → P4 → the 0.2433 milestone, #17).
- Lessons from B that may help A: GT-free diagnostics to size a change before making it, the ball being untracked during most stoppages, and the open question of how long a change of possession must last.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01HdpQdWEhSWNwtA5ZU2RaJw
