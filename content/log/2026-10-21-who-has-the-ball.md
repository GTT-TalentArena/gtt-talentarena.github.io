---
title: "Who has the ball? The possession problem, drawn"
date: 2026-10-21
type: study
authors: [jimy-k4]
summary: "What H, A, D and X mean, why spellF1 punishes flicker, how to spot a change of possession when the ball is missing 41% of the time, and the smoothing toolbox — every idea drawn on an invented toy match, plus the plan we test first."
tags: [rules, possession-change, temporal-continuity, hysteresis, min-duration, smoothing, state-of-the-art]
links:
  - label: "Full study (ES)"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/docs/estudio-posesion/docs/ESTUDIO_POSESION.md
  - label: "CHALLENGE.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/CHALLENGE.md
  - label: "EVALUATION.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/EVALUATION.md
  - label: "possession_metrics.py"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/evaluation/possession_metrics.py
---

## Context

Before writing a line of the model, we read the rules, the scorer and the literature. The full notebook, in Spanish and with every source, is linked on the side. This entry is the same study, **drawn**.

Every match in the figures is an **invented toy match**: nothing here comes from the match data. The scores next to the timelines are not typed by hand — they are computed with the official spellF1 and macroF1 formulas, applied to the toy.

```stats
41% | of graded frames have no ball in the tracking
17 | possessions in the public 5 minutes: our only ground truth
0.2433 | spellF1 to beat (the baseline, full match)
≈ 1 / N | what one flicker, false stop or missed possession costs
```

## 1 · Four letters, one rule

Every frame gets one letter: **H** Barça on the ball, **A** Athletic on the ball, **D** dead ball, **X** no answer. A **possession** is a maximal run of the same team with the ball alive. A stoppage always splits possessions — even when the same team restarts.

```pitch
title: A toy match · 40 invented seconds
mark: 1
label: H Barça build up
home: 15,34 30,18 30,50 47,34 60,20 62,48 75,34
away: 55,36 68,25 70,44 82,30 90,40
ball: 48.4,34.6
holder: 47,34
pass: 47,34 > 60,20
caption: 0:03 · Barça move it through midfield → **H**
---
mark: 2
label: A Athletic cut it out
home: 30,18 30,50 47,34 60,20 62,48 75,34
away: 56,26 68,25 70,44 82,30 90,40
ball: 55.2,25.4
holder: 56,26
pass: 47,34 > 55.5,26.5
run: 56,26 > 44,21
note: 57,20 intercepts + controls
caption: 0:11 · the pass is intercepted and kept → **A**, possession #2
---
mark: 3
label: D Out of play
home: 35,8 30,30 47,34 60,20 62,48
away: 41,4 52,14 68,25 70,44
ball: 40,-1.7
pass: 41,4 > 40.2,-0.9
note: 58,5 nobody owns a dead ball
caption: 0:18 · the ball crosses the touchline → **D**
---
mark: 4
label: H Barça throw it in
home: 40,0.4 36,9 47,11 30,30 47,34
away: 42,7 52,14 68,25 70,44
ball: 40,-0.9
holder: 40,0.4
pass: 40,0.4 > 36,8
caption: 0:24 · play restarts with a clear owner → **H**, possession #3 (a new one)
```

```timeline
title: The same 40 seconds as letters · 1 cell = 1 s
cell: 1s
ticks: 10
marks: 3 11 18 24
score: none
Truth | HHHHHHHHHH AAAAAA DDDDDD HHHHHHHHH AAAAAAAAA
caption: Four possessions: #1 and #3 are both Barça, but the stoppage between them makes them two. The numbers above the strip count possessions; the circled ones are the four pitches.
```

What the rules settle, in one breath:

- **A loose or contested ball stays with the last team that had it.** The definition already has hysteresis built in.
- **A touch without control is not a change**: a deflection, a block, an aerial duel nobody controls afterwards.
- **`H H D D H H` is two possessions**, not one.
- **The ground truth is the "owner" of a corrected tracking**, derived mechanically and never smoothed — which is why very short possessions exist (section 2).
- **Who owns a dead ball is not asked.** Dead is just **D**.

### X means "repeat my last answer"

The scorer fills every **X** with the last letter we gave in that half before it counts possessions. So an **X** inside a possession is free, and an **X** at a hand-over drags the old team across it.

