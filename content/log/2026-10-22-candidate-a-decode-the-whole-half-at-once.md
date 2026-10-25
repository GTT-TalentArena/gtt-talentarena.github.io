---
title: "Candidate A: decode the whole half at once, instead of smoothing it"
date: 2026-10-22
type: iteration
outcome: success
authors: [jimy-k4]
summary: "Candidate A of the face-off (#26) gathers evidence for H, A and D on every frame and picks the best sequence for the whole half in one go, with a price on every change. It calibrates itself without labels and reaches spellF1 0.5250 on the public window, against 0.3256 for baseline_smooth50."
model: candidate-a # same name for every version: one line on the /log chart
version: v1.6
metrics:
  - name: spellF1
    value: 0.5250
    before: 0.3256 # baseline_smooth50
    split: public-5min
    low: 0.3375 # 90 % bootstrap interval
    high: 0.7125
  - name: macroF1
    value: 0.8391
    before: 0.6207
    split: public-5min
  # earlier versions: points on the chart only (prompts/confrontacion/a-opus/resultados.csv)
  - { name: spellF1, value: 0.4414, split: public-5min, version: v1.0, date: 2026-10-21 }
  - { name: macroF1, value: 0.7997, split: public-5min, version: v1.0, date: 2026-10-21 }
  - { name: spellF1, value: 0.4800, split: public-5min, version: v1.1, date: 2026-10-21 }
  - { name: macroF1, value: 0.8318, split: public-5min, version: v1.1, date: 2026-10-21 }
  - { name: spellF1, value: 0.4800, low: 0.2933, high: 0.6667, split: public-5min, version: v1.2 }
  - { name: macroF1, value: 0.8331, split: public-5min, version: v1.2 }
  - { name: spellF1, value: 0.4800, low: 0.2933, high: 0.6667, split: public-5min, version: v1.3 }
  - { name: macroF1, value: 0.8331, split: public-5min, version: v1.3 }
tags: [rules, possession-change, temporal-continuity, smoothing, state-of-the-art]
links:
  - label: "Method and limits (README)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/solution/a_opus/README.md
  - label: "Prompts, runs and deviations"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/tree/main/prompts/confrontacion/a-opus
  - label: "Results per version"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/prompts/confrontacion/a-opus/resultados.csv
  - label: "PR #33"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/33
---

## Context

The study showed that [the score is about whole possessions](/log/who-has-the-ball/): one flickering frame breaks a
possession into three, and inventing possessions caps spellF1 before a single one is wrong. The published baselines
fight flicker with a sliding vote, which only ever looks a second or two around each frame.

Candidate A, built by Jimy with Claude Opus 5.5 from the common brief of the face-off (#26), asks a different
question: **of all the possible label sequences for this half, which one explains the evidence best, if every change
of possession has a price?** The LLM never saw match data, only aggregate logs and metrics.

## What we did

Two separate steps, so each can be improved on its own:

```roadmap
1 | Evidence on every frame | How much each frame looks like H, A or D, from several independent signals. No decision yet.
2 | One decision per half | An exact Viterbi decoder picks the whole H/A/D sequence at once: every change costs λ, and a stoppage lasts at least 2 s.
3 | Calibrated on the match itself | Thresholds and weights come from the match's own statistics, never from labels.
```

- **Team evidence:** a control zone around each player with a speed gate (a ball flying past is not controlled),
  touches, Smart Tagging with its polarity calibrated, and a ball-less model of team shape, cross-validated by halves.
- **Dead-ball evidence:** ball out of the pitch, still ball, low collective speed, restart formations, the
  `SET PIECES` windows and long absences of the ball.

Why decoding beats a vote, on an invented toy strip:

```timeline
title: The same noisy evidence, two ways to clean it · invented · 1 cell = 0.2 s
cell: 0.2s
ticks: 10
score: both
Truth | HHHHHHHHHHHHHHHH AAAA HHHHHHHHHHHH DDDDDDDD AAAAAAAAAAAAAAAA
@raw Evidence, frame by frame | HHAAHAH..HHHHHHH AAAA HH.HHHHAAHHH .DDDD.DD AAA..AAHHAHAAAAA
Vote ±2 cells | =vote(hold(raw), 2)
Decode the whole strip · λ = 1.5 | =viterbi(raw, 1.5)
caption: The vote smooths each frame against its neighbours, so isolated errors survive whenever two of them sit close together. The decoder weighs every change against the evidence on both sides: one wrong frame is never worth a change, but the short real recovery is.
```

## Result

Each version was run on the public window once, five evaluations in all, and every run is logged.

```bars
title: spellF1 on the public window, by version · 17 real possessions
max: 0.6
baseline_smooth50 | 0.3256 | muted
v1.0 | 0.4414
v1.1 | 0.4800
v1.2 | 0.4800
v1.3 | 0.4800
v1.6 | 0.5250 | good
caption: v1.4 and v1.5 were never scored on the window: they only changed the full-match behaviour. The 90 % bootstrap interval of v1.6 is 0.34–0.71, and it overlaps those of earlier versions.
```

```stats
15 / 17 | possessions predicted on the window, where the baseline predicts 26
0.899 | team accuracy while the ball is alive
−1 frame | median latency of the changes it finds
```

What we learned:

- **Deciding globally removes flicker without a minimum duration.** The decoder has no rule like "a possession lasts
  at least 1 s", and still predicts about the right number of possessions.
- **The public window can confirm the pipeline, not rank versions.** With 17 possessions one possession is worth about
  6 points, and the intervals of v1.2 and v1.6 overlap. That is why the face-off used a judge, not the scoreboard.
- **Calibrating on the match itself works.** No labels are needed to set thresholds, which keeps the method usable on
  a match nobody has labelled.

## Limits and next

- **Possessions under 2 s are almost never detected.** The price of a change protects long possessions, but it also
  swallows short real ones. This is where P3 (control) and P5 (boundaries) come in.
- **Stoppages after fouls and offsides start late.** The tracking has no whistle, so the decoder only sees the stoppage
  once play slows down.
- **The ATD ball is smoothed over about 1 s**, which limits how precisely touches and boundaries can be placed.
- The face-off judge picked A on the same day: [Candidate A wins the face-off](/log/candidate-a-wins-the-face-off/).

<details>
<summary>🇪🇸 Original pull request description (Spanish), kept for reference</summary>

Esta entrada se generó a partir de la descripción de la PR #33, escrita en español y orientada a revisar la PR.
El texto completo, con la tabla por versión y las instrucciones de reproducción, está en la
[PR #33](https://github.com/GTT-TalentArena/more-than-a-hack-2027/pull/33) y en
[`prompts/confrontacion/a-opus/`](https://github.com/GTT-TalentArena/more-than-a-hack-2027/tree/main/prompts/confrontacion/a-opus).

</details>
