---
title: "The fork stays public; the match data never enters git"
date: 2026-10-20
type: decision
authors: [jimy-k4]
summary: "The rules require a public repository at submission, so we work in the open from day one — and keep every byte of match data out of git."
tags: [rules, repository]
links:
  - label: "RULES.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/RULES.md
  - label: "SUBMISSION.md"
    href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/SUBMISSION.md
---

## Context

Our project notes said the repository would stay private until we understood the rules. The
rules turned out to answer the question: the submission needs **a public code repository** that
regenerates our file from the data.

## Decision

- `GTT-TalentArena/more-than-a-hack-2027` stays **public** while we work.
- **No match data in git, ever.** `data/` is git-ignored except its README, as in the upstream
  repository, and so are videos and anything that could reconstruct the tracking.
- This log follows the same rule: aggregate metrics and conclusions, never frame-level data.

## Consequences

Other teams can read our code as we write it. We accept that: the ranking comes from the private
full-match ground truth, and a repository that reproduces its result is required anyway.
