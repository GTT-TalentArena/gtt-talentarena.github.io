---
title: "A home for the team: website, identity and this log"
date: 2026-10-20
type: code
authors: [jimy-k4]
summary: "A static site on GitHub Pages with the team, the challenge and this log — plus a simulated tracking pitch that shows the problem without touching the match data."
tags: [website, identity]
links:
  - label: "Website repository"
    href: https://github.com/GTT-TalentArena/gtt-talentarena.github.io
---

## Context

We wanted one place that explains who we are and what we are doing, and that keeps a written
record of every study, test and iteration as the competition goes on.

## What we did

- A static **Next.js** site published with **GitHub Pages**: every push to `main` deploys it.
- An identity built on blaugrana: paper, night-blue ink, and a ball drawn as a data mesh.
- A **simulated** tracking pitch: 22 invented players and a ball, labelled `H`, `A` or `D` frame by
  frame, with the official baseline's idea (nearest player to the ball) drawn as a dashed line.
  It uses no match data.
- This **log**: one Markdown file per entry in `content/log/`, no CMS. The instructions for adding
  entries are at the top of `lib/log.ts`.

## Next

Choose the final typeface from the ten candidates at `/type`, then fill this log as the real work
starts.
