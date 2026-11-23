# CLAUDE.md

Working instructions for this repository. Read this file first, then the documents it links to. It does not repeat them.

## What this is

An offline editor for a musician or teacher: enter a short melody with the keyboard, see it on a treble staff, recover the draft, exchange it as a small MusicXML 4.0 subset and print it. Static JavaScript modules, Canvas 2D, native controls, IndexedDB, a small Node server on `127.0.0.1`, no dependencies.

**Nothing is implemented yet.** The repository holds the plan, the delivery tooling and the backlog in epic #1. Commands marked planned below do not work yet. Do not describe a planned thing as working, and do not claim a passing baseline: there is none.

## Sources of truth

| Topic | Document |
|---|---|
| Product scope, design, fixtures with expected values | [docs/PROJECT-PLAN.md](docs/PROJECT-PLAN.md) |
| Planned module map, freeze points, planned versus implemented | [docs/architecture.md](docs/architecture.md) |
| Backlog | Epic issue #1 and its child tickets on GitHub. The epic's table is authoritative for order, dependencies and estimates; tickets state their own owner-decision defaults. |
| Loop setup and its limits | [LOOP.md](LOOP.md), [loop-constraints.md](loop-constraints.md) |
| Project subagents, origin and local changes | [.claude/agency-agents/README.md](.claude/agency-agents/README.md) |
| Ticket workflow and the step at which each role runs | [.claude/skills/implement-ticket/SKILL.md](.claude/skills/implement-ticket/SKILL.md), section "Agent roles" below |
| How a ticket goes from the queue to a ready pull request, who may do what | "Delivery workflow" below |
| UI and copy rules, design tokens | [docs/ui-quality.md](docs/ui-quality.md), [docs/design-tokens.md](docs/design-tokens.md) |
| Decisions the owner made, with dates | [docs/owner-decisions.md](docs/owner-decisions.md) |

The plan wins for product design; the epic and tickets win for order and scope. A ticket that changes a contract fixes the plan in the same pull request.

## Stack and constraints

- Static HTML, CSS and JavaScript modules, Canvas 2D and native controls. **No npm dependency and no build step.**
- Node 22 for the static server and the test runner. The page itself runs in desktop Chrome.
- Offline: same-origin assets only, verified with external networking disabled.
- Scope: one part, one treble staff, one voice, natural pitches C4 to C6, eighth, quarter and half notes and rests, one meter (4/4 or 3/4), 1 to 64 measures, one lyric syllable per note.
- Limits: import files up to 1 MiB of UTF-8, title 80, part name 40 and lyric 24 Unicode code points.
- Playback, MIDI, cloud, accidentals, chords, several staves or voices, ties, beams and tuplets are future work.
- A runtime version change, a dependency, an external request or a non-loopback listener needs the owner's approval first, not a pull request.

## Commands

Node 22. No install step is needed.

| Purpose | Command | Status |
|---|---|---|
| Tests | `node --test` | planned: real with the scaffold |
| Run the app | `node server/serve.mjs` | planned: real with the scaffold (static shell), editor from #2 |

## Architecture boundaries

The planned module map is in [docs/architecture.md](docs/architecture.md). Invariants every change must keep (the plan is the source):

- Score model, page layout, MusicXML, drafts and the page stay separate. Model and layout are pure modules that run under Node without a browser.
- Two ticks are one quarter. Eighth, quarter and half are 1, 2 and 4 ticks; a 4/4 measure holds 8, a 3/4 measure 6. Onsets are derived, never stored.
- An edit across a bar, or a meter change that would overflow a measure, is rejected as a whole: events, total and focus stay as they were and the reason is shown.
- Import checks byte size and fatal UTF-8 decoding first, rejects DTDs, entities, processing instructions and comments before the XML parser runs, and then walks an allowlist with depth and node ceilings.
- A rejected import leaves the score and the saved draft unchanged. State is published only after model and layout validation.
- Duration conversion is exact integer arithmetic (duration times 2 over divisions); fractional results and contradicting types are rejected.
- Export is deterministic: divisions 2, canonical element order, sequential measure numbers, stable part ID, escaped text, no local event IDs. Incomplete measures block export and print.
- Drafts carry a schema version and a revision. Writes are serialised, the stored revision is compared in the same transaction, and "Saved" appears only after the transaction completes. Unknown or invalid records are kept.
- Preview and print use the same coordinates. Layout is deterministic for the same score, page size and measured text.
- Score text is rendered through text APIs, never as HTML. Same-origin assets only; the server binds `127.0.0.1` and serves an allowlist of files.
- Everything works by keyboard: Tab to controls, arrows inside the list, Enter selects, a labelled Remove deletes. After an insert or removal focus stays in the measure. Selection, remaining ticks and errors are reported as text.
- An ordered, labelled measure and event list shows the same score as the canvas.

## Git workflow

