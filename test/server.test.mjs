import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createAppServer, VERSION } from "../server/serve.mjs";

const run = (...a) => spawnSync(process.execPath, ["server/serve.mjs", ...a], { encoding: "utf8" });

test("help and version", () => {
  assert.match(run("--help").stdout, /Usage/);
  assert.equal(run("--version").stdout.trim(), VERSION);
});

test("stub command exits non-zero", () => {
  const r = run("browser-test");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /not implemented yet: see #3/);
});

test("serves allowlist, refuses the rest", async () => {
  const server = createAppServer();
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/index.html`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get("content-type"), /text\/html/);
    const css = await fetch(`${base}/tokens.css`);
    assert.equal(css.status, 200);
    assert.match(css.headers.get("content-type"), /text\/css/);
    assert.equal((await fetch(`${base}/../package.json`)).status, 404);
    assert.equal((await fetch(`${base}/server/serve.mjs`)).status, 404);
    assert.equal((await fetch(base, { method: "POST" })).status, 405);
  } finally {
    server.close();
  }
});
