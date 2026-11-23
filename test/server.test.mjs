import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { get } from "node:http";
import { createAppServer, VERSION } from "../server/serve.mjs";

const run = (...a) => spawnSync(process.execPath, ["server/serve.mjs", ...a], { encoding: "utf8" });

test("help and version", () => {
  assert.match(run("--help").stdout, /Usage/);
  assert.equal(run("--version").stdout.trim(), VERSION);
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
    // Raw paths: fetch would normalise "..", and "//" is not a valid URL.
    for (const path of ["/../package.json", "//"]) {
      const status = await new Promise((ok, fail) => {
        get({ host: "127.0.0.1", port: server.address().port, path }, (res) => {
          res.resume();
          ok(res.statusCode);
        }).on("error", fail);
      });
      assert.equal(status, 404);
    }
    const head = await fetch(base, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    assert.equal((await fetch(base, { method: "POST" })).status, 405);
  } finally {
    server.close();
  }
});
