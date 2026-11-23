import { test } from "node:test";
import assert from "node:assert/strict";

for (const m of ["model", "editor", "layout", "render", "musicxml", "drafts"]) {
  test(`app/${m} imports`, async () => {
    assert.equal(typeof (await import(`../app/${m}/index.mjs`)), "object");
  });
}
