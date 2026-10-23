# Contributing

## Language: English only

From 22 October 2026, everything in GTT · TalentArena repositories is written in **English**:

- commit messages,
- pull request titles and descriptions,
- reviews and comments on pull requests and issues,
- issues,
- docs, READMEs and log entries,
- code comments and log/console messages.

Write in English even when the whole conversation around it is in Spanish. If something is clearer in Spanish (a
quote, a term from the challenge), keep the Spanish word and explain it in English.

AI assistants working in this repo follow the same rule (see `AGENTS.md`).

### Older Spanish texts

Texts written in Spanish before this rule keep their original wording; nothing is rewritten. Each one carries an
English translation and a note pointing to it:

| Where | Where the translation is |
| :-- | :-- |
| Commit messages | [`docs/commit-translations.md`](docs/commit-translations.md), and as git notes (`git fetch origin 'refs/notes/*:refs/notes/*'`, then `git log --notes`) |
| PRs, issues, comments and reviews on GitHub | At the bottom of the same message, under "🇬🇧 English translation" |
| Docs | A note at the top links to the English version (`*.en.md` next to the original, or an English section in the same file) |

History is never rewritten for this: hashes stay valid and nobody needs to re-clone.

### Language check

The `Language check` workflow warns when a pull request title, description or commit message looks Spanish. It only
warns; it never blocks a merge.
