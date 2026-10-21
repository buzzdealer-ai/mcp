import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MCP_URL, mergeServer, run } from "../dist/index.js";

function io(overrides = {}) {
  const out = [];
  const err = [];
  const execs = [];
  const dir = mkdtempSync(join(tmpdir(), "bdai-"));
  return {
    out,
    err,
    execs,
    dir,
    io: {
      log: (l) => out.push(l),
      error: (l) => err.push(l),
      cwd: join(dir, "project"),
      home: join(dir, "home"),
      which: () => undefined,
      exec: (cmd, args) => (execs.push([cmd, ...args]), 0),
      ...overrides,
    },
  };
}

test("help and connect print text", () => {
  const t = io();
  assert.equal(run(["help"], t.io), 0);
  assert.match(t.out.join("\n"), /add claude-code/);
  assert.equal(run(["connect"], t.io), 0);
  assert.match(t.out.join("\n"), /mcp\.buzzdealer\.ai\/mcp/);
});

test("add claude-code prints the command first and runs it only when claude is found", () => {
  const missing = io();
  assert.equal(run(["add", "claude-code"], missing.io), 0);
  assert.match(missing.out[0], /^Command: claude mcp add --transport http buzzdealer-ai https:\/\/mcp\.buzzdealer\.ai\/mcp$/);
  assert.equal(missing.execs.length, 0);

  const dry = io({ which: () => "/usr/bin/claude" });
  assert.equal(run(["add", "claude-code", "--dry-run"], dry.io), 0);
  assert.equal(dry.execs.length, 0);

  const found = io({ which: () => "/usr/bin/claude" });
  assert.equal(run(["add", "claude-code"], found.io), 0);
  assert.match(found.out[0], /^Command: /);
  assert.deepEqual(found.execs, [["claude", "mcp", "add", "--transport", "http", "buzzdealer-ai", MCP_URL]]);
});

test("add cursor creates ~/.cursor/mcp.json", () => {
  const t = io();
  assert.equal(run(["add", "cursor"], t.io), 0);
  const p = join(t.io.home, ".cursor", "mcp.json");
  assert.deepEqual(JSON.parse(readFileSync(p, "utf8")), { mcpServers: { "buzzdealer-ai": { url: MCP_URL } } });
  assert.match(t.out.join("\n"), /Created/);
});

test("add vscode keeps existing servers and settings", () => {
  const t = io();
  const p = join(t.io.cwd, ".vscode", "mcp.json");
  mkdirSync(join(t.io.cwd, ".vscode"), { recursive: true });
  writeFileSync(p, JSON.stringify({ inputs: [], servers: { northwind: { type: "stdio", command: "northwind-mcp" } } }));
  assert.equal(run(["add", "vscode"], t.io), 0);
  const cfg = JSON.parse(readFileSync(p, "utf8"));
  assert.deepEqual(cfg.inputs, []);
  assert.deepEqual(cfg.servers.northwind, { type: "stdio", command: "northwind-mcp" });
  assert.deepEqual(cfg.servers["buzzdealer-ai"], { type: "http", url: MCP_URL });
  // A second run changes nothing.
  assert.equal(run(["add", "vscode"], t.io), 0);
  assert.match(t.out.at(-1), /Nothing changed/);
});

test("--dry-run writes nothing", () => {
  const t = io();
  assert.equal(run(["add", "cursor", "--dry-run"], t.io), 0);
  assert.equal(existsSync(join(t.io.home, ".cursor", "mcp.json")), false);
  assert.match(t.out.join("\n"), /Would add/);
});

test("a file that is not plain JSON is left alone", () => {
  const t = io();
  const p = join(t.dir, "mcp.json");
  writeFileSync(p, "{ // comment\n }");
  assert.equal(run(["add", "vscode", "--file", p], t.io), 1);
  assert.equal(readFileSync(p, "utf8"), "{ // comment\n }");
});

test("mergeServer keeps extra fields on our entry, such as headers", () => {
  const r = mergeServer({ mcpServers: { "buzzdealer-ai": { url: "https://old.example/mcp", headers: { Authorization: "Bearer ${env:KEY}" } } } }, "cursor");
  assert.equal(r.action, "updated");
  assert.deepEqual(r.config.mcpServers["buzzdealer-ai"], { url: MCP_URL, headers: { Authorization: "Bearer ${env:KEY}" } });
});

test("unknown commands fail", () => {
  const t = io();
  assert.equal(run(["add", "northwind"], t.io), 1);
  assert.equal(run(["launch"], t.io), 1);
});