```timeline
title: X inside a possession vs X at a hand-over · 1 cell = 1 s
cell: 1s
ticks: 10
score: both
Truth | HHHHHHHHHH AAAAAA DDDDDD HHHHHHHHH AAAAAAAAA
@ans Our answer, with X | HHHHXXXHHH XXXXAA DDDDDD HHHHHHHHH AAAAAAAAA
What the scorer reads | =fill(ans)
Hold inside, guess at the hand-over | HHHHHHHHHH HAAAAA DDDDDD HHHHHHHHH AAAAAAAAA
caption: The first three X sit inside possession #1: harmless for spellF1. The next four sit on the hand-over to Athletic: the scorer reads them as H, so possession #2 starts four seconds late. Holding the letter inside a possession and guessing at the hand-over — even one second late — beats both.
```

## 2 · How the board scores us

**spellF1** treats each possession as one object, the way a coach counts them:

1. Fill every X with the previous letter.
2. Cut each half into possessions: runs of H or A. D runs separate them.
3. Pair each predicted possession with a true one of the **same team**, one-to-one, by time overlap (IoU = shared time ÷ total time).
4. Compute the F1 of that pairing at IoU 0.3, 0.4, 0.5, 0.6 and 0.7, and average the five.

**macroF1**, the tie-break, counts frames instead. The two disagree on purpose:

```timeline
title: Six answers to the same 12 seconds · 1 cell = 0.2 s (5 frames)
cell: 0.2s
ticks: 10
score: both
Truth | HHHHHHHHHHHHHH AAA HHHHHHHHHH DDDDDDDD AAAAAAAAAAAAAAAA HHHHHHHHH
Perfect | HHHHHHHHHHHHHH AAA HHHHHHHHHH DDDDDDDD AAAAAAAAAAAAAAAA HHHHHHHHH
One flickering cell | HHHHHHAHHHHHHH AAA HHHHHHHHHH DDDDDDDD AAAAAAAAAAAAAAAA HHHHHHHHH
Ball unseen written as D | HHHHHHHHHHHHHH AAA HHHHHHHHHH DDDDDDDD AAAAAADDDAAAAAAA HHHHHHHHH
Short possession missed | HHHHHHHHHHHHHH HHH HHHHHHHHHH DDDDDDDD AAAAAAAAAAAAAAAA HHHHHHHHH
Every change 0.4 s late | =late(truth, 2)
Every change 1 s late | =late(truth, 5)
caption: Green underline = that possession is recovered at IoU 0.5; orange = it is not. One wrong cell out of 60 barely moves macroF1 but breaks a possession into three. Being 1 s late pushes the 0.6 s possession completely off its real interval.
```

Three consequences shape everything we build:

```bars
title: The count ceiling · predict r times the real number of possessions and spellF1 cannot pass…
max: 1
r = 1 · exact count | 1.00 | good
r = 1.5 | 0.80
r = 2 | 0.67 | bad
r = 3 | 0.50 | bad
r = 5 · a raw, flickering signal | 0.33 | bad
caption: spellF1 = 2 × matched ÷ (predicted + true). Inventing possessions caps the score before a single one is wrong. The raw baseline lands at 0.05 for exactly this reason.
```

```bars
title: A perfect answer, with every change late by… · official numbers from EVALUATION.md
max: 1
1 frame | 1.0000 | good
3 frames | 0.9818
8 frames (0.3 s) | 0.8933
25 frames (1 s) | 0.6539 | bad
caption: A uniform delay keeps every possession's length, so it only breaks the short ones. Losing 11 points to 8 frames means roughly one possession in ten lasts under 1–2 s.
```

> The truth is full of very short possessions. Smoothing harder is not free: the filter that removes a flicker also removes a real two-second possession — and both cost about the same.

That last point is an **inference** from published numbers, to confirm on the public window in local. And one more warning about that window:

```bars
title: What one possession is worth in spellF1
max: 6
Public window · 17 possessions | ≈ 6 pts | bad
Full match · ~350 (extrapolated) | ≈ 0.3 pts | muted
caption: The public window can tell us the pipeline is wired correctly. It cannot choose between two versions: the challenge's own baselines rank in the wrong order on it.
```

## 3 · Spotting a change of possession

