# Commit message translations

Some early commits in this repository were written in Spanish. History is not rewritten, so their hashes stay valid; this page gives the English version of each one. The same translations are attached to the commits as git notes:

```sh
git fetch origin 'refs/notes/*:refs/notes/*'
git log --notes
```

From now on, all commits, pull requests, reviews and docs are written in English (see `CONTRIBUTING.md`).

| Commit | Author | Original (Spanish) | English |
| :-- | :-- | :-- | :-- |
| `d23d17d` | jimy | docs(log): el trabajo del equipo en el log y limpieza de entradas antiguas (#12) | docs(log): the team's work in the log, and a cleanup of older entries (#12)<br><br>Four new entries with what was already documented in the fork:<br>· Face-off of two candidates with a neutral evaluator (#26, #28)<br>· Reproducible Docker to validate and score (#24, #29, #30)<br>· P0 pipeline: from a config to a recorded score (#12, #31)<br>· P1 baseline-hold experiment, mixed result (#13, #32)<br><br>The automatic entry for PR #2 is removed (it is about the log, not the model); "The fork stays public" becomes a section of "Reading the challenge"; the link to the study points to main. |
| `0ecab42` | jimy | feat(squad): roles, partidillo y la web de cada jugador en su ficha (#11) | feat(squad): roles, a kickabout, and each player's website in their card (#11)<br><br>· feat: anonymous site visits in Superveil — loads jimy-superveil's p.js with data-site="gtt": no cookies or stored IPs, and localhost and automated browsers (the `npm run previews` screenshots) are not counted.<br>· feat(squad): roles, a kickabout on the half pitch, and each player's website in their card<br>&nbsp;&nbsp;– Roles from the organisation README table (previously "Role pending" on the site).<br>&nbsp;&nbsp;– The five players of the 1-2-2 move and pass to each other on their own (lib/squad-sim.ts), at the pace of the match in "Who has the ball?". The player whose card is open stands still and doesn't touch the ball: a pass to them runs past; if the ball goes out, the game waits until the card is closed and restarts from the goal.<br>&nbsp;&nbsp;– The card shows the player's website live (a 1280 px iframe scaled down, view only) and sits next to them without leaving the pitch. On mobile it opens with a tap and stays until closed.<br>&nbsp;&nbsp;– Still with prefers-reduced-motion and in /previews (README images). |
| `5b0954a` | Edu Ruiz | ci: no avisar en Discord de ejecuciones lanzadas desde forks (#10) | ci: don't notify Discord about runs triggered from forks (#10) |
| `26a58f0` | Edu Ruiz | ci: avisos de los workflows en el Discord del equipo (#6) | ci: workflow notifications in the team Discord (#6) |
