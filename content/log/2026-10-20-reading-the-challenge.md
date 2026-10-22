---
title: "Reading the challenge before writing a line"
date: 2026-10-20
type: study
authors: [jimy-k4]
summary: "The data landed today. Before any code: what the metric actually rewards, why the public window can mislead us, what an invisible ball means for the problem, and the ground rules we work by."
tags: [rules, metrics, spellF1]
links:
  - label: "CHALLENGE.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/CHALLENGE.md
  - label: "EVALUATION.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/EVALUATION.md
  - label: "RULES.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/RULES.md
---

## Context

Match data was released on 20 October. Before choosing an approach we read the whole challenge
repository — `CHALLENGE`, `DATA`, `EVALUATION`, `RULES` and `SUBMISSION` — to understand what is
scored, and how.

## What we learned

- **The task.** One label per video frame for a full LaLiga match: `H` home, `A` away, `D` dead ball
  or `X` no answer. 199,319 rows in a single CSV.
- **The ranking metric is `spellF1`**, not per-frame accuracy. It counts how many real possessions
  we recover *as whole possessions*. `macroF1` is only the first tie-break.
- **Temporal coherence matters more than frame accuracy.** The organisers' own scoreboard on the
  public five minutes runs one algorithm (nearest tracked player to the ball, then a majority vote
  over a window) four times. `macroF1` stays around 0.58–0.62, while `spellF1` goes from 0.04
  with no smoothing to 0.42 with the widest window.
- **`X` is a real option.** On `spellF1` an abstention is filled with our previous label, so it costs
  nothing inside a possession and a lot across a hand-over.
- **The ball is invisible on 41% of the scored frames.** Any method has to infer possession without
  it for long stretches.
- **The public window can mislead.** The FAQ shows the smoothing window that wins on the public five
  minutes loses on the full match. We should not tune against those five minutes alone.

> The score is about possessions, not frames. A method that is right frame by frame but flickers
> loses to one that is slightly wrong and stable.

## How we work, because of the rules

- **In the open.** The submission needs a public repository that regenerates our file from the data,
  so [our fork](https://github.com/GTT-TalentArena/more-than-a-hack-2027) is public from day one.
- **No match data in git, ever**, and nothing that could rebuild it: no videos, no tracking, no
  frame-level labels. This log follows the same rule: aggregate metrics and conclusions only.
- **Labels come from an algorithm.** No hand labelling and no correcting frames by eye.
- **The only ground truth we touch is the public five minutes.** The full-match ground truth stays
  private, and so does the ranking that comes from it.

## Next

Reproduce the four baselines locally, then design our own validation that does not overfit the
public window.
