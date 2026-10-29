---
title: "Two independent candidates, one neutral judge"
date: 2026-10-21
type: decision
authors: [jimy-k4, hxst1, AlejandroMolines]
summary: "Two members build a candidate each from the same brief, one with Claude Opus 5.5 and one with ChatGPT-6 Astra, and a third member who wrote neither picks between them with criteria fixed before any score exists."
tags: [rules, state-of-the-art]
links:
  - label: "Protocol (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/experimentos/confrontacion-candidatos.md
  - label: "Common brief"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/prompts/confrontacion/BRIEF.md
  - label: "Issue #26"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/26
  - label: "PR #28"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/28
---

> **Update, 29 October 2026: steps 3 and 4 below are withdrawn.** The challenge rules forbid human
> labels on the challenge match, also for validation, and a blind review that marks which candidate is
> right on 40 intervals of its video would be one. The public window only checks that the pipeline
> works; it does not pick between candidates either. Candidates are now compared on synthetic cases
> and on other permitted matches (DFL open data), with the plan fixed before scoring: see
> [issue #47](https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/47). The original text
> is kept below unchanged, for traceability.

## Context

We have no private ground truth, and the public window is too small to choose between two methods: 17
possessions, about six spellF1 points each. A second, independent attempt at the same problem gives us
something the score cannot: the intervals where two reasonable methods **disagree** are where the errors
are likely to be.

## Decision

Agreed on a call on 21 October by Jimy, Edu and Alejandro:

- **Candidate A** (Jimy, Claude Opus 5.5) and **candidate B** (Edu, ChatGPT-6 Astra) start from the
  same brief, the same inputs and the same **8 hours** of active time each. The LLM writes the code; the
  human runs it locally and only sends back tracebacks and aggregate metrics, never frames or rows.
- They live on separate branches and nobody looks at the other's approach until both are frozen on
  **29 October**.
- **Alejandro** is the neutral judge (Nico as backup). The comparison runs on 30–31 October and feeds
  the 1 November milestone.
- At most **five public evaluations** per candidate, all logged, and none used to pick hyperparameters.

## How the winner is picked

*Steps 3 and 4 were withdrawn on 29 October 2026; see the update at the top.*

Fixed before any score is seen, in this order:

1. **Eligible**: the judge regenerates the same CSV twice from the frozen branch and it validates.
2. **Plausible**: number of possessions, median duration and share of `D` and `X` over the full match.
   A candidate with twice a reasonable number of possessions is capped by construction.
3. **Blind review of disagreements** — the main criterion. 40 disagreement intervals, drawn at random
   and stratified by type, are reviewed by Pablo on the local video **without knowing which candidate
   is which**. A sign test decides. The review only judges; it never corrects a label.
4. **Public window**, with bootstrap intervals: it only counts if the intervals do not overlap.
5. If nothing decides, the simpler and more robust candidate goes to the milestone, and combining both
   becomes round two.

> Two candidates agreeing does not make them right. Disagreement tells us where to look, not who is
> correct.

## Next

Both candidates are in development. Their results, and the judge's comparison, will be logged here.