- `main` is the default branch. Work on one branch per ticket: `<issue-number>-<short-slug>`. Never commit to `main`.
- Small commits with imperative subjects and a type prefix (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- Order for every ticket: local evidence, Code Reviewer, Reality Checker, then a draft pull request that says `Part of epic #1` and `Closes #<ticket>`, then CI on that draft, then `gh pr ready` only when CI is green.
- Do not push or open a pull request unless the owner asked in the current session; starting `/next-ticket` is that request for one ticket. Only the owner merges and releases. Do not push to `main`, force-push, or merge your own pull request.
- Never commit exported scores and PDFs, `.env*`, or build output.
- Do not change `.claude/agents/`, `LOOP.md`, `loop-constraints.md` or `loop-budget.md` as part of a feature ticket.
- Open owner decisions on a ticket are settled with the ticket's stated default. Where a ticket states none, take the conservative option and say so in the pull request.

## Evidence before a ticket is called done

Paste real output into the pull request; never summarise a run you did not make.

1. For each acceptance criterion of the issue: the name of the test that proves it, or the exact step and what was observed.
2. The full output of `node --test` locally, and the link to the green CI run on the draft pull request (Linux and Windows).
3. For a layout or print change: the fixture, the PDF page count and what was inspected.
4. For an import or export change: the fixtures run, the rejected cases with their message, and that the score and the saved draft were unchanged.
5. For a UI change: the Chrome version, the keyboard path walked and what was observed, and that the page made no external request.
6. `git status` shows no stray files, and no dependency, external URL or non-loopback listener was added.
7. Anything not verified, said plainly.

## Agent roles

Project subagents are in `.claude/agents/`: six Agency Agents roles and `loop-verifier`, which belongs to the Loop setup. Each Agency Agents role file starts with a section "In this repository", written for this project. That section and this file override the generic text below it. Sources, licence, local changes and the name collision with a user-level install are in [.claude/agency-agents/README.md](.claude/agency-agents/README.md).

When asked to implement, continue or finish a GitHub issue, follow the playbook [`.claude/skills/implement-ticket/SKILL.md`](.claude/skills/implement-ticket/SKILL.md). Claude Code loads it on its own for ticket work; `/implement-ticket <issue number>` starts it by hand. Delegate to the roles without waiting to be asked: each role's `description` ends with a "Use proactively ..." sentence, which is what makes Claude Code delegate. The playbook gives the exact trigger of each role.

| When | Roles | Access |
|---|---|---|
| Before coding | Software Architect | `Read, Grep, Glob` |
| While coding | Frontend Developer | can edit |
| After coding, when the trigger matches | Application Security Engineer, Accessibility Auditor | `Read, Grep, Glob` |
| Gate on every ticket | Code Reviewer on the full diff, until no material finding is left | `Read, Grep, Glob` |
| Acceptance gate on every ticket, after Code Reviewer | Reality Checker on each acceptance criterion and the recorded evidence, and that CI is configured to run the checks (no CI result is needed yet) | `Read, Grep, Glob` |

- The two gates run on every ticket, whatever its size. A ticket is not called done before both have passed.
- Roles limited to `Read, Grep, Glob` cannot run commands. Give them the diff, the acceptance criteria and whatever command output exists.
- The session or role that wrote a change does not count as its reviewer.
- If a role is missing or cannot be delegated to, the session does the before-coding, while-coding and specialist steps itself and says so. It cannot pass the two gates on its own change: do not push or open the pull request. Stop, report that the gates could not run, and leave the run for the owner. This overrides the playbook's sentence "do that step yourself" for the two gates.
- In the pull request description, list under "Agent roles run" each role that ran, what it was asked and its verdict, and any step done without a role.

## Delivery workflow

How a ticket reaches the owner. Each piece is described in its own file; this part only links them.

- **Start:** the owner runs `/next-ticket` ([`.claude/skills/next-ticket/SKILL.md`](.claude/skills/next-ticket/SKILL.md)); it picks one leaf ticket (never a `tracking` parent or a ticket with open sub-issues; the last sub-issue's pull request also closes the parent), creates the branch and worktree, and runs the playbook [`.claude/skills/implement-ticket/SKILL.md`](.claude/skills/implement-ticket/SKILL.md). Nothing is scheduled.
- **Gate hook:** [`.claude/hooks/role-gate.mjs`](.claude/hooks/role-gate.mjs) blocks `gh pr create` and `gh pr ready` until Code Reviewer and Reality Checker ran after the last code edit. `ROLE_GATE=off` in the environment Claude Code is started from switches it off for that session; only the owner does that.
- **Permissions:** [`.claude/settings.json`](.claude/settings.json). Agent configuration edits ask in the main checkout and in ticket worktrees; CI, `CLAUDE.md`, `AGENTS.md` and Loop-file edits ask only in the main checkout; in a ticket worktree they are limited by the playbook's scope rule and reviewed by the owner at merge (shell-made edits are not covered, so a ticket never changes agent configuration); force pushes, pushes to `main`, `gh pr merge`, releases and reads of `.env` are denied.
- **CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Every job must be green on the current diff before a pull request is marked ready. The agent does not poll: it ends its turn with "Draft pull request #N is waiting for CI" and reads `gh pr checks` once when woken. Reviewers read the diff and evidence from `.claude/state/review/`. An acceptance step that needs a person is listed under "Owner checks" in the pull request.
- **Pull request:** [`.github/pull_request_template.md`](.github/pull_request_template.md). Tickets use [`.github/ISSUE_TEMPLATE/implementation-ticket.md`](.github/ISSUE_TEMPLATE/implementation-ticket.md).
- **Labels:** `status:ready`, `status:blocked`, `status:in-progress`, `needs-decision`, `tracking` (parent container, never worked; its sub-issues are the work items).
- **Changelog:** every ticket pull request adds one line under Unreleased in [CHANGELOG.md](CHANGELOG.md).
- **UI and copy:** [docs/ui-quality.md](docs/ui-quality.md); the `ui-ux-pro-max` and `unslop` skills are in `.claude/skills/`. Colours come from the shared design tokens in `app/tokens.css` ([docs/design-tokens.md](docs/design-tokens.md)); new UI adds no colour literals.
- **Decisions:** [docs/owner-decisions.md](docs/owner-decisions.md). Security reports: [SECURITY.md](SECURITY.md).
- **Merge and release:** only the owner merges and releases ([docs/RELEASING.md](docs/RELEASING.md)). An agent stops at a ready pull request.

## Loop

Issue triage runs at L1: report-only, started by hand, no scheduler, no GitHub writes. See [LOOP.md](LOOP.md).
