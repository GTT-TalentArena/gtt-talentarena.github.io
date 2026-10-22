---
title: "Candidate A wins the face-off"
date: 2026-10-22
type: decision
authors: [hxst1, AlejandroMolines, jimy-k4]
summary: "Alejandro, the neutral judge, picked candidate A (Claude Opus 5.5) over candidate B (Codex, later improved by Claude). A leads on every public number we have, so the team builds on A from here."
tags: [state-of-the-art]
links:
  - label: "Protocol (#26)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/26
  - label: "Candidate A (PR #33)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/33
  - label: "Candidate A results"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/prompts/confrontacion/a-opus/resultados.csv
  - label: "Candidate B results"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/prompts/confrontacion/b-gpt-claude/resultados.csv
---

## Context

Two members built a possession model each from the same brief, the same inputs and the same budget: **A** (Jimy, Claude Opus 5.5) and **B** (Edu, Codex with ChatGPT-6 Astra, later improved in a separate, declared variant by Claude Opus 5.5). Neither LLM ever saw match data: they wrote code from public documentation and synthetic data, and the authors ran it locally and reported aggregates only. Each candidate had five evaluations on the public 5-minute window.

## Decision

On 22 October, Alejandro, the neutral judge who wrote neither candidate, picked **candidate A**. The team continues on A: P2 → P3 → P4 → the 0.2433 milestone (#17). Both candidates stay in `main` (`solution/a_opus` and `solution/b_gpt`), so they can be run side by side with the common Docker pipeline.

## Result

Final version of each candidate on the public window (GT: 17 possessions); the full-match columns use no ground truth.

| Candidate | spellF1 [90 % CI] | macroF1 | Possessions (window) | % D (full match) | Possessions (full match) |
|---|---|---|---|---|---|
| **A v1.6** | **0.5250** [0.338, 0.713] | **0.8391** | 15 | 49.3 % | 219 |
| B v4 | 0.4000 [0.213, 0.587] | 0.6983 | 13 | 41.0 % | 220 |
| baseline_smooth50 | 0.3256 | 0.6207 | 26 | — | — |

A is ahead on spellF1, macroF1, team accuracy and dead-ball detection. With only 17 possessions the spellF1 intervals still overlap, so the window alone cannot prove the gap; that is why the decision belonged to a judge, not to the scoreboard.

## Next

- Build on A. Two things B learned may help it: in this tracking the ball is untracked during most stoppages and reappears when play restarts, and a team's very short spell between two of the other team's is usually a touch, not a change of possession.
- Neither number estimates the private full-match score.