The baseline gives the ball to **the player nearest to it**, every frame. That works while someone has it at their feet, and fails everywhere else:

```pitch
title: Four moments the nearest player gets wrong (or right)
mark: 1
label: H Truth stays H
view: 33,17,42,28
home: 40,30 64,30 30,50 55,50
away: 51.5,25 60,40 75,30
ball: 50.5,29.8
pass: 40,30 > 64,30
nearest
note: 51.5,20.5 nearest player: A
caption: **A pass flies past a defender.** For a few frames the nearest player is Athletic's: the raw signal flickers to A, the truth never moves.
---
mark: 2
label: A Touch + control = change
view: 33,17,42,28
home: 40,30 30,50 64,22
away: 52,31 60,40 75,30
ball: 53,31.6
zone: 52,31 1.5
holder: 52,31
pass: 40,30 > 51.2,31
note: 53,25 the ball stops in his zone
caption: **An interception.** The ball enters an Athletic player's zone and changes speed and direction. He keeps it: this is a real change → A.
---
mark: 3
label: H Touched, not controlled
view: 33,17,42,28
home: 40,30 66,34 30,50
away: 52,31 60,42 75,30
ball: 60,33.2
pass: 40,30 > 51.6,31.2; 52.5,31.4 > 64.5,34
note: 52,25 deflection
caption: **A deflection.** Athletic's leg touches the pass but the ball carries on to a Barça player. Not a change: still H.
---
mark: 4
label: H Ball unseen · keep H
view: 66,20,42,28
home: 86,30 90,40 82,44 95,34
away: 88,34 92,30 84,38 96,42 100,34
lost: 89,36
note: 74,26 no ball for 1.4 s
caption: **The ball disappears in a crowded box.** No ball is not a dead ball: keep the last owner until someone clearly controls it.
```

| signal | what it catches | where it fails |
|---|---|---|
| nearest player | who stands by the ball | passes, high balls (no height in the tracking), duels |
| possession zone (0.5–1.5 m) | a possible touch | the radius must be tuned to our tracking noise |
| ball changes direction or speed next to a player | a real touch: reception, pass, deflection | needs a ball speed we trust |
| ball stays in the zone, or the next touch is a teammate's | **control** — the rule's own word | it is only known later: date the change at the first touch, not at the confirmation |
| team shape: who presses, where the blocks run | possession with no ball at all | harder; this is what ball-free models learn |

## 4 · Keeping it continuous

Frame-by-frame decisions flicker; possessions are intervals. Here is one toy tracking signal — the nearest player's team, **·** where the ball is not seen and **D** where a dead-ball detector fires — run through six ways of making it continuous. Every row below the tracking is computed from it.

```timeline
title: Same tracking, six decoders · 1 cell = 0.2 s
cell: 0.2s
ticks: 10
score: both
Truth | HHHHHHHHHHHHHHHHHHHH AAAA HHHHHHHHHHHHHHHH DDDDDDDDDD AAAAAAAAAAAAAAAAAA HHHHHHHHHHHH
@raw Tracking (nearest player) | HHHHAHHHH..HHHAHHHHH AAAA HHH....HHHHHAHHH ...DDDDD.. AAAAAA.....AAHAAAA HAHHHHHHHHHH
Baseline · vote ±2, unseen → D | =baseline(raw, 2)
Hold through gaps | =hold(raw)
Hold + vote ±2 | =vote(hold(raw), 2)
Hold + minimum duration 1 s | =mindur(hold(raw), 5)
Hysteresis · 2 cells, back-dated | =hyst(raw, 2)
Viterbi · switch cost 1.5 | =viterbi(raw, 1.5)
caption: Toy numbers: they show how each method fails, not how well it will do on the match. Writing D for "unseen" splits the long Athletic possession; holding without smoothing keeps every flicker; a 1 s minimum duration erases the real 0.8 s interception.
```

| decoder | flicker | real short possessions | boundaries | ball unseen | knobs |
|---|---|---|---|---|---|
| majority vote ±w (baseline) | removed if w is large | erased if w is large | drift | becomes D | w |
| median / morphology | removed | erased below k | stable | — | k per letter |
| minimum duration | removed | erased below k | stable | — | k per letter |
| hysteresis | removed | kept if the evidence is strong | late, unless back-dated | holds the state | thresholds, k |
| **Viterbi + switch cost** | removed | depends on λ and the evidence | where the evidence changes | neutral frames | λ, asymmetric costs |
| + boundary snapping | — | — | **to the touch** | — | search window |

