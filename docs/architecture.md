# Implementer map

Status: **scaffold only, no product behaviour.** The modules exist as empty files and the static server works; everything else is planned. This page maps the boundaries that [PROJECT-PLAN.md](PROJECT-PLAN.md) requires onto a module layout so that parallel tickets do not collide. It adds no requirement; the plan wins where they differ. The names are the orchestrator's proposal, fixed by the scaffold; a ticket that changes one corrects this page in the same pull request.

## Planned module map

| Boundary | Module | Owns | Parent ticket |
|---|---|---|---|
| Page shell and tokens | `app/index.html`, `app/tokens.css` (a copy, never edited here) | Page markup, links to styles and scripts, design tokens | #2 |
| Score model | `app/model/` | Score record, ticks, measures, edits, rest fill, limits | #2 |
| Editor | `app/editor/` | Native controls, keyboard, selection, event list, status text | #2 |
| Layout | `app/layout/` | Pure geometry: slots, systems, pages | #3, #7 |
| Preview and print | `app/render/` | Canvas drawing from layout, print canvases, page CSS (`app/render/print.css`) | #3, #7 |
| MusicXML | `app/musicxml/` | Bounded import, deterministic export, normalisation | #4, #5 |
| Drafts | `app/drafts/` | IndexedDB record, revisions, recovery | #6 |
| Static server | `server/serve.mjs` | Loopback server with a file allowlist on a fixed port | #2 |
| Tests | `test/` | `node --test` for pure modules; headless Chrome runs for XML, storage, keyboard and print | every ticket |

Dependency direction: `editor`, `render`, `musicxml` and `drafts` depend on `model`; `render` depends on `layout`; `layout` depends on `model`. `model` imports nothing from the app. The editor is also the page controller: it calls `layout` (redraw, admission check), `render`, `musicxml` and `drafts`, and no other module imports `editor`. Every file the page loads is in the server allowlist; the ticket that adds the file adds the entry.

## Freeze points

Parallel tickets rely on these shapes. A ticket that changes a frozen shape updates this page and every dependent ticket in the same pull request.

- **Score record version 1** (title, part name, meter, measures, events with local ID, ticks, pitch or rest, lyric): ticket #2.
- **Layout result** (pages, systems, slots, glyph positions): ticket #3, read by print in #7.
- **Normalised score** used to compare imports and exports: ticket #4.

## What is verified where

Pure modules run under `node --test` locally and in CI on Linux and Windows. Browser checks use headless Chrome over the DevTools pipe without a dependency, or a manual run in Chrome; the pull request says which, with the Chrome version.
