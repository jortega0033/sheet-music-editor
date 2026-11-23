// Static server: loopback only, GET and HEAD, serves an allowlist of files on a fixed port.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const VERSION = "0.0.0";
export const HOST = "127.0.0.1";
export const PORT = 8790;
const APP = join(dirname(fileURLToPath(import.meta.url)), "..", "app");

// URL path -> file under app/ and content type. Tickets extend this list.
export const ALLOWLIST = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/tokens.css", ["tokens.css", "text/css; charset=utf-8"]],
]);

export function createAppServer() {
  return createServer(async (req, res) => {
    const headers = { "x-content-type-options": "nosniff", "cache-control": "no-store" };
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { ...headers, allow: "GET, HEAD" }).end();
      return;
    }
    const entry = ALLOWLIST.get(new URL(req.url, "http://localhost").pathname);
    if (!entry) {
      res.writeHead(404, headers).end();
      return;
    }
    try {
      const body = await readFile(join(APP, entry[0]));
      res.writeHead(200, { ...headers, "content-type": entry[1], "content-length": body.length });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(404, headers).end();
    }
  });
}

const HELP = `Usage: node server/serve.mjs [--help] [--version] [browser-test]

Serves the app on http://${HOST}:${PORT}. Fails if the port is taken.
  browser-test   headless Chrome runs (not built yet)
`;

function main(args) {
  if (args.includes("--help")) return void process.stdout.write(HELP);
  if (args.includes("--version")) return void console.log(VERSION);
  if (args[0] === "browser-test") {
    console.error("not implemented yet: see #3");
    process.exit(1);
  }
  if (args.length > 0) {
    console.error(`unknown argument: ${args[0]}`);
    process.exit(2);
  }
  const server = createAppServer();
  server.on("error", (err) => {
    console.error(`cannot listen on ${HOST}:${PORT}: ${err.code ?? err.message}`);
    process.exit(1);
  });
  server.listen(PORT, HOST, () => console.log(`http://${HOST}:${PORT}`));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