> Our pick: a Viterbi decoder over H, A and D with a switch cost, fed by control events and a dead-ball detector, with neutral frames when the ball is unseen — then snap every boundary to the touch.

The background for the choice: Viterbi finds the cheapest sequence overall, with one knob (λ) for the flicker-versus-short-possession trade-off. A minimum duration can be built into it, and the semi-Markov version models how long each state lasts ([Yu 2010](https://doi.org/10.1016/j.artint.2009.11.011)).

## 5 · What others have done

| work | what it does | why it matters to us |
|---|---|---|
| [Link & Hoernig 2017](https://doi.org/10.1371/journal.pone.0179953) | possession from 25 Hz tracking; kicks found by ball acceleration (≥ 4 m/s²); a Bayesian network separates control from contact | being near the ball is not controlling it |
| [Vidal-Codina et al. 2022](https://arxiv.org/abs/2202.00804) | deterministic rules: possession zone 0.5–1 m, duel zone 1 m, a gain when the ball changes direction or speed; dead balls and set-piece types | the most complete rule-based recipe |
| [Borghesi et al. 2023](https://doi.org/10.1016/j.eswa.2023.119780) | a temporal CNN labels every moment dead / home / away from tracking: 86.2% possession, 89.2% dead-alive accuracy | almost exactly our task |
| [Kim et al. 2023 · Ball Radar](https://arxiv.org/abs/2306.08206) | infers the possessor and the ball's path from the players alone | a way to fill the 41% |
| [Kim et al. 2026 · PathCRF](https://arxiv.org/abs/2602.12080) | a CRF over who passes to whom, impossible transitions masked, Viterbi decoding, no ball needed | structured decoding: our P4 |
| [Lea et al. 2017](https://arxiv.org/abs/1611.05267) · [MS-TCN](https://arxiv.org/abs/1903.01945) · [ASRF](https://arxiv.org/abs/2007.06866) | action segmentation: segmental F1 (≈ spellF1), smoothing losses and boundary refinement against over-segmentation | the same problem in another field |
| [Sportec Open DFL](https://doi.org/10.6084/m9.figshare.28196177) ([paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC11787359/)) | 7 Bundesliga matches, CC-BY, with per-frame `BallPossession` and `BallStatus` | labelled data with our ground truth's meaning |

## 6 · The plan

```roadmap
title: What we test first, in order
P0 | Instrumentation | One command that builds, validates and scores; bootstrap intervals; possession counts and durations; a validation bench on degraded DFL data
P1 | Unseen is not dead | No ball → keep the letter, never D. The cheapest fix we have
P2 | A dead-ball detector | Ball out, players still, restart shapes, Smart Tagging set pieces. Stoppage edges are possession edges
P3 | Control events | A touch (zone + change of ball direction or speed) confirmed by control; keep the last team in between
P4 | Viterbi decoding | H / A / D with a switch cost and neutral frames when the ball is unseen; compared with the vote and hysteresis
P5 | Snap the boundaries | Move each change to the frame of the touch, the ball going out or the restart
P6 | Fill the gaps | Interpolate short gaps; team-shape cues or a ball-free model for the long ones
P7 | Smart Tagging as a prior | Phase and transition tags, with a small weight
P8 | A learned model | Only if P1–P6 stall: trained on degraded DFL data, decoded with P4
```

How we keep ourselves honest:

- **The public window checks wiring, never chooses.** We read its bootstrap interval, not its third decimal.
- **We choose on other matches.** The seven Sportec/DFL matches, with the ball removed in bursts like ours (41%), identities dropped and tracks fragmented.
- **Plateaus, not peaks.** Sweep each knob and take the middle of the flat zone.
- **Write the hypothesis before the result**, and log every experiment — failures too — with `model` and `version`, so it lands on the results chart.

## Next

- Local checks, with the data staying on our machines: which channels the tracking really has, what the ball gaps look like, how many public possessions last under 2 s, and whether a missing ball tends to mean a dead ball.
- First experiment: **P1** on top of the baseline, logged as `model: baseline-hold`, `version: v1`.
