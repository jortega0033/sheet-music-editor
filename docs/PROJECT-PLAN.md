# Sheet Music Editor

> This document specifies phase 1 of the program in [#34](https://github.com/jortega0033/sheet-music-editor/issues/34). Hour figures in it are early estimates for that phase; its open tickets add up to 60 to 84 hours (2026-11-24). Work that it defers is planned in the later phases only where the program names it.

## Product requirements

An instrumentalist or music teacher needs to jot down a short melody, revisit it during rehearsal, and hand out a readable page. The first release is a single-instrument score editor for local desktop Chrome. Its primary workflow is to enter notes and rests, see the staff update, save a draft, and print a score. MusicXML import and export move complete scores within a defined subset.

### First working slice

1. Open an empty score, give it a title, and choose 4/4 or 3/4.
2. Enter pitches and rests with the keyboard, move between measures, and correct an entry. See each change in a treble staff preview.
3. Complete any open measure with rests and print through Chrome. This is the first usable author-to-print workflow.
4. Add MusicXML exchange, draft recovery, one lyric syllable per pitched note, and verified multipage printing in subsequent tickets.

| ID | Requirement | Release evidence |
| --- | --- | --- |
| R1 | Author one part, one treble staff and one voice using natural pitches C4 through C6, with eighth, quarter and half notes or rests. Use one meter for the entire score. | Enter, edit and remove events, navigate measures, and complete a partial measure with only the keyboard. |
| R2 | Read and print a score in desktop Chrome. | A known two-measure score displays every event in order. A multipage fixture prints with margins, readable content and no blank trailing page. |
| R3 | Exchange complete scores in a bounded MusicXML 4.0 subset. | Equivalent source divisions import identically. Export and reimport preserve title, part name, meter, event order, pitches, durations and lyrics. Unsupported or malformed files leave the current score intact. |
| R4 | Reopen the last saved draft in the same Chrome profile and local origin. | After an offline restart, an unfinished measure is restored. A failed write leaves the draft editable and the failure visible. |
| R5 | Write or remove one plain-text lyric syllable per pitched note. | Lyrics stay anchored to notes on screen and in print, survive export and import, and remain readable at the allowed length. |

Support 1–64 measures and UTF-8 import files up to 1 MiB. Limit title to 80 Unicode code points, part name to 40, and lyrics to 24. Trim outer whitespace, retain internal spaces and reject controls and line breaks. Keep text within layout widths by allowing title and part name to wrap, and reject a lyric if its measured width exceeds the printable measure interior. Show the relevant limit beside the control or in the import error. Playback, MIDI, cloud sync, accidentals, chords, multiple staves or voices, meter changes, ties, beams, tuplets, pickups and richer engraving are future work.

## Technical design

### Runtime and data

Use static HTML, CSS and JavaScript modules, Canvas 2D for the score preview, and native HTML editor controls. Host the app on a documented, fixed loopback address using a small local Node static server. Use Node's test runner for pure model and page layout, and a real browser for XML, storage, keyboard and print checks. Bundle all assets locally and verify the complete workflow with external networking disabled.

A versioned score record holds title, part name, meter and ordered measures. Each event has a local ID, integer duration ticks and either a natural pitch or a rest. Pitched events can have lyrics. Derive onset by summing prior event durations. Two ticks represent one quarter, so eighth, quarter and half last 1, 2 and 4 ticks. A 4/4 measure holds 8 ticks and a 3/4 measure holds 6. Reject edits across a bar and any global meter change that would make an existing measure overflow. Partial measures remain editable and savable. An explicit completion action fills available space with half, quarter, then eighth rests as applicable. Export and printing require complete measures.

Provide an ordered, labelled measure and event list to accompany the canvas and expose the same score in text. Tab reaches native controls, arrows move within the measure or event list, Enter selects an event for editing, and a labelled Remove action deletes it. After insertion or removal, place focus on the resulting selection in the same measure. Report current selection, remaining ticks and errors in text.

Store draft schema version and revision in IndexedDB. Serialize writes and announce “Saved” only after the transaction completes. Compare the last known revision to the stored one in the same transaction. On stale writes, preserve the edited draft in memory and offer a reload or a local file copy when the measure is complete. Preserve unknown or invalid saved records and explain recovery. Document which origin and Chrome profile hold the data.

### MusicXML contract

Accept unnamespaced, UTF-8 MusicXML 4.0 with a score-partwise root, a single score-part declaration and one matching part with complete measures. Validate an allowlist of elements and attributes covering optional work title, part name, measure numbers, positive integer divisions, constant 3/4 or 4/4, the treble clef G on line 2, note pitch or rest, duration, optional matching note type, and one plain-text lyric per pitched note. A lyric may omit syllabic or use the single value. Require divisions, time and clef in the first measure. Allow later measure attributes to replace only divisions. Reject unknown or duplicate fields and invalid child order. Generate sequential measure numbers and a stable part ID on export while omitting local event IDs.

MusicXML expresses duration using divisions per quarter note. Each note in this subset has pitch or rest, then duration and optional type and lyric. Convert source duration to internal ticks by multiplying by 2 and dividing by source divisions using exact integer arithmetic. Reject fractional results, unsupported values and contradictory types. Export explicit note types and divisions of 2 in canonical order with properly escaped text. Check structural equality of normalized scores while ignoring source measure numbers, local IDs and equivalent source divisions. [MusicXML 4.0 divisions](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/divisions/), [note](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/note/), [lyric](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/lyric/).

Enforce byte size and fatal UTF-8 decoding before parsing. Allow an optional UTF-8 XML declaration. Reject DTDs, entity declarations, other processing instructions and comments before invoking the detached XML parser. Use a depth and node-count ceiling when walking the parsed tree. Reject parser errors, arbitrary namespaces, include and link elements, and other unsupported markup or external resources. Accept standard escaped XML text and render it through text APIs. The importer reads only bytes from the chosen local file. Publish imported state only after model and layout validation. Identify the relevant measure or limit in the error, with file text treated as text.

### Layout and printing

Compute deterministic coordinates from the score, page dimensions and measured text. Draw staff lines, clef, meter, noteheads, stems, flags, rests and ledger lines with original canvas geometry. Allocate a slot for each onset and widen it for its lyric when needed. When a single measure cannot fit legibly, reject the triggering edit or import and identify the measure. Pack whole measures into a staff system and whole systems into A4 pages with reserved ledger and lyric space. Preserve pitch and onset order. Reuse the same coordinates for preview and print, rendering print canvases at a minimum of 200 DPI. Add CSS page breaks, margins and page numbers, and hide the editor controls in print. Use deterministic fake font widths for pure geometry tests and check real Chrome output against those constraints.

### Original verification fixtures

| Fixture | Data | Checks |
| --- | --- | --- |
| Rehearsal Note | 4/4. Measure 1 contains C4 quarter “la”, D4 quarter “li”, quarter rest and E4 quarter “lu”. Measure 2 contains F4 half “no”, quarter rest and G4 quarter “te”. | Capacity 8. Onsets are 0, 2, 4, 6 and 0, 4, 6. Five pitched notes, two rests, five lyrics, both bars complete. Each lyric is centered under its note. |
| Rehearsal Note, alternate divisions | Same score with divisions 4 and source durations 4, 4, 4, 4 and 8, 4, 4. Use a title variant with an escaped ampersand in both divisions versions. | The two sources and canonical divisions-2 export normalize to identical supported content. |
| Three Beat Step | 3/4, one measure containing C5 eighth, eighth rest and A4 half. | Onsets 0, 1, 2 and total 6. Adding another eighth is rejected. A note with equivalent eighth duration and type quarter is rejected. |
| Page Turn | 64 measures using the rhythm from measure 1 of Rehearsal Note, replacing the first and last pitched events with C4 and C6. Use two neighbouring, near-limit lyrics sized to fit a measure. | Multiple pages with each measure printed once in order. Adjacent lyrics are separated. No margins are crossed, glyphs clipped, or empty final page added. |
| Rejected import | Malformed close tag, invalid UTF-8, oversized input, external DTD, custom entity, include element, two parts, changed meter, chord, zero, negative or off-grid duration and partial measure. | Current score and saved draft are unchanged. Error names the failing limit or location where feasible. Request monitoring sees only loopback resources. |

## Epic SM-E1 — Author and print a short score offline

From a clean workspace, a musician can enter a score, recover the draft, exchange a compatible file and print a readable score. Release evidence includes a keyboard-only Chrome walkthrough, model and geometry tests, XML round-trips, draft recovery and a locally generated A4 PDF.

| Ticket | Dependencies | Estimated engineering effort including verification |
| --- | --- | --- |
| SM-01 Score model and keyboard editor | None | 2–3 hours |
| SM-02 Score preview and first printable page | SM-01 | 3–4 hours |
| SM-03 Local MusicXML import | SM-01 | 2–3 hours |
| SM-04 MusicXML export and round-trip | SM-03 | 2–3 hours |
| SM-05 Recoverable local drafts | SM-01 | 2–3 hours |
| SM-06 Lyrics, multipage print and release checks | SM-02, SM-04, SM-05 | 3–4 hours |

The total estimated effort is 14–20 engineering hours. After SM-01, rendering, interchange and persistence can proceed in parallel. SM-04 follows import and can overlap layout or storage work. SM-03 tests structural and rhythmic validation using the shared model. SM-06 integrates the three lanes and adds the layout admission check to import and live lyrics before publishing the edited score.

### SM-01 — Score model and keyboard editor

As a musician, I want to enter and correct measures with the keyboard while tracking the remaining beats.

- Create a named 3/4 or 4/4 score with one measure. Use only the keyboard to add another measure and insert, select, edit and remove notes or rests.
- For Three Beat Step, validate expected onsets and total. Overflow attempts leave events, total and focus unchanged and show an explanation.
- Unit-test pitch and duration bounds, valid partial drafts, the 64-measure cap, deterministic rest fill, and atomic rejection when changing to a meter with a smaller capacity. Verify the text outline follows active selection.

### SM-02 — Score preview and first printable page

As a musician, I want my notes to become a printable page I can read.

- Render a no-lyric Rehearsal Note with correct event order, C4 ledger line, half note and two quarter rests. Editing a pitch or duration redraws while preserving current measure selection.
- Assert that event centers move right with onset and glyphs stay within the system. Repeated layout with the same input yields equal coordinates.
- Print a completed two-measure score on one titled A4 page in Chrome, with editor controls hidden. An incomplete measure prevents application printing and offers a way to complete the measure. Record the PDF page count.

### SM-03 — Local MusicXML import

As a musician, I want to open a compatible local score and understand why other files cannot open.

- Import both Rehearsal Note divisions variants with equivalent semantic events. Add a mixed-divisions test that changes divisions in the second measure. Escaped title text displays literally.
- Import Three Beat Step with onsets 0, 1 and 2. Reject unsafe integers, fractional values, and an eighth duration with a declared quarter type.
- Run all negative fixtures and verify unchanged draft state, unchanged persisted data when present and no external requests. Test file picker cancellation and a failed read.

### SM-04 — MusicXML export and round-trip

As a musician, I want to save a file I can open and edit later.

- Download a complete score as UTF-8 .musicxml with version 4.0, one matching part, divisions 2 and valid element order. Escape user text. Identify the measure that blocks export when incomplete.
- Export each original rhythmic fixture, reimport and compare semantically to its source. Assert deterministic bytes for the same score and canonical conversion from divisions 4 to 2.
- Validate canonical output using a locally staged official schema if available, or independently verify the supported element order and parse as well-formed XML with external resolution disabled. Keep test evidence in the development workspace.

### SM-05 — Recoverable local drafts

As a musician, I want to resume my last saved edit after closing the page.

- Save a score with a partial second measure, restart Chrome on the same origin and profile with external networking disabled, and confirm all fields and partial progress are restored.
- Inject a failed transaction and provide malformed or unknown-version records. The open draft remains editable, the issue is visible and stored data is preserved. Verify rapid edits save the latest successfully written revision.
- In two tabs, verify a stale save cannot replace the newer score. Confirm the stale tab retains its draft and exposes the reload or completed export path.

### SM-06 — Lyrics, multipage print and release checks

As a teacher, I want each syllable to stay under its note when the music wraps and prints.

- Enter, edit and remove lyrics by keyboard. Reject lyrics on rests, above either supported limit, or resulting in an unprintable measure. Retain all five Rehearsal Note lyrics through a round-trip.
- Run Page Turn through the shared print layout and assert page margins, measure order and zero lyric or glyph collisions. Inspect a real Chrome A4 PDF and record page count, intact staff lines, lyric anchors and page numbers.
- In a clean profile with external networking disabled, author Rehearsal Note, correct an event, save, restart, export, reopen and print. Record browser version, observed fixture results and PDF page counts. Confirm only loopback requests were made.
