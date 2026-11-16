---
title: "Team docs now follow the organisers' clarification of 3 November"
date: 2026-11-16
type: decision
authors: [hxst1]
summary: "The project guide still allowed hand labels without limiting them to other games, and two documents still pointed to checking results on the video. Both are corrected with dated notes, and the history stays readable."
tags: [compliance, rules, docs]
links:
  - label: "Issue 47: audit and rules"
    href: "https://github.com/GTT-TalentArena/more-than-a-hack-2027/issues/47"
  - label: "Project guide"
    href: "https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/GUIA_PROYECTO.en.md"
---

## Context

Alejandro's audit in #47 asked for the guide and the face-off protocol to be corrected. The organisers' email of
3 November then forbade more: checking output against the video, any manual data on the provided game, and training or
tuning on anything but external data. It takes precedence over the documentation and earlier answers.

## What we did

| File (both languages) | Change |
|---|---|
| `docs/GUIA_PROYECTO` | Hand labels only on other games; the new prohibitions added, with a dated note |
| `docs/experimentos/confrontacion-candidatos` | Dated note at the top: historical record, do not apply. Original text unchanged |
| `docs/ESTUDIO_POSESION` | Dated notes: L5 (watching the public GT's changes on the video) is withdrawn, the same for the last sentence of 2.5, and L4/L6 decide or calibrate nothing on the public GT |

Official files (`RULES.md`, `FAQ.md`) are not touched: they are copies of upstream.

## Result

Documentation only: no model, configuration or harness file changes, so no model identity changes.

After review, the study's suggestion to watch the public window's transitions on the video is withdrawn too: it means
checking labels against the video and drawing rules from specific frames. What remains allowed is understanding the game
and the data in general. The organisers have not said more on this point, so the cautious reading applies.

## Next

- #22 is corrected separately, since it is an issue body and not a file.
