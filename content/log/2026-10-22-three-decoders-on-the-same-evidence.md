---
title: "Three decoders, same evidence: Viterbi drops the flicker"
date: 2026-10-22
type: experiment
outcome: success
authors: [jimy-k4]
summary: "We fed the same per-frame evidence of candidate A to three decoders. On five synthetic matches Viterbi scores best (spellF1 0.783, against 0.761 for hysteresis and 0.659 for a vote) and invents the fewest false possessions, without a minimum duration."
metrics:
  - name: spellF1
    value: 0.783
    before: 0.659 # majority vote on the same evidence
    split: synthetic-5-matches
tags: [possession-change, temporal-continuity, hysteresis, min-duration, smoothing]
links:
  - label: "Issue #16 · P4 temporal decoding"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/16
  - label: "Issue #15 · P3 control events"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/15
  - label: "PR #35"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/35
---

## Context

[Candidate A](/log/candidate-a-decode-the-whole-half-at-once/) splits the problem in two: evidence on every frame,
then one decision for the whole half. That raises a fair question for P4 (#16): **is the gain in the decoder, or would
any reasonable smoothing do the same with this evidence?** To answer it, we kept the evidence fixed and swapped only
the decoder.

## What we did

- Three decoders over **the same evidence and the same costs**:
  - **Viterbi** (A's default): the best sequence for the whole half, with a price on each change;
  - **hysteresis**: switch only when the evidence for the other team has piled up enough, and date the change back to
    where it started;
  - **vote**: the majority label within ±1 s of each frame.
- Five synthetic matches, invented end to end: three with noisy tracking, two with the ball smoothed like the real ATD.
  No match data and no public-window evaluation were used.
- Named test scenarios for the situations the rules describe, so each decoder is checked case by case and not only on
  average:
  - P3 (#15): a pass that brushes a defender, a reception, a duel, a rebound and an interception;
  - P4 (#16): isolated noise, a short real recovery, a change across a gap of the ball, and the first frames of each
    half.

The three behaviours, on an invented strip:

```timeline
title: Same evidence, three decoders · invented · 1 cell = 0.2 s
cell: 0.2s
ticks: 10
score: both
Truth | HHHHHHHHHHHHHHHHHH AAAA HHHHHHHHHHHHHH DDDDDDDD AAAAAAAAAAAAAAAAAA
@raw Evidence, frame by frame | HHHHAAHHH..HHHHHHH AAAA HH....HHAAHHHH .DDDDD.D AAAAA....AAHHAAAAA
Vote ±1 s | =vote(hold(raw), 5)
Hysteresis · 2 cells, back-dated | =hyst(raw, 2)
Viterbi · λ = 1.5 | =viterbi(raw, 1.5)
caption: The wide vote erases the short recovery along with the noise. Hysteresis keeps it, but lets through every blip that lasts two cells. Viterbi keeps the recovery because there is enough evidence on both sides of it, and drops the blips because one or two frames are never worth the price of two changes.
```

## Result

```bars
title: spellF1 · mean of five synthetic matches
max: 1
Viterbi | 0.783 | good
Hysteresis | 0.761
Vote | 0.659 | bad
```

```bars
title: False possessions under 2 s · fewer is better
max: 722
Viterbi | 17 | good
Hysteresis | 195
Vote | 722 | bad
caption: Hysteresis invents 11 times more false possessions than Viterbi, and the vote 42 times more.
```

```bars
title: Real short possessions (under 5 s) kept · out of 627
max: 627
Viterbi | 214 | bad
Hysteresis | 298
Vote | 267
caption: The one place where Viterbi loses: it keeps a third of the real short possessions, hysteresis almost half.
```

| decoder | spellF1 | predicted / real possessions | fragmentation |
|---|---|---|---|
| **Viterbi** | **0.783** | 1580 / 1915 | 0.88 |
| hysteresis | 0.761 | 2010 / 1915 | 1.11 |
| vote | 0.659 | 2560 / 1915 | 1.42 |

What we learned:

- **The decoder matters, not only the evidence.** With the same inputs, the choice of decoder moves spellF1 by more
  than 12 points.
- **Viterbi does without a minimum duration.** It is the only one that predicts fewer possessions than there are,
  which is the safe side of the count ceiling.
- **Its weak spot is short real possessions.** That is the trade-off to attack next: better control evidence (P3) and
  sharper boundaries (P5), not a lower price per change.
- These are synthetic matches: they rank methods, they do not estimate the real score.

## Next

- P3 (#15): reuse Nico's distance signals once they are ready.
- P4 (#16): compare the decoders through the common pipeline (#12) with registered configurations.
- Feed P2's restart signals (#14) into the decoder once they are reviewed.

<details>
<summary>🇪🇸 Original pull request description (Spanish), kept for reference</summary>

Esta entrada se generó a partir de la descripción de la PR #35, escrita en español y orientada a revisar la PR.
El texto completo está en la [PR #35](https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/35).

</details>
