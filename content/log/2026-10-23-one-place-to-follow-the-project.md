---
title: "One place to follow the project: Discord, GitHub and the task board in sync"
date: 2026-10-23
type: code
authors: [hxst1]
summary: "A team Discord wired to GitHub, a small bot for the questions we ask every day, and a task forum in two-way sync with the GitHub Project, so nobody has to switch tools to see where things stand."
tags: [reproducibility]
links:
  - label: "Bot repository"
    href: https://github.com/GTT-TalentArena/gtt-bot
  - label: "Bot guide (ES)"
    href: https://github.com/GTT-TalentArena/gtt-bot/blob/main/README.md
  - label: "Task board (GitHub Project)"
    href: https://github.com/orgs/GTT-TalentArena/projects/3
---

## Context

We are five people with a public repo, a website, a GitHub Project and a group chat. The work lives on GitHub but the conversation happens in the chat, so checking whether a task had moved meant opening another tool. We wanted the day-to-day in one place, without copying anything by hand.

## What we did

- A team Discord with channels by topic (data, algorithms, experiments, infrastructure, pitch), roles that match the agreed responsibilities, and a read-only area for notifications.
- GitHub webhooks post pushes, PRs, reviews and issues to `#github`. A small workflow (`discord-notify.yml`) reports CI runs and website deploys to `#ci-tests` and `#deploys`, and ignores runs triggered from forks.
- A bot, "GTT", running as a Cloudflare Worker, so there is no server to keep alive. Its slash commands:
  - `/tarea crear | estado | lista` for tasks;
  - `/experimento` to log a run against the baseline of the same split;
  - `/resumen` with open PRs, tasks, the last deploy and the last log entry;
  - `/countdown` and `/reto` for the deadline and a summary of the challenge;
  - `/log` for the latest entries of this log.

  It also posts a summary to `#general` every morning.
- The task forum is in two-way sync with the GitHub Project. Every issue on the board has a forum post `#N · title`, updated every 5 minutes:
  - status and area go both ways, so changing a tag in Discord moves the card on GitHub and vice versa;
  - title, assignees and milestone come from GitHub, and assignees appear as Discord mentions;
  - a post created by hand in the forum becomes a new issue;
  - if both sides change at the same time, GitHub wins.
- A scheduled GitHub Action keeps an incremental, private copy of the server's channels. Team members can download it with `/archivo discord`, in a reply only they can see, to give an assistant the team's context without copying chats around.
- Tokens live in Cloudflare and GitHub secrets, never in the repos or the chat, and no match data reaches the bot.

## Result

| | |
|---|---|
| Task board | the 14 issues on the Project were mirrored as forum posts on the first run; a status change made in Discord reaches GitHub within 5 minutes, or straight away with `/tarea estado` |
| Notifications | GitHub events, CI results and deploys go to their own channels |
| Archive | refreshed every 6 hours; 35 channels and threads in the copy of 26 October |
| Bot tests | 58, synthetic only, run in CI |

Two problems showed up along the way, and the tests now cover both. Discord rate-limits the creation of many posts at once, so the bot waits and retries. And a check meant to detect a missing Discord permission read the bot's own daily summary, which has no text outside its embed, as a stripped message; it now only looks at messages written by people.

## Next

Ideas for the bot go as issues in the bot repository.
