# Sheet Music Editor

An offline editor for short sheet music scores with keyboard editing, MusicXML interchange and print layouts.

Only the scaffold exists: a static server, an empty page and empty modules. The editor is planned. The scope, architecture and acceptance criteria are in [the project plan](docs/PROJECT-PLAN.md). The plan includes a reproducible verification strategy for the future build.

- [Product requirements](docs/PROJECT-PLAN.md#product-requirements)
- [Technical design](docs/PROJECT-PLAN.md#technical-design)
- [Implementation backlog and epic](https://github.com/jortega0033/sheet-music-editor/issues)

Estimated implementation and verification effort is 14–20 engineering hours.

## Program goal

Build a professional music notation system: engraving for a full orchestra, import of every common format, playback with own synthesis, and recognition of scanned pages, with no notation library.

The program is planned ([#34](https://github.com/jortega0033/sheet-music-editor/issues/34)). Phase 1 is the current epic [#1](https://github.com/jortega0033/sheet-music-editor/issues/1) and the only phase with tickets.

**Score.** Share of the public MusicXML test suite imported without loss, and the engraving error against reference layouts on a fixed score set.

| Phase | Content | Hours (rough) | Issue |
|---|---|---|---|
| 1 | The current epic and its tickets | 60 to 84 | [#1](https://github.com/jortega0033/sheet-music-editor/issues/1) |
| 2 | Engraving engine | 180 to 320 | [#35](https://github.com/jortega0033/sheet-music-editor/issues/35) |
| 3 | All notation | 130 to 220 | [#36](https://github.com/jortega0033/sheet-music-editor/issues/36) |
| 4 | Sound | 130 to 230 | [#37](https://github.com/jortega0033/sheet-music-editor/issues/37) |
| 5 | Scan to score | 180 to 320 | [#38](https://github.com/jortega0033/sheet-music-editor/issues/38) |
| 6 | Composition tools | 110 to 190 | [#39](https://github.com/jortega0033/sheet-music-editor/issues/39) |

About 790 to 1360 engineer hours in total: rough estimates, not measurements. The numbers in the score and the finish lines are targets until a run shows them. Only phase 1 has tickets to work; the sub-issues of a later phase are written when it starts. No single session is expected to reach the end.

## License

[MIT](LICENSE) © 2026 Jake Ortega.
